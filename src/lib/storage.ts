/** Adaptador de storage con fallos acotados (nunca lanza en lectura/escritura). */

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

function selectStorage(kind: "session" | "local"): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function createStorageAdapter(kind: "session" | "local"): StorageAdapter {
  return {
    get(key) {
      const storage = selectStorage(kind);
      if (!storage) return null;
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      const storage = selectStorage(kind);
      if (!storage) return;
      try {
        storage.setItem(key, value);
      } catch {
        /* storage lleno o denegado: se ignora */
      }
    },
    remove(key) {
      const storage = selectStorage(kind);
      if (!storage) return;
      try {
        storage.removeItem(key);
      } catch {
        /* se ignora */
      }
    },
  };
}

export const sessionStorageAdapter: StorageAdapter = createStorageAdapter(
  "session",
);

export const localStorageAdapter: StorageAdapter = createStorageAdapter("local");

export { selectStorage }; // re-export útil para pruebas