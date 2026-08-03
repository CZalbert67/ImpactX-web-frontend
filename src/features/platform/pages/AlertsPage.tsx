import { useState } from "react";
import { MapPin, ShieldAlert } from "lucide-react";
import { useSearchParams } from "react-router";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAlerts } from "@/features/platform/hooks";
import { DataValue, formatPlatformDate, MapLink, platformError } from "@/features/platform/pages/shared";

function tone(value: string): BadgeTone {
  const normalized = value.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("grave") || normalized.includes("severe")) return "error";
  if (normalized.includes("closed") || normalized.includes("cerr")) return "success";
  if (normalized.includes("pending") || normalized.includes("pend")) return "warning";
  return "info";
}

export function AlertsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useAlerts();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const requestedAlertId = searchParams.get("alertId");
  const activeAlertId = selectedAlertId ?? requestedAlertId;
  const selected = query.data?.find((item) => item.id === activeAlertId) ?? null;

  const closeDetail = () => {
    setSelectedAlertId(null);
    if (!requestedAlertId) return;
    const next = new URLSearchParams(searchParams);
    next.delete("alertId");
    setSearchParams(next, { replace: true });
  };
  return <div className="space-y-6">
    <PageHeader icon={ShieldAlert} title="Alertas" description="Consulta las alertas detectadas por ImpactX. Las acciones críticas permanecen en móvil y wearable." />
    {query.isPending ? <div className="skeleton h-72" aria-hidden="true" /> : null}
    {query.isError ? <ErrorState title="No se pudieron cargar las alertas" description={platformError(query.error)} onRetry={() => void query.refetch()} /> : null}
    {query.data?.length === 0 ? <EmptyState icon={ShieldAlert} title="Sin alertas" description="No hay alertas registradas para tu cuenta." /> : null}
    {query.data && query.data.length > 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.map((item) => <Card key={item.id}>
      <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.tipo || "Alerta"}</p><p className="mt-1 text-xs text-muted">{formatPlatformDate(item.creadoEn)}</p></div><Badge tone={tone(item.severidad)}>{item.severidad || item.estado}</Badge></div>
      <div className="mt-4 flex items-center gap-2 text-sm text-secondary"><MapPin className="size-4" aria-hidden="true" />{item.lugar || `${item.lat}, ${item.lng}`}</div>
      <div className="mt-4 flex items-center justify-between"><Badge tone={tone(item.estado)}>{item.estado}</Badge><Button size="sm" variant="outline" onClick={() => setSelectedAlertId(item.id)}>Ver detalle</Button></div>
    </Card>)}</div> : null}
    <Modal open={Boolean(selected)} onClose={closeDetail} title="Detalle de alerta" description="Información registrada por el backend de ImpactX.">
      {selected ? <div className="space-y-5"><dl className="grid gap-4 sm:grid-cols-2"><DataValue label="Tipo">{selected.tipo}</DataValue><DataValue label="Severidad">{selected.severidad}</DataValue><DataValue label="Estado">{selected.estado}</DataValue><DataValue label="Creada">{formatPlatformDate(selected.creadoEn)}</DataValue><DataValue label="Modo">{selected.modo}</DataValue><DataValue label="Canal">{selected.canal || "No informado"}</DataValue><DataValue label="Frecuencia cardiaca">{selected.frecuenciaCardiaca || "No informada"}</DataValue><DataValue label="Fuerza G">{selected.gForce || "No informada"}</DataValue><DataValue label="Decibeles">{selected.decibeles || "No informados"}</DataValue><DataValue label="Nota">{selected.nota || "Sin nota"}</DataValue></dl><MapLink lat={selected.lat} lng={selected.lng} /></div> : null}
    </Modal>
  </div>;
}
