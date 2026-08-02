import type { ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busyLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación reutilizable para acciones de viaje.
 * `loading` bloquea el botón y evita el doble envío.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busyLabel = "Procesando…",
  danger = false,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-secondary">{description}</p>

        {error ? (
          <Alert tone="error" role="alert">
            {error}
          </Alert>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {loading ? busyLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}