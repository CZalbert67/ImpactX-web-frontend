import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { tripsApi } from "@/features/trips/api/tripsApi";

/** Viaje activo del usuario; `null` cuando no hay ninguno. */
export function useActiveTrip() {
  return useQuery({
    queryKey: queryKeys.activeTrip,
    queryFn: ({ signal }) => tripsApi.getActiveTrip({ signal }),
  });
}