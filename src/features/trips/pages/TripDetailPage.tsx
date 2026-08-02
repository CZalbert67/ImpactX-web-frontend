import { useParams } from "react-router";
import { Activity, ArrowLeft, Route } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import { TripStatusBadge } from "@/features/trips/components/TripStatusBadge";
import { TripActionControls } from "@/features/trips/components/TripActionControls";
import { useTripDetail } from "@/features/trips/hooks";
import { isValidTripGuid } from "@/features/trips/utils/guid";
import {
  formatLocalDateTime,
  formatDuration,
} from "@/features/trips/utils/format";
import { shortTripId, tripTitleLabel } from "@/features/trips/utils/display";
import { tripStateLabel } from "@/features/trips/utils/state-labels";
import { tripActionErrorMessage } from "@/features/trips/utils/error-messages";

const GHOST_LINK_CLASSES =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-transparent px-3 text-sm font-semibold text-primary transition-colors hover:bg-panel-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";

/**
 * Detalle de viaje. No existe endpoint de detalle en el contrato real, por
 * lo que el viaje se obtiene desde la caché del listado o, si falta, de una
 * relectura real del listado (ver `useTripDetail`).
 */
export function TripDetailPage() {
  const { tripId = "" } = useParams<{ tripId: string }>();
  const validId = isValidTripGuid(tripId);
  const detail = useTripDetail(tripId);

  const trip = detail.data ?? null;

  return (
    <div className="space-y-6">
      <Link
        to="/app/trips"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a viajes
      </Link>

      <PageHeader
        icon={Route}
        title={trip ? tripTitleLabel(trip) : "Detalle del viaje"}
        description={
          trip
            ? `Viaje ${shortTripId(trip.id)} · ${tripStateLabel(trip.estado)}`
            : "Información del viaje seleccionado."
        }
      />

      {!validId ? (
        <Card>
          <p className="text-sm text-secondary">
            El identificador del viaje no es válido. Revisa la URL e inténtalo
            de nuevo.
          </p>
          <div className="mt-4">
            <Link to="/app/trips" className={GHOST_LINK_CLASSES}>
              Ir a viajes
            </Link>
          </div>
        </Card>
      ) : null}

      {validId && detail.isPending ? (
        <Card aria-hidden="true">
          <div className="space-y-3">
            <div className="skeleton h-14" />
            <div className="skeleton h-14" />
          </div>
        </Card>
      ) : null}

      {validId && detail.isError ? (
        <ErrorState
          title="No se pudo cargar el viaje"
          description={tripActionErrorMessage(detail.error)}
          onRetry={() => void detail.refetch()}
        />
      ) : null}

      {trip && validId ? (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold">{tripTitleLabel(trip)}</h2>
            <TripStatusBadge estado={trip.estado} />
          </div>

          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted">Inicio</dt>
              <dd className="text-secondary">
                {formatLocalDateTime(trip.inicio)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Fin</dt>
              <dd className="text-secondary">
                {trip.fin ? formatLocalDateTime(trip.fin) : "En curso"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Duración</dt>
              <dd className="text-secondary">
                {formatDuration(trip.inicio, trip.fin).label}
              </dd>
            </div>
            {trip.dispositivoId ? (
              <div>
                <dt className="text-muted">Dispositivo</dt>
                <dd className="text-secondary">{trip.dispositivoId}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <TripActionControls trip={trip} />
            <Link
              to={`/app/trips/${trip.id}/telemetry`}
              className={GHOST_LINK_CLASSES}
            >
              <Activity className="size-4" aria-hidden="true" />
              Ver telemetría
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}