/**
 * Intervalos de actualización automática para datos que pueden cambiar por
 * acciones de otra persona. No se consulta en segundo plano cuando la pestaña
 * está oculta para evitar tráfico innecesario.
 */
export const LIVE_QUERY_INTERVAL = {
  messages: 3_000,
  invitations: 5_000,
  relationships: 5_000,
  notifications: 8_000,
  trips: 5_000,
  activity: 10_000,
} as const;

export const liveQueryOptions = (interval: number) => ({
  refetchInterval: interval,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: "always" as const,
  refetchOnReconnect: "always" as const,
  staleTime: 0,
});
