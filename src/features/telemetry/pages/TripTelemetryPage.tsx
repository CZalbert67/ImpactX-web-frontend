import { Activity, Radar } from "lucide-react";
import { useParams } from "react-router";
import { Link } from "react-router";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TelemetryTable } from "@/features/telemetry/components/TelemetryTable";
import { TelemetryCharts } from "@/features/telemetry/components/TelemetryCharts";
import { useTripTelemetry } from "@/features/telemetry/hooks";
import { isValidTripGuid } from "@/features/trips/utils/guid";
import { tripActionErrorMessage } from "@/features/trips/utils/error-messages";

const GHOST_LINK_CLASSES =
  "inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary";

/**
 * Página de telemetría de un viaje. Solo se consume
 * `GET /api/v1/trips/{id}/telemetry`; la ingesta manual desde el navegador
 * no forma parte de esta rama.
 */
export function TripTelemetryPage() {
  const { tripId = "" } = useParams<{ tripId: string }>();
  const validId = isValidTripGuid(tripId);
  const telemetry = useTripTelemetry(tripId);

  const rows = telemetry.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-6">
      <Link to={`/app/trips/${tripId}`} className={GHOST_LINK_CLASSES}>
        ← Volver al viaje
      </Link>

      <PageHeader
        icon={Activity}
        title="Telemetría"
        description="Registro de velocidad, altitud y rumbo del viaje enviado por el dispositivo."
      />

      {!validId ? (
        <Card>
          <p className="text-sm text-secondary">
            El identificador del viaje no es válido. Revisa la URL e inténtalo
            de nuevo.
          </p>
          <div className="mt-4">
            <Link to="/app/trips" className={GHOST_LINK_CLASSES}>
              Ir a viajes
            </Link>
          </div>
        </Card>
      ) : null}

      {validId && telemetry.isPending ? (
        <Card aria-hidden="true">
          <div className="space-y-3">
            <div className="skeleton h-8 w-1/3" />
            <div className="skeleton h-64" />
          </div>
        </Card>
      ) : null}

      {validId && telemetry.isError ? (
        <ErrorState
          title="No se pudo cargar la telemetría"
          description={tripActionErrorMessage(telemetry.error)}
          onRetry={() => void telemetry.refetch()}
        />
      ) : null}

      {validId && !telemetry.isError && telemetry.isFetched && rows.length === 0 ? (
        <EmptyState
          icon={Radar}
          title="Sin telemetría"
          description="El viaje aún no cuenta con registros de telemetría."
        />
      ) : null}

      {rows.length > 0 ? (
        <>
          <section aria-label="Gráficas de la telemetría">
            <TelemetryCharts rows={rows} />
          </section>

          <section aria-label="Tabla de telemetría">
            <h2 className="mb-3 text-lg font-semibold">
              Registro detallado
            </h2>
            <TelemetryTable rows={rows} />
          </section>

          {telemetry.hasNextPage ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => void telemetry.fetchNextPage()}
                loading={telemetry.isFetchingNextPage}
              >
                Cargar más
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}