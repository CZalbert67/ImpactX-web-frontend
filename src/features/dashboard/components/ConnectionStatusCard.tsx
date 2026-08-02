import { Wifi, WifiOff, LoaderCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Connectivity } from "@/features/dashboard/hooks/useDashboard";

export interface ConnectionStatusCardProps {
  connectivity: Connectivity;
}

/** Estado de conectividad con la API (derivado de las consultas reales). */
export function ConnectionStatusCard({ connectivity }: ConnectionStatusCardProps) {
  if (connectivity === "loading") {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-secondary">API</h3>
          <Badge tone="neutral" icon={<LoaderCircle className="size-3 spin" aria-hidden="true" />}>
            Comprobando…
          </Badge>
        </div>
      </Card>
    );
  }

  const online = connectivity === "online";
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-secondary">
          Estado de conexión
        </h3>
        <Badge
          tone={online ? "success" : "error"}
          icon={
            online ? (
              <Wifi className="size-3" aria-hidden="true" />
            ) : (
              <WifiOff className="size-3" aria-hidden="true" />
            )
          }
        >
          {online ? "Conectado" : "API no disponible"}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted" role="status" aria-live="polite">
        {online
          ? "La plataforma ImpactX está en línea."
          : "No se detecta respuesta de la API. Verifica tu conexión."}
      </p>
    </Card>
  );
}