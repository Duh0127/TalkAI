import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearConversationMessages,
  deleteConversation as deleteConversationRequest,
  listConversations,
  listMessagesByConversation,
  sendChatbotMessageStream,
  updateConversation
} from "../../../services/chatbot.service";
import { exportConversationPdf } from "../../../services/pdf-export.service";
import { ChatFile, Conversation, Message } from "../../../types/chat.types";
import {
  filterConversations,
  MAX_FILES_PER_MESSAGE,
  normalizeConversation,
  normalizeMessage,
  sortConversations,
  upsertConversation
} from "../../../utils/chat.utils";

type SendMessageOptions = {
  editingMessageId?: number;
  editedContent?: string;
};

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationQuery, setConversationQuery] = useState("");
  const [prompt, setPrompt] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [renamingConversation, setRenamingConversation] = useState(false);
  const [clearingConversation, setClearingConversation] = useState(false);
  const [exportingConversation, setExportingConversation] = useState(false);
  const [deletingConversationIds, setDeletingConversationIds] = useState<number[]>([]);
  const [updatingMessageIds, setUpdatingMessageIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const skipNextMessagesLoadConversationId = useRef<number | null>(null);
  const streamAbortControllerRef = useRef<AbortController | null>(null);
  const userCancelledStreamRef = useRef(false);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );
  const filteredConversations = useMemo(
    () => filterConversations(conversations, conversationQuery),
    [conversations, conversationQuery]
  );

  const deletingActiveConversation =
    activeConversationId !== null && deletingConversationIds.includes(activeConversationId);
  const canSend =
    !sending &&
    !clearingConversation &&
    !deletingActiveConversation &&
    updatingMessageIds.length === 0 &&
    (prompt.trim().length > 0 || pendingFiles.length > 0);

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    return () => {
      streamAbortControllerRef.current?.abort();
      streamAbortControllerRef.current = null;
      userCancelledStreamRef.current = false;
    };
  }, []);

  useEffect(() => {
    setUpdatingMessageIds([]);

    if (activeConversationId === null) {
      setMessages([]);
      return;
    }

    if (skipNextMessagesLoadConversationId.current === activeConversationId) {
      skipNextMessagesLoadConversationId.current = null;
      return;
    }

    void loadMessages(activeConversationId);
  }, [activeConversationId]);

  async function loadConversations() {
    setLoadingConversations(true);
    setError(null);

    try {
      const response = await listConversations();
      const nextConversations = sortConversations(
        response.filter((conversation) => !conversation.del).map(normalizeConversation)
      );

      setConversations(nextConversations);
      setActiveConversationId((currentId) => {
        if (
          currentId !== null &&
          nextConversations.some((conversation) => conversation.id === currentId)
        ) {
          return currentId;
        }

        return null;
      });
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadMessages(conversationId: number) {
    const shouldShowLoading = messages.length === 0;
    if (shouldShowLoading) {
      setLoadingMessages(true);
    } else {
      setLoadingMessages(false);
    }
    setError(null);

    try {
      const response = await listMessagesByConversation(conversationId);
      const nextMessages = response.filter((message) => !message.del).map(normalizeMessage);
      setMessages((currentMessages) =>
        areMessagesEquivalent(currentMessages, nextMessages) ? currentMessages : nextMessages
      );
    } catch (requestError) {
      if (shouldShowLoading) {
        setMessages([]);
      }
      setError((requestError as Error).message);
    } finally {
      if (shouldShowLoading) {
        setLoadingMessages(false);
      }
    }
  }

  function touchConversation(conversationId: number) {
    setConversations((currentConversations) => {
      const targetConversation = currentConversations.find(
        (conversation) => conversation.id === conversationId
      );

      if (!targetConversation) return currentConversations;

      return upsertConversation(currentConversations, {
        ...targetConversation,
        updatedAt: new Date().toISOString()
      });
    });
  }

  function createNewConversation() {
    setError(null);
    setActiveConversationId(null);
    setMessages([]);
    setPrompt("");
    setPendingFiles([]);
  }

  function selectConversation(conversationId: number) {
    setActiveConversationId(conversationId);
  }

  function updateConversationQuery(query: string) {
    setConversationQuery(query);
  }

  function updatePrompt(value: string) {
    setPrompt(value);
  }

  function cancelSendingMessage() {
    if (!sending) return;

    userCancelledStreamRef.current = true;
    streamAbortControllerRef.current?.abort();
  }

  function addPendingFiles(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;

    setPendingFiles((currentFiles) => {
      const availableSlots = MAX_FILES_PER_MESSAGE - currentFiles.length;

      if (availableSlots <= 0) {
        setError(`Limite de ${MAX_FILES_PER_MESSAGE} anexos por mensagem.`);
        return currentFiles;
      }

      if (selectedFiles.length > availableSlots) {
        setError(`Somente ${availableSlots} arquivo(s) adicional(is) foram adicionados.`);
      } else {
        setError(null);
      }

      return [...currentFiles, ...selectedFiles.slice(0, availableSlots)];
    });
  }

  function removePendingFile(fileIndex: number) {
    setPendingFiles((currentFiles) => currentFiles.filter((_, index) => index !== fileIndex));
  }

  async function editConversationMessage(messageId: number, content: string): Promise<boolean> {
    const conversationId = activeConversationId;
    if (!conversationId) return false;
    if (
      sending ||
      clearingConversation ||
      deletingConversationIds.includes(conversationId) ||
      updatingMessageIds.includes(messageId)
    ) {
      return false;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("A mensagem nao pode ser vazia.");
      return false;
    }

    const messageIndex = messages.findIndex((message) => message.id === messageId);
    if (messageIndex < 0) {
      setError("Mensagem nao encontrada.");
      return false;
    }

    const messageToEdit = messages[messageIndex];
    if (messageToEdit.role === "assistant") {
      setError("Apenas mensagens do usuario podem ser editadas.");
      return false;
    }

    setError(null);
    setUpdatingMessageIds((currentIds) => [...currentIds, messageId]);

    try {
      return await sendMessage({
        editingMessageId: messageId,
        editedContent: trimmedContent
      });
    } finally {
      setUpdatingMessageIds((currentIds) => currentIds.filter((id) => id !== messageId));
    }
  }

  async function deleteConversationById(conversationId: number): Promise<boolean> {
    if (!conversationId) return false;
    if (deletingConversationIds.includes(conversationId)) return false;

    const deletingCurrentConversation = activeConversationId === conversationId;
    if (
      deletingCurrentConversation &&
      (sending || updatingMessageIds.length > 0)
    ) {
      setError("Aguarde as alteracoes em andamento antes de excluir a conversa.");
      return false;
    }

    setError(null);
    setDeletingConversationIds((currentIds) => [...currentIds, conversationId]);

    try {
      await deleteConversationRequest(conversationId);

      setConversations((currentConversations) => {
        const nextConversations = currentConversations.filter(
          (conversation) => conversation.id !== conversationId
        );

        setActiveConversationId((currentId) => {
          if (currentId !== conversationId) return currentId;
          return nextConversations[0]?.id ?? null;
        });

        return nextConversations;
      });

      if (deletingCurrentConversation) {
        setMessages([]);
        setPrompt("");
        setPendingFiles([]);
      }

      return true;
    } catch (requestError) {
      setError((requestError as Error).message);
      return false;
    } finally {
      setDeletingConversationIds((currentIds) => currentIds.filter((id) => id !== conversationId));
    }
  }

  async function renameActiveConversation(name: string): Promise<boolean> {
    const conversationId = activeConversationId;
    if (!conversationId) return false;
    if (renamingConversation) return false;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("O nome da conversa nao pode ser vazio.");
      return false;
    }

    setRenamingConversation(true);
    setError(null);

    try {
      const updatedConversation = normalizeConversation(
        await updateConversation(conversationId, trimmedName)
      );

      setConversations((currentConversations) =>
        upsertConversation(currentConversations, updatedConversation)
      );
      return true;
    } catch (requestError) {
      setError((requestError as Error).message);
      return false;
    } finally {
      setRenamingConversation(false);
    }
  }

  async function clearActiveConversation(): Promise<boolean> {
    const conversationId = activeConversationId;
    if (!conversationId) return false;
    if (
      clearingConversation ||
      sending ||
      deletingConversationIds.includes(conversationId) ||
      updatingMessageIds.length > 0
    ) {
      return false;
    }

    setClearingConversation(true);
    setError(null);

    try {
      await clearConversationMessages(conversationId);
      setMessages([]);
      touchConversation(conversationId);
      return true;
    } catch (requestError) {
      setError((requestError as Error).message);
      return false;
    } finally {
      setClearingConversation(false);
    }
  }

  async function exportActiveConversationPdf(): Promise<boolean> {
    if (exportingConversation) return false;

    const conversation = activeConversation;
    if (!conversation) {
      setError("Selecione uma conversa para exportar.");
      return false;
    }

    const exportableMessages = messages.filter(
      (message) =>
        message.conversationId === conversation.id &&
        !message.loading &&
        !message.del
    );
    if (exportableMessages.length === 0) {
      setError("Nao ha mensagens para exportar nesta conversa.");
      return false;
    }

    setError(null);
    setExportingConversation(true);

    try {
      exportConversationPdf({
        chatName: "TalkAI",
        conversation,
        messages: exportableMessages
      });
      return true;
    } catch (requestError) {
      setError((requestError as Error).message || "Falha ao exportar conversa para PDF.");
      return false;
    } finally {
      setExportingConversation(false);
    }
  }

  async function sendMessage(options?: SendMessageOptions): Promise<boolean> {
    const editingMessageId = options?.editingMessageId;
    const editingMessage = typeof editingMessageId === "number";
    const trimmedPrompt = editingMessage
      ? String(options?.editedContent ?? "").trim()
      : prompt.trim();
    const filesToSend = editingMessage ? [] : pendingFiles;
    const previousPrompt = prompt;
    const previousPendingFiles = pendingFiles;

    if (!trimmedPrompt && filesToSend.length === 0) return false;

    const updatingConflict = editingMessage
      ? updatingMessageIds.some((id) => id !== editingMessageId)
      : updatingMessageIds.length > 0;

    if (
      sending ||
      clearingConversation ||
      deletingActiveConversation ||
      updatingConflict
    ) {
      return false;
    }

    const currentConversationId = activeConversationId;
    if (editingMessage && (!editingMessageId || !currentConversationId)) {
      return false;
    }

    const previousMessages = messages;
    const optimisticTimestamp = new Date().toISOString();
    const optimisticBaseId = -Date.now();
    const optimisticConversationId =
      currentConversationId ?? (editingMessage ? null : optimisticBaseId - 2);
    const optimisticMessageConversationId =
      optimisticConversationId ?? currentConversationId ?? 0;
    const optimisticAssistantMessageId = optimisticBaseId;
    let optimisticUserMessageId: number | null = null;
    const optimisticAssistantMessage: Message = {
      id: optimisticAssistantMessageId,
      conversationId: optimisticMessageConversationId,
      role: "assistant",
      content: "",
      files: [],
      date: optimisticTimestamp,
      loading: true
    };

    if (editingMessage && editingMessageId) {
      const editingIndex = previousMessages.findIndex((message) => message.id === editingMessageId);
      if (editingIndex < 0) return false;

      const nextMessages = previousMessages
        .slice(0, editingIndex + 1)
        .map((message) =>
          message.id === editingMessageId ? { ...message, content: trimmedPrompt } : message
        );

      setMessages([...nextMessages, optimisticAssistantMessage]);
    } else {
      optimisticUserMessageId = optimisticBaseId - 1;
      const optimisticUserMessage: Message = {
        id: optimisticUserMessageId,
        conversationId: optimisticMessageConversationId,
        role: "user",
        content: trimmedPrompt || "Mensagem com anexos.",
        files: [],
        date: optimisticTimestamp
      };

      const baseMessages = currentConversationId === null ? [] : previousMessages;
      setMessages([...baseMessages, optimisticUserMessage, optimisticAssistantMessage]);
    }

    if (!editingMessage) {
      setPrompt("");
      setPendingFiles([]);
    }

    setSending(true);
    setError(null);

    const abortController = new AbortController();
    streamAbortControllerRef.current = abortController;
    userCancelledStreamRef.current = false;

    let streamErrorMessage: string | null = null;
    let streamedConversationName = "";
    let streamedConversationId: number | null = currentConversationId;
    let streamedUserMessageId: number | null = null;
    let streamedAssistantMessageId: number | null = null;
    let streamedUserFiles: ChatFile[] | null = null;
    let streamedAssistantContent = "";

    try {
      await sendChatbotMessageStream({
        prompt: trimmedPrompt,
        conversationId: currentConversationId,
        editingMessageId: editingMessageId,
        files: filesToSend
      }, {
        signal: abortController.signal,
        onEvent: (event) => {
          if (event.type === "chat-stream") {
            const chunk = toStreamContentString(event.content);
            if (!chunk) return;
            streamedAssistantContent += chunk;

            setMessages((currentMessages) =>
              currentMessages.map((message) =>
                message.id === optimisticAssistantMessageId
                  ? {
                    ...message,
                    content: `${message.content || ""}${chunk}`,
                    loading: false
                  }
                  : message
              )
            );
            return;
          }

          if (event.type === "conversation-name") {
            const parsedConversation = parseConversationNameEvent(event.content);
            if (parsedConversation.name) {
              streamedConversationName = parsedConversation.name;
            }

            const nextConversationId =
              parsedConversation.id ?? streamedConversationId ?? optimisticConversationId;

            if (nextConversationId !== null) {
              streamedConversationId = nextConversationId;

              setConversations((currentConversations) =>
                upsertConversation(
                  currentConversations,
                  normalizeConversation({
                    id: nextConversationId,
                    name: parsedConversation.name || streamedConversationName || "Nova conversa",
                    createdAt: optimisticTimestamp,
                    updatedAt: new Date().toISOString()
                  })
                )
              );

              if (currentConversationId === null) {
                setActiveConversationId((currentId) => {
                  if (currentId !== null) return currentId;

                  skipNextMessagesLoadConversationId.current = nextConversationId;
                  return nextConversationId;
                });
              }
            }
            return;
          }

          if (event.type === "message-ids") {
            const parsedMessageIds = parseMessageIdsEvent(event.content);
            streamedUserMessageId = parsedMessageIds.userMessageId;
            streamedAssistantMessageId = parsedMessageIds.assistantMessageId;
            streamedUserFiles = parsedMessageIds.userFiles;
            return;
          }

          if (event.type === "error") {
            streamErrorMessage =
              toStreamContentString(event.content) || "Falha ao processar stream.";
          }
        }
      });

      if (streamErrorMessage) {
        throw new Error(streamErrorMessage);
      }

      const resolvedConversationId = streamedConversationId ?? currentConversationId;
      if (!resolvedConversationId) {
        throw new Error("Stream finalizado sem ID da conversa.");
      }
      if (!streamedUserMessageId || !streamedAssistantMessageId) {
        throw new Error("Stream finalizado sem IDs finais das mensagens.");
      }
      const finalUserMessageId = streamedUserMessageId;
      const finalAssistantMessageId = streamedAssistantMessageId;

      setConversations((currentConversations) => {
        const normalizedConversationName = streamedConversationName.trim();
        const withoutOptimisticConversation =
          optimisticConversationId !== null && optimisticConversationId !== resolvedConversationId
            ? currentConversations.filter((item) => item.id !== optimisticConversationId)
            : currentConversations;

        if (!normalizedConversationName) {
          return withoutOptimisticConversation;
        }

        return upsertConversation(
          withoutOptimisticConversation,
          normalizeConversation({
            id: resolvedConversationId,
            name: normalizedConversationName,
            updatedAt: new Date().toISOString()
          })
        );
      });

      if (!streamedConversationName.trim()) {
        touchConversation(resolvedConversationId);
      }

      setActiveConversationId((currentId) => {
        if (currentId === resolvedConversationId) return currentId;
        skipNextMessagesLoadConversationId.current = resolvedConversationId;
        return resolvedConversationId;
      });

      setMessages((currentMessages) => {
        let foundOptimisticUser = false;
        let foundOptimisticAssistant = false;

        const nextMessages = currentMessages.map((message) => {
          if (message.id === optimisticAssistantMessageId) {
            foundOptimisticAssistant = true;
            return {
              ...message,
              id: finalAssistantMessageId,
              conversationId: resolvedConversationId,
              content: message.content || streamedAssistantContent || "Nao consegui gerar uma resposta agora.",
              loading: false
            };
          }

          const shouldPatchUserId =
            (optimisticUserMessageId !== null && message.id === optimisticUserMessageId) ||
            (editingMessage && Boolean(editingMessageId) && message.id === editingMessageId);

          if (shouldPatchUserId) {
            foundOptimisticUser = true;
            return {
              ...message,
              id: finalUserMessageId,
              conversationId: resolvedConversationId,
              files: streamedUserFiles ?? message.files ?? []
            };
          }

          return message;
        });

        const withFallbackUser = foundOptimisticUser
          ? nextMessages
          : [
            ...nextMessages,
            {
              id: finalUserMessageId,
              conversationId: resolvedConversationId,
              role: "user",
              content: trimmedPrompt || "Mensagem com anexos.",
              files: streamedUserFiles ?? [],
              date: optimisticTimestamp
            }
          ];

        const withFallbackAssistant = foundOptimisticAssistant
          ? withFallbackUser
          : [
            ...withFallbackUser,
            {
              id: finalAssistantMessageId,
              conversationId: resolvedConversationId,
              role: "assistant",
              content: streamedAssistantContent || "Nao consegui gerar uma resposta agora.",
              files: [],
              date: new Date().toISOString(),
              loading: false
            }
          ];

        return dedupeMessagesById(withFallbackAssistant);
      });

      return true;
    } catch (requestError) {
      const userCancelledStream =
        userCancelledStreamRef.current && isStreamAbortError(requestError);

      if (userCancelledStream) {
        const resolvedConversationId = streamedConversationId ?? currentConversationId;
        const canceledAssistantContent = streamedAssistantContent.trim();

        if (resolvedConversationId) {
          setActiveConversationId((currentId) => {
            if (currentId === resolvedConversationId) return currentId;

            skipNextMessagesLoadConversationId.current = resolvedConversationId;
            return resolvedConversationId;
          });

          await loadMessages(resolvedConversationId);

          if (canceledAssistantContent) {
            setMessages((currentMessages) => [
              ...currentMessages,
              {
                id: optimisticAssistantMessageId,
                conversationId: resolvedConversationId,
                role: "assistant",
                content: canceledAssistantContent,
                files: [],
                date: new Date().toISOString(),
                loading: false
              }
            ]);
          }

          touchConversation(resolvedConversationId);
          return false;
        }

        setMessages(previousMessages);
        if (!editingMessage) {
          setPrompt(previousPrompt);
          setPendingFiles(previousPendingFiles);
        }

        if (currentConversationId === null && optimisticConversationId !== null) {
          setConversations((currentConversations) =>
            currentConversations.filter((conversation) => conversation.id !== optimisticConversationId)
          );
          setActiveConversationId((currentId) =>
            currentId === optimisticConversationId ? null : currentId
          );
        }

        await loadConversations();
        return false;
      }

      if (editingMessage && currentConversationId) {
        await loadMessages(currentConversationId);
      } else {
        setMessages(previousMessages);
        if (!editingMessage) {
          setPrompt(previousPrompt);
          setPendingFiles(previousPendingFiles);
        }
      }

      if (currentConversationId === null && optimisticConversationId !== null) {
        setConversations((currentConversations) =>
          currentConversations.filter((conversation) => conversation.id !== optimisticConversationId)
        );
        setActiveConversationId((currentId) =>
          currentId === optimisticConversationId ? null : currentId
        );
      }

      setError((requestError as Error).message);
      return false;
    } finally {
      streamAbortControllerRef.current = null;
      userCancelledStreamRef.current = false;
      setSending(false);
    }
  }

  return {
    conversations,
    filteredConversations,
    activeConversation,
    activeConversationId,
    messages,
    conversationQuery,
    prompt,
    pendingFiles,
    loadingConversations,
    loadingMessages,
    sending,
    renamingConversation,
    clearingConversation,
    exportingConversation,
    deletingConversationIds,
    deletingActiveConversation,
    updatingMessageIds,
    canSend,
    error,
    createNewConversation,
    selectConversation,
    updateConversationQuery,
    updatePrompt,
    addPendingFiles,
    removePendingFile,
    deleteConversationById,
    editConversationMessage,
    renameActiveConversation,
    clearActiveConversation,
    exportActiveConversationPdf,
    cancelSendingMessage,
    sendMessage
  };
}

function areMessagesEquivalent(currentMessages: Message[], nextMessages: Message[]): boolean {
  if (currentMessages.length !== nextMessages.length) return false;

  for (let i = 0; i < currentMessages.length; i += 1) {
    const current = currentMessages[i];
    const next = nextMessages[i];

    if (
      current.id !== next.id ||
      current.content !== next.content ||
      current.role !== next.role ||
      current.date !== next.date ||
      current.createdAt !== next.createdAt ||
      current.updatedAt !== next.updatedAt ||
      Boolean(current.loading) !== Boolean(next.loading)
    ) {
      return false;
    }

    const currentFiles = current.files ?? [];
    const nextFiles = next.files ?? [];
    if (currentFiles.length !== nextFiles.length) return false;

    for (let fileIndex = 0; fileIndex < currentFiles.length; fileIndex += 1) {
      const currentFile = currentFiles[fileIndex];
      const nextFile = nextFiles[fileIndex];
      if (currentFile.name !== nextFile.name || currentFile.url !== nextFile.url) {
        return false;
      }
    }
  }

  return true;
}

function toStreamContentString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseConversationNameEvent(value: unknown): { id: number | null; name: string } {
  if (typeof value === "string") {
    return { id: null, name: value.trim() };
  }

  if (!value || typeof value !== "object") {
    return { id: null, name: "" };
  }

  const typedValue = value as { id?: unknown; name?: unknown; title?: unknown };
  const id = parsePositiveInteger(typedValue.id);
  const name = String(typedValue.name ?? typedValue.title ?? "").trim();
  return { id, name };
}

function parseMessageIdsEvent(value: unknown): {
  userMessageId: number | null;
  assistantMessageId: number | null;
  userFiles: ChatFile[] | null;
} {
  if (!value || typeof value !== "object") {
    return { userMessageId: null, assistantMessageId: null, userFiles: null };
  }

  const typedValue = value as {
    userMessageId?: unknown;
    assistantMessageId?: unknown;
    user_id?: unknown;
    assistant_id?: unknown;
    userFiles?: unknown;
    user_files?: unknown;
  };

  const userMessageId = parsePositiveInteger(typedValue.userMessageId ?? typedValue.user_id);
  const assistantMessageId = parsePositiveInteger(
    typedValue.assistantMessageId ?? typedValue.assistant_id
  );
  const userFiles = parseStreamFiles(typedValue.userFiles ?? typedValue.user_files);

  return { userMessageId, assistantMessageId, userFiles };
}

function parsePositiveInteger(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.trunc(parsed);
}

function parseStreamFiles(value: unknown): ChatFile[] | null {
  if (value === undefined) return null;
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

function dedupeMessagesById(messages: Message[]): Message[] {
  const nextMessages: Message[] = [];
  const seenIds = new Set<number>();

  for (const message of messages) {
    if (seenIds.has(message.id)) continue;
    seenIds.add(message.id);
    nextMessages.push(message);
  }

  return nextMessages;
}

function isStreamAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.trim().toLowerCase() === "requisicao de stream cancelada ou expirou.";
}
