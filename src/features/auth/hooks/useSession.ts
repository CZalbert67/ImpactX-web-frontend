import { useAuthStore, type AuthStatus } from "@/features/auth/store/auth.store";
import type { AuthUser } from "@/features/auth/types/api";

export interface SessionInfo {
  status: AuthStatus;
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
}

/** Estado de sesión para consumo en componentes y guards de ruta. */
export function useSession(): SessionInfo {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  return {
    status,
    isInitialized: status !== "initializing",
    isAuthenticated: status === "authenticated",
    user,
  };
}