import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useSession } from "@/features/auth/hooks/useSession";
import { Spinner } from "@/components/ui/Spinner";

export interface PublicRouteProps {
  children: ReactNode;
  authenticatedRedirect?: string;
}

/**
 * Rutas públicas: un usuario autenticado no puede volver a login/registro.
 * El registro redirige al onboarding para que la cuenta recién creada termine
 * su configuración sin perder el contexto del flujo.
 */
export function PublicRoute({
  children,
  authenticatedRedirect = "/app/dashboard",
}: PublicRouteProps) {
  const { isInitialized, isAuthenticated } = useSession();

  if (!isInitialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page text-primary">
        <Spinner size="lg" label="Verificando sesión…" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={authenticatedRedirect} replace />;
  }

  return <>{children}</>;
}
