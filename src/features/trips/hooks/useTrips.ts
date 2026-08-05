import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { LIVE_QUERY_INTERVAL, liveQueryOptions } from "@/api/liveQuery";
import { tripsApi } from "@/features/trips/api/tripsApi";
import type { Trip } from "@/features/trips/types";
import {
  DEFAULT_PAGE_SIZE,
  normalizePageSize,
} from "@/features/trips/utils/pagination";
import type { PaginatedResult } from "@/features/trips/utils/pagination";

export interface UseTripsOptions {
  pageSize?: number | string;
}

/** Trae los viajes del usuario paginados con «Cargar más» (sin scroll). */
export function useTrips(options: UseTripsOptions = {}) {
  const pageSize = normalizePageSize(options.pageSize ?? DEFAULT_PAGE_SIZE);

  return useInfiniteQuery({
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.trips),
    queryKey: queryKeys.tripsList,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      tripsApi.getTrips({
        pageSize,
        continuationToken: pageParam,
        signal,
      }),
    getNextPageParam: (lastPage: PaginatedResult<Trip>) => lastPage.nextToken,
  });
}