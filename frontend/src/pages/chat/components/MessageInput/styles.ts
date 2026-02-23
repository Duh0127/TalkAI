import styled from "styled-components";

export const Composer = styled.form<{
  $layout: "docked" | "centered";
  $animateDocking: boolean;
}>`
  width: min(880px, calc(100% - 36px));
  margin: 10px auto 16px;
  border: none;
  border-radius: 16px;
  background: rgba(11, 19, 32, 0.62);
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  transform: ${({ $layout }) =>
    $layout === "centered" ? "translateY(calc(-47dvh + 24px))" : "translateY(0)"};
  transition: ${({ $animateDocking }) =>
    $animateDocking ? "transform 0.42s cubic-bezier(0.2, 0.75, 0.2, 1)" : "none"};
  z-index: 2;

  @media (max-width: 980px) {
    width: calc(100% - 20px);
    margin: 8px auto 10px;
    transform: ${({ $layout }) =>
      $layout === "centered" ? "translateY(calc(-44dvh + 16px))" : "translateY(0)"};
  }
`;

export const IntroText = styled.p`
  margin: 0;
  margin-bottom: 24px;
  color: rgba(214, 230, 255, 0.92);
  font-size: 24px;
  line-height: 1.4;
  text-align: center;
  letter-spacing: 0.01em;
`;

export const PendingFiles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 132px;
  overflow: auto;
  padding: 1px 1px 0;
`;

export const PendingFile = styled.div`
  border: 1px solid rgba(106, 145, 212, 0.3);
  border-radius: 11px;
  background: rgba(10, 17, 28, 0.9);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  min-width: min(280px, 100%);
`;

export const PendingFilePreview = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(109, 149, 214, 0.48);
  flex-shrink: 0;
`;

export const PendingFileIcon = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(109, 149, 214, 0.42);
  background: rgba(50, 99, 214, 0.18);
  color: #c9deff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

export const PendingFileInfo = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

export const PendingFileName = styled.span`
  color: var(--text-main);
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const PendingFileMeta = styled.span`
  color: var(--text-soft);
  font-size: 10px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
`;

export const InputRow = styled.div`
  border: 1px solid rgba(103, 145, 210, 0.34);
  border-radius: 14px;
  background: rgba(8, 14, 24, 0.9);
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px;
`;

export const PromptInput = styled.textarea`
  flex: 1;
  width: 100%;
  height: 40px;
  border: none;
  padding: 8px 4px;
  background: transparent;
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.35;
  resize: none;
  outline: none;
  overflow-y: auto;

  &::placeholder {
    color: rgba(144, 164, 194, 0.72);
  }
`;

export const AttachInput = styled.input`
  display: none;
`;
