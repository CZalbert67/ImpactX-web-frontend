import { Watch } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { WearableSummary } from "@/features/dashboard/types";

export interface WearableCardProps {
  wearable: WearableSummary;
}

export function WearableCard({ wearable }: WearableCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-secondary">Wearable</h3>
          <p className="mt-1 font-semibold">{wearable.modelo}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-panel-soft">
          <Watch className="size-5 text-brand" aria-hidden="true" />
        </div>
      </div>

<div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">Batería</span>
        <span className="font-medium">{wearable.bateriaPorcentaje}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-panel-soft">
        <div
          className="h-full rounded-full bg-[var(--color-primary)]"
          style={{ width: `${wearable.bateriaPorcentaje}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">
          Última sincronización: {wearable.ultimaSincronizacion}
        </span>
      </div>
      <div className="mt-2">
        <Badge tone={wearable.conectado ? "success" : "warning"}>
          {wearable.conectado ? "Conectado" : "Sin conexión"}
        </Badge>
      </div>
    </Card>
  );
}