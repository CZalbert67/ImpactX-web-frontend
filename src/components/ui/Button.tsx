import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-bg-main)] hover:opacity-90 disabled:opacity-45",
  secondary:
    "bg-[var(--color-panel-elevated)] text-primary border-line border hover:bg-panel-raised",
  outline:
    "border border-line-strong bg-transparent hover:bg-panel-soft text-primary",
  ghost: "text-secondary hover:bg-panel-soft hover:text-primary",
  danger: "bg-[var(--color-error)] text-white hover:opacity-90 disabled:opacity-45",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      type = "button",
      children,
      ...rest
    },
    ref,
  ) {
    const isLoading = loading ?? false;
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex select-none items-center justify-center rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && "w-full",
          className,
        )}
        aria-busy={isLoading || undefined}
        {...rest}
      >
        {isLoading ? (
          <LoaderCircle className="spin size-4" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading ? rightIcon : null}
      </button>
    );
  },
);