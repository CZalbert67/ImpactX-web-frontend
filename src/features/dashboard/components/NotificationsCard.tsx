import { Bell } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NotificationSummary } from "@/features/dashboard/types";

export interface NotificationsCardProps {
  summary: NotificationSummary;
}

export function NotificationsCard({ summary }: NotificationsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-secondary">
            Notificaciones
          </h3>
          <p className="mt-1 text-sm text-muted">{summary.resumen}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-panel-soft">
          <Bell className="size-5 text-info" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3">
        <Badge tone={summary.noLeidas > 0 ? "warning" : "neutral"}>
          {summary.noLeidas} sin leer
        </Badge>
      </div>
    </Card>
  );
}