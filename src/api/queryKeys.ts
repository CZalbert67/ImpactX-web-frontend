/**
 * Claves de consulta de TanStack Query, centralizadas para evitar cadenas
 * sueltas en los hooks de datos.
 */
export const queryKeys = {
  profile: ["auth", "profile"] as const,
  plans: ["plans"] as const,
} as const;