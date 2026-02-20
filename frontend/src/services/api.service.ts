import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { ApiEnvelope } from "../types/chat.types";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60_000
});

type RequestApiStreamHandlers = {
  onChunk: (chunk: string) => void;
  onJsonChunk?: (payload: unknown) => void;
};

export async function requestApi<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<ApiEnvelope<T>>(config);
    const payload = response.data;

    if (!payload?.success) {
      throw new Error(payload?.message || payload?.error || "Falha ao processar requisicao.");
    }

    return payload.data;
  } catch (error) {
    throw mapApiError(error);
  }
}

export async function requestApiStream(
  config: AxiosRequestConfig,
  handlers: RequestApiStreamHandlers
): Promise<void> {
  const { onChunk, onJsonChunk } = handlers;
  const url = resolveRequestUrl(String(config.url ?? ""));
  if (!url) {
    throw new Error("URL da requisicao de stream nao informada.");
  }

  const normalizedHeaders = normalizeHeaders(config.headers);
  const body = normalizeRequestBody(config.data, normalizedHeaders);
  const timeout = Number(config.timeout ?? 60_000);

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let externalAbortHandler: (() => void) | null = null;

  if (config.signal) {
    if (config.signal.aborted) {
      controller.abort();
    } else {
      externalAbortHandler = () => controller.abort();
      config.signal.addEventListener?.("abort", externalAbortHandler, { once: true });
    }
  }

  if (Number.isFinite(timeout) && timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeout);
  }

  try {
    const response = await fetch(url, {
      method: (config.method || "GET").toUpperCase(),
      headers: normalizedHeaders,
      body,
      signal: controller.signal,
      credentials: config.withCredentials ? "include" : "same-origin"
    });

    if (!response.ok) {
      const rawError = await response.text();
      throw new Error(readApiErrorMessage(rawError) || `Erro HTTP ${response.status}.`);
    }

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = flushBufferedStream(buffer, onChunk, onJsonChunk);
    }

    buffer += decoder.decode();
    flushBufferedStream(buffer, onChunk, onJsonChunk, true);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Requisicao de stream cancelada ou expirou.");
    }

    throw mapApiError(error);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    if (externalAbortHandler && config.signal) {
      config.signal.removeEventListener?.("abort", externalAbortHandler);
    }
  }
}

function mapApiError(error: unknown): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error("Erro inesperado ao chamar a API.");
  }

  const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
  const apiMessage =
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.message;

  return new Error(apiMessage || "Erro de comunicacao com a API.");
}

function resolveRequestUrl(url: string): string {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";
  if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;

  if (!API_BASE) return trimmedUrl;

  if (trimmedUrl.startsWith("/")) {
    return `${API_BASE}${trimmedUrl}`;
  }

  return `${API_BASE}/${trimmedUrl}`;
}

function normalizeHeaders(headers: AxiosRequestConfig["headers"]): Record<string, string> {
  if (!headers) return {};

  const normalized: Record<string, string> = {};
  const entries = Object.entries(headers as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    if (typeof value === "object") continue;

    normalized[key] = String(value);
  }

  return normalized;
}

function normalizeRequestBody(
  data: AxiosRequestConfig["data"],
  headers: Record<string, string>
): BodyInit | undefined {
  if (data === undefined || data === null) return undefined;

  if (
    data instanceof FormData ||
    data instanceof Blob ||
    data instanceof URLSearchParams ||
    typeof data === "string" ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data)
  ) {
    return data as BodyInit;
  }

  const hasContentType = Object.keys(headers).some((key) => key.toLowerCase() === "content-type");
  if (!hasContentType) {
    headers["Content-Type"] = "application/json";
  }

  return JSON.stringify(data);
}

function flushBufferedStream(
  buffer: string,
  onChunk: (chunk: string) => void,
  onJsonChunk?: (payload: unknown) => void,
  flushRest = false
): string {
  const normalized = buffer.replace(/\r/g, "");
  const lines = normalized.split("\n");
  const pending = flushRest ? "" : lines.pop() ?? "";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const chunk = line.startsWith("data:") ? line.slice(5).trim() : line;
    if (!chunk || chunk === "[DONE]") continue;

    onChunk(chunk);

    if (onJsonChunk) {
      try {
        onJsonChunk(JSON.parse(chunk));
      } catch {
        // stream chunk pode ser texto puro
      }
    }
  }

  if (flushRest) {
    const lastChunk = pending.trim();
    if (lastChunk) {
      const normalizedChunk = lastChunk.startsWith("data:")
        ? lastChunk.slice(5).trim()
        : lastChunk;

      if (normalizedChunk && normalizedChunk !== "[DONE]") {
        onChunk(normalizedChunk);

        if (onJsonChunk) {
          try {
            onJsonChunk(JSON.parse(normalizedChunk));
          } catch {
            // stream chunk pode ser texto puro
          }
        }
      }
    }
  }

  return pending;
}

function readApiErrorMessage(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as Partial<ApiEnvelope<unknown>> & { message?: string; error?: string };
    return String(parsed.message || parsed.error || "").trim();
  } catch {
    return trimmed;
  }
}
