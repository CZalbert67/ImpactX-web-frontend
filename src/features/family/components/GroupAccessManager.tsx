import { useMemo, useState } from "react";
import { ShieldCheck, UserRoundCog } from "lucide-react";
import { userSafeErrorMessage } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Select } from "@/components/ui/Select";
import {
  useCurrentFamilySubscription,
  useFamilyMemberAccess,
  useUpdateFamilyMemberAccess,
} from "@/features/family/hooks";
import type {
  FamilyAccessPermissions,
  FamilyMemberAccess,
  UpdateFamilyMemberAccessInput,
} from "@/features/family/types";

interface GroupAccessManagerProps {
  title?: string;
  description?: string;
  onNotice?: (message: string) => void;
}

interface PermissionDefinition {
  key: keyof FamilyAccessPermissions;
  label: string;
  description: string;
}

const PERMISSIONS: readonly PermissionDefinition[] = [
  {
    key: "sendMessages",
    label: "Mensajes rápidos",
    description: "Permite que esta persona te envíe mensajes predefinidos.",
  },
  {
    key: "receiveCriticalAlerts",
    label: "Alertas críticas",
    description: "Recibe avisos cuando ImpactX detecte una emergencia tuya.",
  },
  {
    key: "viewEmergencyLocation",
    label: "Ubicación durante emergencias",
    description: "Muestra tu ubicación únicamente durante un evento crítico.",
  },
  {
    key: "viewIncidents",
    label: "Incidentes",
    description: "Permite consultar tus incidentes y su estado.",
  },
  {
    key: "viewRoutes",
    label: "Rutas e historial de viajes",
    description: "Permite consultar tus viajes y rutas registradas.",
  },
  {
    key: "viewLocation",
    label: "Ubicación continua",
    description: "Comparte tu ubicación fuera de una emergencia.",
  },
  {
    key: "viewTelemetry",
    label: "Telemetría",
    description: "Permite consultar los datos detallados de tus viajes.",
  },
  {
    key: "receiveNotifications",
    label: "Notificaciones del grupo",
    description: "Recibe cambios relevantes relacionados contigo.",
  },
  {
    key: "viewMedicalProfile",
    label: "Ficha médica",
    description: "Permite consultar la información médica que registraste.",
  },
] as const;

function toDraft(access: FamilyMemberAccess): UpdateFamilyMemberAccessInput {
  return {
    ...access.permissions,
    confirmMedicalConsent: access.permissions.viewMedicalProfile
      && access.medicalConsentGranted,
    sosPriority: access.sosPriority,
  };
}

function displayName(access: FamilyMemberAccess): string {
  return access.viewerName || access.viewerUsername || access.viewerPublicProfileId;
}

function displayHandle(access: FamilyMemberAccess): string {
  return access.viewerUsername
    ? `@${access.viewerUsername}`
    : access.viewerPublicProfileId;
}

interface AccessEditorProps {
  access: FamilyMemberAccess;
  sosContactLimit: number;
  saving: boolean;
  onSave: (access: FamilyMemberAccess, input: UpdateFamilyMemberAccessInput) => void;
}

function AccessEditor({ access, sosContactLimit, saving, onSave }: AccessEditorProps) {
  const [draft, setDraft] = useState<UpdateFamilyMemberAccessInput>(() => toDraft(access));


  const medicalConsentMissing = draft.viewMedicalProfile && !draft.confirmMedicalConsent;
  const priorityOptions = useMemo(
    () => [
      { value: "", label: "Sin prioridad SOS" },
      ...Array.from({ length: Math.max(0, sosContactLimit) }, (_, index) => ({
        value: String(index + 1),
        label: `Prioridad ${index + 1}`,
      })),
    ],
    [sosContactLimit],
  );

  const togglePermission = (key: keyof FamilyAccessPermissions, checked: boolean) => {
    setDraft((current) => ({
      ...current,
      [key]: checked,
      ...(key === "viewMedicalProfile" && !checked
        ? { confirmMedicalConsent: false }
        : {}),
    }));
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{displayName(access)}</h3>
          <p className="text-sm text-muted">{displayHandle(access)}</p>
        </div>
        {draft.sosPriority ? (
          <Badge tone="warning">SOS {draft.sosPriority}</Badge>
        ) : (
          <Badge tone="neutral">Sin prioridad SOS</Badge>
        )}
      </div>

      <div className="space-y-2">
        {PERMISSIONS.map((permission) => {
          const checked = draft[permission.key];
          return (
            <label
              key={permission.key}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-panel-soft p-3"
            >
              <Checkbox
                checked={checked}
                onChange={(event) => togglePermission(permission.key, event.target.checked)}
                aria-label={permission.label}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-primary">
                  {permission.label}
                </span>
                <span className="block text-xs text-muted">
                  {permission.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {draft.viewMedicalProfile ? (
        <label className="flex items-start gap-3 rounded-lg border border-line-strong bg-panel-soft p-3">
          <Checkbox
            checked={draft.confirmMedicalConsent}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                confirmMedicalConsent: event.target.checked,
              }))
            }
            aria-label="Confirmar consentimiento médico"
          />
          <span>
            <span className="block text-sm font-semibold text-primary">
              Confirmo el consentimiento médico
            </span>
            <span className="block text-xs text-muted">
              Autorizo de forma explícita que esta persona consulte mi ficha médica.
            </span>
          </span>
        </label>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <label
            htmlFor={`sos-priority-${access.publicRelationshipId}`}
            className="mb-1.5 block text-sm font-medium"
          >
            Prioridad de contacto SOS
          </label>
          <Select
            id={`sos-priority-${access.publicRelationshipId}`}
            value={draft.sosPriority?.toString() ?? ""}
            options={priorityOptions}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                sosPriority: event.target.value
                  ? Number.parseInt(event.target.value, 10)
                  : null,
              }))
            }
          />
          <p className="mt-1 text-xs text-muted">
            La prioridad ordena los avisos; no concede permisos adicionales.
          </p>
        </div>
        <Button
          loading={saving}
          disabled={medicalConsentMissing}
          onClick={() => onSave(access, draft)}
        >
          Guardar permisos
        </Button>
      </div>

      {medicalConsentMissing ? (
        <Alert tone="warning">
          Confirma el consentimiento médico antes de guardar este permiso.
        </Alert>
      ) : null}
    </Card>
  );
}

export function GroupAccessManager({
  title = "Privacidad y contactos SOS",
  description = "Decide qué información tuya puede consultar cada integrante del grupo.",
  onNotice,
}: GroupAccessManagerProps) {
  const current = useCurrentFamilySubscription();
  const access = useFamilyMemberAccess(Boolean(current.data));
  const update = useUpdateFamilyMemberAccess();
  const [notice, setNotice] = useState<string | null>(null);

  const announce = (message: string) => {
    setNotice(message);
    onNotice?.(message);
  };

  const save = (item: FamilyMemberAccess, input: UpdateFamilyMemberAccessInput) => {
    setNotice(null);
    update.mutate(
      {
        targetPublicProfileId: item.viewerPublicProfileId,
        input,
      },
      {
        onSuccess: () => announce(`Permisos de ${displayName(item)} actualizados.`),
      },
    );
  };

  return (
    <section className="space-y-4" aria-labelledby="group-access-heading">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
        <div>
          <h2 id="group-access-heading" className="text-lg font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {update.isError ? (
        <Alert tone="error">
          {userSafeErrorMessage(update.error, "No pudimos guardar los permisos. Inténtalo nuevamente.")}
        </Alert>
      ) : null}

      {current.isPending || access.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2" aria-hidden="true">
          <div className="skeleton h-80" />
          <div className="skeleton h-80" />
        </div>
      ) : null}

      {current.isError || access.isError ? (
        <ErrorState
          title="No se pudieron cargar los permisos del grupo"
          description={userSafeErrorMessage(
            current.error ?? access.error,
            "Inténtalo nuevamente.",
          )}
          onRetry={() => {
            void current.refetch();
            void access.refetch();
          }}
        />
      ) : null}

      {!current.isPending && !current.isError && !current.data ? (
        <Alert tone="info">
          Activa un plan para crear tu grupo y configurar permisos por integrante.
        </Alert>
      ) : null}

      {current.data && !access.isPending && !access.isError && access.data?.length === 0 ? (
        <EmptyState
          icon={UserRoundCog}
          title="Aún no hay otros integrantes"
          description="Cuando una persona acepte la invitación del grupo, podrás configurar aquí sus permisos y prioridad SOS."
        />
      ) : null}

      {current.data && access.data && access.data.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {access.data.map((item) => (
            <AccessEditor
              key={`${item.publicRelationshipId}:${item.updatedAtUtc}`}
              access={item}
              sosContactLimit={current.data?.sosContactLimit ?? 0}
              saving={update.isPending && update.variables?.targetPublicProfileId === item.viewerPublicProfileId}
              onSave={save}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
