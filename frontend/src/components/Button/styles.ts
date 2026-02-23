import styled, { css, keyframes } from "styled-components";

export type ButtonTone = "neutral" | "primary" | "accent" | "danger" | "success";
export type ButtonVariant = "solid" | "soft" | "outline" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonRadius = "sm" | "md" | "lg" | "pill";
export type ButtonAlign = "center" | "start" | "between";

export type ButtonColorOverrides = Partial<{
  border: string;
  background: string;
  text: string;
  hoverBorder: string;
  hoverBackground: string;
  hoverText: string;
  activeBorder: string;
  activeBackground: string;
  activeText: string;
  disabledBorder: string;
  disabledBackground: string;
  disabledText: string;
}>;

type TonePalette = {
  soft: {
    border: string;
    background: string;
    text: string;
    hoverBorder: string;
    hoverBackground: string;
    hoverText: string;
  };
  solid: {
    border: string;
    background: string;
    text: string;
    hoverBorder: string;
    hoverBackground: string;
    hoverText: string;
  };
  outline: {
    border: string;
    background: string;
    text: string;
    hoverBorder: string;
    hoverBackground: string;
    hoverText: string;
  };
  ghost: {
    border: string;
    background: string;
    text: string;
    hoverBorder: string;
    hoverBackground: string;
    hoverText: string;
  };
  active: {
    border: string;
    background: string;
    text: string;
  };
  disabled: {
    border: string;
    background: string;
    text: string;
  };
};

type ResolvedButtonColors = {
  border: string;
  background: string;
  text: string;
  hoverBorder: string;
  hoverBackground: string;
  hoverText: string;
  activeBorder: string;
  activeBackground: string;
  activeText: string;
  disabledBorder: string;
  disabledBackground: string;
  disabledText: string;
};

type SizeToken = {
  height: string;
  padding: string;
  fontSize: string;
  iconSize: number;
  gap: string;
};

const RADIUS_BY_SIZE: Record<ButtonRadius, string> = {
  sm: "8px",
  md: "10px",
  lg: "12px",
  pill: "999px"
};

const SIZE_TOKENS: Record<ButtonSize, SizeToken> = {
  xs: {
    height: "27px",
    padding: "0 10px",
    fontSize: "10.5px",
    iconSize: 14,
    gap: "5px"
  },
  sm: {
    height: "30px",
    padding: "0 12px",
    fontSize: "11.5px",
    iconSize: 14,
    gap: "6px"
  },
  md: {
    height: "36px",
    padding: "0 12px",
    fontSize: "12.5px",
    iconSize: 16,
    gap: "7px"
  },
  lg: {
    height: "40px",
    padding: "0 14px",
    fontSize: "13px",
    iconSize: 18,
    gap: "8px"
  }
};

const TONE_PALETTES: Record<ButtonTone, TonePalette> = {
  neutral: {
    soft: {
      border: "rgba(106, 145, 212, 0.34)",
      background: "rgba(12, 21, 34, 0.92)",
      text: "rgba(217, 229, 247, 0.9)",
      hoverBorder: "rgba(123, 168, 246, 0.84)",
      hoverBackground: "rgba(15, 28, 46, 0.96)",
      hoverText: "#e8f0ff"
    },
    solid: {
      border: "rgba(98, 138, 209, 0.64)",
      background: "linear-gradient(180deg, rgba(82, 131, 223, 0.96), rgba(50, 99, 214, 0.94))",
      text: "#f4f8ff",
      hoverBorder: "rgba(123, 168, 246, 0.92)",
      hoverBackground: "linear-gradient(180deg, rgba(92, 141, 233, 0.98), rgba(60, 109, 224, 0.96))",
      hoverText: "#f7faff"
    },
    outline: {
      border: "rgba(98, 138, 209, 0.54)",
      background: "rgba(18, 34, 58, 0.56)",
      text: "#dceaff",
      hoverBorder: "rgba(123, 168, 246, 0.9)",
      hoverBackground: "rgba(27, 51, 87, 0.7)",
      hoverText: "#e7f1ff"
    },
    ghost: {
      border: "rgba(106, 145, 212, 0)",
      background: "transparent",
      text: "#dceaff",
      hoverBorder: "rgba(106, 145, 212, 0.28)",
      hoverBackground: "rgba(15, 28, 46, 0.52)",
      hoverText: "#e7f1ff"
    },
    active: {
      border: "rgba(116, 161, 236, 0.8)",
      background: "rgba(15, 26, 44, 0.98)",
      text: "#eef5ff"
    },
    disabled: {
      border: "rgba(103, 127, 164, 0.45)",
      background: "rgba(83, 106, 142, 0.42)",
      text: "rgba(210, 223, 244, 0.72)"
    }
  },
  primary: {
    soft: {
      border: "rgba(98, 138, 209, 0.6)",
      background: "rgba(64, 112, 198, 0.28)",
      text: "#d7e6ff",
      hoverBorder: "rgba(115, 159, 235, 0.9)",
      hoverBackground: "rgba(64, 112, 198, 0.4)",
      hoverText: "#e8f1ff"
    },
    solid: {
      border: "rgba(98, 138, 209, 0.74)",
      background: "linear-gradient(180deg, rgba(84, 133, 225, 0.98), rgba(52, 101, 216, 0.96))",
      text: "#f6f9ff",
      hoverBorder: "rgba(129, 175, 250, 0.94)",
      hoverBackground: "linear-gradient(180deg, rgba(96, 146, 237, 0.99), rgba(64, 113, 228, 0.98))",
      hoverText: "#ffffff"
    },
    outline: {
      border: "rgba(98, 138, 209, 0.56)",
      background: "rgba(20, 36, 60, 0.44)",
      text: "#e1ecff",
      hoverBorder: "rgba(129, 175, 250, 0.9)",
      hoverBackground: "rgba(33, 58, 95, 0.62)",
      hoverText: "#edf4ff"
    },
    ghost: {
      border: "rgba(98, 138, 209, 0)",
      background: "transparent",
      text: "#d9e8ff",
      hoverBorder: "rgba(98, 138, 209, 0.34)",
      hoverBackground: "rgba(33, 58, 95, 0.44)",
      hoverText: "#edf4ff"
    },
    active: {
      border: "rgba(132, 176, 250, 0.96)",
      background: "rgba(43, 75, 126, 0.84)",
      text: "#f2f7ff"
    },
    disabled: {
      border: "rgba(103, 127, 164, 0.45)",
      background: "rgba(83, 106, 142, 0.42)",
      text: "rgba(210, 223, 244, 0.72)"
    }
  },
  accent: {
    soft: {
      border: "rgba(110, 188, 255, 0.4)",
      background: "rgba(18, 52, 88, 0.44)",
      text: "#e6f5ff",
      hoverBorder: "rgba(138, 208, 255, 0.86)",
      hoverBackground: "rgba(24, 70, 116, 0.62)",
      hoverText: "#f1f9ff"
    },
    solid: {
      border: "rgba(127, 207, 255, 0.72)",
      background: "linear-gradient(180deg, rgba(116, 205, 255, 0.98), rgba(87, 169, 255, 0.94))",
      text: "#021426",
      hoverBorder: "rgba(161, 223, 255, 0.9)",
      hoverBackground: "linear-gradient(180deg, rgba(132, 214, 255, 0.99), rgba(103, 183, 255, 0.96))",
      hoverText: "#03172b"
    },
    outline: {
      border: "rgba(110, 188, 255, 0.5)",
      background: "rgba(18, 52, 88, 0.4)",
      text: "#e2f3ff",
      hoverBorder: "rgba(147, 214, 255, 0.9)",
      hoverBackground: "rgba(28, 74, 122, 0.56)",
      hoverText: "#eff8ff"
    },
    ghost: {
      border: "rgba(110, 188, 255, 0)",
      background: "transparent",
      text: "#d2ecff",
      hoverBorder: "rgba(110, 188, 255, 0.38)",
      hoverBackground: "rgba(24, 70, 116, 0.4)",
      hoverText: "#e8f6ff"
    },
    active: {
      border: "rgba(161, 223, 255, 0.9)",
      background: "rgba(30, 80, 132, 0.75)",
      text: "#f4fbff"
    },
    disabled: {
      border: "rgba(108, 143, 173, 0.44)",
      background: "rgba(62, 86, 114, 0.42)",
      text: "rgba(201, 224, 247, 0.7)"
    }
  },
  danger: {
    soft: {
      border: "rgba(217, 111, 111, 0.45)",
      background: "rgba(117, 38, 38, 0.35)",
      text: "rgba(255, 214, 214, 0.94)",
      hoverBorder: "rgba(232, 140, 140, 0.84)",
      hoverBackground: "rgba(141, 44, 44, 0.48)",
      hoverText: "#ffe1e1"
    },
    solid: {
      border: "rgba(214, 97, 97, 0.68)",
      background: "linear-gradient(180deg, rgba(216, 97, 97, 0.96), rgba(177, 66, 66, 0.94))",
      text: "#fff2f2",
      hoverBorder: "rgba(228, 118, 118, 0.9)",
      hoverBackground: "linear-gradient(180deg, rgba(225, 109, 109, 0.98), rgba(187, 77, 77, 0.96))",
      hoverText: "#fff6f6"
    },
    outline: {
      border: "rgba(217, 111, 111, 0.5)",
      background: "rgba(117, 38, 38, 0.22)",
      text: "#ffdede",
      hoverBorder: "rgba(232, 140, 140, 0.84)",
      hoverBackground: "rgba(141, 44, 44, 0.38)",
      hoverText: "#ffeaea"
    },
    ghost: {
      border: "rgba(217, 111, 111, 0)",
      background: "transparent",
      text: "#ffd2d2",
      hoverBorder: "rgba(217, 111, 111, 0.4)",
      hoverBackground: "rgba(141, 44, 44, 0.34)",
      hoverText: "#ffe8e8"
    },
    active: {
      border: "rgba(232, 140, 140, 0.84)",
      background: "rgba(141, 44, 44, 0.54)",
      text: "#fff2f2"
    },
    disabled: {
      border: "rgba(173, 121, 121, 0.42)",
      background: "rgba(124, 92, 92, 0.38)",
      text: "rgba(243, 219, 219, 0.66)"
    }
  },
  success: {
    soft: {
      border: "rgba(101, 193, 146, 0.42)",
      background: "rgba(25, 82, 56, 0.38)",
      text: "#d4f8e4",
      hoverBorder: "rgba(126, 219, 171, 0.82)",
      hoverBackground: "rgba(31, 103, 69, 0.5)",
      hoverText: "#e3ffef"
    },
    solid: {
      border: "rgba(101, 193, 146, 0.7)",
      background: "linear-gradient(180deg, rgba(88, 190, 139, 0.96), rgba(50, 145, 98, 0.94))",
      text: "#062115",
      hoverBorder: "rgba(126, 219, 171, 0.86)",
      hoverBackground: "linear-gradient(180deg, rgba(104, 204, 153, 0.98), rgba(65, 160, 113, 0.96))",
      hoverText: "#062518"
    },
    outline: {
      border: "rgba(101, 193, 146, 0.5)",
      background: "rgba(25, 82, 56, 0.32)",
      text: "#d4f8e4",
      hoverBorder: "rgba(126, 219, 171, 0.84)",
      hoverBackground: "rgba(31, 103, 69, 0.45)",
      hoverText: "#e5fcef"
    },
    ghost: {
      border: "rgba(101, 193, 146, 0)",
      background: "transparent",
      text: "#c6f0d9",
      hoverBorder: "rgba(101, 193, 146, 0.36)",
      hoverBackground: "rgba(31, 103, 69, 0.34)",
      hoverText: "#e0f9ea"
    },
    active: {
      border: "rgba(126, 219, 171, 0.84)",
      background: "rgba(31, 103, 69, 0.54)",
      text: "#f0fff7"
    },
    disabled: {
      border: "rgba(121, 163, 142, 0.42)",
      background: "rgba(93, 126, 108, 0.36)",
      text: "rgba(206, 231, 217, 0.66)"
    }
  }
};

function resolveButtonColors(
  tone: ButtonTone,
  variant: ButtonVariant,
  colorOverrides?: ButtonColorOverrides
): ResolvedButtonColors {
  const palette = TONE_PALETTES[tone];
  const variantPalette = palette[variant];

  return {
    border: colorOverrides?.border ?? variantPalette.border,
    background: colorOverrides?.background ?? variantPalette.background,
    text: colorOverrides?.text ?? variantPalette.text,
    hoverBorder: colorOverrides?.hoverBorder ?? variantPalette.hoverBorder,
    hoverBackground: colorOverrides?.hoverBackground ?? variantPalette.hoverBackground,
    hoverText: colorOverrides?.hoverText ?? variantPalette.hoverText,
    activeBorder: colorOverrides?.activeBorder ?? palette.active.border,
    activeBackground: colorOverrides?.activeBackground ?? palette.active.background,
    activeText: colorOverrides?.activeText ?? palette.active.text,
    disabledBorder: colorOverrides?.disabledBorder ?? palette.disabled.border,
    disabledBackground: colorOverrides?.disabledBackground ?? palette.disabled.background,
    disabledText: colorOverrides?.disabledText ?? palette.disabled.text
  };
}

type RootProps = {
  $tone: ButtonTone;
  $variant: ButtonVariant;
  $size: ButtonSize;
  $radius: ButtonRadius;
  $align: ButtonAlign;
  $iconOnly: boolean;
  $fullWidth: boolean;
  $active: boolean;
  $elevateOnHover: boolean;
  $uppercase: boolean;
  $iconSize?: number;
  $colorOverrides?: ButtonColorOverrides;
  $width?: string;
  $height?: string;
  $minWidth?: string;
  $minHeight?: string;
  $padding?: string;
  $fontSize?: string;
  $fontWeight?: number;
  $letterSpacing?: string;
  $gap?: string;
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const Root = styled.button<RootProps>`
  ${({ $tone, $variant, $colorOverrides, $active }) => {
    const colors = resolveButtonColors($tone, $variant, $colorOverrides);

    return css`
      --btn-border: ${$active ? colors.activeBorder : colors.border};
      --btn-bg: ${$active ? colors.activeBackground : colors.background};
      --btn-text: ${$active ? colors.activeText : colors.text};
      --btn-hover-border: ${colors.hoverBorder};
      --btn-hover-bg: ${colors.hoverBackground};
      --btn-hover-text: ${colors.hoverText};
      --btn-active-border: ${colors.activeBorder};
      --btn-active-bg: ${colors.activeBackground};
      --btn-active-text: ${colors.activeText};
      --btn-disabled-border: ${colors.disabledBorder};
      --btn-disabled-bg: ${colors.disabledBackground};
      --btn-disabled-text: ${colors.disabledText};
    `;
  }}

  ${({ $size, $iconSize, $gap, $padding, $fontSize, $width, $height, $minWidth, $minHeight, $iconOnly, $fullWidth, $fontWeight, $letterSpacing }) => {
    const tokens = SIZE_TOKENS[$size];
    const resolvedHeight = $height ?? tokens.height;
    const resolvedWidth = $fullWidth ? "100%" : $width ?? ($iconOnly ? resolvedHeight : "auto");
    const resolvedMinWidth = $minWidth ?? ($iconOnly ? resolvedHeight : "auto");
    const resolvedMinHeight = $minHeight ?? resolvedHeight;

    return css`
      --btn-icon-size: ${$iconSize ?? tokens.iconSize}px;
      width: ${resolvedWidth};
      height: ${resolvedHeight};
      min-width: ${resolvedMinWidth};
      min-height: ${resolvedMinHeight};
      gap: ${$gap ?? tokens.gap};
      padding: ${$iconOnly ? "0" : ($padding ?? tokens.padding)};
      font-size: ${$fontSize ?? tokens.fontSize};
      font-weight: ${$fontWeight ?? 600};
      letter-spacing: ${$letterSpacing ?? "0"};
    `;
  }}

  border: 1px solid var(--btn-border);
  border-radius: ${({ $radius }) => RADIUS_BY_SIZE[$radius]};
  background: var(--btn-bg);
  color: var(--btn-text);
  font-family: inherit;
  line-height: 1;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: ${({ $align }) =>
    $align === "between" ? "space-between" : $align === "start" ? "flex-start" : "center"};
  text-align: ${({ $align }) => ($align === "start" ? "left" : "center")};
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    filter 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
  text-transform: ${({ $uppercase }) => ($uppercase ? "uppercase" : "none")};

  &:hover {
    border-color: var(--btn-hover-border);
    background: var(--btn-hover-bg);
    color: var(--btn-hover-text);
    filter: brightness(1.03);
    transform: ${({ $elevateOnHover }) => ($elevateOnHover ? "translateY(-1px)" : "none")};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(123, 168, 246, 0.24);
  }

  &:active {
    border-color: var(--btn-active-border);
    background: var(--btn-active-bg);
    color: var(--btn-active-text);
    transform: translateY(0);
  }

  &:disabled,
  &[aria-disabled="true"] {
    border-color: var(--btn-disabled-border);
    background: var(--btn-disabled-bg);
    color: var(--btn-disabled-text);
    cursor: not-allowed;
    opacity: 0.68;
    transform: none;
    filter: none;
    box-shadow: none;
    pointer-events: none;
  }

  svg {
    width: var(--btn-icon-size);
    height: var(--btn-icon-size);
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex-shrink: 0;
  }
`;

export const Spinner = styled.span<{ $size?: number }>`
  width: ${({ $size }) => `${$size ?? 14}px`};
  height: ${({ $size }) => `${$size ?? 14}px`};
  border: 2px solid rgba(232, 241, 255, 0.36);
  border-top-color: currentColor;
  border-radius: 999px;
  animation: ${spin} 0.8s linear infinite;
  flex-shrink: 0;
`;

export const Content = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: inherit;
  gap: inherit;
  min-width: 0;
`;

export const Label = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
