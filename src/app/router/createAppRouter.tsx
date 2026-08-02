import { Suspense } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter, createMemoryRouter, Navigate } from "react-router";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { RootRedirect } from "@/app/router/RootRedirect";
import {
  AlertsPage,
  ComingSoonPage,
  ContactsPage,
  DashboardPage,
  DevicesPage,
  FamilySubscriptionPage,
  IncidentsPage,
  LoginPage,
  MessagesPage,
  MonitoringDetailPage,
  NotificationsPage,
  ProfilePage,
  MonitoringPage,
  NotFoundPage,
  RegisterPage,
  RoutesPage,
  SettingsPage,
  TripDetailPage,
  TripTelemetryPage,
  TripsPage,
  UnauthorizedPage,
  VehiclesPage,
  WearablesPage,
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
    { path: "/login", element: <PublicRoute>{withSuspense(<LoginPage />)}</PublicRoute> },
    { path: "/register", element: <PublicRoute>{withSuspense(<RegisterPage />)}</PublicRoute> },
    { path: "/unauthorized", element: withSuspense(<UnauthorizedPage />) },
    {
      path: "/app",
      element: <ProtectedRoute><AppShell /></ProtectedRoute>,
      children: [
        { index: true, element: <Navigate to="/app/dashboard" replace /> },
        { path: "dashboard", element: withSuspense(<DashboardPage />) },
        { path: "vehicles", element: withSuspense(<VehiclesPage />) },
        { path: "family", element: withSuspense(<FamilySubscriptionPage />) },
        { path: "monitoring", element: withSuspense(<MonitoringPage />) },
        { path: "monitoring/:publicRelationshipId", element: withSuspense(<MonitoringDetailPage />) },
        { path: "messages", element: withSuspense(<MessagesPage />) },
        { path: "alerts", element: withSuspense(<AlertsPage />) },
        { path: "incidents", element: withSuspense(<IncidentsPage />) },
        { path: "contacts", element: withSuspense(<ContactsPage />) },
        { path: "devices", element: withSuspense(<DevicesPage />) },
        { path: "notifications", element: withSuspense(<NotificationsPage />) },
        { path: "routes", element: withSuspense(<RoutesPage />) },
        { path: "profile", element: withSuspense(<ProfilePage />) },
        { path: "settings", element: withSuspense(<SettingsPage />) },
        { path: "wearables", element: withSuspense(<WearablesPage />) },
        { path: "trips", element: withSuspense(<TripsPage />) },
        { path: "trips/:tripId", element: withSuspense(<TripDetailPage />) },
        { path: "trips/:tripId/telemetry", element: withSuspense(<TripTelemetryPage />) },
        { path: "*", element: withSuspense(<ComingSoonPage />) },
      ],
    },
    { path: "*", element: withSuspense(<NotFoundPage />) },
  ];
}

export function createAppRouter(initialEntries?: string[]): ReturnType<typeof createBrowserRouter> {
  const routes = buildRoutes();
  return initialEntries
    ? createMemoryRouter(routes, { initialEntries })
    : createBrowserRouter(routes);
}

export function createTestRouter(initialEntries: string[]): ReturnType<typeof createBrowserRouter> {
  return createMemoryRouter(buildRoutes(), { initialEntries });
}
