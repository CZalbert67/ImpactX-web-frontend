import { TimeSeriesChart } from "@/features/telemetry/components/TimeSeriesChart";
import {
  velocitySeries,
  altitudeSeries,
} from "@/features/telemetry/utils/series";
import type { TelemetryRow } from "@/features/telemetry/types";

export interface TelemetryChartsProps {
  rows: readonly TelemetryRow[];
}

/**
 * Gráficas simples de telemetría: velocidad y altitud contra el tiempo.
 * Nunca se grafican lat/long como dos líneas sin contexto.
 */
export function TelemetryCharts({ rows }: TelemetryChartsProps) {
  const velocity = velocitySeries(rows);
  const altitude = altitudeSeries(rows);
  const showAltitude = rows.some((row) => row.altitud !== null);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TimeSeriesChart
        title="Velocidad contra el tiempo"
        unit="km/h"
        color="var(--color-primary)"
        data={velocity}
      />
      {showAltitude ? (
        <TimeSeriesChart
          title="Altitud contra el tiempo"
          unit="m"
          color="var(--color-accent-purple)"
          data={altitude}
        />
      ) : null}
    </div>
  );
}