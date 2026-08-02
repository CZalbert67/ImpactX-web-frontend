/**
 * Formato de fechas y duraciones.
 *
 * Se conservan las cadenas ISO-8601 en UTC que entrega el backend; solo al
 * mostrar se convierten a la zona horaria local del navegador
 * (`toLocaleString`), nunca al revés.
 */

const NO_DATE = "—";

function parseIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Fecha + hora local abreviada (sin segundos). */
export function formatLocalDateTime(value: string | null | undefined): string {
  const date = parseIso(value);
  if (!date) return NO_DATE;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Hora local corta (HH:MM). */
export function formatLocalTime(value: string | null | undefined): string {
  const date = parseIso(value);
  if (!date) return NO_DATE;
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Duración en minutos entre dos instantes ISO. Devuelve `null` si falta el
 * fin (viaje en curso) o si las fechas no son válidas: nunca se inventa una
 * duración sin fechas reales.
 */
export function durationMinutesBetween(
  inicio: string | null | undefined,
  fin: string | null | undefined,
): number | null {
  if (!inicio || !fin) return null;
  const start = parseIso(inicio);
  const end = parseIso(fin);
  if (!start || !end) return null;
  const deltaMs = end.getTime() - start.getTime();
  if (deltaMs < 0) return null;
  return Math.round(deltaMs / 60_000);
}

export interface DurationLabel {
  minutes: number | null;
  label: string;
}

/** Etiqueta legible de duración ("13 min", "1 h 05 min") o "—". */
export function formatDuration(
  inicio: string | null | undefined,
  fin: string | null | undefined,
): DurationLabel {
  const minutes = durationMinutesBetween(inicio, fin);
  if (minutes === null) return { minutes: null, label: NO_DATE };

  if (minutes < 60) {
    return { minutes, label: `${minutes} min` };
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return {
    minutes,
    label: rest === 0 ? `${hours} h` : `${hours} h ${rest.toString().padStart(2, "0")} min`,
  };
}