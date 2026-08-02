import { Activity, ArrowLeft, Route } from "lucide-react";
import { Link, useParams } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TripStatusBadge } from "@/features/trips/components/TripStatusBadge";
import { useTripDetail } from "@/features/trips/hooks";
import { tripTitleLabel, shortTripId } from "@/features/trips/utils/display";
import { tripActionErrorMessage } from "@/features/trips/utils/error-messages";
import { formatDuration, formatLocalDateTime } from "@/features/trips/utils/format";
import { isValidTripGuid } from "@/features/trips/utils/guid";
import { tripStateLabel } from "@/features/trips/utils/state-labels";

const LINK_CLASSES = "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-transparent px-3 text-sm font-semibold text-primary transition-colors hover:bg-panel-soft";

export function TripDetailPage() {
  const { tripId = "" } = useParams<{ tripId: string }>();
  const validId = isValidTripGuid(tripId);
  const detail = useTripDetail(tripId);
  const trip = detail.data ?? null;

  return (
    <div className="space-y-6">
      <Link to="/app/trips" className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary"><ArrowLeft className="size-4" aria-hidden="true" /> Volver a viajes</Link>
      <PageHeader icon={Route} title={trip ? tripTitleLabel(trip) : "Detalle del viaje"} description={trip ? `Viaje ${shortTripId(trip.id)} · ${tripStateLabel(trip.estado)}` : "Información del viaje seleccionado."} />
      <Alert tone="info">Esta vista es de solo lectura. El control del viaje permanece en móvil o wearable.</Alert>

      {!validId ? <Card><p className="text-sm text-secondary">El identificador del viaje no es válido.</p></Card> : null}
      {validId && detail.isPending ? <Card aria-hidden="true"><div className="space-y-3"><div className="skeleton h-14" /><div className="skeleton h-14" /></div></Card> : null}
      {validId && detail.isError ? <ErrorState title="No se pudo cargar el viaje" description={tripActionErrorMessage(detail.error)} onRetry={() => void detail.refetch()} /> : null}
      {trip && validId ? (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold">{tripTitleLabel(trip)}</h2><TripStatusBadge estado={trip.estado} /></div>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-muted">Inicio</dt><dd className="text-secondary">{formatLocalDateTime(trip.inicio)}</dd></div>
            <div><dt className="text-muted">Fin</dt><dd className="text-secondary">{trip.fin ? formatLocalDateTime(trip.fin) : "En curso"}</dd></div>
            <div><dt className="text-muted">Duración</dt><dd className="text-secondary">{formatDuration(trip.inicio, trip.fin).label}</dd></div>
            <div><dt className="text-muted">Control</dt><dd className="text-secondary">{trip.controlClient || "No informado"}</dd></div>
            <div><dt className="text-muted">Dispositivo</dt><dd className="text-secondary">{trip.dispositivoId || "No informado"}</dd></div>
            <div><dt className="text-muted">Vehículo</dt><dd className="text-secondary">{trip.vehiclePublicId || "No asociado"}</dd></div>
            <div><dt className="text-muted">Fallback móvil</dt><dd className="text-secondary">{trip.mobileFallbackUsed ? "Sí" : "No"}</dd></div>
            <div><dt className="text-muted">Motivo fallback</dt><dd className="text-secondary">{trip.fallbackReason || "No aplica"}</dd></div>
          </dl>
          <div className="mt-5"><Link to={`/app/trips/${trip.id}/telemetry`} className={LINK_CLASSES}><Activity className="size-4" aria-hidden="true" /> Ver telemetría</Link></div>
        </Card>
      ) : null}
    </div>
  );
}
