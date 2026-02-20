import { useEffect, useState } from "react";
import { ConfirmModal } from "../../../../components/ConfirmModal";
import { formatHour } from "../../../../services/date.service";
import { Conversation } from "../../../../types/chat.types";
import * as S from "./styles";

type ConversationSidebarProps = {
  conversations: Conversation[];
  activeConversationId: number | null;
  conversationQuery: string;
  loadingConversations: boolean;
  deletingConversationIds: number[];
  mobileOpen: boolean;
  compactMode: boolean;
  onCreateConversation: () => void;
  onConversationQueryChange: (query: string) => void;
  onSelectConversation: (conversationId: number) => void;
  onDeleteConversation: (conversationId: number) => Promise<boolean>;
  onRequestClose: () => void;
};

export function ConversationSidebar({
  conversations,
  activeConversationId,
  conversationQuery,
  loadingConversations,
  deletingConversationIds,
  mobileOpen,
  compactMode,
  onCreateConversation,
  onConversationQueryChange,
  onSelectConversation,
  onDeleteConversation,
  onRequestClose
}: ConversationSidebarProps) {
  const [targetConversation, setTargetConversation] = useState<Conversation | null>(null);

  const deletingTargetConversation =
    targetConversation !== null && deletingConversationIds.includes(targetConversation.id);

  useEffect(() => {
    if (!targetConversation) return;
    if (!conversations.some((conversation) => conversation.id === targetConversation.id)) {
      setTargetConversation(null);
    }
  }, [conversations, targetConversation]);

  async function handleConfirmDeleteConversation() {
    if (!targetConversation) return;
    const deleted = await onDeleteConversation(targetConversation.id);
    if (deleted) {
      setTargetConversation(null);
    }
  }

  function handleSelectConversation(conversationId: number) {
    onSelectConversation(conversationId);
    if (compactMode) {
      onRequestClose();
    }
  }

  function handleCreateConversation() {
    onCreateConversation();
    if (compactMode) {
      onRequestClose();
    }
  }

  return (
    <S.Sidebar $mobileOpen={mobileOpen}>
      <S.SidebarTop>
        <S.SidebarTitleRow>
          <S.LogoTitle>TalkAI</S.LogoTitle>
          <S.MobileCloseButton
            type="button"
            title="Fechar menu de conversas"
            aria-label="Fechar menu de conversas"
            onClick={onRequestClose}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18" />
              <path d="M6 6L18 18" />
            </svg>
          </S.MobileCloseButton>
        </S.SidebarTitleRow>
        <S.PrimaryButton type="button" onClick={handleCreateConversation}>
          Nova conversa
        </S.PrimaryButton>
        <S.SearchInput
          placeholder="Buscar conversa..."
          value={conversationQuery}
          onChange={(event) => onConversationQueryChange(event.target.value)}
        />
      </S.SidebarTop>

      <S.ConversationList>
        {loadingConversations && <S.MutedText as="li">Carregando conversas...</S.MutedText>}

        {!loadingConversations && conversations.length === 0 && (
          <S.MutedText as="li">Nenhuma conversa encontrada.</S.MutedText>
        )}

        {!loadingConversations &&
          conversations.map((conversation) => {
            const deletingConversation = deletingConversationIds.includes(conversation.id);

            return (
              <S.ConversationRow key={conversation.id} $active={conversation.id === activeConversationId}>
                <S.ConversationSelectButton
                  type="button"
                  onClick={() => handleSelectConversation(conversation.id)}
                  $active={conversation.id === activeConversationId}
                  disabled={deletingConversation}
                >
                  <S.ConversationSummary>
                    <S.ConversationName>{conversation.name}</S.ConversationName>
                    <S.ConversationTime>
                      {formatHour(conversation.updatedAt || conversation.createdAt)}
                    </S.ConversationTime>
                  </S.ConversationSummary>
                </S.ConversationSelectButton>

                <S.ConversationDeleteButton
                  type="button"
                  title="Excluir conversa"
                  aria-label={`Excluir conversa ${conversation.name}`}
                  onClick={() => setTargetConversation(conversation)}
                  disabled={deletingConversation}
                >
                  {deletingConversation ? (
                    <S.TinySpinner aria-hidden />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M3 6H21" />
                      <path d="M8 6V4H16V6" />
                      <path d="M19 6L18.2 18.2C18.1 19.2 17.2 20 16.2 20H7.8C6.8 20 5.9 19.2 5.8 18.2L5 6" />
                      <path d="M10 10V16" />
                      <path d="M14 10V16" />
                    </svg>
                  )}
                </S.ConversationDeleteButton>
              </S.ConversationRow>
            );
          })}
      </S.ConversationList>

      <ConfirmModal
        open={Boolean(targetConversation)}
        tone="danger"
        title="Excluir conversa?"
        description={
          targetConversation
            ? `A conversa "${targetConversation.name}" sera removida da sidebar e nao aparecera mais na lista principal.`
            : undefined
        }
        confirmLabel="Excluir conversa"
        cancelLabel="Cancelar"
        confirmLoading={deletingTargetConversation}
        onClose={() => setTargetConversation(null)}
        onConfirm={handleConfirmDeleteConversation}
        icon={
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 6H21" />
            <path d="M8 6V4H16V6" />
            <path d="M19 6L18.2 18.2C18.1 19.2 17.2 20 16.2 20H7.8C6.8 20 5.9 19.2 5.8 18.2L5 6" />
            <path d="M10 10V16" />
            <path d="M14 10V16" />
          </svg>
        }
      >
        <S.DeleteHint>Use esta acao quando quiser arquivar definitivamente este contexto.</S.DeleteHint>
      </ConfirmModal>
    </S.Sidebar>
  );
}
