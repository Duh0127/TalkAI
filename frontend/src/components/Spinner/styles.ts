import styled, { keyframes } from "styled-components";

type GlyphProps = {
  $size: number;
};

type OrbitProps = {
  $duration: string;
  $delay: string;
  $reverse?: boolean;
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const spinReverse = keyframes`
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
`;

const pulse = keyframes`
  0%,
  100% {
    opacity: 0.7;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
`;

const labelFlicker = keyframes`
  0%,
  100% {
    opacity: 0.75;
    letter-spacing: 0.14em;
  }

  50% {
    opacity: 1;
    letter-spacing: 0.18em;
  }
`;

const scan = keyframes`
  0%,
  100% {
    opacity: 0.34;
    transform: scaleX(0.38);
  }

  50% {
    opacity: 1;
    transform: scaleX(1);
  }
`;

export const SpinnerRoot = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

export const Glyph = styled.span<GlyphProps>`
  --spinner-size: ${({ $size }) => `${$size}px`};
  width: var(--spinner-size);
  height: var(--spinner-size);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 18px rgba(106, 243, 255, 0.28));
`;

export const Halo = styled.span`
  position: absolute;
  inset: -14%;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(113, 215, 255, 0.32) 0%,
    rgba(113, 215, 255, 0.08) 45%,
    transparent 72%
  );
  animation: ${pulse} 2.4s ease-in-out infinite;
`;

export const OuterRing = styled.span`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: calc(var(--spinner-size) * 0.07) solid transparent;
  border-top-color: rgba(106, 243, 255, 0.98);
  border-right-color: rgba(73, 160, 255, 0.84);
  box-shadow: 0 0 20px rgba(106, 243, 255, 0.34);
  animation: ${spin} 1.1s linear infinite;
`;

export const InnerRing = styled.span`
  position: absolute;
  inset: 20%;
  border-radius: 999px;
  border: calc(var(--spinner-size) * 0.065) solid transparent;
  border-bottom-color: rgba(167, 224, 255, 0.9);
  border-left-color: rgba(65, 142, 255, 0.84);
  box-shadow: inset 0 0 14px rgba(106, 243, 255, 0.2);
  animation: ${spinReverse} 0.9s linear infinite;
`;

export const Orbit = styled.span<OrbitProps>`
  position: absolute;
  inset: 8%;
  border-radius: 999px;
  animation: ${({ $reverse }) => ($reverse ? spinReverse : spin)} ${({ $duration }) => $duration}
    linear infinite;
  animation-delay: ${({ $delay }) => $delay};

  &::before {
    content: "";
    position: absolute;
    top: calc(var(--spinner-size) * -0.01);
    left: 50%;
    width: calc(var(--spinner-size) * 0.12);
    height: calc(var(--spinner-size) * 0.12);
    margin-left: calc(var(--spinner-size) * -0.06);
    border-radius: 999px;
    background: radial-gradient(circle, #d9fcff 0%, #73dfff 55%, #3f8cff 100%);
    box-shadow:
      0 0 11px rgba(130, 227, 255, 0.92),
      0 0 18px rgba(75, 154, 255, 0.62);
  }
`;

export const Core = styled.span`
  position: absolute;
  inset: 34%;
  border-radius: 999px;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(232, 253, 255, 0.95) 0%,
    rgba(99, 197, 255, 0.82) 42%,
    rgba(23, 74, 147, 0.88) 100%
  );
  box-shadow: 0 0 18px rgba(106, 243, 255, 0.5);
  animation: ${pulse} 1.7s ease-in-out infinite;
`;

export const Label = styled.span`
  position: relative;
  color: #dcf8ff;
  font-family: "Oxanium", "Manrope", sans-serif;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-align: center;
  text-shadow: 0 0 14px rgba(106, 243, 255, 0.6);
  animation: ${labelFlicker} 1.8s ease-in-out infinite;

  &::after {
    content: "";
    position: absolute;
    left: -4%;
    bottom: -4px;
    width: 108%;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, rgba(154, 226, 255, 0.82), transparent);
    animation: ${scan} 1.4s ease-in-out infinite;
  }
`;

