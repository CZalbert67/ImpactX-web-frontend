import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { AppLogo } from "@/components/branding/AppLogo";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { cn } from "@/lib/cn";

export interface AuthShellProps {
  children: ReactNode;
  size?: "md" | "xl";
}

/**
 * Marco de las pantallas públicas de autenticación y onboarding: panel de
 * marca, mensaje de seguridad, selector de tema y contenido centrado.
 */
export function AuthShell({ children, size = "md" }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-page text-primary">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" aria-label="Volver a la presentación de ImpactX">
          <AppLogo />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line-strong px-3 text-sm font-semibold transition-colors hover:bg-panel-soft sm:px-4"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Volver a la presentación</span>
            <span className="sm:hidden">Inicio</span>
          </Link>
          <ThemeSelector compact />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div
          className={cn(
            "w-full panel p-6 sm:p-8",
            size === "xl" ? "max-w-4xl" : "max-w-md",
          )}
        >
          {children}
        </div>
      </main>

      <footer className="px-4 pb-5 text-center text-xs text-muted">
        ImpactX protege tu información. No compartas tu sesión ni tus
        credenciales. La autorización siempre se valida en el servidor.
      </footer>
    </div>
  );
}
