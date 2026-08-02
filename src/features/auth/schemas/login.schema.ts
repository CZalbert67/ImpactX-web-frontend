import { z } from "zod";
import type { LoginRequest } from "@/features/auth/types/api";

/**
 * Validación alineada al backend:
 *   LoginRequest { correo (email, max 256), password (obligatorio) }
 */
export const loginSchema = z.object({
  correo: z
    .email({ message: "Ingresa un correo válido" })
    .max(256, "El correo no puede superar 256 caracteres"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function toLoginRequest(values: LoginFormValues): LoginRequest {
  return {
    correo: values.correo.trim(),
    password: values.password,
  };
}