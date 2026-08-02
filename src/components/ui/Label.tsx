import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required = false, className, children, ...rest }: LabelProps) {
  return (
    <label
      className={cn(
        "mb-1 block text-sm font-medium text-secondary",
        className,
      )}
      {...rest}
    >
      {children}
      {required ? (
        <span className="ml-1 text-error" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}