import styled, { keyframes } from "styled-components";

export const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const glow = keyframes`
  0%,
  100% {
    box-shadow: 0 0 0 rgba(118, 164, 240, 0);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(118, 164, 240, 0.12);
  }
`;

const dotPulse = keyframes`
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-1px);
  }
`;

export const MessagesWrapper = styled.section`
  position: relative;
  height: 100%;
  min-height: 0;
`;

export const Messages = styled.div`
  padding: 20px clamp(12px, 2.5vw, 28px);
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
`;

export const MessagesInner = styled.div`
  width: min(880px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
`;

export const MutedText = styled.p`
  margin: 0;
  color: var(--text-soft);
  font-size: 12px;
`;

export const LoadingState = styled.div`
  margin: auto;
  padding: 26px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EmptyState = styled.div`
  margin: auto;
  border: 1px dashed rgba(109, 149, 214, 0.35);
  border-radius: 14px;
  padding: 22px 20px;
  max-width: 440px;
  text-align: center;
  background: rgba(11, 18, 30, 0.88);
  animation: ${rise} 0.4s ease;

  h3 {
    margin: 0 0 6px;
    font-family: "Manrope", "Segoe UI", sans-serif;
    font-size: 20px;
    font-weight: 650;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: var(--text-soft);
    font-size: 14px;
  }
`;

export const MessageActions = styled.div<{ $visible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "translateY(0)" : "translateY(6px)")};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.22s ease, transform 0.22s ease;
`;

export const MessageBubble = styled.article<{ $assistant: boolean }>`
  width: ${({ $assistant }) => ($assistant ? "min(840px, 100%)" : "min(760px, 78%)")};
  max-width: 100%;
  border-radius: ${({ $assistant }) => ($assistant ? "0" : "14px")};
  border: ${({ $assistant }) => ($assistant ? "none" : "1px solid rgba(109, 149, 214, 0.46)")};
  padding: ${({ $assistant }) => ($assistant ? "2px 2px 0" : "12px 14px")};
  display: flex;
  flex-direction: column;
  gap: 7px;
  animation: ${rise} 0.24s ease;
  align-self: ${({ $assistant }) => ($assistant ? "flex-start" : "flex-end")};
  background: ${({ $assistant }) =>
    $assistant
      ? "transparent"
      : "linear-gradient(180deg, rgba(47, 81, 150, 0.52), rgba(29, 52, 96, 0.84))"};
  box-shadow: ${({ $assistant }) => ($assistant ? "none" : "0 10px 22px rgba(2, 8, 18, 0.32)")};

  &:hover ${MessageActions},
  &:focus-within ${MessageActions} {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  @media (hover: none) {
    ${MessageActions} {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  }

  @media (max-width: 760px) {
    width: ${({ $assistant }) => ($assistant ? "100%" : "min(100%, 90%)")};
  }
`;

export const MessageRole = styled.p<{ $assistant: boolean }>`
  margin: 0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $assistant }) => ($assistant ? "rgba(154, 176, 207, 0.86)" : "rgba(209, 227, 255, 0.9)")};
`;

export const MessageContent = styled.div`
  margin: 0;
  font-size: 14px;
  line-height: 1.58;
`;

export const AssistantLoading = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  border: 1px solid rgba(116, 160, 232, 0.45);
  border-radius: 999px;
  background: rgba(12, 23, 39, 0.92);
  color: rgba(215, 231, 255, 0.95);
  font-size: 12px;
  line-height: 1.1;
  padding: 8px 12px;
  animation: ${glow} 1.6s ease-in-out infinite;
`;

export const LoadingDots = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    animation: ${dotPulse} 0.9s ease-in-out infinite;
  }

  span:nth-child(2) {
    animation-delay: 0.12s;
  }

  span:nth-child(3) {
    animation-delay: 0.24s;
  }
`;

export const MessageEditor = styled.textarea`
  width: 100%;
  min-height: 120px;
  border: 1px solid rgba(112, 152, 221, 0.6);
  border-radius: 11px;
  background: rgba(6, 12, 20, 0.86);
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  padding: 10px 11px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: rgba(128, 173, 248, 0.9);
    box-shadow: 0 0 0 3px rgba(128, 173, 248, 0.18);
  }

  &:disabled {
    opacity: 0.76;
    cursor: not-allowed;
  }
`;

export const MessageEditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const EditorButton = styled.button<{ $primary?: boolean }>`
  height: 30px;
  border-radius: 999px;
  border: 1px solid
    ${({ $primary }) => ($primary ? "rgba(114, 160, 238, 0.88)" : "rgba(106, 145, 212, 0.38)")};
  background: ${({ $primary }) =>
    $primary
      ? "linear-gradient(180deg, rgba(76, 124, 214, 0.9), rgba(47, 95, 193, 0.9))"
      : "rgba(11, 20, 34, 0.86)"};
  color: ${({ $primary }) => ($primary ? "#f4f8ff" : "#dceaff")};
  padding: 0 12px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;

  &:hover {
    filter: brightness(1.05);
    border-color: rgba(132, 176, 250, 0.96);
  }

  &:disabled {
    opacity: 0.62;
    cursor: not-allowed;
    filter: none;
  }
`;

export const MessageFiles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const FileLink = styled.a`
  border: 1px solid rgba(109, 149, 214, 0.42);
  background: rgba(10, 18, 29, 0.9);
  border-radius: 999px;
  color: #d6e7ff;
  text-decoration: none;
  font-size: 11.5px;
  padding: 5px 10px;
  transition: border-color 0.2s ease, filter 0.2s ease;

  &:hover {
    border-color: rgba(124, 166, 235, 0.88);
    filter: brightness(1.03);
  }
`;

export const MessageFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const MessageTime = styled.small`
  color: rgba(152, 176, 208, 0.84);
  font-size: 10.5px;
`;

export const MessageActionButton = styled.button`
  min-width: 30px;
  height: 27px;
  border: 1px solid rgba(107, 147, 213, 0.42);
  border-radius: 999px;
  background: rgba(11, 20, 34, 0.82);
  color: #dbe9ff;
  font-size: 10.5px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  opacity: 0.9;
  transition: border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;

  svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    opacity: 1;
    border-color: rgba(123, 168, 246, 0.9);
    background: rgba(15, 28, 46, 0.96);
  }

  &:disabled {
    opacity: 0.62;
    cursor: not-allowed;
  }
`;
