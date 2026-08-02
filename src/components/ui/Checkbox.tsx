import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ invalid = false, className, id, ...rest }, ref) {
    return (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        aria-invalid={invalid || undefined}
        className={cn(
          "size-4 shrink-0 cursor-pointer rounded border-line-strong bg-panel-soft accent-[var(--color-primary)]",
          className,
        )}
        {...rest}
      />
    );
  },
);