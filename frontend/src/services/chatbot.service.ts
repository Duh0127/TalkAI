import { requestApi, requestApiStream } from "./api.service";
import {
  ChatStreamEvent,
  ClearConversationResponse,
  Conversation,
  Message,
  SendChatbotMessagePayload,
  UpdateMessagePayload
} from "../types/chat.types";

type SendChatbotMessageStreamHandlers = {
  onChunk?: (chunk: string) => void;
  onEvent?: (event: ChatStreamEvent) => void;
  signal?: AbortSignal;
};

export function listConversations(): Promise<Conversation[]> {
  return requestApi<Conversation[]>({
    method: "GET",
    url: "/api/conversation"
  });
}

export function createConversation(name: string): Promise<Conversation> {
  return requestApi<Conversation>({
    method: "POST",
    url: "/api/conversation",
    data: { name }
  });
}

export function updateConversation(conversationId: number, name: string): Promise<Conversation> {
  return requestApi<Conversation>({
    method: "PATCH",
    url: `/api/conversation/${conversationId}`,
    data: { name }
  });
}

export function deleteConversation(conversationId: number): Promise<Conversation> {
  return requestApi<Conversation>({
    method: "DELETE",
    url: `/api/conversation/${conversationId}`
  });
}

export function listMessagesByConversation(conversationId: number): Promise<Message[]> {
  return requestApi<Message[]>({
    method: "GET",
    url: `/api/message/conversation/${conversationId}`
  });
}

export function updateMessage(messageId: number, payload: UpdateMessagePayload): Promise<Message> {
  return requestApi<Message>({
    method: "PATCH",
    url: `/api/message/${messageId}`,
    data: payload
  });
}

export function clearConversationMessages(conversationId: number): Promise<ClearConversationResponse> {
  return requestApi<ClearConversationResponse>({
    method: "PATCH",
    url: `/api/message/conversation/${conversationId}/clear`
  });
}

export function sendChatbotMessageStream(
  payload: SendChatbotMessagePayload,
  handlers: SendChatbotMessageStreamHandlers
): Promise<void> {
  const formData = buildChatbotFormData(payload);

  return requestApiStream(
    {
      method: "POST",
      url: "/api/chatbot",
      data: formData,
      signal: handlers.signal
    },
    {
      onChunk: (chunk) => {
        handlers.onChunk?.(chunk);
      },
      onJsonChunk: (payloadChunk) => {
        const event = parseChatStreamEvent(payloadChunk);
        if (!event) return;
        handlers.onEvent?.(event);
      }
    }
  );
}

function buildChatbotFormData(payload: SendChatbotMessagePayload): FormData {
  const formData = new FormData();

  if (payload.prompt.trim()) {
    formData.append("prompt", payload.prompt.trim());
  }

  if (payload.conversationId) {
    formData.append("conversationId", String(payload.conversationId));
  }

  if (typeof payload.editingMessageId === "number" && payload.editingMessageId > 0) {
    formData.append("editingMessageId", String(payload.editingMessageId));
  }

  payload.files.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

function parseChatStreamEvent(payload: unknown): ChatStreamEvent | null {
  if (!payload || typeof payload !== "object") return null;

  const typedPayload = payload as { type?: unknown; content?: unknown };
  const type = String(typedPayload.type ?? "").trim();
  if (!type) return null;

  return {
    type,
    content: typedPayload.content
  };
}
