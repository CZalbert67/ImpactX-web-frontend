import type { ThemeId } from "@/lib/constants";
import {
  applyThemeToDocument,
  useThemeStore,
} from "@/features/theme/theme.store";

export interface ThemeOptions {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  toggleTheme?: () => void;
}

export function useTheme(): ThemeOptions {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = (next: ThemeId) => {
    useThemeStore.getState().setTheme(next);
    applyThemeToDocument(next);
  };
  return { theme, setTheme };
}