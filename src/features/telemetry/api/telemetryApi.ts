import apiClient from "@/api/client";
import type { TelemetryRow } from "@/features/telemetry/types/telemetry";
import { parseTelemetryPoint } from "@/features/telemetry/types/telemetry";
import {
  buildPaginationParams,
  DEFAULT_PAGE_SIZE,
  normalizePageSize,
  readContinuationToken,
} from "@/features/trips/utils/pagination";
import type { PaginatedResult } from "@/features/trips/utils/pagination";

export interface TripTelemetryParams {
  tripId: string;
  pageSize?: number | string;
  continuationToken?: string | null;
  signal?: AbortSignal;
}

/**
 * Capa de acceso de telemetría. Ruta auditada contra el OpenAPI real:
 *   GET /api/v1/trips/{id}/telemetry   (paginada por X-Continuation-Token)
 *
 * El POST y PATCH del mismo recurso corresponden a la ingesta desde el
 * wearable; en esta rama web solo se consume (GET). Nunca se puede
 * tomar/seleccionar una coordenada manualmente.
 */
export const telemetryApi = {
  async getTripTelemetry(
    params: TripTelemetryParams,
  ): Promise<PaginatedResult<TelemetryRow>> {
    const tripId = encodeURIComponent(params.tripId);
    const { data, headers } = await apiClient.get<unknown>(
      `/api/v1/trips/${tripId}/telemetry`,
      {
        params: buildPaginationParams(
          normalizePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
          params.continuationToken ?? null,
        ),
        signal: params.signal,
      },
    );

    const items = Array.isArray(data) ? (data as unknown[]) : [];
    return {
      items: items
        .map(parseTelemetryPoint)
        .filter((point): point is TelemetryRow => point !== null),
      nextToken: readContinuationToken(headers),
    };
  },
};