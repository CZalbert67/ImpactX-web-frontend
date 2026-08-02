import type { QueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import type { Trip } from "@/features/trips/types";
import type { PaginatedResult } from "@/features/trips/utils/pagination";

/** Lee todos los viajes que hay en caché del listado real (no una API). */
export function readTripsFromListCache(queryClient: QueryClient): Trip[] {
  const data = queryClient.getQueryData<
    InfiniteData<PaginatedResult<Trip>>
  >(queryKeys.tripsList);
  if (!data) return [];
  return data.pages.flatMap((page) => page.items);
}

/** Devuelve el viaje de la caché del listado, o `null` si no está cargado. */
export function findTripInListCache(
  queryClient: QueryClient,
  tripId: string,
): Trip | null {
  return readTripsFromListCache(queryClient).find((trip) => trip.id === tripId) ?? null;
}