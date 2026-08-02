import type { components } from "@/api/generated/schema";

/**
 * Punto de telemetría con tipos generados por OpenAPI
 * (`TelemetryPointDto`): timestamp, lat, lng, velocidad, altitud y heading.
 */
export type TelemetryPoint = components["schemas"]["TelemetryPointDto"];

export interface TelemetryRow {
  timestamp: string;
  lat: number;
  lng: number;
  velocidad: number | null;
  altitud: number | null;
  heading: number | null;
}

/** Normaliza un valor numérico opaco (número o cadena) a number|null. */
function toFiniteOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * Deserializa puntos de telemetría. Los números pueden llegar como cadena
 * (schema `number|string`); se normalizan a `number|null`.
 */
export function parseTelemetryPoint(value: unknown): TelemetryRow | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.timestamp !== "string") return null;

  return {
    timestamp: record.timestamp,
    lat: toFiniteOrNull(record.lat) ?? 0,
    lng: toFiniteOrNull(record.lng) ?? 0,
    velocidad: toFiniteOrNull(record.velocidad),
    altitud: toFiniteOrNull(record.altitud),
    heading: toFiniteOrNull(record.heading),
  };
}