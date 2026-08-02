import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { RouterProvider } from "react-router";
import { AppProviders } from "@/app/providers/AppProviders";
import { createTestRouter } from "@/app/router/createAppRouter";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { AuthUser } from "@/features/auth/types/api";
import type { SessionSnapshot } from "@/features/auth/types/session";

export const TEST_USER: AuthUser = {
  id: "00000000-0000-0000-0000-000000000009",
  username: "maria.test",
  appId: "app-1",
  nombre: "María López",
  correo: "maria@test.invalid",
  telefono: null,
  planActivo: "Plan Free",
};

export const TEST_ACCESS_TOKEN = "access-token-test-only";
export const TEST_REFRESH_TOKEN = "refresh-token-test-only";

export function makeSessionSnapshot(
  overrides: Partial<SessionSnapshot> = {},
): SessionSnapshot {
  return {
    accessToken: TEST_ACCESS_TOKEN,
    refreshToken: TEST_REFRESH_TOKEN,
    user: TEST_USER,
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

/** Fija el store en estado autenticado (sin tocar storage). */
export function setAuthenticated() {
  useAuthStore.setState({
    status: "authenticated",
    accessToken: TEST_ACCESS_TOKEN,
    refreshToken: TEST_REFRESH_TOKEN,
    user: TEST_USER,
  });
}

export function setUnauthenticated() {
  useAuthStore.setState({
    status: "unauthenticated",
    accessToken: null,
    refreshToken: null,
    user: null,
  });
}

export interface RenderAppOptions {
  initialEntries?: string[];
  authenticated?: boolean;
}

export function renderApp({
  initialEntries = ["/"],
  authenticated = false,
}: RenderAppOptions = {}) {
  if (authenticated) setAuthenticated();
  else setUnauthenticated();

  const router = createTestRouter(initialEntries);
  const ui = (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  ) as ReactElement;

  return render(ui);
}