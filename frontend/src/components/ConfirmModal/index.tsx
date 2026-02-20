import { MouseEvent, ReactNode, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import * as S from "./styles";

export type ConfirmModalTone = "neutral" | "accent" | "danger";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  eyebrow?: string;
  tone?: ConfirmModalTone;
  confirmLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  closeOnBackdrop?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

const EYEBROW_BY_TONE: Record<ConfirmModalTone, string> = {
  neutral: "Confirmacao",
  accent: "Atencao",
  danger: "Acao critica"
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  eyebrow,
  tone = "neutral",
  confirmLoading = false,
  icon,
  children,
  closeOnBackdrop = true,
  onConfirm,
  onClose
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !confirmLoading) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, confirmLoading, onClose]);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (!closeOnBackdrop || confirmLoading) return;
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  if (!open) return null;

  return createPortal(
    <S.Backdrop onMouseDown={handleBackdropClick}>
      <S.ModalCard
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        $tone={tone}
      >
        <S.Eyebrow $tone={tone}>{eyebrow || EYEBROW_BY_TONE[tone]}</S.Eyebrow>
        <S.TitleRow>
          {icon && <S.IconWrap $tone={tone}>{icon}</S.IconWrap>}
          <S.Title id={titleId}>{title}</S.Title>
        </S.TitleRow>

        {description && <S.Description id={descriptionId}>{description}</S.Description>}
        {children && <S.Body>{children}</S.Body>}

        <S.Actions>
          <S.SecondaryButton type="button" onClick={onClose} disabled={confirmLoading}>
            {cancelLabel}
          </S.SecondaryButton>
          <S.PrimaryButton
            type="button"
            onClick={() => void onConfirm()}
            disabled={confirmLoading}
            $tone={tone}
          >
            {confirmLoading ? "Processando..." : confirmLabel}
          </S.PrimaryButton>
        </S.Actions>
      </S.ModalCard>
    </S.Backdrop>,
    document.body
  );
}
