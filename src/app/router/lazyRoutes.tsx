import { lazy } from "react";

export const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
export const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
export const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
export const TripsPage = lazy(() =>
  import("@/features/trips/pages/TripsPage").then((m) => ({
    default: m.TripsPage,
  })),
);
export const TripDetailPage = lazy(() =>
  import("@/features/trips/pages/TripDetailPage").then((m) => ({
    default: m.TripDetailPage,
  })),
);
export const TripTelemetryPage = lazy(() =>
  import("@/features/telemetry/pages/TripTelemetryPage").then((m) => ({
    default: m.TripTelemetryPage,
  })),
);
export const ComingSoonPage = lazy(() =>
  import("@/pages/ComingSoonPage").then((m) => ({
    default: m.ComingSoonPage,
  })),
);
export const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
export const UnauthorizedPage = lazy(() =>
  import("@/pages/UnauthorizedPage").then((m) => ({
    default: m.UnauthorizedPage,
  })),
);