import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { TripsSummary } from "@/features/trips/types";

export interface TripsSummaryCardProps {
  summary: TripsSummary | null;
}

function value(raw: number | null, suffix = ""): string {
  if (raw === null || !Number.isFinite(raw)) return "Información no disponible";
  const formatted = new Intl.NumberFormat("es-MX").format(raw);
  return `${formatted}${suffix}`;
}

/**
 * Resumen de viajes. Los números dependen del DTO del backend: cuando una
 * métrica no aporta un valor finito se muestra «Información no disponible»
 * (no se inventa ninguna cifra).
 */
export function TripsSummaryCard({ summary }: TripsSummaryCardProps) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="size-4 text-brand" aria-hidden="true" />
        <h3 className="text-sm font-medium text-secondary">Resumen de viajes</h3>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Total de viajes</dt>
          <dd className="font-semibold text-primary">
            {value(summary?.total ?? null)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Distancia total</dt>
          <dd className="font-semibold text-primary">
            {value(summary?.distanciaTotalKm ?? null, " km")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Duración promedio</dt>
          <dd className="font-semibold text-primary">
            {value(summary?.duracionPromedioMin ?? null, " min")}
          </dd>
        </div>
      </dl>
    </Card>
  );
}