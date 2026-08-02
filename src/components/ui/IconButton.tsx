import type { ButtonHTMLAttributes, ComponentType } from "react";
import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ButtonSize } from "@/components/ui/Button";

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const VARIANT_CLASSES = {
  ghost: "text-secondary hover:bg-panel-soft hover:text-primary",
  outline: "border border-line-strong bg-primary hover:bg-panel-soft",
  soft: "bg-panel-soft text-secondary hover:text-primary",
  danger: "text-error hover:bg-panel-soft",
} as const;

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: keyof typeof VARIANT_CLASSES;
  icon: ComponentType<LucideProps>;
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon: Icon, label, size = "md", variant = "ghost", className, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex select-none items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
          SIZE_MAP[size],
          VARIANT_CLASSES[variant],
          className,
        )}
        {...rest}
      >
        {<Icon className="size-5" aria-hidden="true" />}
      </button>
    );
  },
);