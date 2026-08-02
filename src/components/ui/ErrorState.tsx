import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

export function ErrorState({
  title = "No se pudo cargar la información",
  description = "Inténtalo de nuevo en unos momentos.",
  retryLabel = "Reintentar",
  onRetry,
  children,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line p-6 text-center"
    >
      <TriangleAlert className="size-7 text-error" aria-hidden="true" />
      <h3 className="font-semibold text-secondary">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {children}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}