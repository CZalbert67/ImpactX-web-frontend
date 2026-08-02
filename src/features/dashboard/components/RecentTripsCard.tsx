import { Route } from "lucide-react";
import { Link } from "react-router";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatLocalDateTime,
  formatDuration,
} from "@/features/trips/utils/format";
import { shortTripId, tripTitleLabel } from "@/features/trips/utils/display";
import { tripStateLabel } from "@/features/trips/utils/state-labels";
import type { Trip } from "@/features/trips/types";

export interface RecentTripsCardProps {
  trips: Trip[];
}

/** Últimos viajes con la duración calculada solo con fechas reales. */
export function RecentTripsCard({ trips }: RecentTripsCardProps) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-secondary">Viajes recientes</h3>
      {trips.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Sin viajes"
          description="Cuando registres viajes aparecerán aquí."
        />
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className="rounded-lg bg-panel-soft p-3">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/app/trips/${trip.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {tripTitleLabel(trip)}
                </Link>
                <span className="text-xs text-muted">{shortTripId(trip.id)}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {tripStateLabel(trip.estado)} ·{" "}
                {formatLocalDateTime(trip.inicio)}
              </p>
              <p className="mt-0.5 text-xs text-secondary">
                {formatDuration(trip.inicio, trip.fin).label}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}