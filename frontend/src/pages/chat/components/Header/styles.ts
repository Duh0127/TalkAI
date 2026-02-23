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

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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
