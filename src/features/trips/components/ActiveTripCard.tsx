import { Link } from "react-router";
import { Eye, Route } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TripStatusBadge } from "@/features/trips/components/TripStatusBadge";
import type { Trip } from "@/features/trips/types";
import { formatLocalDateTime } from "@/features/trips/utils/format";
import { tripTitleLabel } from "@/features/trips/utils/display";

export interface ActiveTripCardProps {
  trip: Trip | null;
}

export function ActiveTripCard({ trip }: ActiveTripCardProps) {
  if (!trip) {
    return (
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-secondary">Viaje activo</h3>
          <Badge tone="neutral">Solo lectura web</Badge>
        </div>
        <EmptyState
          icon={Route}
          title="Sin viaje activo"
          description="Los viajes se inician desde el Galaxy Watch 8."
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
        <div><dt className="text-muted">Inicio</dt><dd>{formatLocalDateTime(trip.inicio)}</dd></div>
        <div><dt className="text-muted">Control</dt><dd>{trip.controlClient ?? "Cliente no informado"}</dd></div>
        {trip.rutaOrigen ? <div><dt className="text-muted">Origen</dt><dd>{trip.rutaOrigen}</dd></div> : null}
        {trip.vehiclePublicId ? <div><dt className="text-muted">Vehículo</dt><dd>{trip.vehiclePublicId}</dd></div> : null}
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link to={`/app/trips/${trip.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
          <Eye className="size-4" aria-hidden="true" /> Ver detalle
        </Link>
        <Link to={`/app/trips/${trip.id}/telemetry`} className="text-sm font-medium text-brand hover:underline">Ver telemetría</Link>
        <Badge tone="neutral">La web no controla viajes</Badge>
      </div>
    </Card>
  );
}
