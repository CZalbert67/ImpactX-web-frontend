import type { TelemetryRow } from "@/features/telemetry/types";

export interface SeriesDatum {
  time: number;
  value: number;
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