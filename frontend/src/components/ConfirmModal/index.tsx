import { MouseEvent, ReactNode, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
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
          <Button
            type="button"
            onClick={onClose}
            disabled={confirmLoading}
            variant="soft"
            tone="neutral"
            size="md"
            radius="md"
            minHeight="38px"
            padding="0 14px"
            fontSize="13px"
            colorOverrides={{
              border: "rgba(145, 182, 205, 0.34)",
              background: "rgba(10, 24, 43, 0.72)",
              text: "var(--text-main)",
              hoverBorder: "rgba(106, 243, 255, 0.58)",
              hoverBackground: "rgba(13, 30, 53, 0.84)",
              hoverText: "var(--text-main)",
              disabledBorder: "rgba(122, 152, 172, 0.36)",
              disabledBackground: "rgba(65, 84, 104, 0.42)",
              disabledText: "rgba(219, 234, 249, 0.66)"
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => void onConfirm()}
            loading={confirmLoading}
            loadingLabel="Processando..."
            variant="solid"
            tone="accent"
            size="md"
            radius="md"
            minHeight="38px"
            padding="0 14px"
            fontSize="13px"
            fontWeight={700}
            elevateOnHover
            colorOverrides={buildConfirmPrimaryColors(tone)}
          >
            {confirmLabel}
          </Button>
        </S.Actions>
      </S.ModalCard>
    </S.Backdrop>,
    document.body
  );
}

function buildConfirmPrimaryColors(tone: ConfirmModalTone) {
  if (tone === "danger") {
    return {
      border: "rgba(61, 140, 255, 0.84)",
      background: "linear-gradient(120deg, #3d8cff, rgba(255, 255, 255, 0.82))",
      text: "#041423",
      hoverBorder: "rgba(96, 160, 255, 0.9)",
      hoverBackground: "linear-gradient(120deg, #5b9cff, rgba(255, 255, 255, 0.88))",
      hoverText: "#031220",
      activeBorder: "rgba(96, 160, 255, 0.9)",
      activeBackground: "linear-gradient(120deg, #3277d8, rgba(233, 245, 255, 0.82))",
      activeText: "#031220",
      disabledBorder: "rgba(88, 136, 186, 0.48)",
      disabledBackground: "rgba(96, 122, 148, 0.44)",
      disabledText: "rgba(213, 227, 241, 0.66)"
    };
  }

  if (tone === "accent") {
    return {
      border: "rgba(106, 243, 255, 0.82)",
      background: "linear-gradient(120deg, #6af3ff, rgba(255, 255, 255, 0.82))",
      text: "#041423",
      hoverBorder: "rgba(142, 249, 255, 0.92)",
      hoverBackground: "linear-gradient(120deg, #84f6ff, rgba(255, 255, 255, 0.88))",
      hoverText: "#041423",
      activeBorder: "rgba(142, 249, 255, 0.92)",
      activeBackground: "linear-gradient(120deg, #58d8e4, rgba(240, 255, 255, 0.84))",
      activeText: "#041423",
      disabledBorder: "rgba(112, 170, 176, 0.46)",
      disabledBackground: "rgba(96, 122, 126, 0.42)",
      disabledText: "rgba(218, 236, 240, 0.66)"
    };
  }

  return {
    border: "rgba(159, 209, 230, 0.82)",
    background: "linear-gradient(120deg, #9fd1e6, rgba(255, 255, 255, 0.82))",
    text: "#041423",
    hoverBorder: "rgba(180, 224, 243, 0.9)",
    hoverBackground: "linear-gradient(120deg, #b2dff1, rgba(255, 255, 255, 0.88))",
    hoverText: "#041423",
    activeBorder: "rgba(180, 224, 243, 0.9)",
    activeBackground: "linear-gradient(120deg, #87b8cd, rgba(241, 249, 255, 0.84))",
    activeText: "#041423",
    disabledBorder: "rgba(126, 161, 178, 0.44)",
    disabledBackground: "rgba(96, 122, 136, 0.42)",
    disabledText: "rgba(218, 233, 242, 0.66)"
  };
}
