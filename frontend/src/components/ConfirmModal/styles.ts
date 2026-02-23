import styled, { css, keyframes } from "styled-components";
import type { ConfirmModalTone } from "./index";

type ToneProps = {
  $tone: ConfirmModalTone;
};

const popIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

function toneStyles(tone: ConfirmModalTone) {
  if (tone === "danger") {
    return css`
      --tone-main: #3d8cff;
      --tone-strong: rgba(61, 140, 255, 0.84);
      --tone-bg: rgba(10, 34, 74, 0.7);
      --tone-soft: #dbeaff;
    `;
  }

  if (tone === "accent") {
    return css`
      --tone-main: #6af3ff;
      --tone-strong: rgba(106, 243, 255, 0.82);
      --tone-bg: rgba(5, 42, 56, 0.66);
      --tone-soft: #d9fbff;
    `;
  }

  return css`
    --tone-main: #9fd1e6;
    --tone-strong: rgba(159, 209, 230, 0.82);
    --tone-bg: rgba(19, 33, 52, 0.66);
    --tone-soft: #e9f8ff;
  `;
}

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  padding: 20px;
  background:
    radial-gradient(circle at 20% 18%, rgba(106, 243, 255, 0.14), transparent 42%),
    radial-gradient(circle at 82% 82%, rgba(61, 140, 255, 0.12), transparent 38%),
    rgba(1, 9, 19, 0.72);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalCard = styled.section<ToneProps>`
  ${({ $tone }) => toneStyles($tone)};
  width: min(520px, 100%);
  border: 1px solid var(--tone-strong);
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(6, 20, 37, 0.95), rgba(3, 12, 25, 0.98)),
    var(--panel-strong);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 28px 48px rgba(1, 7, 17, 0.55),
    0 0 0 1px rgba(104, 235, 255, 0.14);
  padding: 22px 22px 18px;
  animation: ${popIn} 0.2s ease;
`;

export const Eyebrow = styled.p<ToneProps>`
  ${({ $tone }) => toneStyles($tone)};
  margin: 0;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--tone-strong);
  border-radius: 999px;
  background: var(--tone-bg);
  color: var(--tone-soft);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 5px 9px;
`;

export const TitleRow = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const IconWrap = styled.span<ToneProps>`
  ${({ $tone }) => toneStyles($tone)};
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--tone-strong);
  background: var(--tone-bg);
  color: var(--tone-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

export const Title = styled.h3`
  margin: 0;
  color: var(--text-main);
  font-family: "Oxanium", "Sora", sans-serif;
  font-size: 23px;
  line-height: 1.15;
`;

export const Description = styled.p`
  margin: 10px 0 0;
  color: var(--text-soft);
  font-size: 14px;
  line-height: 1.5;
`;

export const Body = styled.div`
  margin-top: 12px;
`;

export const Actions = styled.div`
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
`;
