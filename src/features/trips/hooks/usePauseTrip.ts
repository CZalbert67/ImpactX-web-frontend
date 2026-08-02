import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { tripsApi } from "@/features/trips/api/tripsApi";

/** Pausa un viaje. */
export function usePauseTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => tripsApi.pauseTrip(tripId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tripsSummary });
    },
  });
}