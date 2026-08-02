import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "@/features/auth/hooks/useSession";
import { Spinner } from "@/components/ui/Spinner";

export interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Rutas protegidas: espera la restauración de sesión, muestra un cargador
 * accesible y redirige a /login conservando la ubicación solicitada.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isInitialized, isAuthenticated } = useSession();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page text-primary">
        <Spinner size="lg" label="Verificando sesión…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}