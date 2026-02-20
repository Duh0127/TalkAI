import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownRender } from "../../../../components/MarkdownRender";
import { Spinner } from "../../../../components/Spinner";
import { formatHour } from "../../../../services/date.service";
import { Message } from "../../../../types/chat.types";
import { ScrollToBottomButton } from "../ScrollToBottomButton";
import * as S from "./styles";

type MessageListProps = {
  messages: Message[];
  loadingMessages: boolean;
  showEmptyState?: boolean;
  updatingMessageIds: number[];
  onEditMessage: (messageId: number, content: string) => Promise<boolean>;
};

const STREAMING_MESSAGE_TOP_OFFSET = 6;

export function MessageList({
  messages,
  loadingMessages,
  showEmptyState = true,
  updatingMessageIds,
  onEditMessage
}: MessageListProps) {
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef<boolean>(true);

  const editingMessage = useMemo(() => {
    if (!editingMessageId) return null;
    return messages.find((message) => message.id === editingMessageId) ?? null;
  }, [messages, editingMessageId]);

  const savingEditingMessage =
    editingMessage !== null && updatingMessageIds.includes(editingMessage.id);

  const publishBottomState = useCallback(
    (isAtBottom: boolean) => {
      if (isAtBottomRef.current === isAtBottom) return;
      isAtBottomRef.current = isAtBottom;
      setIsAtBottom(isAtBottom);
    },
    []
  );

  const updateBottomState = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      publishBottomState(true);
      return;
    }

    const bottomOffset = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isAtBottom = bottomOffset <= 20;
    publishBottomState(isAtBottom);
  }, [publishBottomState]);

  useEffect(
    () => () => {
      if (copyFeedbackTimeoutRef.current) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (editingMessage || editingMessageId === null) return;
    setEditingMessageId(null);
    setEditingContent("");
  }, [editingMessage, editingMessageId]);

  useEffect(() => {
    if (!copiedMessageId) return;
    if (messages.some((message) => message.id === copiedMessageId)) return;
    setCopiedMessageId(null);
  }, [messages, copiedMessageId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateBottomState();
    };

    updateBottomState();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateBottomState]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      updateBottomState();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [messages, loadingMessages, editingMessageId, copiedMessageId, updateBottomState]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    if (lastMessage.role !== "assistant") return;
    if (lastMessage.id >= 0) return;

    const frameId = window.requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (!container) return;

      const targetElement = container.querySelector<HTMLElement>(
        `[data-message-id="${lastMessage.id}"]`
      );
      if (!targetElement) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const nextTop =
        container.scrollTop + (targetRect.top - containerRect.top) - STREAMING_MESSAGE_TOP_OFFSET;

      container.scrollTo({
        top: Math.max(nextTop, 0),
        behavior: "auto"
      });
      updateBottomState();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [messages, updateBottomState]);

  function handleScrollToBottom() {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }

  function handleStartEdit(message: Message) {
    if (message.role === "assistant") return;
    if (updatingMessageIds.includes(message.id)) return;

    setEditingMessageId(message.id);
    setEditingContent(message.content);
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setEditingContent("");
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleConfirmEditMessage();
    }
  }

  async function handleConfirmEditMessage() {
    if (!editingMessage) return;

    const nextContent = editingContent.trim();
    if (!nextContent) return;

    if (nextContent === editingMessage.content.trim()) {
      handleCancelEdit();
      return;
    }

    const edited = await onEditMessage(editingMessage.id, nextContent);
    if (edited) {
      handleCancelEdit();
    }
  }

  async function handleCopyMessage(message: Message) {
    const copyText = buildMessageCopyText(message);
    if (!copyText) return;

    const copied = await copyToClipboard(copyText);
    if (!copied) return;

    setCopiedMessageId(message.id);

    if (copyFeedbackTimeoutRef.current) {
      window.clearTimeout(copyFeedbackTimeoutRef.current);
    }

    copyFeedbackTimeoutRef.current = window.setTimeout(() => {
      setCopiedMessageId((currentCopiedId) =>
        currentCopiedId === message.id ? null : currentCopiedId
      );
    }, 1600);
  }

  const showInitialLoading = loadingMessages && messages.length === 0;
  const showScrollToBottomButton = !showInitialLoading && messages.length > 0 && !isAtBottom;

  return (
    <S.MessagesWrapper>
      <S.Messages ref={messagesContainerRef}>
        <S.MessagesInner>
          {showInitialLoading && (
            <S.LoadingState>
              <Spinner text="Carregando mensagens" />
            </S.LoadingState>
          )}

          {!showInitialLoading && showEmptyState && messages.length === 0 && (
            <S.EmptyState>
              <h3>Pronto para conversar</h3>
              <p>Envie um prompt direto para o OpenAI e, se quiser, adicione PDF, TXT ou imagens.</p>
            </S.EmptyState>
          )}

          {!showInitialLoading &&
            messages.map((message) => {
              const updating = updatingMessageIds.includes(message.id);
              const assistantMessage = message.role === "assistant";
              const loadingAssistant = assistantMessage && Boolean(message.loading);
              const editing = editingMessageId === message.id;
              const copied = copiedMessageId === message.id;
              const showActions = updating || copied;

              return (
                <S.MessageBubble
                  key={message.id}
                  $assistant={assistantMessage}
                  data-message-id={message.id}
                >
                  <S.MessageRole $assistant={assistantMessage}>
                    {assistantMessage ? "Assistente" : "Voce"}
                  </S.MessageRole>

                  {loadingAssistant ? (
                    <S.AssistantLoading aria-live="polite">
                      <S.LoadingDots aria-hidden>
                        <span />
                        <span />
                        <span />
                      </S.LoadingDots>
                      <span>Gerando resposta...</span>
                    </S.AssistantLoading>
                  ) : editing ? (
                    <>
                      <S.MessageEditor
                        value={editingContent}
                        onChange={(event) => setEditingContent(event.target.value)}
                        onKeyDown={handleEditKeyDown}
                        disabled={savingEditingMessage}
                        autoFocus
                      />
                      <S.MessageEditActions>
                        <S.EditorButton
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={savingEditingMessage}
                        >
                          Cancelar
                        </S.EditorButton>
                        <S.EditorButton
                          type="button"
                          $primary
                          onClick={() => void handleConfirmEditMessage()}
                          disabled={savingEditingMessage || editingContent.trim().length === 0}
                        >
                          {savingEditingMessage ? "Salvando..." : "Salvar"}
                        </S.EditorButton>
                      </S.MessageEditActions>
                    </>
                  ) : (
                    <S.MessageContent>
                      <MarkdownRender content={message.content} />
                    </S.MessageContent>
                  )}

                  {!loadingAssistant && message.files && message.files.length > 0 && (
                    <S.MessageFiles>
                      {message.files.map((file) => (
                        <S.FileLink
                          key={`${message.id}_${file.url}`}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {file.name}
                        </S.FileLink>
                      ))}
                    </S.MessageFiles>
                  )}

                  {!loadingAssistant && (
                    <S.MessageFooter>
                      <S.MessageTime>{formatHour(message.date || message.createdAt)}</S.MessageTime>

                      {!editing && (
                        <S.MessageActions $visible={showActions}>
                          <S.MessageActionButton
                            type="button"
                            onClick={() => void handleCopyMessage(message)}
                            disabled={updating}
                            title={copied ? "Mensagem copiada" : "Copiar mensagem"}
                            aria-label={copied ? "Mensagem copiada" : "Copiar mensagem"}
                          >
                            {copied ? (
                              "Copiado"
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                                <rect x="9" y="9" width="10" height="10" rx="2" />
                                <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
                              </svg>
                            )}
                          </S.MessageActionButton>

                          {!assistantMessage && (
                            <S.MessageActionButton
                              type="button"
                              onClick={() => handleStartEdit(message)}
                              disabled={updating}
                              title="Editar mensagem"
                              aria-label="Editar mensagem"
                            >
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M12 20H21" />
                                <path d="M16.5 3.5A2.12 2.12 0 1 1 19.5 6.5L7 19l-4 1 1-4 12.5-12.5Z" />
                              </svg>
                            </S.MessageActionButton>
                          )}
                        </S.MessageActions>
                      )}
                    </S.MessageFooter>
                  )}
                </S.MessageBubble>
              );
            })}
        </S.MessagesInner>
      </S.Messages>
      <ScrollToBottomButton
        visible={showScrollToBottomButton}
        onClick={handleScrollToBottom}
      />
    </S.MessagesWrapper>
  );
}

function buildMessageCopyText(message: Message): string {
  const content = String(message.content ?? "").trim();
  if (content) return content;

  const files = message.files ?? [];
  if (!files.length) return "";

  return files.map((file) => `${file.name}: ${file.url}`).join("\n");
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      // fallback to document.execCommand below
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch (_error) {
    return false;
  }
}
