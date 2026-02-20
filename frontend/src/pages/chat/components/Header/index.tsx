import { useEffect, useState } from "react";
import { ConfirmModal } from "../../../../components/ConfirmModal";
import { Conversation } from "../../../../types/chat.types";
import * as S from "./styles";

type ChatHeaderProps = {
  activeConversation: Conversation | null;
  renamingConversation: boolean;
  clearingConversation: boolean;
  exportingConversation: boolean;
  deletingActiveConversation: boolean;
  canExportConversation: boolean;
  onRenameConversation: (name: string) => Promise<boolean>;
  onClearConversation: () => Promise<boolean>;
  onExportConversation: () => Promise<boolean>;
};

export function ChatHeader({
  activeConversation,
  renamingConversation,
  clearingConversation,
  exportingConversation,
  deletingActiveConversation,
  canExportConversation,
  onRenameConversation,
  onClearConversation,
  onExportConversation
}: ChatHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [openClearModal, setOpenClearModal] = useState(false);

  useEffect(() => {
    setDraftName(activeConversation?.name ?? "");
    setIsEditingTitle(false);
  }, [activeConversation?.id]);

  useEffect(() => {
    if (!isEditingTitle) {
      setDraftName(activeConversation?.name ?? "");
    }
  }, [activeConversation?.name, isEditingTitle]);

  useEffect(() => {
    setOpenClearModal(false);
  }, [activeConversation?.id]);

  function handleStartEditing() {
    if (!activeConversation || renamingConversation) return;
    setDraftName(activeConversation.name);
    setIsEditingTitle(true);
  }

  async function handleConfirmRename() {
    if (!activeConversation) return;
    const updated = await onRenameConversation(draftName);
    if (updated) {
      setIsEditingTitle(false);
    }
  }

  function handleCancelRename() {
    setDraftName(activeConversation?.name ?? "");
    setIsEditingTitle(false);
  }

  function handleOpenClearModal() {
    if (!activeConversation || clearingConversation || deletingActiveConversation) return;
    setOpenClearModal(true);
  }

  async function handleConfirmClearConversation() {
    if (!activeConversation || clearingConversation) return;
    const cleared = await onClearConversation();
    if (cleared) {
      setOpenClearModal(false);
    }
  }

  return (
    <S.Header>
      <S.HeaderContent>
        <S.HeaderLabel>Conversa ativa</S.HeaderLabel>

        {activeConversation ? (
          isEditingTitle ? (
            <S.EditRow>
              <S.TitleInput
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Nome da conversa"
                maxLength={200}
                disabled={renamingConversation}
              />

              <S.IconButton
                type="button"
                title="Confirmar nome"
                aria-label="Confirmar nome"
                onClick={() => void handleConfirmRename()}
                disabled={renamingConversation}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12L10 17L19 8" />
                </svg>
              </S.IconButton>

              <S.IconButton
                type="button"
                title="Cancelar edicao"
                aria-label="Cancelar edicao"
                onClick={handleCancelRename}
                disabled={renamingConversation}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18" />
                  <path d="M6 6L18 18" />
                </svg>
              </S.IconButton>
            </S.EditRow>
          ) : (
            <S.TitleRow>
              <S.Title>{activeConversation.name}</S.Title>
              <S.IconButton
                type="button"
                title="Editar nome da conversa"
                aria-label="Editar nome da conversa"
                onClick={handleStartEditing}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 20H21" />
                  <path d="M16.5 3.5A2.12 2.12 0 1 1 19.5 6.5L7 19l-4 1 1-4 12.5-12.5Z" />
                </svg>
              </S.IconButton>
            </S.TitleRow>
          )
        ) : (
          <S.Title>Selecione ou crie uma conversa</S.Title>
        )}
      </S.HeaderContent>

      <S.HeaderActions>
        <S.ExportButton
          type="button"
          onClick={() => void onExportConversation()}
          disabled={!canExportConversation || exportingConversation || deletingActiveConversation}
        >
          {exportingConversation ? "Exportando..." : "Exportar PDF"}
        </S.ExportButton>

        <S.ClearButton
          type="button"
          onClick={handleOpenClearModal}
          disabled={!activeConversation || clearingConversation || deletingActiveConversation}
        >
          {clearingConversation
            ? "Limpando..."
            : deletingActiveConversation
              ? "Removendo..."
              : "Limpar conversa"}
        </S.ClearButton>
      </S.HeaderActions>

      <ConfirmModal
        open={openClearModal}
        tone="accent"
        title="Limpar conversa ativa?"
        description={
          activeConversation
            ? `As mensagens de "${activeConversation.name}" serao ocultadas da timeline atual.`
            : undefined
        }
        confirmLabel="Limpar conversa"
        cancelLabel="Cancelar"
        confirmLoading={clearingConversation}
        onClose={() => setOpenClearModal(false)}
        onConfirm={handleConfirmClearConversation}
        icon={
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7H20" />
            <path d="M6 11H18" />
            <path d="M9 15H15" />
            <path d="M5 4H19L18 20H6L5 4Z" />
          </svg>
        }
      >
        <S.ModalTip>A conversa permanece disponivel para novos prompts logo apos a limpeza.</S.ModalTip>
      </ConfirmModal>
    </S.Header>
  );
}
