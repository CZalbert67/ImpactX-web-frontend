import { publicClient } from "@/api/client";
import type { AuthResponse } from "@/features/auth/types/api";
import type { SessionSnapshot } from "@/features/auth/types/session";
import {
  getSessionForHttp,
  useAuthStore,
} from "@/features/auth/store/auth.store";

/**
 * Refresh token con vuelo único (single-flight).
 *
 * Si varias peticiones reciben 401 al mismo tiempo, todas esperan la misma
 * promesa: una sola llamada a /api/v1/auth/refresh en vuelo. Cuando falla, la
 * sesión se limpia (el router redirige a /login por el estado del store).
 */

let inflightRefresh: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!inflightRefresh) {
    inflightRefresh = performRefresh().finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
}

async function performRefresh(): Promise<string | null> {
  const session = getSessionForHttp();
  if (!session) return null;

  let response: AuthResponse;
  try {
    const { data } = await publicClient.post<AuthResponse>(
      "/api/v1/auth/refresh",
      { refreshToken: session.refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    response = data;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }

  if (
    response.success === false ||
    !response.token ||
    !response.refreshToken ||
    !response.usuario
  ) {
    useAuthStore.getState().clearSession();
    return null;
  }

  const snapshot: SessionSnapshot = {
    accessToken: response.token,
    refreshToken: response.refreshToken,
    user: response.usuario,
    updatedAt: new Date().toISOString(),
  };

  useAuthStore.getState().setSession(snapshot);
  return snapshot.accessToken;
}