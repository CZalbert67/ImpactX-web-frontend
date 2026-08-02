import { Link } from "react-router";
import type { Trip } from "@/features/trips/types";
import { TripStatusBadge } from "@/features/trips/components/TripStatusBadge";
import { TripActionControls } from "@/features/trips/components/TripActionControls";
import {
  formatLocalDateTime,
  formatDuration,
} from "@/features/trips/utils/format";
import { shortTripId, tripTitleLabel } from "@/features/trips/utils/display";

export interface TripListItemProps {
  trip: Trip;
}

/** Fila de un viaje en el listado paginado. */
export function TripListItem({ trip }: TripListItemProps) {
  const duration = formatDuration(trip.inicio, trip.fin);

  return (
    <li className="panel flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-primary">{tripTitleLabel(trip)}</p>
          <p className="mt-0.5 text-xs text-muted">
            {shortTripId(trip.id)}
          </p>
        </div>
        <TripStatusBadge estado={trip.estado} />
      </div>

      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
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
          <dd className="text-secondary">{duration.label}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TripActionControls trip={trip} />
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/app/trips/${trip.id}`}
            className="text-sm font-medium text-brand hover:underline"
          >
            Detalle
          </Link>
          <Link
            to={`/app/trips/${trip.id}/telemetry`}
            className="text-sm font-medium text-brand hover:underline"
          >
            Telemetría
          </Link>
        </div>
      </div>
    </li>
  );
}