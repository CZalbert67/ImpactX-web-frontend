/**
 * Claves de consulta de TanStack Query, centralizadas para evitar cadenas
 * sueltas en los hooks de datos.
 *
 * Convención de jerarquía: `["trips"]` es la raíz de todos los datos de
 * viajes, de modo que invalidar la raíz refresca listado, detalle, activo
 * y telemetría tras una mutación (start/pause/resume/finish).
 */
export const queryKeys = {
  profile: ["auth", "profile"] as const,
  plans: ["plans"] as const,
  dashboard: ["dashboard"] as const,

  trips: ["trips"] as const,
  tripsList: ["trips", "list"] as const,
  tripDetail: (tripId: string) => ["trips", "detail", tripId] as const,
  activeTrip: ["trips", "active"] as const,
  tripTelemetry: (tripId: string) =>
    ["trips", "telemetry", tripId] as const,

  tripsSummary: ["analytics", "trips", "summary"] as const,
} as const;