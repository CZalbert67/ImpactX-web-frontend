import { Route } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RecentTrip } from "@/features/dashboard/types";

export interface RecentTripsCardProps {
  trips: RecentTrip[];
}

export function RecentTripsCard({ trips }: RecentTripsCardProps) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-secondary">Viajes recientes</h3>
      {trips.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Sin viajes"
          description="Tus viajes recientes aparecerán aquí."
        />
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className="rounded-lg bg-panel-soft p-3">
              <p className="font-medium">
                {trip.origen} → {trip.destino}
              </p>
              <p className="mt-0.5 text-xs text-muted">{trip.fecha}</p>
              <p className="mt-1 text-xs text-secondary">
                {trip.distanciaKm.toFixed(1)} km · {trip.duracionMin} min
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}