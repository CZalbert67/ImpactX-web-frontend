import type { ReactNode } from "react";
import { AppLogo } from "@/components/branding/AppLogo";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

export interface AuthShellProps {
  children: ReactNode;
}

/**
 * Marco de las pantallas públicas de autenticación: panel de marca,
 * mensaje de seguridad, selector de tema y contenido centrado.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-page text-primary">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <AppLogo />
        <ThemeSelector compact />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md panel p-6 sm:p-8">{children}</div>
      </main>

      <footer className="px-4 pb-5 text-center text-xs text-muted">
        ImpactX protege tu información. No compartas tu sesión ni tus
        credenciales. La autorización siempre se valida en el servidor.
      </footer>
    </div>
  );
}