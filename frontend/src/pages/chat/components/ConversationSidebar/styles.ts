import styled, { css, keyframes } from "styled-components";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const Sidebar = styled.aside<{ $mobileOpen: boolean }>`
  border: none;
  border-radius: 0;
  background: linear-gradient(180deg, rgba(11, 19, 32, 0.9), rgba(11, 19, 32, 0.78));
  box-shadow: none;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 980px) {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(86vw, 320px);
    max-height: none;
    z-index: 70;
    transform: translateX(${({ $mobileOpen }) => ($mobileOpen ? "0" : "-110%")});
    transition: transform 0.24s ease;
    padding: 12px;
  }
`;

export const SidebarTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SidebarTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const LogoTag = styled.p`
  margin: 0;
  color: #92b8ff;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 9px;
  font-weight: 600;
`;

export const LogoTitle = styled.h1`
  margin: 0;
  font-family: "Manrope", "Segoe UI", sans-serif;
  font-size: clamp(19px, 1.35vw, 22px);
  font-weight: 700;
  letter-spacing: 0;
`;

export const SearchInput = styled.input`
  width: 100%;
  border: 1px solid rgba(103, 145, 210, 0.3);
  border-radius: 10px;
  background: rgba(8, 14, 24, 0.88);
  color: var(--text-main);
  font-size: 13px;
  padding: 9px 11px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: rgba(149, 168, 196, 0.72);
  }

  &:focus {
    border-color: rgba(115, 159, 235, 0.85);
    box-shadow: 0 0 0 3px rgba(115, 159, 235, 0.15);
  }
`;

export const ConversationList = styled.ul`
  margin: 0;
  padding: 1px;
  list-style: none;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
`;

export const MutedText = styled.p`
  margin: 6px 4px;
  list-style: none;
  color: var(--text-soft);
  font-size: 12px;
`;

export const ConversationRow = styled.li<{ $active: boolean }>`
  border: 1px solid rgba(103, 145, 210, 0.16);
  border-radius: 11px;
  background: rgba(10, 17, 28, 0.84);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px;
  align-items: center;
  padding: 2px;
  min-width: 0;
  position: relative;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: rgba(118, 161, 236, 0.38);
    background: rgba(13, 22, 36, 0.96);
  }

  &:hover button:last-child {
    opacity: 1;
  }

  ${({ $active }) =>
    $active &&
    css`
      border-color: rgba(116, 161, 236, 0.8);
      background: rgba(15, 26, 44, 0.98);
    `}
`;

export const ConversationSummary = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
`;

export const ConversationName = styled.span`
  display: inline-block;
  max-width: 180px;
  font-size: 12.5px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ConversationTime = styled.small`
  color: var(--text-soft);
  font-size: 10.5px;
  white-space: nowrap;
`;

export const TinySpinner = styled.span`
  width: 13px;
  height: 13px;
  border: 2px solid rgba(187, 217, 255, 0.24);
  border-top-color: rgba(220, 234, 255, 0.9);
  border-radius: 999px;
  animation: ${spin} 0.9s linear infinite;
`;

export const DeleteHint = styled.p`
  margin: 0;
  border: 1px solid rgba(106, 145, 212, 0.3);
  border-radius: 10px;
  background: rgba(12, 21, 34, 0.75);
  color: #dceaff;
  font-size: 12.5px;
  line-height: 1.35;
  padding: 8px 10px;
`;
