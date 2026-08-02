import type { ReactNode } from "react";
import { useEffect } from "react";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  applyThemeToDocument,
  useThemeStore,
} from "@/features/theme/theme.store";

function ThemeManager() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    applyThemeToDocument(theme);
    document.documentElement.style.colorScheme =
      theme === "impactx-light" ? "light" : "dark";
  }, [theme]);

  return null;
}

function SessionBootstrap() {
  const status = useAuthStore((state) => state.status);
  const restore = useAuthStore((state) => state.restore);

  useEffect(() => {
    if (status === "initializing") {
      restore();
    }
  }, [status, restore]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeManager />
      <SessionBootstrap />
      {children}
    </QueryProvider>
  );
}