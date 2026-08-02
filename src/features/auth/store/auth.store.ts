import { create } from "zustand";
import type { AuthUser } from "@/features/auth/types/api";
import type { SessionSnapshot } from "@/features/auth/types/session";
import {
  sessionPersistence,
  subscribeToSessionSync,
  notifySessionSync,
} from "@/features/auth/store/persistence";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  /** El contrato del backend expone refresh token, por eso se conserva. */
  refreshToken: string | null;

  /** Restaura la sesión persistida y marca el estado como listo. */
  restore: () => void;
  /** Persiste y publica la sesión, notificando a las demás pestañas. */
  setSession: (snapshot: SessionSnapshot) => void;
  /** Limpia memoria y storage, e notifica el cierre. */
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "initializing",
  user: null,
  accessToken: null,
  refreshToken: null,

  restore: () => {
    const snapshot = sessionPersistence.read();
    if (snapshot) {
      set({
        status: "authenticated",
        user: snapshot.user,
        accessToken: snapshot.accessToken,
        refreshToken: snapshot.refreshToken,
      });
    } else {
      set({
        status: "unauthenticated",
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },

  setSession: (snapshot) => {
    sessionPersistence.write(snapshot);
    set({
      status: "authenticated",
      user: snapshot.user,
      accessToken: snapshot.accessToken,
      refreshToken: snapshot.refreshToken,
    });
    notifySessionSync();
  },

  clearSession: () => {
    sessionPersistence.clear();
    set({
      status: "unauthenticated",
      user: null,
      accessToken: null,
      refreshToken: null,
    });
    notifySessionSync();
  },
}));

/**
 * Acceso síncrono fuera de React (requerido por la capa HTTP) para leer
 * exclusivamente los campos no sensibles de la sesión actual.
 */
export function getSessionForHttp(): Pick<
  AuthState,
  "accessToken" | "refreshToken"
> | null {
  const { accessToken, refreshToken } = useAuthStore.getState();
  if (accessToken === null || refreshToken === null) return null;
  return { accessToken, refreshToken };
}

/* Sincronización entre pestañas: cierre de sesión/ingreso en una se refleja
 * en las demás vía BroadcastChannel. */
try {
  subscribeToSessionSync(() => {
    const snapshot = sessionPersistence.read();
    useAuthStore.setState(
      snapshot
        ? {
            status: "authenticated",
            user: snapshot.user,
            accessToken: snapshot.accessToken,
            refreshToken: snapshot.refreshToken,
          }
        : {
            status: "unauthenticated",
            user: null,
            accessToken: null,
            refreshToken: null,
          },
    );
  });
} catch {
  /* canal indisponible en este entorno: sincronización opcional */
}