import apiClient from "@/api/client";
import { AppApiError } from "@/api/errors";
import type { StartTripRequest, Trip, TripsSummary } from "@/features/trips/types";
import { parseTripFromTrip } from "@/features/trips/types/trip";
import {
  buildPaginationParams,
  DEFAULT_PAGE_SIZE,
  normalizePageSize,
  readContinuationToken,
} from "@/features/trips/utils/pagination";
import type { PaginatedResult } from "@/features/trips/utils/pagination";

export interface TripsListParams {
  pageSize?: number | string;
  continuationToken?: string | null;
  signal?: AbortSignal;
}

export interface StartTripParams {
  body: StartTripRequest;
  signal?: AbortSignal;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseTripsSummary(value: unknown): TripsSummary {
  if (!isPlainRecord(value)) {
    return { total: null, distanciaTotalKm: null, duracionPromedioMin: null };
  }
  const pickFinite = (keys: string[]): number | null => {
    for (const key of keys) {
      const raw = value[key];
      if (typeof raw === "number" && Number.isFinite(raw)) return raw;
      if (typeof raw === "string" && raw.trim() !== "") {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return null;
  };

  return {
    total: pickFinite(["total", "totalViajes", "cantidad"]),
    distanciaTotalKm: pickFinite(["distanciaTotalKm", "distanciaKm"]),
    duracionPromedioMin: pickFinite(["duracionPromedioMin", "duracionPromedio"]),
  };
}

function encodeTripId(tripId: string): string {
  return encodeURIComponent(tripId);
}

/**
 * Capa de acceso HTTP de viajes. Rutas auditadas contra el OpenAPI real:
 *   GET  /api/v1/trips                    (paginada por X-Continuation-Token)
 *   GET  /api/v1/trips/active
 *   POST /api/v1/trips/start
 *   POST /api/v1/trips/{id}/pause
 *   POST /api/v1/trips/{id}/resume
 *   POST /api/v1/trips/{id}/finish
 *   GET  /api/v1/analytics/trips/summary
 *
 * No existe endpoint de «detalle de viaje»: el detalle se reconstruye desde
 * el listado real (ver `useTripDetail`).
 */
export const tripsApi = {
  async getTrips(params: TripsListParams = {}): Promise<PaginatedResult<Trip>> {
    const { data, headers } = await apiClient.get<unknown>(
      "/api/v1/trips",
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
        .map(parseTripFromTrip)
        .filter((trip): trip is Trip => trip !== null),
      nextToken: readContinuationToken(headers),
    };
  },

  async getActiveTrip(params: { signal?: AbortSignal } = {}): Promise<Trip | null> {
    try {
      const { data } = await apiClient.get<unknown>(
        "/api/v1/trips/active",
        { signal: params.signal },
      );
      return data ? parseTripFromTrip(data) : null;
    } catch (error) {
      if (error instanceof AppApiError && error.status === 404) return null;
      throw error;
    }
  },

  async startTrip(params: StartTripParams): Promise<Trip | null> {
    const { data } = await apiClient.post<unknown>(
      "/api/v1/trips/start",
      params.body,
      { signal: params.signal },
    );
    return data ? parseTripFromTrip(data) : null;
  },

  async pauseTrip(
    tripId: string,
    params: { signal?: AbortSignal } = {},
  ): Promise<void> {
    await apiClient.post(`/api/v1/trips/${encodeTripId(tripId)}/pause`, null, {
      signal: params.signal,
    });
  },

  async resumeTrip(
    tripId: string,
    params: { signal?: AbortSignal } = {},
  ): Promise<void> {
    await apiClient.post(`/api/v1/trips/${encodeTripId(tripId)}/resume`, null, {
      signal: params.signal,
    });
  },

  async finishTrip(
    tripId: string,
    params: { signal?: AbortSignal } = {},
  ): Promise<void> {
    await apiClient.post(`/api/v1/trips/${encodeTripId(tripId)}/finish`, null, {
      signal: params.signal,
    });
  },

  async getTripsSummary(
    params: { signal?: AbortSignal } = {},
  ): Promise<TripsSummary> {
    const { data } = await apiClient.get<unknown>(
      "/api/v1/analytics/trips/summary",
      { signal: params.signal },
    );
    return parseTripsSummary(data);
  },
};