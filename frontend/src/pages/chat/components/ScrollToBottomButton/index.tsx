import * as S from "./styles";

type ScrollToBottomButtonProps = {
  visible: boolean;
  onClick: () => void;
};

export function ScrollToBottomButton({ visible, onClick }: ScrollToBottomButtonProps) {
  return (
    <S.Container $visible={visible}>
      <S.Button
        type="button"
        onClick={onClick}
        aria-label="Rolar para o fim do chat"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 10L12 16L18 10" />
        </svg>
      </S.Button>
    </S.Container>
  );
}
