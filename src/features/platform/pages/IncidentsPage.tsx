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
import { incidentsApi } from "@/features/platform/api";
import {
  useIncident,
  useIncidents,
  useMarkFalseAlarm,
  useUpdateIncidentNote,
} from "@/features/platform/hooks";
import {
  DataValue,
  formatPlatformDate,
  MapLink,
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

function IncidentDetailForm({
  incident,
  onClose,
  onNotice,
}: IncidentDetailFormProps) {
  const updateNote = useUpdateIncidentNote();
  const markFalse = useMarkFalseAlarm();
  const [note, setNote] = useState(incident.nota ?? "");

  return (
    <div className="space-y-5">
      <dl className="grid gap-4 sm:grid-cols-2">
        <DataValue label="Severidad">{incident.severidad}</DataValue>
        <DataValue label="Método de cierre">{incident.metodoCierre}</DataValue>
        <DataValue label="Fuerza G">{incident.gForce || "No informada"}</DataValue>
        <DataValue label="Frecuencia cardiaca">
          {incident.frecuenciaCardiaca || "No informada"}
        </DataValue>
        <DataValue label="Contactos notificados">
          {incident.contactosNotificados.length}
        </DataValue>
        <DataValue label="Cierre">{formatPlatformDate(incident.cerradaEn)}</DataValue>
      </dl>
      <MapLink lat={incident.lat} lng={incident.lng} />
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
      {updateNote.isError || markFalse.isError ? (
        <Alert tone="error">{platformError(updateNote.error || markFalse.error)}</Alert>
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
          disabled={incident.esFalsaAlarma}
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
      </div>
    </div>
  );
}

export function IncidentsPage() {
  const query = useIncidents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useIncident(selectedId);
  const [notice, setNotice] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const exportData = async (format: "csv" | "pdf") => {
    setExporting(true);
    setNotice(null);
    try {
      downloadBlob(
        await incidentsApi.exportFile(format),
        format === "csv" ? "incidentes.csv" : "incidentes.pdf",
      );
    } catch (error) {
      setNotice(platformError(error));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldAlert}
        title="Incidentes"
        description="Revisa incidentes cerrados, notas y ubicación."
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
            <Button
              variant="outline"
              loading={exporting}
              onClick={() => void exportData("pdf")}
            >
              PDF
            </Button>
          </div>
        }
      />
      {notice ? (
        <Alert tone={notice.includes("No se") ? "error" : "success"}>{notice}</Alert>
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
        <EmptyState
          icon={ShieldAlert}
          title="Sin incidentes"
          description="No hay incidentes registrados."
        />
      ) : null}
      {query.data && query.data.length > 0 ? (
        <div className="space-y-3">
          {query.data.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {item.lugar || "Incidente sin ubicación descriptiva"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {formatPlatformDate(item.creadoEn)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge tone={item.esFalsaAlarma ? "neutral" : "warning"}>
                    {item.esFalsaAlarma ? "Falsa alarma" : item.severidad}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedId(item.id)}
                  >
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
      <Modal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Detalle del incidente"
      >
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
