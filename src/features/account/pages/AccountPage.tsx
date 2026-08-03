import { useState } from "react";
import { Archive, Download, ShieldX, Trash2, UserCog } from "lucide-react";
import { useNavigate } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  useAccountRetention,
  useDeleteAccount,
  useExportAccount,
  useRevokeAccountConsents,
} from "@/features/account/hooks";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { platformError } from "@/features/platform/pages/shared";

function downloadJson(value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `impactx-cuenta-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AccountPage() {
  const retention = useAccountRetention();
  const exportAccount = useExportAccount();
  const revokeConsents = useRevokeAccountConsents();
  const deleteAccount = useDeleteAccount();
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  const [revokeLocation, setRevokeLocation] = useState(false);
  const [revokeDriving, setRevokeDriving] = useState(false);
  const [removeMedical, setRemoveMedical] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const closeDeleteModal = () => {
    if (deleteAccount.isPending) return;
    setDeleteOpen(false);
    setPassword("");
    setConfirmation("");
    setReason("");
    deleteAccount.reset();
  };

  if (retention.isError) {
    return (
      <ErrorState
        title="No se pudo cargar la cuenta"
        description={platformError(retention.error)}
        onRetry={() => void retention.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCog}
        title="Cuenta y privacidad"
        description="Exporta tus datos, revisa la retención, revoca consentimientos o elimina tu cuenta."
      />

      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {retention.isPending ? <div className="skeleton h-44" /> : null}
      {retention.data ? (
        <Card>
          <div className="flex items-center gap-2">
            <Archive className="size-5 text-brand" aria-hidden="true" />
            <h2 className="font-semibold">Política de retención</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-panel-soft p-4">
              <p className="text-xs text-muted">Viajes y telemetría</p>
              <p className="mt-1 text-2xl font-bold">{retention.data.tripsAndTelemetryDays} días</p>
            </div>
            <div className="rounded-xl bg-panel-soft p-4">
              <p className="text-xs text-muted">Alertas e incidentes</p>
              <p className="mt-1 text-2xl font-bold">{retention.data.alertsAndIncidentsDays} días</p>
            </div>
            <div className="rounded-xl bg-panel-soft p-4">
              <p className="text-xs text-muted">Notificaciones</p>
              <p className="mt-1 text-2xl font-bold">{retention.data.notificationsDays} días</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-secondary">
            La identidad se anonimiza inmediatamente al eliminar la cuenta; los
            registros operativos se conservan únicamente hasta cumplir su TTL.
          </p>
        </Card>
      ) : null}

      <Card>
        <div className="flex items-center gap-2">
          <Download className="size-5 text-brand" aria-hidden="true" />
          <h2 className="font-semibold">Exportación de datos</h2>
        </div>
        <p className="mt-2 text-sm text-secondary">
          Descarga un JSON con perfil, plan, familia, vehículos, contactos,
          monitoreo, viajes, telemetría, alertas, incidentes y mensajes.
        </p>
        {exportAccount.isError ? (
          <Alert className="mt-4" tone="error">{platformError(exportAccount.error)}</Alert>
        ) : null}
        <Button
          className="mt-4"
          leftIcon={<Download className="size-4" />}
          loading={exportAccount.isPending}
          onClick={() =>
            exportAccount.mutate(undefined, {
              onSuccess: (data) => {
                downloadJson(data);
                setNotice("Exportación generada correctamente.");
              },
            })
          }
        >
          Exportar mi cuenta
        </Button>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <ShieldX className="size-5 text-brand" aria-hidden="true" />
          <h2 className="font-semibold">Consentimientos opcionales</h2>
        </div>
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-2.5 text-sm text-secondary">
            <Checkbox checked={revokeLocation} onChange={(event) => setRevokeLocation(event.target.checked)} />
            Revocar el consentimiento de ubicación durante incidentes.
          </label>
          <label className="flex items-start gap-2.5 text-sm text-secondary">
            <Checkbox checked={revokeDriving} onChange={(event) => setRevokeDriving(event.target.checked)} />
            Revocar el análisis de patrones de conducción.
          </label>
          <label className="flex items-start gap-2.5 text-sm text-secondary">
            <Checkbox checked={removeMedical} onChange={(event) => setRemoveMedical(event.target.checked)} />
            Eliminar también mi ficha médica.
          </label>
        </div>
        {revokeConsents.isError ? (
          <Alert className="mt-4" tone="error">{platformError(revokeConsents.error)}</Alert>
        ) : null}
        <Button
          className="mt-4"
          variant="outline"
          disabled={!revokeLocation && !revokeDriving && !removeMedical}
          loading={revokeConsents.isPending}
          onClick={() =>
            revokeConsents.mutate(
              {
                revokeLocationIncidentConsent: revokeLocation,
                revokeDrivingPatternConsent: revokeDriving,
                removeMedicalProfile: removeMedical,
              },
              {
                onSuccess: () => {
                  setRevokeLocation(false);
                  setRevokeDriving(false);
                  setRemoveMedical(false);
                  setNotice("Consentimientos actualizados.");
                },
              },
            )
          }
        >
          Revocar seleccionados
        </Button>
      </Card>

      <Card className="border-[color-mix(in_srgb,var(--color-error)_35%,transparent)]">
        <div className="flex items-center gap-2">
          <Trash2 className="size-5 text-error" aria-hidden="true" />
          <h2 className="font-semibold">Eliminar cuenta</h2>
        </div>
        <p className="mt-2 text-sm text-secondary">
          Esta acción revoca sesiones, desvincula dispositivos y anonimiza tus
          datos de identidad. No se puede deshacer.
        </p>
        <Button className="mt-4" variant="danger" onClick={() => setDeleteOpen(true)}>
          Eliminar mi cuenta
        </Button>
      </Card>

      <Modal open={deleteOpen} onClose={closeDeleteModal} title="Eliminar cuenta">
        <div className="space-y-4">
          <Alert tone="error" title="Acción irreversible">
            Escribe tu contraseña y la palabra DELETE para confirmar.
          </Alert>
          <PasswordInput
            aria-label="Contraseña actual"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contraseña actual"
          />
          <Input
            aria-label="Confirmación de eliminación"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Escribe DELETE"
            autoComplete="off"
          />
          <Input
            aria-label="Motivo opcional"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motivo (opcional)"
            maxLength={500}
          />
          {deleteAccount.isError ? (
            <Alert tone="error">{platformError(deleteAccount.error)}</Alert>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteAccount.isPending}
              disabled={!password || confirmation !== "DELETE"}
              onClick={() =>
                deleteAccount.mutate(
                  {
                    password,
                    confirmation: "DELETE",
                    reason: reason.trim() || undefined,
                  },
                  {
                    onSuccess: () => {
                      clearSession();
                      navigate("/login", { replace: true });
                    },
                  },
                )
              }
            >
              Eliminar definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
