import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "@/test/test-utils";
import { AppApiError } from "@/api/errors";
import type { Trip, TripsSummary } from "@/features/trips/types";
import type { PaginatedResult } from "@/features/trips/utils/pagination";

const tripsApiMocks = vi.hoisted(() => ({
  getTrips: vi.fn(),
  getActiveTrip: vi.fn(),
  getTripsSummary: vi.fn(),
}));

vi.mock("@/features/trips/api/tripsApi", () => ({
  tripsApi: tripsApiMocks,
}));

const ACTIVE_TRIP: Trip = {
  id: "trip-0001",
  estado: "activo",
  inicio: "2026-08-01T10:00:00.000Z",
  fin: null,
  dispositivoId: "band-0001",
  proposito: "Traslado a cliente",
  rutaOrigen: "Guadalajara",
  rutaDestino: "Zapopan",
};

const FINISHED_TRIP: Trip = {
  id: "trip-0002",
  estado: "finalizado",
  inicio: "2026-07-28T09:15:00.000Z",
  fin: "2026-07-28T11:05:00.000Z",
  dispositivoId: null,
  proposito: null,
  rutaOrigen: null,
  rutaDestino: null,
};

const SUMMARY: TripsSummary = {
  total: 12,
  distanciaTotalKm: 842.5,
  duracionPromedioMin: 33,
};

function tripListPage(items: Trip[]): PaginatedResult<Trip> {
  return { items, nextToken: null };
}

beforeEach(() => {
  tripsApiMocks.getTrips.mockResolvedValue(tripListPage([FINISHED_TRIP]));
  tripsApiMocks.getActiveTrip.mockResolvedValue(ACTIVE_TRIP);
  tripsApiMocks.getTripsSummary.mockResolvedValue(SUMMARY);
});

describe("Página de Dashboard (datos reales)", () => {
  it("da la bienvenida al usuario autenticado", async () => {
    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    expect(
      await screen.findByRole(
        "heading",
        { name: /hola, maría/i },
        { timeout: 5_000 },
      ),
    ).toBeInTheDocument();
  });

  it("muestra el viaje activo, el resumen y los viajes recientes reales", async () => {
    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    expect(
      await screen.findByText(/hacia zapopan/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Guadalajara")).toBeInTheDocument();

    expect(screen.getByText(/viaje trip-000/i)).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("842.5 km")).toBeInTheDocument();
    expect(screen.getByText("33 min")).toBeInTheDocument();

    expect(screen.getByText("Conectado")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay viajes", async () => {
    tripsApiMocks.getActiveTrip.mockResolvedValue(null);
    tripsApiMocks.getTrips.mockResolvedValue(tripListPage([]));

    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    expect(
      await screen.findByText(/aún no hay viajes/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /iniciar viaje/i }).length,
    ).toBeGreaterThan(0);
  });

  it("muestra un error recuperable cuando las consultas fallan", async () => {
    tripsApiMocks.getTrips.mockRejectedValue(
      new AppApiError({ status: 409, message: "Conflicto de simulación" }),
    );

    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    expect(
      await screen.findByText(/no se pudo cargar el dashboard/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reintentar/i }),
    ).toBeInTheDocument();
  });

  it("muestra un estado de carga accesible durante la espera", async () => {
    let releaseActive!: (value: Trip) => void;
    tripsApiMocks.getActiveTrip.mockReturnValue(
      new Promise((resolve) => {
        releaseActive = resolve;
      }),
    );

    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    await waitFor(() => {
      expect(document.querySelector(".skeleton")).not.toBeNull();
    });

    releaseActive(ACTIVE_TRIP);
    await screen.findByText(/hacia zapopan/i);
  });
});