import { Activity, ArrowLeft, HeartPulse, MapPin, Route, ShieldAlert, TriangleAlert, Users } from "lucide-react";
import { Link, useParams } from "react-router";
import { AppApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSession } from "@/features/auth/hooks/useSession";
import {
  useMonitoredAlerts,
  useMonitoredIncidents,
  useMonitoredMedicalProfile,
  useMonitoredRoutes,
  useMonitoredTrips,
  useMonitoringRelationships,
} from "@/features/monitoring/hooks";
import { formatLocalDateTime, formatDuration } from "@/features/trips/utils/format";
import { tripStateLabel } from "@/features/trips/utils/state-labels";

const BACK_LINK = "inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary";

function messageOf(error: unknown): string {
  return error instanceof AppApiError ? error.message : "No se pudo cargar la información autorizada.";
}

function date(value: string | null | undefined): string {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Sin fecha" : new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function MapLink({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const href = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lng)}#map=16/${encodeURIComponent(lat)}/${encodeURIComponent(lng)}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
      <MapPin className="size-3" aria-hidden="true" /> {label}
    </a>
  );
}

export function MonitoringDetailPage() {
  const { publicRelationshipId = "" } = useParams<{ publicRelationshipId: string }>();
  const { user } = useSession();
  const relationships = useMonitoringRelationships();
  const relationship = relationships.data?.find((value) => value.publicRelationshipId === publicRelationshipId) ?? null;
  const currentProfileId = user?.publicProfileId ?? user?.id ?? "";
  const isMonitor = relationship?.monitorPublicProfileId === currentProfileId;
  const accepted = relationship?.status === "Accepted";
  const canLoad = Boolean(relationship && accepted && isMonitor);

  const trips = useMonitoredTrips(publicRelationshipId, canLoad && Boolean(relationship?.permissions.viewTelemetry));
  const alerts = useMonitoredAlerts(publicRelationshipId, canLoad && Boolean(relationship?.permissions.receiveCriticalAlerts));
  const incidents = useMonitoredIncidents(publicRelationshipId, canLoad && Boolean(relationship?.permissions.viewIncidents));
  const routes = useMonitoredRoutes(publicRelationshipId, canLoad && Boolean(relationship?.permissions.viewRoutes));
  const medical = useMonitoredMedicalProfile(publicRelationshipId, canLoad && Boolean(relationship?.permissions.viewMedicalProfile));

  const monitoredName = relationship?.monitoredName || relationship?.monitoredUsername || "persona monitoreada";

  if (relationships.isPending) {
    return <div className="panel h-72 p-5"><div className="skeleton h-full" /></div>;
  }

  if (relationships.isError) {
    return <ErrorState title="No se pudo consultar la relación" description={messageOf(relationships.error)} onRetry={() => void relationships.refetch()} />;
  }

  if (!relationship) {
    return <ErrorState title="Relación no encontrada" description="La relación no existe o ya no está disponible para tu cuenta."><Link to="/app/monitoring" className={BACK_LINK}>Volver a monitoreo</Link></ErrorState>;
  }

  return (
    <div className="space-y-6">
      <Link to="/app/monitoring" className={BACK_LINK}><ArrowLeft className="size-4" aria-hidden="true" /> Volver a monitoreo</Link>
      <PageHeader icon={Users} title={`Monitoreo de ${monitoredName}`} description={`Relación ${relationship.publicRelationshipId} · acceso controlado por permisos.`} />

      {!accepted ? <Alert tone="warning">La relación todavía no está aceptada.</Alert> : null}
      {accepted && !isMonitor ? <Alert tone="info">En esta relación tú eres la persona monitoreada. Puedes administrar permisos desde la pantalla anterior.</Alert> : null}

      {canLoad ? (
        <>
          <section aria-labelledby="monitored-trips-heading">
            <div className="mb-3 flex items-center gap-2"><Activity className="size-4 text-brand" aria-hidden="true" /><h2 id="monitored-trips-heading" className="text-lg font-semibold">Viajes autorizados</h2></div>
            {!relationship.permissions.viewTelemetry ? <Alert tone="info">La telemetría no está autorizada.</Alert> : trips.isPending ? <div className="skeleton h-36" /> : trips.isError ? <ErrorState description={messageOf(trips.error)} onRetry={() => void trips.refetch()} /> : trips.data?.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {trips.data.map((trip) => (
                  <Card key={trip.id}>
                    <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{trip.proposito || "Viaje"}</h3><Badge tone="neutral">{tripStateLabel(trip.estado)}</Badge></div>
                    <p className="mt-2 text-sm text-secondary">{formatLocalDateTime(trip.inicio)} · {formatDuration(trip.inicio, trip.fin).label}</p>
                    <p className="mt-1 text-xs text-muted">{trip.rutaOrigen || "Origen no registrado"} → {trip.rutaDestino || "Destino no registrado"}</p>
                  </Card>
                ))}
              </div>
            ) : <EmptyState icon={Route} title="Sin viajes autorizados" />}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section aria-labelledby="monitored-alerts-heading">
              <div className="mb-3 flex items-center gap-2"><TriangleAlert className="size-4 text-brand" aria-hidden="true" /><h2 id="monitored-alerts-heading" className="text-lg font-semibold">Alertas críticas</h2></div>
              {!relationship.permissions.receiveCriticalAlerts ? <Alert tone="info">Las alertas críticas no están autorizadas.</Alert> : alerts.isPending ? <div className="skeleton h-44" /> : alerts.isError ? <ErrorState description={messageOf(alerts.error)} onRetry={() => void alerts.refetch()} /> : (
                <Card>
                  {alerts.data?.length ? <ul className="divide-y divide-[var(--color-border)]">{alerts.data.map((item) => <li key={item.id} className="py-3"><div className="flex items-center justify-between gap-2"><span className="font-medium">{item.tipo} · {item.severidad}</span><Badge tone={item.estado.toLowerCase().includes("cerr") ? "success" : "warning"}>{item.estado}</Badge></div><p className="mt-1 text-xs text-muted">{item.lugar || "Sin lugar"} · {date(item.creadoEn)}</p><MapLink lat={item.lat} lng={item.lng} label="Abrir ubicación" /></li>)}</ul> : <EmptyState icon={TriangleAlert} title="Sin alertas" />}
                </Card>
              )}
            </section>

            <section aria-labelledby="monitored-incidents-heading">
              <div className="mb-3 flex items-center gap-2"><ShieldAlert className="size-4 text-brand" aria-hidden="true" /><h2 id="monitored-incidents-heading" className="text-lg font-semibold">Incidentes</h2></div>
              {!relationship.permissions.viewIncidents ? <Alert tone="info">Los incidentes no están autorizados.</Alert> : incidents.isPending ? <div className="skeleton h-44" /> : incidents.isError ? <ErrorState description={messageOf(incidents.error)} onRetry={() => void incidents.refetch()} /> : (
                <Card>
                  {incidents.data?.length ? <ul className="divide-y divide-[var(--color-border)]">{incidents.data.map((item) => <li key={item.id} className="py-3"><div className="flex items-center justify-between gap-2"><span className="font-medium">{item.severidad}</span><Badge tone={item.esFalsaAlarma ? "neutral" : "warning"}>{item.esFalsaAlarma ? "Falsa alarma" : item.metodoCierre || "Abierto"}</Badge></div><p className="mt-1 text-xs text-muted">{item.lugar || "Sin lugar"} · {date(item.creadoEn)}</p><MapLink lat={item.lat} lng={item.lng} label="Abrir ubicación" /></li>)}</ul> : <EmptyState icon={ShieldAlert} title="Sin incidentes" />}
                </Card>
              )}
            </section>
          </div>

          <section aria-labelledby="monitored-routes-heading">
            <div className="mb-3 flex items-center gap-2"><Route className="size-4 text-brand" aria-hidden="true" /><h2 id="monitored-routes-heading" className="text-lg font-semibold">Rutas</h2></div>
            {!relationship.permissions.viewRoutes ? <Alert tone="info">Las rutas no están autorizadas.</Alert> : routes.isPending ? <div className="skeleton h-44" /> : routes.isError ? <ErrorState description={messageOf(routes.error)} onRetry={() => void routes.refetch()} /> : (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card><h3 className="mb-3 font-semibold">Frecuentes</h3>{routes.data?.frequent.length ? <ul className="space-y-3">{routes.data.frequent.map((item) => <li key={item.id} className="rounded-lg bg-panel-soft p-3"><p className="font-medium">{item.nombre}</p><p className="mt-1 text-xs text-muted">{item.origen} → {item.destino} · {item.distanciaKm} km</p></li>)}</ul> : <EmptyState icon={Route} title="Sin rutas frecuentes" />}</Card>
                <Card><h3 className="mb-3 font-semibold">Historial</h3>{routes.data?.history.length ? <ul className="space-y-3">{routes.data.history.map((item) => <li key={`${item.id}-${item.usadaEn ?? "none"}`} className="rounded-lg bg-panel-soft p-3"><p className="font-medium">{item.nombre}</p><p className="mt-1 text-xs text-muted">{item.origen} → {item.destino} · {date(item.usadaEn)}</p></li>)}</ul> : <EmptyState icon={Route} title="Sin historial de rutas" />}</Card>
              </div>
            )}
          </section>

          <section aria-labelledby="monitored-medical-heading">
            <div className="mb-3 flex items-center gap-2"><HeartPulse className="size-4 text-brand" aria-hidden="true" /><h2 id="monitored-medical-heading" className="text-lg font-semibold">Ficha médica autorizada</h2></div>
            {!relationship.permissions.viewMedicalProfile ? <Alert tone="info">La ficha médica no está autorizada.</Alert> : medical.isPending ? <div className="skeleton h-36" /> : medical.isError ? <ErrorState description={messageOf(medical.error)} onRetry={() => void medical.refetch()} /> : medical.data ? (
              <Card><dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3"><div><dt className="text-muted">Tipo de sangre</dt><dd className="mt-1 font-medium">{medical.data.tipoSangre || "No registrado"}</dd></div><div><dt className="text-muted">Alergias</dt><dd className="mt-1 font-medium">{medical.data.alergias || "No registradas"}</dd></div><div><dt className="text-muted">Condiciones</dt><dd className="mt-1 font-medium">{medical.data.condiciones || "No registradas"}</dd></div><div><dt className="text-muted">Medicamentos</dt><dd className="mt-1 font-medium">{medical.data.medicamentos || "No registrados"}</dd></div><div className="sm:col-span-2"><dt className="text-muted">Nota</dt><dd className="mt-1 font-medium">{medical.data.nota || "Sin nota"}</dd></div></dl></Card>
            ) : <EmptyState icon={HeartPulse} title="Sin ficha médica" />}
          </section>
        </>
      ) : null}
    </div>
  );
}
