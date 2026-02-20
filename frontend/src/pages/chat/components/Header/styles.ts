import styled from "styled-components";

export const Header = styled.header`
  padding: 14px 18px 12px;
  border-bottom: none;
  background: rgba(11, 19, 32, 0.68);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  @media (max-width: 980px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const HeaderContent = styled.div`
  min-width: 0;
`;

export const HeaderLabel = styled.p`
  margin: 0;
  color: rgba(144, 164, 194, 0.9);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.11em;
`;

export const TitleRow = styled.div`
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;
  font-family: "Manrope", "Segoe UI", sans-serif;
  font-size: clamp(18px, 1.6vw, 21px);
  font-weight: 650;
  letter-spacing: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EditRow = styled.div`
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const TitleInput = styled.input`
  width: min(360px, 72vw);
  border: 1px solid rgba(103, 145, 210, 0.35);
  border-radius: 9px;
  background: rgba(9, 15, 24, 0.9);
  color: var(--text-main);
  font-family: inherit;
  font-size: 13px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: rgba(115, 159, 235, 0.85);
    box-shadow: 0 0 0 3px rgba(115, 159, 235, 0.15);
  }
`;

export const IconButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid rgba(106, 145, 212, 0.34);
  border-radius: 8px;
  background: rgba(11, 20, 34, 0.92);
  color: rgba(217, 229, 247, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;

  svg {
    width: 15px;
    height: 15px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    border-color: rgba(123, 168, 246, 0.84);
    background: rgba(15, 28, 46, 0.96);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ExportButton = styled.button`
  border: 1px solid rgba(98, 138, 209, 0.54);
  border-radius: 999px;
  background: rgba(18, 34, 58, 0.56);
  color: #dceaff;
  font-family: inherit;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;

  &:hover {
    border-color: rgba(123, 168, 246, 0.9);
    background: rgba(27, 51, 87, 0.7);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const ClearButton = styled.button`
  border: 1px solid rgba(98, 138, 209, 0.5);
  border-radius: 999px;
  background: rgba(64, 112, 198, 0.24);
  color: #d4e4ff;
  font-family: inherit;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;

  &:hover {
    border-color: rgba(118, 161, 236, 0.88);
    background: rgba(64, 112, 198, 0.36);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const ModelChip = styled.span`
  border: 1px solid rgba(103, 145, 210, 0.34);
  background: rgba(11, 19, 32, 0.92);
  border-radius: 999px;
  font-size: 11.5px;
  color: #9fc0f4;
  padding: 7px 11px;
  white-space: nowrap;
`;

export const ModalTip = styled.p`
  margin: 0;
  border: 1px solid rgba(106, 145, 212, 0.3);
  border-radius: 10px;
  background: rgba(12, 21, 34, 0.75);
  color: #dce8fb;
  font-size: 12.5px;
  line-height: 1.38;
  padding: 8px 10px;
`;
