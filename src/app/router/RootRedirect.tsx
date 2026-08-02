import { Navigate, useLocation } from "react-router";
import { useSession } from "@/features/auth/hooks/useSession";

/**
 * Redirección de `/`: según la sesión, a dashboard o a login.
 * Conserva la ubicación tras un intento de acceso directo.
 */
export function RootRedirect() {
  const { isAuthenticated } = useSession();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}