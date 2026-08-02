import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Copy,
  CreditCard,
  Crown,
  MailPlus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserMinus,
  Users,
} from "lucide-react";
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
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import {
  useAcceptFamilyInvitation,
  useActivateFamily,
  useCancelFamily,
  useChangeFamilyPlan,
  useCreateFamilyInvitation,
  useCurrentFamilySubscription,
  useFamilyInvitations,
  useFamilyMembers,
  useLeaveFamily,
  useRedeemFamilyInvitation,
  useRejectFamilyInvitation,
  useRemoveFamilyMember,
  useRenewFamily,
} from "@/features/family/hooks";
import type {
  CreateFamilyInvitationInput,
  FamilyInvitation,
  FamilyMember,
  FamilyPlanName,
  FamilySubscriptionSummary,
} from "@/features/family/types";

const PLAN_CARDS: ReadonlyArray<{
  value: FamilyPlanName;
  label: string;
  invited: string;
  vehicles: string;
  description: string;
}> = [
  {
    value: "Free",
    label: "Gratuito",
    invited: "1 invitado",
    vehicles: "1 vehículo por usuario",
    description: "Para probar el monitoreo familiar esencial.",
  },
  {
    value: "Basic",
    label: "Estándar",
    invited: "3 invitados",
    vehicles: "3 vehículos por usuario",
    description: "Para familias que administran varios vehículos.",
  },
  {
    value: "Premium",
    label: "Premium",
    invited: "6 invitados",
    vehicles: "Vehículos sin límite fijo",
    description: "Cobertura ampliada con protección contra abuso.",
  },
];

function messageOf(error: unknown): string {
  return error instanceof AppApiError
    ? error.message
    : "No se pudo completar la operación.";
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "No disponible";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "No disponible"
    : new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);
}

function statusTone(status: string): BadgeTone {
  if (["Active", "Accepted", "Consumed"].includes(status)) return "success";
  if (["Pending", "PastDue"].includes(status)) return "warning";
  if (["Rejected", "Removed", "Cancelled", "Expired"].includes(status)) {
    return "error";
  }
  return "neutral";
}

function invitationTarget(invitation: FamilyInvitation): string {
  return (
    invitation.targetUsername ??
    invitation.targetEmail ??
    invitation.targetPublicProfileId ??
    "Invitación sin destinatario visible"
  );
}

function PlanPicker({
  currentPlan,
  pending,
  onSelect,
}: {
  currentPlan?: string | null;
  pending: boolean;
  onSelect: (plan: FamilyPlanName) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PLAN_CARDS.map((plan) => {
        const selected = currentPlan === plan.value;
        return (
          <Card key={plan.value} className={selected ? "border-line-strong" : undefined}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">{plan.label}</h3>
              {selected ? <Badge tone="brand">Plan actual</Badge> : null}
            </div>
            <p className="mt-2 text-sm text-muted">{plan.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden="true" />
                {plan.invited}
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden="true" />
                {plan.vehicles}
              </li>
            </ul>
            <Button
              className="mt-5"
              fullWidth
              variant={selected ? "secondary" : "primary"}
              disabled={selected || pending}
              loading={pending && !selected}
              onClick={() => onSelect(plan.value)}
            >
              {selected ? "Seleccionado" : currentPlan ? "Cambiar a este plan" : "Activar plan"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}

function SubscriptionSummary({ summary }: { summary: FamilySubscriptionSummary }) {
  const unlimited = summary.vehicleLimitPerUser >= 2_147_483_647;
  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Crown className="size-5 text-brand" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Plan {summary.planName}</h2>
            <Badge tone={statusTone(summary.status)}>{summary.status}</Badge>
            <Badge tone="neutral">{summary.currentUserRole === "Owner" ? "Titular" : "Miembro"}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">
            Titular: {summary.ownerName || summary.ownerUsername} · {summary.publicSubscriptionId}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-panel-soft p-3 text-center">
            <p className="text-xs text-muted">Miembros</p>
            <p className="mt-1 font-bold">
              {summary.acceptedMembers}/{summary.invitedMemberLimit + 1}
            </p>
          </div>
          <div className="rounded-lg bg-panel-soft p-3 text-center">
            <p className="text-xs text-muted">Espacios</p>
            <p className="mt-1 font-bold">{summary.availableMemberSlots}</p>
          </div>
          <div className="rounded-lg bg-panel-soft p-3 text-center">
            <p className="text-xs text-muted">Vehículos/usuario</p>
            <p className="mt-1 font-bold">{unlimited ? "Sin límite fijo" : summary.vehicleLimitPerUser}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-secondary">
          <CalendarClock className="size-4 text-muted" aria-hidden="true" />
          Periodo: {formatDate(summary.periodStartUtc)} — {formatDate(summary.periodEndUtc)}
        </div>
        <div className="flex items-center gap-2 text-secondary">
          <CreditCard className="size-4 text-muted" aria-hidden="true" />
          {summary.latestPayment
            ? `Pago simulado: ${summary.latestPayment.amount} ${summary.latestPayment.currency} (${summary.latestPayment.result})`
            : "Sin pago simulado registrado"}
        </div>
      </div>
      {summary.pendingAdjustment ? (
        <Alert tone="warning" className="mt-4">
          Hay un ajuste pendiente hacia el plan {summary.pendingPlanName ?? "seleccionado"}. Puede requerir reducir miembros antes de aplicarse.
        </Alert>
      ) : null}
    </Card>
  );
}

function MemberList({
  members,
  owner,
  busy,
  onRemove,
}: {
  members: FamilyMember[];
  owner: boolean;
  busy: boolean;
  onRemove: (member: FamilyMember) => void;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Users className="size-4 text-brand" aria-hidden="true" />
        <h2 className="font-semibold">Miembros familiares</h2>
      </div>
      {members.length === 0 ? (
        <EmptyState icon={Users} title="Sin miembros" description="Las personas aceptadas aparecerán aquí." />
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {members.map((member) => (
            <li key={member.publicMembershipId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{member.displayName || member.username}</p>
                  <Badge tone={statusTone(member.status)}>{member.status}</Badge>
                  <Badge tone="neutral">{member.role === "Owner" ? "Titular" : "Miembro"}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">@{member.username} · {member.publicProfileId}</p>
              </div>
              {owner && member.role !== "Owner" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-error"
                  leftIcon={<UserMinus className="size-4" aria-hidden="true" />}
                  disabled={busy}
                  onClick={() => onRemove(member)}
                >
                  Quitar
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function FamilySubscriptionPage() {
  const current = useCurrentFamilySubscription();
  const members = useFamilyMembers(Boolean(current.data));
  const invitations = useFamilyInvitations(true);
  const activate = useActivateFamily();
  const changePlan = useChangeFamilyPlan();
  const renew = useRenewFamily();
  const cancel = useCancelFamily();
  const leave = useLeaveFamily();
  const removeMember = useRemoveFamilyMember();
  const createInvitation = useCreateFamilyInvitation();
  const acceptInvitation = useAcceptFamilyInvitation();
  const rejectInvitation = useRejectFamilyInvitation();
  const redeemInvitation = useRedeemFamilyInvitation();

  const [targetType, setTargetType] = useState<"username" | "publicProfileId" | "email">("username");
  const [target, setTarget] = useState("");
  const [createMonitoring, setCreateMonitoring] = useState(true);
  const [redeemCode, setRedeemCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [removeCandidate, setRemoveCandidate] = useState<FamilyMember | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  const summary = current.data ?? null;
  const isOwner = summary?.currentUserRole === "Owner";
  const busy = [
    activate,
    changePlan,
    renew,
    cancel,
    leave,
    removeMember,
    createInvitation,
    acceptInvitation,
    rejectInvitation,
    redeemInvitation,
  ].some((mutation) => mutation.isPending);

  const firstError = useMemo(
    () =>
      [
        activate.error,
        changePlan.error,
        renew.error,
        cancel.error,
        leave.error,
        removeMember.error,
        createInvitation.error,
        acceptInvitation.error,
        rejectInvitation.error,
        redeemInvitation.error,
      ].find(Boolean),
    [
      activate.error,
      changePlan.error,
      renew.error,
      cancel.error,
      leave.error,
      removeMember.error,
      createInvitation.error,
      acceptInvitation.error,
      rejectInvitation.error,
      redeemInvitation.error,
    ],
  );

  const selectPlan = (planName: FamilyPlanName) => {
    setNotice(null);
    const mutation = summary ? changePlan : activate;
    mutation.mutate(planName, {
      onSuccess: () => setNotice(summary ? "Solicitud de cambio de plan aplicada." : "Suscripción familiar activada."),
    });
  };

  const submitInvitation = () => {
    const clean = target.trim();
    if (!clean) {
      setNotice("Escribe un usuario, perfil público o correo para invitar.");
      return;
    }
    const input: CreateFamilyInvitationInput = {
      createMonitoringRelationship: createMonitoring,
      [targetType]: clean,
    };
    createInvitation.mutate(input, {
      onSuccess: (response) => {
        setTarget("");
        setManualCode(response.manualCode);
        setNotice("Invitación creada. Comparte el código manual por un canal seguro.");
      },
    });
  };

  const copyCode = async () => {
    if (!manualCode || !navigator.clipboard) return;
    await navigator.clipboard.writeText(manualCode);
    setNotice("Código copiado al portapapeles.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Plan familiar"
        description="Administra el plan compartido, los miembros y las invitaciones. Los pagos de esta versión son simulados."
      />

      {notice ? <Alert tone={notice.startsWith("Escribe") ? "warning" : "success"}>{notice}</Alert> : null}
      {firstError ? <Alert tone="error">{messageOf(firstError)}</Alert> : null}

      {current.isPending ? <div className="panel h-56 p-5"><div className="skeleton h-full" /></div> : null}
      {current.isError ? (
        <ErrorState
          title="No se pudo consultar la suscripción"
          description={messageOf(current.error)}
          onRetry={() => void current.refetch()}
        />
      ) : null}

      {!current.isPending && !current.isError && summary ? <SubscriptionSummary summary={summary} /> : null}

      {!current.isPending && !current.isError ? (
        <section aria-labelledby="plans-heading" className="space-y-3">
          <div>
            <h2 id="plans-heading" className="text-lg font-semibold">
              {summary ? "Cambiar plan" : "Elige un plan"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              El titular paga de forma simulada; los miembros aceptados heredan los beneficios.
            </p>
          </div>
          <PlanPicker currentPlan={summary?.planName} pending={activate.isPending || changePlan.isPending} onSelect={selectPlan} />
        </section>
      ) : null}

      {summary ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MemberList
            members={members.data ?? []}
            owner={isOwner}
            busy={busy}
            onRemove={setRemoveCandidate}
          />

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <MailPlus className="size-4 text-brand" aria-hidden="true" />
              <h2 className="font-semibold">Invitar a un miembro</h2>
            </div>
            {isOwner ? (
              <div className="space-y-4">
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
                  <Input
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    placeholder={targetType === "email" ? "persona@ejemplo.com" : targetType === "username" ? "usuario" : "USR-..."}
                    autoComplete="off"
                  />
                </div>
                <label className="flex items-start gap-2.5 rounded-lg bg-panel-soft p-3 text-sm text-secondary">
                  <Checkbox checked={createMonitoring} onChange={(event) => setCreateMonitoring(event.target.checked)} />
                  Crear también una relación de monitoreo al aceptar.
                </label>
                <Button onClick={submitInvitation} loading={createInvitation.isPending} disabled={summary.availableMemberSlots <= 0}>
                  Crear invitación
                </Button>
                {summary.availableMemberSlots <= 0 ? (
                  <Alert tone="warning">No quedan espacios disponibles en el plan actual.</Alert>
                ) : null}
                {manualCode ? (
                  <Alert tone="info" title="Código manual de un solo uso">
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="rounded bg-panel-raised px-2 py-1 text-primary">{manualCode}</code>
                      <Button size="sm" variant="outline" leftIcon={<Copy className="size-3.5" aria-hidden="true" />} onClick={() => void copyCode()}>
                        Copiar
                      </Button>
                    </div>
                  </Alert>
                ) : null}
              </div>
            ) : (
              <Alert tone="info">Solo el titular puede crear invitaciones y administrar miembros.</Alert>
            )}
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
            <h2 className="font-semibold">Canjear código manual</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={redeemCode}
              onChange={(event) => setRedeemCode(event.target.value)}
              placeholder="Código recibido"
              autoComplete="off"
            />
            <Button
              loading={redeemInvitation.isPending}
              disabled={!redeemCode.trim()}
              onClick={() =>
                redeemInvitation.mutate(redeemCode.trim(), {
                  onSuccess: () => {
                    setRedeemCode("");
                    setNotice("Invitación canjeada correctamente.");
                  },
                })
              }
            >
              Canjear
            </Button>
          </div>
        </Card>

        {summary ? (
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <RefreshCw className="size-4 text-brand" aria-hidden="true" />
              <h2 className="font-semibold">Administración del periodo</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {isOwner ? (
                <>
                  <Button variant="secondary" loading={renew.isPending} onClick={() => renew.mutate(undefined, { onSuccess: () => setNotice("Periodo renovado con pago simulado.") })}>
                    Renovar
                  </Button>
                  <Button variant="ghost" className="text-error" leftIcon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setCancelConfirm(true)}>
                    Cancelar plan
                  </Button>
                </>
              ) : (
                <Button variant="ghost" className="text-error" leftIcon={<UserMinus className="size-4" aria-hidden="true" />} onClick={() => setLeaveConfirm(true)}>
                  Salir del plan
                </Button>
              )}
            </div>
          </Card>
        ) : null}
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <MailPlus className="size-4 text-brand" aria-hidden="true" />
          <h2 className="font-semibold">Invitaciones relacionadas con tu cuenta</h2>
        </div>
        {invitations.isPending ? <div className="skeleton h-28" /> : null}
        {invitations.isError ? (
          <ErrorState description={messageOf(invitations.error)} onRetry={() => void invitations.refetch()} />
        ) : null}
        {invitations.data && invitations.data.length === 0 ? (
          <EmptyState icon={MailPlus} title="Sin invitaciones" description="Las invitaciones enviadas o recibidas aparecerán aquí." />
        ) : null}
        {invitations.data && invitations.data.length > 0 ? (
          <ul className="divide-y divide-[var(--color-border)]">
            {invitations.data.map((invitation) => (
              <li key={invitation.publicInvitationId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{invitationTarget(invitation)}</p>
                    <Badge tone={statusTone(invitation.status)}>{invitation.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Expira: {formatDate(invitation.expiresAtUtc)} · {invitation.publicInvitationId}
                  </p>
                </div>
                {invitation.status === "Pending" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptInvitation.mutate(invitation.publicInvitationId, { onSuccess: () => setNotice("Invitación aceptada.") })}
                      disabled={busy}
                    >
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectInvitation.mutate(invitation.publicInvitationId, { onSuccess: () => setNotice("Invitación rechazada.") })}
                      disabled={busy}
                    >
                      Rechazar
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      <ConfirmDialog
        open={Boolean(removeCandidate)}
        title="Quitar miembro"
        description={removeCandidate ? `Se quitará a ${removeCandidate.displayName || removeCandidate.username} del plan familiar.` : ""}
        confirmLabel="Quitar miembro"
        danger
        loading={removeMember.isPending}
        error={removeMember.isError ? messageOf(removeMember.error) : null}
        onConfirm={() => {
          if (!removeCandidate) return;
          removeMember.mutate(removeCandidate.publicMembershipId, {
            onSuccess: () => {
              setRemoveCandidate(null);
              setNotice("Miembro eliminado del plan.");
            },
          });
        }}
        onCancel={() => !removeMember.isPending && setRemoveCandidate(null)}
      />

      <ConfirmDialog
        open={cancelConfirm}
        title="Cancelar plan familiar"
        description="La suscripción quedará cancelada y los miembros volverán al plan gratuito según las reglas del backend."
        confirmLabel="Cancelar plan"
        danger
        loading={cancel.isPending}
        error={cancel.isError ? messageOf(cancel.error) : null}
        onConfirm={() => cancel.mutate(undefined, { onSuccess: () => { setCancelConfirm(false); setNotice("Plan familiar cancelado."); } })}
        onCancel={() => !cancel.isPending && setCancelConfirm(false)}
      />

      <ConfirmDialog
        open={leaveConfirm}
        title="Salir del plan familiar"
        description="Dejarás de heredar los beneficios del titular y volverás al plan gratuito."
        confirmLabel="Salir del plan"
        danger
        loading={leave.isPending}
        error={leave.isError ? messageOf(leave.error) : null}
        onConfirm={() => leave.mutate(undefined, { onSuccess: () => { setLeaveConfirm(false); setNotice("Saliste del plan familiar."); } })}
        onCancel={() => !leave.isPending && setLeaveConfirm(false)}
      />
    </div>
  );
}
