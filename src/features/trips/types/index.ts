import type { components } from "@/api/generated/schema";

export type { Trip, TripState } from "@/features/trips/types/trip";
export {
  classifyTripState,
  parseTripFromTrip,
  canPauseTrip,
  canResumeTrip,
  canFinishTrip,
  isTripActive,
  isTripPaused,
  isTripFinished,
} from "@/features/trips/types/trip";

/** Resultado de `GET /api/v1/analytics/trips/summary` (compilado defensivo). */
export interface TripsSummary {
  /** Total de viajes registrados para el usuario autenticado. */
  total: number | null;
  /** Distancia acumulada en kilómetros. */
  distanciaTotalKm: number | null;
  /** Duración promedia en minutos. */
  duracionPromedioMin: number | null;
}

export type TelemetryPoint = components["schemas"]["TelemetryPointDto"];