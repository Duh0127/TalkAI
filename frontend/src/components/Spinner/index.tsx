import * as S from "./styles";

export type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  text?: string;
  size?: SpinnerSize;
  className?: string;
};

const SIZE_MAP: Record<SpinnerSize, number> = {
  sm: 48,
  md: 72,
  lg: 96
};

export function Spinner({ text, size = "md", className }: SpinnerProps) {
  const ariaLabel = text ? `Carregando: ${text}` : "Carregando";

  return (
    <S.SpinnerRoot className={className} role="status" aria-live="polite" aria-label={ariaLabel}>
      <S.Glyph $size={SIZE_MAP[size]} aria-hidden>
        <S.Halo />
        <S.OuterRing />
        <S.InnerRing />
        <S.Orbit $duration="1.9s" $delay="0s" />
        <S.Orbit $duration="2.6s" $delay="-1.2s" $reverse />
        <S.Core />
      </S.Glyph>
      {text ? <S.Label>{text}</S.Label> : null}
    </S.SpinnerRoot>
  );
}
