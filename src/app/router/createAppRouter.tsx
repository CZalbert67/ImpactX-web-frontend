import { Suspense } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter, createMemoryRouter, Navigate } from "react-router";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { RootRedirect } from "@/app/router/RootRedirect";
import {
  ComingSoonPage,
  DashboardPage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
  TripDetailPage,
  TripTelemetryPage,
  TripsPage,
  UnauthorizedPage,
} from "@/app/router/lazyRoutes";
import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/ui/Spinner";

function withSuspense(element: ReactNode): ReactNode {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-page text-primary">
          <Spinner size="lg" label="Cargando…" />
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

function buildRoutes() {
  return [
    { path: "/", element: <RootRedirect /> },
    {
      path: "/login",
      element: <PublicRoute>{withSuspense(<LoginPage />)}</PublicRoute>,
    },
    {
      path: "/register",
      element: <PublicRoute>{withSuspense(<RegisterPage />)}</PublicRoute>,
    },
    {
      path: "/unauthorized",
      element: withSuspense(<UnauthorizedPage />),
    },
    {
      path: "/app",
      element: (
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/app/dashboard" replace /> },
        { path: "dashboard", element: withSuspense(<DashboardPage />) },
        { path: "trips", element: withSuspense(<TripsPage />) },
        {
          path: "trips/:tripId",
          element: withSuspense(<TripDetailPage />),
        },
        {
          path: "trips/:tripId/telemetry",
          element: withSuspense(<TripTelemetryPage />),
        },
        { path: "*", element: withSuspense(<ComingSoonPage />) },
      ],
    },
    { path: "*", element: withSuspense(<NotFoundPage />) },
  ];
}

/** Fábrica del router de la aplicación. Requiere envolverlo con AppProviders. */
export function createAppRouter(
  initialEntries?: string[],
): ReturnType<typeof createBrowserRouter> {
  const routes = buildRoutes();
  if (initialEntries) {
    return createMemoryRouter(routes, { initialEntries });
  }
  return createBrowserRouter(routes);
}

/** Router en memoria para pruebas (sin dependencia del historial real). */
export function createTestRouter(
  initialEntries: string[],
): ReturnType<typeof createBrowserRouter> {
  return createMemoryRouter(buildRoutes(), { initialEntries });
}