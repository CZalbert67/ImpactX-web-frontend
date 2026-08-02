import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * Cierre de sesión: primero revoca el refresh token en el backend (best
 * effort) y SIEMPRE limpia la sesión local, sin importar el resultado remoto.
 */
export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await authApi.logout({ refreshToken });
        } catch {
          /* el cierre local siempre ocurre */
        }
      }
      clearSession();
    },
    onSuccess: () => {
      navigate("/login", { replace: true });
    },
  });
}