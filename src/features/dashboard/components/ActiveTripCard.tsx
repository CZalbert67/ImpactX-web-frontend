import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ActiveTrip } from "@/features/dashboard/types";

export interface ActiveTripCardProps {
  trip: ActiveTrip | null;
}

export function ActiveTripCard({ trip }: ActiveTripCardProps) {
  if (!trip) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-medium text-secondary">
          Viaje activo
        </h3>
        <EmptyState
          icon={MapPin}
          title="Sin viaje activo"
          description="Cuando inicies un viaje aparecerá aquí su progreso en tiempo real."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-secondary">Viaje activo</h3>
        <Badge tone="success">En curso</Badge>
      </div>
      <p className="text-lg font-semibold">Hacia {trip.destino}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted">Inicio</dt>
          <dd>{trip.inicioLocal}</dd>
        </div>
        <div>
          <dt className="text-muted">Transcurrido</dt>
          <dd>{trip.elapsedMinutes} min</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Distancia</dt>
          <dd>{trip.distanciaKm.toFixed(1)} km</dd>
        </div>
      </dl>
    </Card>
  );
}