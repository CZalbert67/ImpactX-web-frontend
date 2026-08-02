import { create } from "zustand";
import {
  DEFAULT_THEME,
  STORAGE_KEYS,
  THEMES,
  type ThemeId,
} from "@/lib/constants";
import { localStorageAdapter } from "@/lib/storage";

function isThemeId(value: string | null | undefined): value is ThemeId {
  if (typeof value !== "string" || value.length === 0) return false;
  return (THEMES as readonly string[]).includes(value);
}

export function readStoredTheme(): ThemeId {
  const stored = localStorageAdapter.get(STORAGE_KEYS.theme);
  return isThemeId(stored) ? stored : DEFAULT_THEME;
}

export function applyThemeToDocument(theme: ThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    localStorageAdapter.set(STORAGE_KEYS.theme, theme);
    applyThemeToDocument(theme);
    set({ theme });
  },
}));

/* Aplicación inmediata (además del script inline de index.html). */
applyThemeToDocument(useThemeStore.getState().theme);