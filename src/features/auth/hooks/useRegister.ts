import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { AppApiError } from "@/api/errors";
import { authApi } from "@/features/auth/api/authApi";
import {
  toRegisterRequest,
  type RegisterInputValues,
} from "@/features/auth/schemas/register.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { toSnapshot } from "@/features/auth/types/session";

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: RegisterInputValues) => {
      try {
        const response = await authApi.register(toRegisterRequest(values));

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
          status: 400,
          message:
            "No pudimos crear la cuenta con esos datos. Revísalos e inténtalo nuevamente.",
          title: "Registro no completado",
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
              : "No pudimos crear la cuenta con esos datos. Revísalos e inténtalo nuevamente.",
          title: "Registro no completado",
        });
      }
    },
    onSuccess: () => {
      navigate("/onboarding", { replace: true });
    },
  });
}
