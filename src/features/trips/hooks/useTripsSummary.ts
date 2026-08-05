import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { LIVE_QUERY_INTERVAL, liveQueryOptions } from "@/api/liveQuery";
import { tripsApi } from "@/features/trips/api/tripsApi";

/** Resumen de viajes para métricas de cabecera (endpoint real de analytics). */
export function useTripsSummary() {
  return useQuery({
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.trips),
    queryKey: queryKeys.tripsSummary,
    queryFn: ({ signal }) => tripsApi.getTripsSummary({ signal }),
  });
}