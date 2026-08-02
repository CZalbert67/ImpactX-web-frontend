/**
 * Claves de storage centralizadas.
 *
 * Ninguna clave contiene tokens en su nombre y los valores sensibles solo
 * viven en sessionStorage. Las claves de tema y UI viven en localStorage
 * porque deben sobrevivir entre pestañas/sesiones.
 */
export const STORAGE_KEYS = {
  /** Sesión (sessionStorage, sensible). */
  session: "impactx.session.v1",
  /** Tema activo (localStorage, no sensible). */
  theme: "impactx.theme",
  /** Estado colapsado de la barra lateral. */
  sidebarCollapsed: "impactx.sidebar.collapsed",
} as const;

export type ThemeId = "impactx-neon" | "impactx-professional" | "impactx-light";

export const THEMES: ThemeId[] = [
  "impactx-neon",
  "impactx-professional",
  "impactx-light",
] as const;

export const DEFAULT_THEME: ThemeId = "impactx-neon";

/** Canal BroadcastChannel para sincronizar acciones de sesión entre pestañas. */
export const SESSION_SYNC_CHANNEL = "impactx:session-sync";

/** Evento global usado ante expiración de sesión forzada por la capa HTTP. */
export const SESSION_EXPIRED_EVENT = "impactx:session-expired";