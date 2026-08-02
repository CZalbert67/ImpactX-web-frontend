import { useCallback } from "react";
import { AppApiError } from "@/api/errors";
import type { Trip, TripsSummary } from "@/features/trips/types";
import {
  useActiveTrip,
  useTrips,
  useTripsSummary,
} from "@/features/trips/hooks";

export type Connectivity = "loading" | "online" | "offline";

export type DashboardView =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "ready" };

export interface DashboardState {
  view: DashboardView;
  activeTrip: Trip | null;
  recentTrips: Trip[];
  summary: TripsSummary | null;
  connectivity: Connectivity;
  errorMessage: string;
  retry: () => void;
}

function isNetworkError(error: unknown): boolean {
  return error instanceof AppApiError && error.status === 0;
}

function errorMessage(error: unknown): string {
  if (error instanceof AppApiError) {
    return error.status >= 500
      ? "La API presenta un error temporal. Inténtalo en un momento."
      : error.message;
  }
  return "No se pudo conectar con la API.";
}

/**
 * Estado del dashboard real: combina viaje activo, listado reciente y
 * resumen de viajes de la API (todos endpoints auditados). No inventa
 * cifras: si no hay contrato disponible, las tarjetas muestran
 * «Información no disponible».
 */
export function useDashboardState(): DashboardState {
  const active = useActiveTrip();
  const trips = useTrips({ pageSize: 5 });
  const summary = useTripsSummary();

  const activeError = active.isError ? active.error : null;
  const tripsError = trips.isError ? trips.error : null;

  const firstError = tripsError ?? activeError ?? null;
  const offline =
    (tripsError !== null && isNetworkError(tripsError)) ||
    (activeError !== null && isNetworkError(activeError));

  const isLoading =
    active.isPending ||
    summary.isPending ||
    (trips.isPending && trips.isFetching);
  const connectivity: Connectivity = offline
    ? "offline"
    : isLoading
      ? "loading"
      : "online";

  const recentTrips = trips.data?.pages.flatMap((page) => page.items) ?? [];
  const activeTrip = active.data ?? null;

  const summaryData = summary.data ?? null;

  let view: DashboardView;
  if (firstError) {
    view = { kind: "error", message: errorMessage(firstError) };
  } else if (isLoading) {
    view = { kind: "loading" };
  } else if (!activeTrip && recentTrips.length === 0) {
    view = { kind: "empty" };
  } else {
    view = { kind: "ready" };
  }

  const retry = useCallback(() => {
    void active.refetch();
    void trips.refetch();
    void summary.refetch();
  }, [active, trips, summary]);

  return {
    view,
    activeTrip,
    recentTrips,
    summary: summaryData,
    connectivity,
    errorMessage: firstError ? errorMessage(firstError) : "",
    retry,
  };
}