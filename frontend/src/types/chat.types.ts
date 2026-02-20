export type ChatFile = {
  name: string;
  url: string;
};

export type Conversation = {
  id: number;
  name: string;
  del?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Message = {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  loading?: boolean;
  files?: ChatFile[];
  date?: string;
  del?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
};

export type ClearConversationResponse = {
  conversationId: number;
  clearedCount: number;
};

export type UpdateMessagePayload = {
  content: string;
};

export type SendChatbotMessagePayload = {
  prompt: string;
  conversationId: number | null;
  editingMessageId?: number;
  files: File[];
};

export type ChatStreamEventType =
  | "chat-stream"
  | "conversation-name"
  | "message-ids"
  | "error";

export type ChatStreamEvent = {
  type: ChatStreamEventType | string;
  content?: unknown;
};
