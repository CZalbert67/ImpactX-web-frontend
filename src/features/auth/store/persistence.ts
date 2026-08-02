import {
  SESSION_SYNC_CHANNEL,
  SESSION_EXPIRED_EVENT,
  STORAGE_KEYS,
} from "@/lib/constants";
import { sessionStorageAdapter } from "@/lib/storage";
import type { SessionSnapshot } from "@/features/auth/types/session";

/**
 * Abstracción de persistencia de la sesión.
 *
 * Por decisión de la Frontend Foundation la sesión vive en sessionStorage.
 * Esta capa es el único punto que toca el storage: migrar a otra estrategia
 * (p. ej. cookies httpOnly o IndexedDB) solo requiere cambiar este módulo.
 *
 * No se registran contraseñas ni tokens fuera de este almacén acotado y nunca
 * se exponen por console/servidor.
 */

export interface SessionPersistence {
  read(): SessionSnapshot | null;
  write(snapshot: SessionSnapshot): void;
  clear(): void;
}

function parseSnapshot(raw: string | null): SessionSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionSnapshot>;
    if (
      typeof parsed.accessToken === "string" &&
      typeof parsed.refreshToken === "string" &&
      parsed.user &&
      typeof parsed.user === "object" &&
      typeof parsed.user.id === "string"
    ) {
      return parsed as SessionSnapshot;
    }
    return null;
  } catch {
    return null;
  }
}

export const sessionPersistence: SessionPersistence = {
  read() {
    return parseSnapshot(sessionStorageAdapter.get(STORAGE_KEYS.session));
  },
  write(snapshot) {
    sessionStorageAdapter.set(STORAGE_KEYS.session, JSON.stringify(snapshot));
  },
  clear() {
    sessionStorageAdapter.remove(STORAGE_KEYS.session);
  },
};

/** Notifica a otras pestañas que la sesión cambió (cierre de sesión, login). */
export function notifySessionSync(): void {
  if (typeof BroadcastChannel === "undefined") return;
  try {
    new BroadcastChannel(SESSION_SYNC_CHANNEL).postMessage({ type: "changed" });
  } catch {
    /* canal no disponible: se ignora */
  }
}

export function subscribeToSessionSync(onChange: () => void): () => void {
  if (typeof BroadcastChannel === "undefined") return () => undefined;
  let channel: BroadcastChannel;
  try {
    channel = new BroadcastChannel(SESSION_SYNC_CHANNEL);
  } catch {
    return () => undefined;
  }
  channel.addEventListener("message", () => onChange());
  return () => {
    channel.close();
  };
}

/** Difunde un evento global cuando la sesión es expirada por la capa HTTP. */
export function dispatchSessionExpired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}