import { lazy } from "react";

export const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
export const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
export const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
export const TripsPage = lazy(() =>
  import("@/features/trips/pages/TripsPage").then((m) => ({ default: m.TripsPage })),
);
export const TripDetailPage = lazy(() =>
  import("@/features/trips/pages/TripDetailPage").then((m) => ({ default: m.TripDetailPage })),
);
export const TripTelemetryPage = lazy(() =>
  import("@/features/telemetry/pages/TripTelemetryPage").then((m) => ({ default: m.TripTelemetryPage })),
);
export const VehiclesPage = lazy(() =>
  import("@/features/vehicles/pages/VehiclesPage").then((m) => ({ default: m.VehiclesPage })),
);
export const FamilySubscriptionPage = lazy(() =>
  import("@/features/family/pages/FamilySubscriptionPage").then((m) => ({ default: m.FamilySubscriptionPage })),
);
export const MonitoringPage = lazy(() =>
  import("@/features/monitoring/pages/MonitoringPage").then((m) => ({ default: m.MonitoringPage })),
);
export const MonitoringDetailPage = lazy(() =>
  import("@/features/monitoring/pages/MonitoringDetailPage").then((m) => ({ default: m.MonitoringDetailPage })),
);
export const MessagesPage = lazy(() =>
  import("@/features/messages/pages/MessagesPage").then((m) => ({ default: m.MessagesPage })),
);
export const AlertsPage = lazy(() =>
  import("@/features/platform/pages/AlertsPage").then((m) => ({ default: m.AlertsPage })),
);
export const IncidentsPage = lazy(() =>
  import("@/features/platform/pages/IncidentsPage").then((m) => ({ default: m.IncidentsPage })),
);
export const ContactsPage = lazy(() =>
  import("@/features/platform/pages/ContactsPage").then((m) => ({ default: m.ContactsPage })),
);
export const DevicesPage = lazy(() =>
  import("@/features/platform/pages/DevicesPage").then((m) => ({ default: m.DevicesPage })),
);
export const NotificationsPage = lazy(() =>
  import("@/features/platform/pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })),
);
export const RoutesPage = lazy(() =>
  import("@/features/platform/pages/RoutesPage").then((m) => ({ default: m.RoutesPage })),
);
export const ProfilePage = lazy(() =>
  import("@/features/platform/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
export const SettingsPage = lazy(() =>
  import("@/features/platform/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
export const WearablesPage = lazy(() =>
  import("@/features/platform/pages/WearablesPage").then((m) => ({ default: m.WearablesPage })),
);
export const ComingSoonPage = lazy(() =>
  import("@/pages/ComingSoonPage").then((m) => ({ default: m.ComingSoonPage })),
);
export const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
export const UnauthorizedPage = lazy(() =>
  import("@/pages/UnauthorizedPage").then((m) => ({ default: m.UnauthorizedPage })),
);
