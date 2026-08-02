import { Link } from "react-router";
import { Route } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TripStatusBadge } from "@/features/trips/components/TripStatusBadge";
import { TripActionControls } from "@/features/trips/components/TripActionControls";
import type { Trip } from "@/features/trips/types";
import {
  formatLocalDateTime,
} from "@/features/trips/utils/format";
import { tripTitleLabel } from "@/features/trips/utils/display";

export interface ActiveTripCardProps {
  trip: Trip | null;
}

/**
 * Viaje activo destacado. No se muestra duración mientras el viaje está en
 * curso porque carece de `fin` (nunca se inventa).
 */
export function ActiveTripCard({ trip }: ActiveTripCardProps) {
  if (!trip) {
    return (
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-secondary">Viaje activo</h3>
        </div>
        <EmptyState
          icon={Route}
          title="Sin viaje activo"
          description="Cuando inicies un viaje aparecerá aquí su estado en tiempo real."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-secondary">Viaje activo</h3>
        <TripStatusBadge estado={trip.estado} />
      </div>

      <p className="text-lg font-semibold">{tripTitleLabel(trip)}</p>

      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Inicio</dt>
          <dd>{formatLocalDateTime(trip.inicio)}</dd>
        </div>
        {trip.rutaOrigen ? (
          <div>
            <dt className="text-muted">Origen</dt>
            <dd>{trip.rutaOrigen}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <TripActionControls trip={trip} />
        <Link
          to={`/app/trips/${trip.id}`}
          className="text-sm font-medium text-brand hover:underline"
        >
          Ver detalle
        </Link>
        <Link
          to={`/app/trips/${trip.id}/telemetry`}
          className="text-sm font-medium text-brand hover:underline"
        >
          Ver telemetría
        </Link>
      </div>
    </Card>
  );
}