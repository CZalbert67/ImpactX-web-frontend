import type { components } from "@/api/generated/schema";

/** Body de `POST /api/v1/trips/start` — tipado real desde OpenAPI. */
export type StartTripRequest = components["schemas"]["StartTripRequest"];

/**
 * Viaje del dominio de ImpactX.
 *
 * NOTA DE CONTRATO: las respuestas 200 de `GET /api/v1/trips`,
 * `GET /api/v1/trips/active` y `POST /api/v1/trips/start` no declaran un
 * esquema de contenido en el OpenAPI actual. Por eso este modelo es la
 * representación defensiva del servicio, con nombres en español alineados a
 * los cuerpos documentados (`StartTripRequest`, `TelemetryPointDto`).
 *
 * Todos los campos opcionales toleran ausencias: ver `parseTripFromApi`.
 * Ninguna propiedad se muestra como número o métrica inventada.
 */
export interface Trip {
  id: string;
  /** Estado real devuelto por el backend (p. ej. "activo", "pausado", "finalizado"). */
  estado: string;
  /** Instante de inicio en ISO-8601 (UTC). Se conserva la cadena original. */
  inicio: string;
  /** Instante de fin en ISO-8601 (UTC); `null` si el viaje aún está en curso. */
  fin: string | null;
  dispositivoId: string | null;
  proposito: string | null;
  rutaOrigen: string | null;
  rutaDestino: string | null;
}

/** Clasificación derivada del estado real; nunca inventa estados. */
export type TripState = "activo" | "pausado" | "finalizado" | "desconocido";

const ACTIVE_STATES = new Set(["activo", "active", "en curso", "en_curso"]);
const PAUSED_STATES = new Set([
  "pausado",
  "paused",
  "suspendido",
  "suspended",
]);
const FINISHED_STATES = new Set([
  "finalizado",
  "finalizada",
  "finished",
  "completed",
  "terminado",
  "cerrado",
]);

function normalizeState(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** Clasifica el estado real del backend; si no se reconoce, `desconocido`. */
export function classifyTripState(
  estado: string | null | undefined,
): TripState {
  const normalized = normalizeState(estado);
  if (ACTIVE_STATES.has(normalized)) return "activo";
  if (PAUSED_STATES.has(normalized)) return "pausado";
  if (FINISHED_STATES.has(normalized)) return "finalizado";
  return "desconocido";
}

export function isTripActive(trip: Trip): boolean {
  return classifyTripState(trip.estado) === "activo";
}

export function isTripPaused(trip: Trip): boolean {
  return classifyTripState(trip.estado) === "pausado";
}

export function isTripFinished(trip: Trip): boolean {
  return classifyTripState(trip.estado) === "finalizado";
}

/** Acciones que el frontend ofrece; solo existen si tienen sentido real. */
export const canPauseTrip = isTripActive;
export const canResumeTrip = isTripPaused;
export const canFinishTrip = (trip: Trip): boolean =>
  !isTripFinished(trip) && classifyTripState(trip.estado) !== "desconocido";

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function optionalString(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value;
  return null;
}

/**
 * Deserializa un viaje de la API. Requiere `id`; los campos opcionales se
 * degradan a vacío/nulo sin romper la vista.
 */
export function parseTripFromTrip(value: unknown): Trip | null {
  if (!isPlainRecord(value)) return null;
  if (typeof value.id !== "string" || value.id.trim() === "") return null;

  const inicio =
    typeof value.inicio === "string" ? value.inicio : "";

  return {
    id: value.id,
    estado: typeof value.estado === "string" ? value.estado : "",
    inicio,
    fin: typeof value.fin === "string" ? value.fin : null,
    dispositivoId: optionalString(value.dispositivoId),
    proposito: optionalString(value.proposito),
    rutaOrigen: optionalString(value.rutaOrigen),
    rutaDestino: optionalString(value.rutaDestino),
  };
}