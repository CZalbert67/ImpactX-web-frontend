import type { TelemetryRow } from "@/features/telemetry/types";
import { formatLocalTime } from "@/features/trips/utils/format";

export interface TelemetryTableProps {
  rows: readonly TelemetryRow[];
}

function coordinate(value: number | null): string {
  return value === null ? "—" : value.toFixed(5);
}

/** Tabla responsiva de telemetría: fuente accesible principal de la página. */
export function TelemetryTable({ rows }: TelemetryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line bg-panel-soft text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="px-4 py-3 font-medium">
              Hora local
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Latitud
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Longitud
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Velocidad (km/h)
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Altitud (m)
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Heading (°)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={`${row.timestamp}-${index}`} className="text-secondary">
              <td className="px-4 py-2.5 whitespace-nowrap">
                {formatLocalTime(row.timestamp)}
              </td>
              <td className="px-4 py-2.5 font-mono">{coordinate(row.lat)}</td>
              <td className="px-4 py-2.5 font-mono">{coordinate(row.lng)}</td>
              <td className="px-4 py-2.5 text-right">
                {row.velocidad !== null ? row.velocidad.toFixed(1) : "—"}
              </td>
              <td className="px-4 py-2.5 text-right">
                {row.altitud !== null ? row.altitud.toFixed(1) : "—"}
              </td>
              <td className="px-4 py-2.5 text-right">
                {row.heading !== null ? row.heading.toFixed(1) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}