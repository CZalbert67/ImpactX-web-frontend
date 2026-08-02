import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

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
        {error ? <Alert tone="error">{error}</Alert> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
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
