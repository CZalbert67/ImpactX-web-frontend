import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { telemetryApi } from "@/features/telemetry/api/telemetryApi";
import type { TelemetryRow } from "@/features/telemetry/types";
import { isValidTripGuid } from "@/features/trips/utils/guid";
import {
  normalizePageSize,
} from "@/features/trips/utils/pagination";
import type { PaginatedResult } from "@/features/trips/utils/pagination";

export interface UseTripTelemetryOptions {
  pageSize?: number | string;
}

const TELEMETRY_PAGE_SIZE_DEFAULT = 50;

/**
 * Telemetría de un viaje con «Cargar más». Deshabilitada ante un GUID
 * inválido para no llamar a la API.
 */
export function useTripTelemetry(
  tripId: string,
  options: UseTripTelemetryOptions = {},
) {
  const validId = isValidTripGuid(tripId);
  const pageSize = normalizePageSize(
    options.pageSize ?? TELEMETRY_PAGE_SIZE_DEFAULT,
  );

  return useInfiniteQuery({
    queryKey: queryKeys.tripTelemetry(tripId),
    initialPageParam: null as string | null,
    enabled: validId,
    queryFn: ({ pageParam, signal }) =>
      telemetryApi.getTripTelemetry({
        tripId,
        pageSize,
        continuationToken: pageParam,
        signal,
      }),
    getNextPageParam: (lastPage: PaginatedResult<TelemetryRow>) =>
      lastPage.nextToken,
  });
}