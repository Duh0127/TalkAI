import OpenAI from "openai";
import type {
    Response as OpenAIResponse,
    ResponseCreateParamsNonStreaming as OpenAINonStreamingParams,
    ResponseCreateParamsStreaming as OpenAIStreamingParams,
    ResponseCreateParams as OpenAIResponseCreateParams,
    ResponseInput as OpenAIResponseInput,
    ResponseStreamEvent as OpenAIResponseStreamEvent,
} from "openai/resources/responses/responses";
import type { Stream } from "openai/streaming";
import { ErrorTypes } from "../errors/ErrorTypes";

const BRASILIA_TIME_ZONE = "America/Sao_Paulo";
const BRASILIA_GMT_LABEL = "GMT-3";

const getDatePart = (parts: Intl.DateTimeFormatPart[], type: string): string =>
    parts.find((part) => part.type === type)?.value ?? "00";

const getSystemDateTime = (): string => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: BRASILIA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(new Date());

    const year = getDatePart(parts, "year");
    const month = getDatePart(parts, "month");
    const day = getDatePart(parts, "day");
    const hour = getDatePart(parts, "hour");
    const minute = getDatePart(parts, "minute");
    const second = getDatePart(parts, "second");

    return `${year}-${month}-${day} ${hour}:${minute}:${second} ${BRASILIA_GMT_LABEL}`;
};

const buildChatbotInstructions = (): string =>
    `Voce e um chatbot util e objetivo. Responda em portugues quando o usuario escrever em portugues. Data e hora do sistema: ${getSystemDateTime()}.`;

const buildConversationTitleInstructions = (): string =>
    `Voce cria titulos curtos para conversas. Responda somente com um titulo em portugues, sem aspas, com no maximo 8 palavras. Data e hora do sistema: ${getSystemDateTime()}.`;

export class OpenAIService {
    private client: OpenAI | null = null;

    getClient(): OpenAI {
        if (this.client) {
            return this.client;
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw ErrorTypes.Environment("OPENAI_API_KEY nao configurada na API.");
        }

        this.client = new OpenAI({ apiKey });
        return this.client;
    }

    async createResponse(params: OpenAIStreamingParams): Promise<Stream<OpenAIResponseStreamEvent>>;
    async createResponse(params: OpenAINonStreamingParams): Promise<OpenAIResponse>;
    async createResponse(
        params: OpenAIResponseCreateParams
    ): Promise<Stream<OpenAIResponseStreamEvent> | OpenAIResponse> {
        const client = this.getClient();
        return client.responses.create(params);
    }

    async createChatbotAssistantResponse(
        input: OpenAIResponseInput
    ): Promise<Stream<OpenAIResponseStreamEvent>> {
        const baseParams = {
            model: this.getModel(),
            instructions: buildChatbotInstructions(),
            input,
        };

        return this.createResponse({
            ...baseParams,
            stream: true,
        });
    }

    async createConversationTitleResponse(prompt: string): Promise<OpenAIResponse> {
        const compactPrompt = prompt.trim().replace(/\s+/g, " ");

        return this.createResponse({
            model: this.getModel(),
            instructions: buildConversationTitleInstructions(),
            input: [
                {
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: `Gere um titulo para esta conversa: ${compactPrompt}`,
                        },
                    ],
                },
            ],
            temperature: 0.2,
            max_output_tokens: 24,
            stream: false,
        });
    }

    extractOutputText(response: { output_text?: unknown; output?: unknown }): string {
        const directOutputText =
            typeof response.output_text === "string" ? response.output_text.trim() : "";
        if (directOutputText) return directOutputText;

        const output = Array.isArray(response.output) ? response.output : [];
        for (const item of output) {
            if (!item || typeof item !== "object") continue;

            const typedItem = item as { type?: unknown; content?: unknown };
            if (typedItem.type !== "message" || !Array.isArray(typedItem.content)) continue;

            const text = typedItem.content
                .map((part) => {
                    if (!part || typeof part !== "object") return "";
                    const typedPart = part as { type?: unknown; text?: unknown };
                    if (typedPart.type !== "output_text") return "";
                    return String(typedPart.text ?? "").trim();
                })
                .filter(Boolean)
                .join("\n")
                .trim();

            if (text) return text;
        }

        return "";
    }

    private getModel(): string {
        return process.env.OPENAI_MODEL || "gpt-4.1-mini";
    }
}

export const openAIService = new OpenAIService();
export type {
    OpenAIResponse,
    OpenAIResponseCreateParams,
    OpenAIResponseStreamEvent,
    OpenAIStreamingParams,
    OpenAINonStreamingParams,
};
