export interface Trip {
  id: string;
  estado: string;
  inicio: string;
  fin: string | null;
  dispositivoId: string | null;
  vehiclePublicId: string | null;
  controlClient: string | null;
  mobileFallbackUsed: boolean;
  fallbackReason: string | null;
  proposito: string | null;
  rutaOrigen: string | null;
  rutaDestino: string | null;
}

export type TripState = "activo" | "pausado" | "finalizado" | "desconocido";

const ACTIVE_STATES = new Set(["activo", "active", "en curso", "en_curso"]);
const PAUSED_STATES = new Set(["pausado", "paused", "suspendido", "suspended"]);
const FINISHED_STATES = new Set(["finalizado", "finalizada", "finished", "completed", "terminado", "cerrado"]);

function normalizeState(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function classifyTripState(estado: string | null | undefined): TripState {
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

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function parseTripFromTrip(value: unknown): Trip | null {
  if (!isPlainRecord(value) || typeof value.id !== "string" || value.id.trim() === "") {
    return null;
  }
  return {
    id: value.id,
    estado: typeof value.estado === "string" ? value.estado : "",
    inicio: typeof value.inicio === "string" ? value.inicio : "",
    fin: typeof value.fin === "string" ? value.fin : null,
    dispositivoId: optionalString(value.dispositivoId),
    vehiclePublicId: optionalString(value.vehiclePublicId),
    controlClient: optionalString(value.controlClient),
    mobileFallbackUsed: value.mobileFallbackUsed === true,
    fallbackReason: optionalString(value.fallbackReason),
    proposito: optionalString(value.proposito),
    rutaOrigen: optionalString(value.rutaOrigen),
    rutaDestino: optionalString(value.rutaDestino),
  };
}
