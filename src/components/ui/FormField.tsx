import type { ReactNode } from "react";
import { useId } from "react";
import { CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (fieldId: string) => ReactNode;
  className?: string;
}

/**
 * Envuelve un campo de formulario con label asociado, hint opcional y
 * mensaje de error en zona `aria-live`.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn("w-full", className)}>
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>
      {children(fieldId)}
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1 flex items-center gap-1 text-xs text-error"
        >
          <CircleAlert size={13} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}