import { Suspense } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter, createMemoryRouter, Navigate } from "react-router";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import {
  AccountPage,
  AlertsPage,
  ContactsPage,
  DashboardPage,
  DataConsentsPage,
  FamilySubscriptionPage,
  IncidentsPage,
  LandingPage,
  LoginPage,
  MessagesPage,
  MonitoringDetailPage,
  NotificationsPage,
  PrivacyNoticePage,
  ProfilePage,
  MonitoringPage,
  NotFoundPage,
  RegisterPage,
  RegistrationOnboardingPage,
  RoutesPage,
  SettingsPage,
  TripDetailPage,
  TermsPage,
  TripTelemetryPage,
  TripsPage,
  UnauthorizedPage,
  VehiclesPage,
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
    { path: "/", element: withSuspense(<LandingPage />) },
    { path: "/legal/terms", element: withSuspense(<TermsPage />) },
    { path: "/legal/privacy", element: withSuspense(<PrivacyNoticePage />) },
    { path: "/legal/consents", element: withSuspense(<DataConsentsPage />) },
    { path: "/login", element: <PublicRoute>{withSuspense(<LoginPage />)}</PublicRoute> },
    { path: "/register", element: <PublicRoute authenticatedRedirect="/onboarding">{withSuspense(<RegisterPage />)}</PublicRoute> },
    { path: "/onboarding", element: <ProtectedRoute>{withSuspense(<RegistrationOnboardingPage />)}</ProtectedRoute> },
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
        { path: "notifications", element: withSuspense(<NotificationsPage />) },
        { path: "routes", element: withSuspense(<RoutesPage />) },
        { path: "profile", element: withSuspense(<ProfilePage />) },
        { path: "settings", element: withSuspense(<SettingsPage />) },
        { path: "account", element: withSuspense(<AccountPage />) },
        { path: "trips", element: withSuspense(<TripsPage />) },
        { path: "trips/:tripId", element: withSuspense(<TripDetailPage />) },
        { path: "trips/:tripId/telemetry", element: withSuspense(<TripTelemetryPage />) },
        { path: "*", element: withSuspense(<NotFoundPage />) },
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
