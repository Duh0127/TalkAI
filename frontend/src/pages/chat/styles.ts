import styled, { keyframes } from "styled-components";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const Layout = styled.div`
  height: 100dvh;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(250px, 310px) 1fr;
  gap: 0;
  padding: 0;
  overflow: hidden;
  align-items: stretch;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 0;
  }
`;

export const SidebarBackdrop = styled.div<{ $visible: boolean }>`
  display: none;

  @media (max-width: 980px) {
    display: ${({ $visible }) => ($visible ? "block" : "none")};
    position: fixed;
    inset: 0;
    background: rgba(2, 7, 15, 0.55);
    z-index: 60;
  }
`;

export const ChatPanel = styled.main`
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 980px) {
    grid-template-rows: auto minmax(0, 1fr) auto;
    min-height: 0;
  }
`;

export const MobileToolbar = styled.div`
  display: none;

  @media (max-width: 980px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(103, 145, 210, 0.2);
    background: rgba(11, 19, 32, 0.82);
  }
`;

export const MobileToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

export const MobileToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const MobileTitleInput = styled.input`
  width: 100%;
  min-width: 0;
  height: 34px;
  border: 1px solid rgba(103, 145, 210, 0.36);
  border-radius: 9px;
  background: rgba(8, 14, 24, 0.9);
  color: var(--text-main);
  font-family: inherit;
  font-size: 13px;
  padding: 0 10px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: rgba(115, 159, 235, 0.85);
    box-shadow: 0 0 0 3px rgba(115, 159, 235, 0.15);
  }
`;

export const MobileToolbarTitle = styled.p`
  margin: 0;
  color: rgba(214, 230, 255, 0.9);
  font-size: 13px;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ToolbarActionSpinner = styled.span`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(220, 234, 255, 0.24);
  border-top-color: rgba(220, 234, 255, 0.96);
  border-radius: 999px;
  animation: ${spin} 0.8s linear infinite;
`;

export const MobileModalTip = styled.p`
  margin: 0;
  border: 1px solid rgba(106, 145, 212, 0.3);
  border-radius: 10px;
  background: rgba(12, 21, 34, 0.75);
  color: #dce8fb;
  font-size: 12.5px;
  line-height: 1.38;
  padding: 8px 10px;
`;

export const ErrorMessage = styled.p`
  margin: 0;
  padding: 0 22px 16px;
  color: var(--danger);
  font-size: 13px;
`;
