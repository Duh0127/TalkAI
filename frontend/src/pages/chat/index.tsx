import { useEffect, useState } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import * as S from "./styles";
import { useChat } from "./hooks/useChat";
import { ChatHeader } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { MessageInput } from "./components/MessageInput";
import { ConversationSidebar } from "./components/ConversationSidebar";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 980px)";

export default function ChatPage() {
  const chat = useChat();
  const [dockingComposer, setDockingComposer] = useState(false);
  const [compactMode, setCompactMode] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? !window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches : true
  );
  const [mobileEditingTitle, setMobileEditingTitle] = useState(false);
  const [mobileDraftName, setMobileDraftName] = useState("");
  const [mobileClearModalOpen, setMobileClearModalOpen] = useState(false);

  const centeredComposer = !compactMode && chat.activeConversationId === null && !dockingComposer;
  const exportableMessagesCount =
    chat.activeConversationId === null
      ? 0
      : chat.messages.filter(
        (message) =>
          message.conversationId === chat.activeConversationId &&
          !message.loading &&
          !message.del
      ).length;
  const canExportConversation =
    Boolean(chat.activeConversation) && !chat.loadingMessages && exportableMessagesCount > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const syncMode = () => {
      setCompactMode(mediaQuery.matches);
    };

    syncMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncMode);
      return () => mediaQuery.removeEventListener("change", syncMode);
    }

    mediaQuery.addListener(syncMode);
    return () => mediaQuery.removeListener(syncMode);
  }, []);

  useEffect(() => {
    setSidebarOpen(!compactMode);
  }, [compactMode]);

  useEffect(() => {
    if (!compactMode || !sidebarOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [compactMode, sidebarOpen]);

  useEffect(() => {
    if (chat.activeConversationId !== null) {
      setDockingComposer(false);
    }
  }, [chat.activeConversationId]);

  useEffect(() => {
    setMobileEditingTitle(false);
    setMobileDraftName(chat.activeConversation?.name ?? "");
    setMobileClearModalOpen(false);
  }, [chat.activeConversation?.id]);

  useEffect(() => {
    if (!mobileEditingTitle) {
      setMobileDraftName(chat.activeConversation?.name ?? "");
    }
  }, [chat.activeConversation?.name, mobileEditingTitle]);

  async function handleSendMessage() {
    const shouldAnimateDocking =
      !compactMode && chat.activeConversationId === null && !dockingComposer && !chat.sending;

    if (shouldAnimateDocking) {
      setDockingComposer(true);
    }

    const sent = await chat.sendMessage();

    if (sent && compactMode) {
      setSidebarOpen(false);
    }

    if (!sent && shouldAnimateDocking) {
      setDockingComposer(false);
    }

    return sent;
  }

  function handleMobileStartRename() {
    if (!chat.activeConversation || chat.renamingConversation || chat.deletingActiveConversation) return;
    setMobileDraftName(chat.activeConversation.name);
    setMobileEditingTitle(true);
  }

  async function handleMobileConfirmRename() {
    if (!chat.activeConversation) return;
    const updated = await chat.renameActiveConversation(mobileDraftName);
    if (updated) {
      setMobileEditingTitle(false);
    }
  }

  function handleMobileCancelRename() {
    setMobileDraftName(chat.activeConversation?.name ?? "");
    setMobileEditingTitle(false);
  }

  function handleMobileOpenClearModal() {
    if (!chat.activeConversation || chat.clearingConversation || chat.deletingActiveConversation) return;
    setMobileClearModalOpen(true);
  }

  async function handleMobileConfirmClearConversation() {
    if (!chat.activeConversation || chat.clearingConversation) return;
    const cleared = await chat.clearActiveConversation();
    if (cleared) {
      setMobileClearModalOpen(false);
    }
  }

  return (
    <S.Layout>
      <S.SidebarBackdrop
        type="button"
        aria-label="Fechar menu de conversas"
        $visible={compactMode && sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <ConversationSidebar
        conversations={chat.filteredConversations}
        activeConversationId={chat.activeConversationId}
        conversationQuery={chat.conversationQuery}
        loadingConversations={chat.loadingConversations}
        deletingConversationIds={chat.deletingConversationIds}
        mobileOpen={!compactMode || sidebarOpen}
        compactMode={compactMode}
        onCreateConversation={chat.createNewConversation}
        onConversationQueryChange={chat.updateConversationQuery}
        onSelectConversation={chat.selectConversation}
        onDeleteConversation={chat.deleteConversationById}
        onRequestClose={() => setSidebarOpen(false)}
      />

      <S.ChatPanel>
        {compactMode && (
          <S.MobileToolbar>
            <S.MobileToolbarLeft>
              <S.MenuButton
                type="button"
                title={sidebarOpen ? "Fechar conversas" : "Abrir conversas"}
                aria-label={sidebarOpen ? "Fechar conversas" : "Abrir conversas"}
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen((currentValue) => !currentValue)}
              >
                {sidebarOpen ? (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M18 6L6 18" />
                    <path d="M6 6L18 18" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 7H20" />
                    <path d="M4 12H20" />
                    <path d="M4 17H20" />
                  </svg>
                )}
              </S.MenuButton>
              {mobileEditingTitle ? (
                <S.MobileTitleInput
                  value={mobileDraftName}
                  onChange={(event) => setMobileDraftName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleMobileConfirmRename();
                    }

                    if (event.key === "Escape") {
                      handleMobileCancelRename();
                    }
                  }}
                  placeholder="Nome da conversa"
                  maxLength={200}
                  disabled={chat.renamingConversation}
                />
              ) : (
                <S.MobileToolbarTitle>{chat.activeConversation?.name || "Conversas"}</S.MobileToolbarTitle>
              )}
            </S.MobileToolbarLeft>

            <S.MobileToolbarActions>
              {mobileEditingTitle ? (
                <>
                  <S.ToolbarActionButton
                    type="button"
                    title="Confirmar nome"
                    aria-label="Confirmar nome"
                    onClick={() => void handleMobileConfirmRename()}
                    disabled={chat.renamingConversation}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12L10 17L19 8" />
                    </svg>
                  </S.ToolbarActionButton>

                  <S.ToolbarActionButton
                    type="button"
                    title="Cancelar edicao"
                    aria-label="Cancelar edicao"
                    onClick={handleMobileCancelRename}
                    disabled={chat.renamingConversation}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M18 6L6 18" />
                      <path d="M6 6L18 18" />
                    </svg>
                  </S.ToolbarActionButton>
                </>
              ) : (
                <S.ToolbarActionButton
                  type="button"
                  title="Editar nome da conversa"
                  aria-label="Editar nome da conversa"
                  onClick={handleMobileStartRename}
                  disabled={!chat.activeConversation || chat.renamingConversation || chat.deletingActiveConversation}
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 20H21" />
                    <path d="M16.5 3.5A2.12 2.12 0 1 1 19.5 6.5L7 19l-4 1 1-4 12.5-12.5Z" />
                  </svg>
                </S.ToolbarActionButton>
              )}

              <S.ToolbarActionButton
                type="button"
                title="Exportar conversa em PDF"
                aria-label="Exportar conversa em PDF"
                onClick={() => void chat.exportActiveConversationPdf()}
                disabled={!canExportConversation || chat.exportingConversation || chat.deletingActiveConversation}
              >
                {chat.exportingConversation ? (
                  <S.ToolbarActionSpinner aria-hidden />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 4V14" />
                    <path d="M8 10L12 14L16 10" />
                    <path d="M5 18H19" />
                  </svg>
                )}
              </S.ToolbarActionButton>

              <S.ToolbarActionButton
                type="button"
                $danger
                title="Limpar conversa"
                aria-label="Limpar conversa"
                onClick={handleMobileOpenClearModal}
                disabled={!chat.activeConversation || chat.clearingConversation || chat.deletingActiveConversation}
              >
                {chat.clearingConversation ? (
                  <S.ToolbarActionSpinner aria-hidden />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 17H20" />
                    <path d="M7 17L9.5 6H14.5L17 17" />
                    <path d="M6 6H18" />
                    <path d="M10 10H14" />
                  </svg>
                )}
              </S.ToolbarActionButton>
            </S.MobileToolbarActions>
          </S.MobileToolbar>
        )}

        {!compactMode && (
          <ChatHeader
            activeConversation={chat.activeConversation}
            renamingConversation={chat.renamingConversation}
            clearingConversation={chat.clearingConversation}
            exportingConversation={chat.exportingConversation}
            deletingActiveConversation={chat.deletingActiveConversation}
            canExportConversation={canExportConversation}
            onRenameConversation={chat.renameActiveConversation}
            onClearConversation={chat.clearActiveConversation}
            onExportConversation={chat.exportActiveConversationPdf}
          />
        )}
        <MessageList
          messages={chat.messages}
          loadingMessages={chat.loadingMessages}
          showEmptyState={!centeredComposer}
          updatingMessageIds={chat.updatingMessageIds}
          onEditMessage={chat.editConversationMessage}
        />
        <MessageInput
          layout={centeredComposer ? "centered" : "docked"}
          animateDocking={dockingComposer}
          introText={
            centeredComposer
              ? "O que voce quer descobrir hoje?"
              : undefined
          }
          prompt={chat.prompt}
          pendingFiles={chat.pendingFiles}
          sending={chat.sending}
          canSend={chat.canSend}
          onPromptChange={chat.updatePrompt}
          onAddPendingFiles={chat.addPendingFiles}
          onRemovePendingFile={chat.removePendingFile}
          onSend={handleSendMessage}
          onCancel={chat.cancelSendingMessage}
        />

        {chat.error && <S.ErrorMessage>{chat.error}</S.ErrorMessage>}

        <ConfirmModal
          open={compactMode && mobileClearModalOpen}
          tone="accent"
          title="Limpar conversa ativa?"
          description={
            chat.activeConversation
              ? `As mensagens de "${chat.activeConversation.name}" serao ocultadas da timeline atual.`
              : undefined
          }
          confirmLabel="Limpar conversa"
          cancelLabel="Cancelar"
          confirmLoading={chat.clearingConversation}
          onClose={() => setMobileClearModalOpen(false)}
          onConfirm={handleMobileConfirmClearConversation}
          icon={
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7H20" />
              <path d="M6 11H18" />
              <path d="M9 15H15" />
              <path d="M5 4H19L18 20H6L5 4Z" />
            </svg>
          }
        >
          <S.MobileModalTip>A conversa permanece disponivel para novos prompts logo apos a limpeza.</S.MobileModalTip>
        </ConfirmModal>
      </S.ChatPanel>
    </S.Layout>
  );
}
