import type { Trip } from "@/features/trips/types";

/** Identificador visual reducido; nunca se muestra el GUID completo titulado. */
export function shortTripId(id: string): string {
  return id.slice(0, 8);
}

/**
 * Título descriptivo del viaje con datos reales únicamente:
 * destino → propósito → identificador reducido.
 */
export function tripTitleLabel(trip: Trip): string {
  if (trip.rutaDestino) return `Hacia ${trip.rutaDestino}`;
  if (trip.proposito) return trip.proposito;
  return `Viaje ${shortTripId(trip.id)}`;
}