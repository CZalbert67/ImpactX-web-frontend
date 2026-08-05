import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { LIVE_QUERY_INTERVAL, liveQueryOptions } from "@/api/liveQuery";
import { tripsApi } from "@/features/trips/api/tripsApi";

/** Viaje activo del usuario; `null` cuando no hay ninguno. */
export function useActiveTrip() {
  return useQuery({
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.trips),
    queryKey: queryKeys.activeTrip,
    queryFn: ({ signal }) => tripsApi.getActiveTrip({ signal }),
  });
}