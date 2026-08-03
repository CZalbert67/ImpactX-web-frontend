import { useState } from "react";
import { Download, MapPin, ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { incidentsApi } from "@/features/platform/api";
import {
  useActiveIncidents,
  useCloseIncident,
  useIncident,
  useIncidentMap,
  useIncidents,
  useMarkFalseAlarm,
  useUpdateIncidentNote,
} from "@/features/platform/hooks";
import {
  DataValue,
  formatPlatformDate,
  platformError,
} from "@/features/platform/pages/shared";
import type { IncidentDetail } from "@/features/platform/types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

interface IncidentDetailFormProps {
  incident: IncidentDetail;
  onClose: () => void;
  onNotice: (message: string) => void;
}

function IncidentDetailForm({ incident, onClose, onNotice }: IncidentDetailFormProps) {
  const updateNote = useUpdateIncidentNote();
  const markFalse = useMarkFalseAlarm();
  const closeIncident = useCloseIncident();
  const [note, setNote] = useState(incident.nota ?? "");
  const [closeMethod, setCloseMethod] = useState("Atendido");
  const [mapEnabled, setMapEnabled] = useState(false);
  const map = useIncidentMap(incident.id, mapEnabled);
  const active = ["Pendiente", "Enviada", "Activa"].includes(incident.estado);

  return (
    <div className="space-y-5">
      <dl className="grid gap-4 sm:grid-cols-2">
        <DataValue label="Tipo">{incident.tipo || "No informado"}</DataValue>
        <DataValue label="Estado">{incident.estado}</DataValue>
        <DataValue label="Severidad">{incident.severidad}</DataValue>
        <DataValue label="Método de cierre">{incident.metodoCierre || "Pendiente"}</DataValue>
        <DataValue label="Fuerza G">{incident.gForce || "No informada"}</DataValue>
        <DataValue label="Frecuencia cardiaca">
          {incident.frecuenciaCardiaca || "No informada"}
        </DataValue>
        <DataValue label="Regla de detección">{incident.ruleVersion || "No disponible"}</DataValue>
        <DataValue label="Puntaje de detección">
          {incident.detectionScore ?? "No disponible"}
        </DataValue>
        <DataValue label="Contactos notificados">
          {incident.contactosNotificados.length}
        </DataValue>
        <DataValue label="Cierre">{formatPlatformDate(incident.cerradaEn)}</DataValue>
      </dl>

      <div className="rounded-xl border border-line bg-panel-soft p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Ubicación en mapa</p>
            <p className="mt-1 text-xs text-muted">
              La visualización está sujeta a los beneficios del plan efectivo.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            loading={map.isFetching}
            onClick={() => setMapEnabled(true)}
          >
            Consultar mapa
          </Button>
        </div>
        {map.isError ? (
          <Alert className="mt-3" tone="warning">
            {platformError(map.error)}
          </Alert>
        ) : null}
        {map.data ? (
          <a
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            href={map.data.mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin className="size-4" aria-hidden="true" />
            Abrir ubicación autorizada
          </a>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="incident-note">
          Nota
        </label>
        <Input
          id="incident-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
        />
      </div>

      {active ? (
        <div className="rounded-xl border border-line bg-panel-soft p-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="incident-close-method">
            Método de cierre
          </label>
          <Select
            id="incident-close-method"
            value={closeMethod}
            onChange={(event) => setCloseMethod(event.target.value)}
            options={[
              { value: "Atendido", label: "Atendido" },
              { value: "Resuelto", label: "Resuelto" },
              { value: "FalsaAlarma", label: "Falsa alarma" },
            ]}
          />
        </div>
      ) : null}

      {updateNote.isError || markFalse.isError || closeIncident.isError ? (
        <Alert tone="error">
          {platformError(updateNote.error || markFalse.error || closeIncident.error)}
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          loading={updateNote.isPending}
          onClick={() =>
            updateNote.mutate(
              { id: incident.id, nota: note },
              { onSuccess: () => onNotice("Nota actualizada correctamente.") },
            )
          }
        >
          Guardar nota
        </Button>
        <Button
          variant="outline"
          disabled={incident.esFalsaAlarma || !active}
          loading={markFalse.isPending}
          onClick={() =>
            markFalse.mutate(
              { id: incident.id, nota: note },
              {
                onSuccess: () => {
                  onNotice("Incidente marcado como falsa alarma.");
                  onClose();
                },
              },
            )
          }
        >
          Marcar falsa alarma
        </Button>
        {active ? (
          <Button
            variant="secondary"
            loading={closeIncident.isPending}
            onClick={() =>
              closeIncident.mutate(
                { id: incident.id, metodoCierre: closeMethod, nota: note },
                {
                  onSuccess: (response) => {
                    onNotice(response.mensaje || "Incidente cerrado correctamente.");
                    onClose();
                  },
                },
              )
            }
          >
            Cerrar incidente
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function IncidentsPage() {
  const query = useIncidents();
  const activeQuery = useActiveIncidents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useIncident(selectedId);
  const [notice, setNotice] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const exportData = async (format: "csv" | "txt") => {
    setExporting(true);
    setNotice(null);
    setPageError(null);
    try {
      downloadBlob(
        await incidentsApi.exportFile(format),
        format === "csv" ? "incidentes.csv" : "incidentes.txt",
      );
    } catch (error) {
      setPageError(platformError(error));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldAlert}
        title="Incidentes"
        description="Consulta, documenta y cierra incidentes detectados por ImpactX."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              loading={exporting}
              leftIcon={<Download className="size-4" />}
              onClick={() => void exportData("csv")}
            >
              CSV
            </Button>
            <Button variant="outline" loading={exporting} onClick={() => void exportData("txt")}>
              TXT
            </Button>
          </div>
        }
      />

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {pageError ? <Alert tone="error">{pageError}</Alert> : null}

      {activeQuery.data && activeQuery.data.length > 0 ? (
        <Alert tone="warning" title="Incidentes activos">
          Hay {activeQuery.data.length} incidente(s) pendiente(s), enviado(s) o activo(s).
        </Alert>
      ) : null}

      {query.isPending ? <div className="skeleton h-72" /> : null}
      {query.isError ? (
        <ErrorState
          title="No se pudieron cargar los incidentes"
          description={platformError(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data?.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="Sin incidentes" description="No hay incidentes registrados." />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="space-y-3">
          {query.data.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.lugar || "Incidente sin ubicación descriptiva"}</p>
                  <p className="mt-1 text-xs text-muted">{formatPlatformDate(item.creadoEn)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={item.esFalsaAlarma ? "neutral" : item.estado === "Cerrada" ? "success" : "warning"}>
                    {item.esFalsaAlarma ? "Falsa alarma" : item.estado}
                  </Badge>
                  <Badge tone="neutral">{item.severidad}</Badge>
                  <Button size="sm" variant="outline" onClick={() => setSelectedId(item.id)}>
                    Detalle
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-secondary">
                <MapPin className="size-4" />
                {item.lat}, {item.lng}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <Modal open={Boolean(selectedId)} onClose={() => setSelectedId(null)} title="Detalle del incidente">
        {detail.isPending ? <div className="skeleton h-56" /> : null}
        {detail.isError ? (
          <ErrorState
            title="No se pudo cargar"
            description={platformError(detail.error)}
            onRetry={() => void detail.refetch()}
          />
        ) : null}
        {detail.data ? (
          <IncidentDetailForm
            incident={detail.data}
            onClose={() => setSelectedId(null)}
            onNotice={setNotice}
          />
        ) : null}
      </Modal>
    </div>
  );
}
