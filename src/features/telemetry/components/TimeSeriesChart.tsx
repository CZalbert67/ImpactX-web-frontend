import { useId } from "react";
import type { TelemetryRow } from "@/features/telemetry/types";
import { sampleSeries, MAX_CHART_POINTS } from "@/features/telemetry/utils/sample";

export interface SeriesDatum {
  time: number;
  value: number;
}

export interface TimeSeriesChartProps {
  title: string;
  unit: string;
  color: string;
  data: SeriesDatum[];
  height?: number;
}

/**
 * Gráfica de líneas ligera en SVG, sin dependencias ni mapas. Los colores
 * usan tokens CSS de los tres temas. La tabla de telemetría permanece como
 * la fuente accesible principal; la gráfica añade contexto visual.
 */
export function TimeSeriesChart({
  title,
  unit,
  color,
  data,
  height = 160,
}: TimeSeriesChartProps) {
  const labelId = useId();
  const points = sampleSeries(data, MAX_CHART_POINTS);

  if (points.length < 2) {
    return (
      <p className="text-sm text-muted">
        {title}: se necesitan al menos dos puntos para graficar.
      </p>
    );
  }

  const width = 600;
  const minTime = points[0]?.time ?? 0;
  const maxTime = points[points.length - 1]?.time ?? minTime + 1;
  const timeSpan = maxTime - minTime || 1;
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueSpan = maxValue - minValue || 1;

  const padX = 8;
  const padY = 8;

  const toX = (time: number): number =>
    padX + ((time - minTime) / timeSpan) * (width - padX * 2);
  const toY = (value: number): number =>
    padY + (1 - (value - minValue) / valueSpan) * (height - padY * 2);

  const path = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${toX(point.time).toFixed(1)} ${toY(point.value).toFixed(1)}`;
    })
    .join(" ");

  const description = `${title} (${unit}). Graficando ${points.length} de ${data.length} puntos.`;

  return (
    <div className="w-full">
      <p className="mb-1 text-sm font-medium text-secondary">{title}</p>
      <div className="overflow-hidden rounded-lg border border-line bg-panel-soft">
        <svg
          role="img"
          aria-labelledby={labelId}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-auto w-full"
        >
          <title id={labelId}>{description}</title>
          <polyline
            points={path}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="mt-1 text-xs text-muted">{description}</p>
    </div>
  );
}

function toSeries(
  rows: readonly TelemetryRow[],
  select: (row: TelemetryRow) => number | null,
): SeriesDatum[] {
  return rows.flatMap((row) => {
    const value = select(row);
    const time = Date.parse(row.timestamp);
    if (value === null || !Number.isFinite(time)) return [];
    return [{ time, value }];
  });
}

export function velocitySeries(rows: readonly TelemetryRow[]): SeriesDatum[] {
  return toSeries(rows, (row) => row.velocidad);
}

export function altitudeSeries(rows: readonly TelemetryRow[]): SeriesDatum[] {
  return toSeries(rows, (row) => row.altitud);
}