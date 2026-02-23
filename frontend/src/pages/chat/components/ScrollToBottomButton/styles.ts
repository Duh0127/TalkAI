import styled from "styled-components";

export const Container = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: 50%;
  bottom: 12px;
  display: inline-flex;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) =>
    $visible ? "translate(-50%, 0)" : "translate(-50%, 8px)"};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.22s ease, transform 0.22s ease;
  z-index: 3;

  @media (max-width: 980px) {
    bottom: 10px;
  }
`;
