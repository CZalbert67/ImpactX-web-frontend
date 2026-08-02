import { CalendarDays, Gauge, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Vehicle } from "@/features/vehicles/types";

export interface VehicleCardProps {
  vehicle: Vehicle;
  actionBusy?: boolean;
  onEdit: () => void;
  onSetPrimary: () => void;
  onDelete: () => void;
}

export function VehicleCard({
  vehicle,
  actionBusy = false,
  onEdit,
  onSetPrimary,
  onDelete,
}: VehicleCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">
              {vehicle.marca} {vehicle.modelo}
            </h2>
            {vehicle.esPrincipal ? (
              <Badge tone="brand" icon={<Star className="size-3" aria-hidden="true" />}>
                Principal
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted">{vehicle.publicVehicleId}</p>
        </div>
        <Badge tone="neutral">{vehicle.tipoVehiculo}</Badge>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-panel-soft p-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted">
            <CalendarDays className="size-3.5" aria-hidden="true" /> Año
          </dt>
          <dd className="mt-1 font-semibold">{vehicle.ano}</dd>
        </div>
        <div className="rounded-lg bg-panel-soft p-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted">
            <Gauge className="size-3.5" aria-hidden="true" /> Velocidad prom.
          </dt>
          <dd className="mt-1 font-semibold">
            {new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(
              vehicle.velocidadPromedio,
            )} km/h
          </dd>
        </div>
        <div className="col-span-2 rounded-lg bg-panel-soft p-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="size-3.5" aria-hidden="true" /> Uso principal
          </dt>
          <dd className="mt-1 font-semibold">{vehicle.usoPrincipalVehiculo}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Pencil className="size-3.5" aria-hidden="true" />}
          onClick={onEdit}
          disabled={actionBusy}
        >
          Editar
        </Button>
        {!vehicle.esPrincipal ? (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Star className="size-3.5" aria-hidden="true" />}
            onClick={onSetPrimary}
            disabled={actionBusy}
          >
            Hacer principal
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<Trash2 className="size-3.5" aria-hidden="true" />}
          onClick={onDelete}
          disabled={actionBusy}
          className="text-error"
        >
          Eliminar
        </Button>
      </div>
    </Card>
  );
}
