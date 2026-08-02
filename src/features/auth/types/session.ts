import type { AuthUser } from "@/features/auth/types/api";

/** Estado de sesión mínima persistida. Solo se guardan datos necesarios. */
export interface SessionSnapshot {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  /** Marca de tiempo UTC de la última mutación, útil para sincronización. */
  updatedAt: string;
}

export function toSnapshot(
  accessToken: string,
  refreshToken: string,
  user: AuthUser,
): SessionSnapshot {
  return {
    accessToken,
    refreshToken,
    user,
    updatedAt: new Date().toISOString(),
  };
}