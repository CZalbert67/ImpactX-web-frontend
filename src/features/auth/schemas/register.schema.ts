import { z } from "zod";
import type { RegisterRequest } from "@/features/auth/types/api";

export const registerSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre no puede superar 200 caracteres"),
  correo: z
    .email("Debe ser un correo válido")
    .max(256, "El correo no puede superar 256 caracteres"),
  telefono: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar 20 caracteres")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña no puede superar 100 caracteres"),
});

export type RegisterInputValues = z.infer<typeof registerSchema>;

export function toRegisterRequest(values: RegisterInputValues): RegisterRequest {
  const telefono = values.telefono?.trim();
  return {
    nombre: values.nombre.trim(),
    correo: values.correo.trim(),
    password: values.password,
    telefono: telefono && telefono.length > 0 ? telefono : undefined,
    client: "web",
  };
}
