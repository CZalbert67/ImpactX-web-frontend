import type { ReactNode } from "react";
import { useId, useEffect } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  description?: string;
  className?: string;
}

/**
 * Modal (diálogo) accesible: `aria-modal`, escape para cerrar, foco inicial
 * dirigido y bloqueo del scroll del body mientras está abierto.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  description,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "panel-solid z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto p-6",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton icon={X} label="Cerrar diálogo" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}