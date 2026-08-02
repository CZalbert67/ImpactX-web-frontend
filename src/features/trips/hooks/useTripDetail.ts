import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppApiError } from "@/api/errors";
import { queryKeys } from "@/api/queryKeys";
import { tripsApi } from "@/features/trips/api/tripsApi";
import type { Trip } from "@/features/trips/types";
import { findTripInListCache } from "@/features/trips/hooks/tripCache";
import { isValidTripGuid } from "@/features/trips/utils/guid";
import { MAX_PAGE_SIZE } from "@/features/trips/utils/pagination";

/**
 * Detalle de viaje.
 *
 * No existe `GET /api/v1/trips/{id}` en el OpenAPI real, por lo que el
 * viaje se obtiene por el mecanismo real disponible:
 *   1. desde la caché ya cargada del listado (`/api/v1/trips`);
 *   2. en su defecto, con una llamada legítima al listado (primera página).
 * Si aun así no aparece, se reporta como no disponible (404 lógico).
 *
 * Limitación documentada: si el viaje cae fuera de la primera página y aún
 * no se paginó hasta él, se mostrará como no encontrado.
 */
export function useTripDetail(tripId: string) {
  const queryClient = useQueryClient();
  const validId = isValidTripGuid(tripId);

  return useQuery({
    queryKey: queryKeys.tripDetail(tripId),
    enabled: validId,
    queryFn: async ({ signal }): Promise<Trip> => {
      const cached = findTripInListCache(queryClient, tripId);
      if (cached) return cached;

      const page = await tripsApi.getTrips({
        pageSize: MAX_PAGE_SIZE,
        signal,
      });
      const trip = page.items.find((item) => item.id === tripId);
      if (trip) return trip;

      throw new AppApiError({
        status: 404,
        message: "El viaje no está disponible en este momento.",
        title: "Viaje no encontrado",
      });
    },
  });
}