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