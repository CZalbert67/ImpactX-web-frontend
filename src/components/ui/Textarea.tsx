import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid = false, className, id, rows = 3, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full resize-y rounded-lg border border-line bg-panel-soft px-3 py-2 text-sm text-primary placeholder:text-muted transition-colors",
          "focus:border-line-strong focus:outline-2 focus:outline-[var(--color-focus)]",
          invalid && "border-[var(--color-error)]",
          className,
        )}
        {...rest}
      />
    );
  },
);
