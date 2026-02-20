import { nowHourStamp } from "../services/date.service";
import { ChatFile, Conversation, Message } from "../types/chat.types";

export const MAX_FILES_PER_MESSAGE = 8;

export function normalizeFiles(value: unknown): ChatFile[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const name = String((item as { name?: unknown }).name ?? "").trim();
      const url = String((item as { url?: unknown }).url ?? "").trim();

      if (!name || !url) return null;
      return { name, url };
    })
    .filter((item): item is ChatFile => Boolean(item));
}

export function normalizeConversation(conversation: Conversation): Conversation {
  return {
    ...conversation,
    name: String(conversation.name ?? "Nova conversa").trim() || "Nova conversa"
  };
}

export function normalizeMessage(message: Message): Message {
  return {
    ...message,
    role: String(message.role ?? "assistant"),
    content: String(message.content ?? ""),
    files: normalizeFiles(message.files)
  };
}

export function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

export function upsertConversation(
  conversations: Conversation[],
  conversation: Conversation
): Conversation[] {
  const next = conversations.filter((item) => item.id !== conversation.id);
  next.unshift(conversation);
  return sortConversations(next);
}

export function filterConversations(conversations: Conversation[], query: string): Conversation[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return conversations;

  return conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(normalizedQuery)
  );
}

export function buildConversationName(prompt: string): string {
  const compact = prompt.trim().replace(/\s+/g, " ");

  if (!compact) {
    return `Nova conversa ${nowHourStamp()}`;
  }

  return compact.length > 52 ? `${compact.slice(0, 49)}...` : compact;
}
