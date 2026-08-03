import { Eye, HeartPulse, MessageCircle, Shield, Users } from "lucide-react";
import { Link } from "react-router";
import { userSafeErrorMessage } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSession } from "@/features/auth/hooks/useSession";
import { GroupAccessManager } from "@/features/family/components/GroupAccessManager";
import { useMonitoringRelationships } from "@/features/monitoring/hooks";
import type { MonitoringRelationship } from "@/features/monitoring/types";

function monitoredPerson(relationship: MonitoringRelationship) {
  return {
    publicProfileId: relationship.monitoredPublicProfileId,
    username: relationship.monitoredUsername,
    name: relationship.monitoredName,
  };
}

function enabledPermissions(relationship: MonitoringRelationship): string[] {
  const permissions = relationship.permissions;
  return [
    permissions.sendMessages ? "Mensajes" : null,
    permissions.receiveCriticalAlerts ? "Alertas" : null,
    permissions.viewEmergencyLocation ? "Ubicación SOS" : null,
    permissions.viewIncidents ? "Incidentes" : null,
    permissions.viewRoutes ? "Rutas" : null,
    permissions.viewLocation ? "Ubicación continua" : null,
    permissions.viewTelemetry ? "Telemetría" : null,
    permissions.viewMedicalProfile ? "Ficha médica" : null,
  ].filter((value): value is string => Boolean(value));
}

export function MonitoringPage() {
  const { user } = useSession();
  const relationships = useMonitoringRelationships();
  const currentProfileId = user?.publicProfileId ?? user?.id ?? "";
  const accessGrantedToMe = relationships.data?.filter((item) =>
    item.status === "Accepted" && item.monitorPublicProfileId === currentProfileId
  ) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Monitoreo del grupo"
        description="Las personas del mismo plan quedan conectadas automáticamente. Cada usuario controla qué datos propios comparte con cada integrante."
      />

      <Alert tone="info" title="Una sola relación de grupo">
        Ya no necesitas enviar invitaciones separadas de monitoreo o de contacto SOS.
        La invitación al grupo habilita mensajes y protección recíproca; los permisos y la prioridad SOS se configuran abajo.
      </Alert>

      <GroupAccessManager
        title="Qué comparto con cada integrante"
        description="Estos interruptores controlan los datos tuyos que cada persona puede consultar. Los permisos que ellos te otorguen aparecen en los accesos disponibles."
      />

      <section className="space-y-3" aria-labelledby="available-access-heading">
        <div className="flex items-center gap-2">
          <Eye className="size-5 text-brand" aria-hidden="true" />
          <h2 id="available-access-heading" className="text-lg font-semibold">
            Accesos disponibles
          </h2>
        </div>
        <p className="text-sm text-muted">
          Aquí aparece únicamente lo que las demás personas te autorizaron consultar.
          Lo que tú compartes se administra en los interruptores de la sección anterior.
        </p>

        {relationships.isPending ? <div className="skeleton h-52" /> : null}
        {relationships.isError ? (
          <ErrorState
            title="No se pudieron cargar los accesos"
            description={userSafeErrorMessage(relationships.error, "Inténtalo nuevamente.")}
            onRetry={() => void relationships.refetch()}
          />
        ) : null}
        {!relationships.isPending && !relationships.isError && accessGrantedToMe.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin otros integrantes"
            description="Cuando una persona acepte la invitación del grupo, aparecerán aquí los accesos recíprocos."
          />
        ) : null}

        {accessGrantedToMe.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {accessGrantedToMe.map((relationship) => {
              const other = monitoredPerson(relationship);
              const permissions = enabledPermissions(relationship);
              return (
                <Card key={relationship.publicRelationshipId} className="flex h-full flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{other.name || other.username || "Integrante"}</h3>
                      <p className="mt-1 text-xs text-muted">
                        @{other.username || "usuario"} · {other.publicProfileId}
                      </p>
                    </div>
                    <Badge tone="success">Puedes consultar</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {permissions.length ? permissions.map((permission) => (
                      <Badge key={permission} tone="neutral">{permission}</Badge>
                    )) : <Badge tone="warning">Sin permisos habilitados</Badge>}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <Link to={`/app/monitoring/${relationship.publicRelationshipId}`}>
                      <Button
                        size="sm"
                        leftIcon={<Eye className="size-4" aria-hidden="true" />}
                      >
                        Ver información autorizada
                      </Button>
                    </Link>
                    {relationship.permissions.sendMessages ? (
                      <Link to={`/app/messages?recipient=${other.publicProfileId ?? ""}`}>
                        <Button size="sm" variant="outline" leftIcon={<MessageCircle className="size-4" aria-hidden="true" />}>
                          Mensajes
                        </Button>
                      </Link>
                    ) : null}
                    {relationship.permissions.receiveCriticalAlerts ? (
                      <Badge tone="error" icon={<HeartPulse className="size-3" aria-hidden="true" />}>
                        Recibe SOS
                      </Badge>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
