import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type InputSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: "h-8 px-2.5 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "md",
    invalid = false,
    className,
    id,
    ...rest
  },
  ref,
) {
  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-lg border bg-panel-soft text-primary placeholder:text-muted transition-colors",
        "border-line focus:border-line-strong focus:outline-2 focus:outline-[var(--color-focus)]",
        invalid && "border-[var(--color-error)]",
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    />
  );
});