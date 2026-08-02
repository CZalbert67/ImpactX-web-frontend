import { useMemo, useState } from "react";
import { Ban, Copy, Eye, Link2, MailPlus, MessageCircle, Settings2, Shield, Trash2, Users } from "lucide-react";
import { Link } from "react-router";
import { AppApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { PermissionsEditor } from "@/features/monitoring/components/PermissionsEditor";
import {
  useAcceptMonitoringInvitation,
  useBlockMonitoringRelationship,
  useCreateMonitoringInvitation,
  useMonitoringRelationships,
  useRejectMonitoringInvitation,
  useRevokeMonitoringRelationship,
  useUpdateMonitoringPermissions,
} from "@/features/monitoring/hooks";
import type {
  CreateMonitoringInvitationInput,
  MonitoringInvitationPermissions,
  MonitoringRelationship,
  UpdateMonitoringPermissionsInput,
} from "@/features/monitoring/types";
import { useSession } from "@/features/auth/hooks/useSession";

const DEFAULT_PERMISSIONS: MonitoringInvitationPermissions = {
  viewRoutes: true,
  viewLocation: true,
  viewEmergencyLocation: true,
  viewIncidents: true,
  receiveCriticalAlerts: true,
  sendMessages: true,
  viewTelemetry: true,
  receiveNotifications: true,
};

function messageOf(error: unknown): string {
  return error instanceof AppApiError ? error.message : "No se pudo completar la operación.";
}

function tone(status: string): BadgeTone {
  if (status === "Accepted") return "success";
  if (status === "Pending") return "warning";
  if (["Rejected", "Revoked", "Blocked", "Expired"].includes(status)) return "error";
  return "neutral";
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Sin fecha"
    : new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function counterpart(relationship: MonitoringRelationship, currentProfileId: string) {
  const userIsMonitor = relationship.monitorPublicProfileId === currentProfileId;
  return {
    userIsMonitor,
    publicProfileId: userIsMonitor
      ? relationship.monitoredPublicProfileId
      : relationship.monitorPublicProfileId,
    username: userIsMonitor ? relationship.monitoredUsername : relationship.monitorUsername,
    name: userIsMonitor ? relationship.monitoredName : relationship.monitorName,
  };
}

export function MonitoringPage() {
  const { user } = useSession();
  const relationships = useMonitoringRelationships();
  const createInvitation = useCreateMonitoringInvitation();
  const acceptInvitation = useAcceptMonitoringInvitation();
  const rejectInvitation = useRejectMonitoringInvitation();
  const updatePermissions = useUpdateMonitoringPermissions();
  const blockRelationship = useBlockMonitoringRelationship();
  const revokeRelationship = useRevokeMonitoringRelationship();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [targetType, setTargetType] = useState<"username" | "publicProfileId" | "email">("username");
  const [target, setTarget] = useState("");
  const [invitePermissions, setInvitePermissions] = useState(DEFAULT_PERMISSIONS);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [responseCode, setResponseCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [permissionTarget, setPermissionTarget] = useState<MonitoringRelationship | null>(null);
  const [blockTarget, setBlockTarget] = useState<MonitoringRelationship | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<MonitoringRelationship | null>(null);

  const currentProfileId = user?.publicProfileId ?? user?.id ?? "";
  const busy = [createInvitation, acceptInvitation, rejectInvitation, updatePermissions, blockRelationship, revokeRelationship].some((value) => value.isPending);
  const firstError = useMemo(
    () => [createInvitation.error, acceptInvitation.error, rejectInvitation.error, updatePermissions.error, blockRelationship.error, revokeRelationship.error].find(Boolean),
    [createInvitation.error, acceptInvitation.error, rejectInvitation.error, updatePermissions.error, blockRelationship.error, revokeRelationship.error],
  );

  const submitInvitation = () => {
    const clean = target.trim();
    if (!clean) {
      setNotice("Escribe el identificador de la persona que deseas invitar.");
      return;
    }
    const input: CreateMonitoringInvitationInput = {
      permissions: invitePermissions,
      [targetType]: clean,
    };
    createInvitation.mutate(input, {
      onSuccess: (response) => {
        setManualCode(response.manualCode);
        setTarget("");
        setNotice("Invitación de monitoreo creada.");
      },
    });
  };

  const respondWithCode = (action: "accept" | "reject") => {
    const code = responseCode.trim();
    if (!code) return;
    const mutation = action === "accept" ? acceptInvitation : rejectInvitation;
    mutation.mutate({ code }, {
      onSuccess: () => {
        setResponseCode("");
        setNotice(action === "accept" ? "Invitación aceptada." : "Invitación rechazada.");
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Monitoreo"
        description="Administra relaciones direccionales y permisos para ubicación, incidentes, rutas, telemetría y mensajes."
        actions={<Button leftIcon={<MailPlus className="size-4" aria-hidden="true" />} onClick={() => setInviteOpen(true)}>Invitar</Button>}
      />

      {notice ? <Alert tone={notice.startsWith("Escribe") ? "warning" : "success"}>{notice}</Alert> : null}
      {firstError ? <Alert tone="error">{messageOf(firstError)}</Alert> : null}

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="monitoring-code" className="mb-1.5 block text-sm font-medium">
              Código manual recibido
            </label>
            <Input
              id="monitoring-code"
              value={responseCode}
              onChange={(event) => setResponseCode(event.target.value)}
              placeholder="Código de invitación"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <Button disabled={!responseCode.trim() || busy} onClick={() => respondWithCode("accept")}>Aceptar</Button>
            <Button variant="outline" disabled={!responseCode.trim() || busy} onClick={() => respondWithCode("reject")}>Rechazar</Button>
          </div>
        </div>
      </Card>

      {relationships.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2" aria-hidden="true">
          {[0, 1].map((value) => <div key={value} className="panel h-64 p-5"><div className="skeleton h-full" /></div>)}
        </div>
      ) : null}
      {relationships.isError ? (
        <ErrorState title="No se pudieron cargar las relaciones" description={messageOf(relationships.error)} onRetry={() => void relationships.refetch()} />
      ) : null}
      {relationships.data && relationships.data.length === 0 ? (
        <EmptyState icon={Users} title="Sin relaciones de monitoreo" description="Invita a una persona mediante usuario, perfil público o correo." action={<Button onClick={() => setInviteOpen(true)}>Crear invitación</Button>} />
      ) : null}
      {relationships.data && relationships.data.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {relationships.data.map((relationship) => {
            const other = counterpart(relationship, currentProfileId);
            const incoming = relationship.status === "Pending" && !other.userIsMonitor;
            const canEditPermissions = !other.userIsMonitor && relationship.status === "Accepted";
            return (
              <Card key={relationship.publicRelationshipId} className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{other.name || other.username || "Usuario pendiente"}</h2>
                      <Badge tone={tone(relationship.status)}>{relationship.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {other.userIsMonitor ? "Tú monitoreas" : "Te monitorea"} · {other.publicProfileId ?? relationship.publicRelationshipId}
                    </p>
                  </div>
                  <Badge tone="neutral">{relationship.direction === "MonitorInvitesMonitored" ? "Invitación del monitor" : "Solicitud de monitor"}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-secondary sm:grid-cols-3">
                  <span className="rounded-lg bg-panel-soft px-2 py-2">Rutas: {relationship.permissions.viewRoutes ? "Sí" : "No"}</span>
                  <span className="rounded-lg bg-panel-soft px-2 py-2">Incidentes: {relationship.permissions.viewIncidents ? "Sí" : "No"}</span>
                  <span className="rounded-lg bg-panel-soft px-2 py-2">Telemetría: {relationship.permissions.viewTelemetry ? "Sí" : "No"}</span>
                  <span className="rounded-lg bg-panel-soft px-2 py-2">Mensajes: {relationship.permissions.sendMessages ? "Sí" : "No"}</span>
                  <span className="rounded-lg bg-panel-soft px-2 py-2">Médico: {relationship.permissions.viewMedicalProfile ? "Sí" : "No"}</span>
                  <span className="rounded-lg bg-panel-soft px-2 py-2">Alertas: {relationship.permissions.receiveCriticalAlerts ? "Sí" : "No"}</span>
                </div>

                <p className="mt-4 text-xs text-muted">
                  Solicitada: {formatDate(relationship.requestedAtUtc)} · Expira: {formatDate(relationship.expiresAtUtc)}
                </p>

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {relationship.status === "Accepted" && other.userIsMonitor ? (
                    <Link
                      to={`/app/monitoring/${relationship.publicRelationshipId}`}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 text-sm font-semibold text-[var(--color-bg-main)] hover:opacity-90"
                    >
                      <Eye className="size-3.5" aria-hidden="true" /> Ver monitoreo
                    </Link>
                  ) : null}
                  {relationship.status === "Accepted" && relationship.permissions.sendMessages ? (
                    <Link
                      to={`/app/messages?recipient=${encodeURIComponent(other.publicProfileId ?? "")}`}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-line-strong px-3 text-sm font-semibold hover:bg-panel-soft"
                    >
                      <MessageCircle className="size-3.5" aria-hidden="true" /> Mensaje
                    </Link>
                  ) : null}
                  {incoming ? (
                    <>
                      <Button size="sm" onClick={() => acceptInvitation.mutate({ publicRelationshipId: relationship.publicRelationshipId }, { onSuccess: () => setNotice("Invitación aceptada.") })} disabled={busy}>Aceptar</Button>
                      <Button size="sm" variant="outline" onClick={() => rejectInvitation.mutate({ publicRelationshipId: relationship.publicRelationshipId }, { onSuccess: () => setNotice("Invitación rechazada.") })} disabled={busy}>Rechazar</Button>
                    </>
                  ) : null}
                  {canEditPermissions ? (
                    <Button size="sm" variant="secondary" leftIcon={<Settings2 className="size-3.5" aria-hidden="true" />} onClick={() => setPermissionTarget(relationship)}>
                      Permisos
                    </Button>
                  ) : null}
                  {relationship.status === "Accepted" ? (
                    <Button size="sm" variant="ghost" className="text-warning" leftIcon={<Ban className="size-3.5" aria-hidden="true" />} onClick={() => setBlockTarget(relationship)}>Bloquear</Button>
                  ) : null}
                  {!["Revoked", "Rejected", "Expired"].includes(relationship.status) ? (
                    <Button size="sm" variant="ghost" className="text-error" leftIcon={<Trash2 className="size-3.5" aria-hidden="true" />} onClick={() => setRevokeTarget(relationship)}>Revocar</Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      <Modal open={inviteOpen} onClose={createInvitation.isPending ? () => undefined : () => setInviteOpen(false)} title="Invitar a monitoreo" description="El código se mostrará una sola vez. No se coloca en la URL.">
        <div className="space-y-4">
          {createInvitation.isError ? <Alert tone="error">{messageOf(createInvitation.error)}</Alert> : null}
          <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
            <Select
              aria-label="Tipo de identificador"
              value={targetType}
              onChange={(event) => setTargetType(event.target.value as typeof targetType)}
              options={[
                { value: "username", label: "Usuario" },
                { value: "publicProfileId", label: "Perfil público" },
                { value: "email", label: "Correo" },
              ]}
            />
            <Input value={target} onChange={(event) => setTarget(event.target.value)} placeholder={targetType === "email" ? "persona@ejemplo.com" : targetType === "username" ? "usuario" : "USR-..."} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Permisos iniciales</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(DEFAULT_PERMISSIONS) as Array<keyof MonitoringInvitationPermissions>).map((key) => (
                <label key={key} className="flex items-center gap-2 rounded-lg bg-panel-soft p-2.5 text-sm text-secondary">
                  <Checkbox checked={invitePermissions[key]} onChange={(event) => setInvitePermissions((value) => ({ ...value, [key]: event.target.checked }))} />
                  {key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}
                </label>
              ))}
            </div>
          </div>
          {manualCode ? (
            <Alert tone="info" title="Código manual">
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded bg-panel-raised px-2 py-1">{manualCode}</code>
                <Button size="sm" variant="outline" leftIcon={<Copy className="size-3.5" aria-hidden="true" />} onClick={() => void navigator.clipboard?.writeText(manualCode)}>Copiar</Button>
              </div>
            </Alert>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" disabled={createInvitation.isPending} onClick={() => setInviteOpen(false)}>Cerrar</Button>
            <Button loading={createInvitation.isPending} onClick={submitInvitation} leftIcon={<Link2 className="size-4" aria-hidden="true" />}>Crear invitación</Button>
          </div>
        </div>
      </Modal>

      {permissionTarget ? (
        <PermissionsEditor
          open
          permissions={permissionTarget.permissions}
          loading={updatePermissions.isPending}
          error={updatePermissions.isError ? messageOf(updatePermissions.error) : null}
          onClose={() => !updatePermissions.isPending && setPermissionTarget(null)}
          onSubmit={(input: UpdateMonitoringPermissionsInput) =>
            updatePermissions.mutate(
              { publicRelationshipId: permissionTarget.publicRelationshipId, input },
              { onSuccess: () => { setPermissionTarget(null); setNotice("Permisos actualizados."); } },
            )
          }
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(blockTarget)}
        title="Bloquear relación"
        description="La relación quedará bloqueada y no podrá usarse para monitoreo ni mensajes."
        confirmLabel="Bloquear"
        danger
        loading={blockRelationship.isPending}
        error={blockRelationship.isError ? messageOf(blockRelationship.error) : null}
        onConfirm={() => blockTarget && blockRelationship.mutate(blockTarget.publicRelationshipId, { onSuccess: () => { setBlockTarget(null); setNotice("Relación bloqueada."); } })}
        onCancel={() => !blockRelationship.isPending && setBlockTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title="Revocar relación"
        description="Se eliminará el acceso de monitoreo asociado a esta relación."
        confirmLabel="Revocar"
        danger
        loading={revokeRelationship.isPending}
        error={revokeRelationship.isError ? messageOf(revokeRelationship.error) : null}
        onConfirm={() => revokeTarget && revokeRelationship.mutate(revokeTarget.publicRelationshipId, { onSuccess: () => { setRevokeTarget(null); setNotice("Relación revocada."); } })}
        onCancel={() => !revokeRelationship.isPending && setRevokeTarget(null)}
      />
    </div>
  );
}
