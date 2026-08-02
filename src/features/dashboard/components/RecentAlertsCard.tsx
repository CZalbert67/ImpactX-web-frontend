import { TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RecentAlert } from "@/features/dashboard/types";

const LEVEL_TONE: Record<RecentAlert["nivel"], BadgeTone> = {
  bajo: "info",
  medio: "warning",
  alto: "error",
  crítico: "error",
};

export interface RecentAlertsCardProps {
  alerts: RecentAlert[];
}

export function RecentAlertsCard({ alerts }: RecentAlertsCardProps) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-secondary">Alertas recientes</h3>
      {alerts.length === 0 ? (
        <EmptyState
          icon={TriangleAlert}
          title="Sin alertas"
          description="Las alertas detectadas aparecerán aquí."
        />
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="rounded-lg bg-panel-soft p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{alert.tipo}</p>
                <Badge tone={LEVEL_TONE[alert.nivel]}>{alert.nivel}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{alert.descripcion}</p>
              <p className="mt-1 text-xs text-muted">{alert.fecha}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}