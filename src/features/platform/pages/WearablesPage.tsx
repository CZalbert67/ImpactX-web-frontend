import { Activity, Battery, Watch } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useWearableDiagnostics, useWearables } from "@/features/platform/hooks";
import { formatPlatformDate, platformError } from "@/features/platform/pages/shared";

export function WearablesPage() {
  const wearables = useWearables(); const diagnostics = useWearableDiagnostics();
  return <div className="space-y-6"><PageHeader icon={Watch} title="Wearables" description="Estado de los wearables vinculados. La vinculación, calibración y sincronización se realizan desde móvil o reloj." /><Alert tone="info">El panel web es de consulta. No vincula, desvincula, calibra ni envía telemetría.</Alert>
    {wearables.isPending ? <div className="skeleton h-56" /> : null}{wearables.isError ? <ErrorState title="No se pudieron cargar los wearables" description={platformError(wearables.error)} onRetry={() => void wearables.refetch()} /> : null}{wearables.data?.length === 0 ? <EmptyState icon={Watch} title="Sin wearables" description="Vincula un reloj desde la aplicación móvil." /> : null}
    {wearables.data && wearables.data.length > 0 ? <div className="grid gap-4 md:grid-cols-2">{wearables.data.map((item) => <Card key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.nombre}</p><p className="text-sm text-muted">{item.modelo} · {item.dispositivoId}</p></div><Badge tone={item.connected ? "success" : "neutral"}>{item.connected ? "Conectado" : item.estado}</Badge></div><div className="mt-4 flex items-center gap-2 text-sm text-secondary"><Battery className="size-4" />{item.nivelBateria}%</div><p className="mt-2 text-xs text-muted">Última sincronización: {formatPlatformDate(item.ultimaSincronizacion)}</p><p className="mt-1 text-xs text-muted">Calibrado: {item.calibrado ? "Sí" : "No"}</p></Card>)}</div> : null}
    <section><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Activity className="size-5" />Diagnóstico de sensores</h2>{diagnostics.isPending ? <div className="skeleton h-32" /> : null}{diagnostics.isError ? <Alert tone="warning">{platformError(diagnostics.error)}</Alert> : null}{diagnostics.data ? <Card><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{(["acelerometro", "giroscopio", "magnetometro", "gps", "frecuenciaCardiaca"] as const).map((key) => <div key={key}><p className="text-xs capitalize text-muted">{key}</p><Badge tone={diagnostics.data?.[key] ? "success" : "error"}>{diagnostics.data?.[key] ? "Disponible" : "No disponible"}</Badge></div>)}</div><p className="mt-4 text-xs text-muted">Diagnóstico: {formatPlatformDate(diagnostics.data.ultimoDiagnostico)}</p></Card> : null}</section>
  </div>;
}
