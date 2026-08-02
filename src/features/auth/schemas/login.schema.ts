import { z } from "zod";
import type { LoginRequest } from "@/features/auth/types/api";

/** El backend permite iniciar sesión con correo o nombre de usuario. */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "El correo o usuario es obligatorio")
    .max(256, "El identificador no puede superar 256 caracteres"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function toLoginRequest(values: LoginFormValues): LoginRequest {
  return {
    identifier: values.identifier.trim(),
    password: values.password,
    client: "web",
  };
}
