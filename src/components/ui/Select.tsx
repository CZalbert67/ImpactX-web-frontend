import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface OptionItem {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: OptionItem[];
  placeholder?: string;
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { options, placeholder, invalid = false, className, id, ...rest },
    ref,
  ) {
    return (
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={invalid || undefined}
          className={cn(
            "w-full appearance-none rounded-lg border border-line bg-panel-soft px-3 text-sm text-primary",
            "focus:border-line-strong focus:outline-2 focus:outline-[var(--color-focus)]",
            invalid && "border-[var(--color-error)]",
            className,
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    );
  },
);