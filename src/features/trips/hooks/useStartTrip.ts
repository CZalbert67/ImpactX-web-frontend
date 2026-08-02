import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { tripsApi } from "@/features/trips/api/tripsApi";
import type { StartTripRequest } from "@/features/trips/types";

export interface StartTripVariables {
  body: StartTripRequest;
}

/** Inicia un viaje; invalida listado, detalle y viaje activo. */
export function useStartTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ body }: StartTripVariables) =>
      tripsApi.startTrip({ body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tripsSummary });
    },
  });
}