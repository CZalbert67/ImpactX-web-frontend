import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { AppApiError } from "@/api/client";
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
          response.mensaje ?? "No se pudo completar el registro.",
        title: "Registro no completado",
      });
    },
    onSuccess: () => {
      navigate("/app/dashboard", { replace: true });
    },
  });
}