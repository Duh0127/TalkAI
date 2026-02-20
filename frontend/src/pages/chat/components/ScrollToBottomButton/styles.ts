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

export const Button = styled.button`
  height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(111, 153, 222, 0.48);
  background: rgba(8, 14, 24, 0.92);
  color: rgba(214, 231, 255, 0.94);
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, filter 0.2s ease;

  svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    border-color: rgba(126, 170, 245, 0.9);
    background: rgba(12, 22, 37, 0.98);
    filter: brightness(1.04);
  }
`;
