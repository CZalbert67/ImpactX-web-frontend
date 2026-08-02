import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import type {
  MonitoringPermissions,
  UpdateMonitoringPermissionsInput,
} from "@/features/monitoring/types";

const ITEMS: ReadonlyArray<{
  key: keyof MonitoringPermissions;
  label: string;
  description: string;
}> = [
  { key: "viewRoutes", label: "Ver rutas", description: "Rutas frecuentes e historial." },
  { key: "viewLocation", label: "Ver ubicación", description: "Ubicación durante el monitoreo." },
  { key: "viewEmergencyLocation", label: "Ubicación de emergencia", description: "Ubicación asociada a eventos críticos." },
  { key: "viewIncidents", label: "Ver incidentes", description: "Historial de incidentes de tránsito." },
  { key: "receiveCriticalAlerts", label: "Alertas críticas", description: "Consultar alertas graves compartidas." },
  { key: "viewMedicalProfile", label: "Ficha médica", description: "Requiere consentimiento médico explícito." },
  { key: "sendMessages", label: "Mensajes rápidos", description: "Permite mensajes predefinidos entre ambas cuentas." },
  { key: "viewTelemetry", label: "Telemetría y viajes", description: "Viajes e información de telemetría autorizada." },
  { key: "receiveNotifications", label: "Notificaciones", description: "Recibir avisos relacionados con la persona monitoreada." },
];

export interface PermissionsEditorProps {
  open: boolean;
  permissions: MonitoringPermissions;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: UpdateMonitoringPermissionsInput) => void;
}

interface PermissionsFormProps {
  permissions: MonitoringPermissions;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: UpdateMonitoringPermissionsInput) => void;
}

function PermissionsForm({
  permissions,
  loading,
  error,
  onClose,
  onSubmit,
}: PermissionsFormProps) {
  const [value, setValue] = useState<MonitoringPermissions>(permissions);
  const [medicalConsent, setMedicalConsent] = useState(false);

  return (
    <div className="space-y-4">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div className="space-y-2">
        {ITEMS.map((item) => (
          <label key={item.key} className="flex items-start gap-3 rounded-lg border border-line bg-panel-soft p-3">
            <Checkbox
              checked={value[item.key]}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  [item.key]: event.target.checked,
                }))
              }
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs text-muted">{item.description}</span>
            </span>
          </label>
        ))}
      </div>
      {value.viewMedicalProfile ? (
        <label className="flex items-start gap-3 rounded-lg border border-[color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-3 text-sm">
          <Checkbox checked={medicalConsent} onChange={(event) => setMedicalConsent(event.target.checked)} />
          Confirmo expresamente que deseo compartir mi ficha médica con este monitor.
        </label>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" disabled={loading} onClick={onClose}>Cancelar</Button>
        <Button
          loading={loading}
          disabled={value.viewMedicalProfile && !medicalConsent}
          onClick={() => onSubmit({ ...value, confirmMedicalConsent: medicalConsent })}
        >
          Guardar permisos
        </Button>
      </div>
    </div>
  );
}

export function PermissionsEditor({
  open,
  permissions,
  loading = false,
  error,
  onClose,
  onSubmit,
}: PermissionsEditorProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title="Permisos de monitoreo"
      description="La persona monitoreada controla qué información comparte."
    >
      <PermissionsForm
        permissions={permissions}
        loading={loading}
        error={error}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
