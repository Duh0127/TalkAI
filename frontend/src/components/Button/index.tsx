import { ButtonHTMLAttributes, ElementType, MouseEvent, ReactNode, forwardRef } from "react";
import * as S from "./styles";
import type {
  ButtonAlign,
  ButtonColorOverrides,
  ButtonRadius,
  ButtonSize,
  ButtonTone,
  ButtonVariant
} from "./styles";

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">;

export type ButtonProps = NativeButtonProps & {
  as?: ElementType;
  tone?: ButtonTone;
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
  align?: ButtonAlign;
  iconOnly?: boolean;
  fullWidth?: boolean;
  active?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  elevateOnHover?: boolean;
  uppercase?: boolean;
  colorOverrides?: ButtonColorOverrides;
  iconSize?: number;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: number;
  letterSpacing?: string;
  gap?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      as,
      type = "button",
      tone = "neutral",
      variant = "soft",
      size = "md",
      radius = "md",
      align = "center",
      iconOnly = false,
      fullWidth = false,
      active = false,
      loading = false,
      loadingLabel,
      elevateOnHover = false,
      uppercase = false,
      colorOverrides,
      iconSize,
      width,
      height,
      minWidth,
      minHeight,
      padding,
      fontSize,
      fontWeight,
      letterSpacing,
      gap,
      disabled = false,
      children,
      onClick,
      tabIndex,
      ...rest
    },
    ref
  ) => {
    const isNativeButton = !as || as === "button";
    const nonInteractive = disabled || loading;

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
      if (nonInteractive && !isNativeButton) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    }

    return (
      <S.Root
        ref={ref}
        as={as}
        type={isNativeButton ? type : undefined}
        disabled={isNativeButton ? nonInteractive : undefined}
        aria-disabled={!isNativeButton && nonInteractive ? true : undefined}
        aria-busy={loading || undefined}
        tabIndex={!isNativeButton && nonInteractive && tabIndex === undefined ? -1 : tabIndex}
        onClick={handleClick}
        $tone={tone}
        $variant={variant}
        $size={size}
        $radius={radius}
        $align={align}
        $iconOnly={iconOnly}
        $fullWidth={fullWidth}
        $active={active}
        $elevateOnHover={elevateOnHover}
        $uppercase={uppercase}
        $colorOverrides={colorOverrides}
        $iconSize={iconSize}
        $width={width}
        $height={height}
        $minWidth={minWidth}
        $minHeight={minHeight}
        $padding={padding}
        $fontSize={fontSize}
        $fontWeight={fontWeight}
        $letterSpacing={letterSpacing}
        $gap={gap}
        {...rest}
      >
        <S.Content>
          {loading && <S.Spinner $size={Math.max(12, (iconSize ?? 14) - 1)} aria-hidden />}
          {loading && loadingLabel ? <S.Label>{loadingLabel}</S.Label> : children}
        </S.Content>
      </S.Root>
    );
  }
);

Button.displayName = "Button";
