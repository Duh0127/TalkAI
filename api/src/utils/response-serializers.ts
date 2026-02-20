type PlainRecord = Record<string, unknown>;

type ApiChatFile = {
    name: string;
    url: string;
};

type ApiConversation = {
    id: number;
    name: string;
};

type ApiMessage = {
    id: number;
    conversationId: number;
    role: "user" | "assistant";
    content: string;
    files: ApiChatFile[];
    date: string;
};

type ApiConversationWithMessages = ApiConversation & {
    messages: ApiMessage[];
};

type ApiChatbotSendResponse = {
    conversation: ApiConversation;
    userMessage: ApiMessage;
    assistantMessage: ApiMessage;
};

type ApiClearConversationResponse = {
    conversationId: number;
    clearedCount: number;
};

export function serializeConversation(value: unknown): ApiConversation {
    const plain = toPlainObject(value);

    return {
        id: toPositiveInt(plain.id),
        name: toTrimmedString(plain.name, 200) || "Nova conversa",
    };
}

export function serializeConversationList(values: unknown): ApiConversation[] {
    if (!Array.isArray(values)) return [];
    return values.map(serializeConversation);
}

export function serializeConversationWithMessages(value: unknown): ApiConversationWithMessages {
    const plain = toPlainObject(value);
    const conversation = serializeConversation(plain);
    const messages = serializeMessageList((plain as { messages?: unknown }).messages);

    return {
        ...conversation,
        messages,
    };
}

export function serializeMessage(value: unknown): ApiMessage {
    const plain = toPlainObject(value);
    const roleRaw = toTrimmedString(plain.role, 30).toLowerCase();
    const role: "user" | "assistant" = roleRaw === "user" ? "user" : "assistant";
    const dateValue =
        toDateString(plain.date) ||
        toDateString(plain.createdAt) ||
        new Date().toISOString();

    return {
        id: toPositiveInt(plain.id),
        conversationId: toPositiveInt(plain.conversationId),
        role,
        content: toTrimmedString(plain.content, 4000),
        files: serializeChatFileList(plain.files),
        date: dateValue,
    };
}

export function serializeMessageList(values: unknown): ApiMessage[] {
    if (!Array.isArray(values)) return [];
    return values.map(serializeMessage);
}

export function serializeChatbotSendResponse(value: unknown): ApiChatbotSendResponse {
    const plain = toPlainObject(value);

    return {
        conversation: serializeConversation(plain.conversation),
        userMessage: serializeMessage(plain.userMessage),
        assistantMessage: serializeMessage(plain.assistantMessage),
    };
}

export function serializeClearConversationResponse(value: unknown): ApiClearConversationResponse {
    const plain = toPlainObject(value);

    return {
        conversationId: toPositiveInt(plain.conversationId),
        clearedCount: toNonNegativeInt(plain.clearedCount),
    };
}

function serializeChatFileList(value: unknown): ApiChatFile[] {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => {
            const plain = toPlainObject(item);
            const name = toTrimmedString(plain.name, 200);
            const url = toSafeFileUrl(plain.url);

            if (!name || !url) return null;
            return { name, url };
        })
        .filter((item): item is ApiChatFile => Boolean(item));
}

function toPlainObject(value: unknown): PlainRecord {
    if (!value || typeof value !== "object") return {};

    const maybeModel = value as { toJSON?: () => unknown };
    if (typeof maybeModel.toJSON === "function") {
        const parsed = maybeModel.toJSON();
        if (parsed && typeof parsed === "object") {
            return parsed as PlainRecord;
        }
    }

    return value as PlainRecord;
}

function toPositiveInt(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.trunc(parsed);
}

function toNonNegativeInt(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.trunc(parsed);
}

function toBoolean(value: unknown): boolean {
    return value === true || value === 1 || value === "1";
}

function toTrimmedString(value: unknown, maxLength: number): string {
    const normalized = String(value ?? "").trim();
    if (!normalized) return "";
    return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
}

function toDateString(value: unknown): string | undefined {
    if (!value) return undefined;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
}

function toSafeFileUrl(value: unknown): string {
    const normalized = toTrimmedString(value, 4000);
    if (!normalized) return "";

    const lower = normalized.toLowerCase();
    if (
        lower.startsWith("https://") ||
        lower.startsWith("http://") ||
        lower.startsWith("/public/") ||
        lower.startsWith("data:image/")
    ) {
        return normalized;
    }

    return "";
}

