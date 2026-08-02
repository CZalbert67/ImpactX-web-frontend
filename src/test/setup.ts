import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { useAuthStore } from "@/features/auth/store/auth.store";

function createMemoryStorage(): Storage {
  let store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store = new Map();
    },
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
}

Object.defineProperty(window, "sessionStorage", {
  configurable: true,
  value: createMemoryStorage(),
});
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: createMemoryStorage(),
});

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  useAuthStore.getState().clearSession();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  window.localStorage.clear();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

// El BroadcastChannel de jsdom propaga mensajes entre pruebas y podría
// resetear la sesión al vacío. En tests la sincronización entre pestañas
// no es necesaria: se deshabilita para que el store quede determinista.
Object.defineProperty(globalThis, "BroadcastChannel", {
  configurable: true,
  value: undefined,
});