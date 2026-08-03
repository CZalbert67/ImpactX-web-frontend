import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { AppApiError } from "@/api/errors";
import { authApi } from "@/features/auth/api/authApi";
import {
  toLoginRequest,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { toSnapshot } from "@/features/auth/types/session";

/** Devuelve la ruta original solicitada antes de ser redirigido a login. */
export function useIntendedRoute(): string {
  const location = useLocation();
  const state = location.state as { from?: { pathname?: string } } | null;
  return state?.from?.pathname ?? "/app/dashboard";
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const intended = useIntendedRoute();

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      try {
        const response = await authApi.login(toLoginRequest(values));

        if (
          response.success &&
          response.token &&
          response.refreshToken &&
          response.usuario
        ) {
          setSession(
            toSnapshot(
              response.token,
              response.refreshToken,
              response.usuario,
            ),
          );
          return response;
        }

        throw new AppApiError({
          status: 401,
          message:
            "No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.",
          title: "Inicio de sesión no completado",
        });
      } catch (error) {
        const normalized = AppApiError.from(error);
        throw new AppApiError({
          status: normalized.status,
          code: normalized.code,
          retryAfterSeconds: normalized.retryAfterSeconds,
          message:
            normalized.status === 0
              ? normalized.message
              : "No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.",
          title: "Inicio de sesión no completado",
        });
      }
    },
    onSuccess: () => {
      navigate(intended, { replace: true });
    },
  });
}
