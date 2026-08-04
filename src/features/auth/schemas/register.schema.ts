import { z } from "zod";
import type { RegisterRequest } from "@/features/auth/types/api";

const usernamePattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9._]*[a-zA-Z0-9])?$/;
const phonePattern = /^[0-9+ ()-]+$/;
const reservedUsernames = new Set([
  "impactx",
  "admin",
  "support",
  "soporte",
  "root",
  "system",
  "contact",
  "contacto",
  "privacy",
  "privacidad",
  "staff",
  "test",
]);

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(200, "El nombre no puede superar 200 caracteres"),
    username: z
      .string()
      .trim()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .max(30, "El usuario no puede superar 30 caracteres")
      .regex(
        usernamePattern,
        "Usa letras, números, punto o guion bajo.",
      )
      .refine((value) => !value.includes(".."), {
        message: "El usuario no puede contener puntos consecutivos",
      })
      .refine((value) => !reservedUsernames.has(value.toLowerCase()), {
        message: "Ese nombre de usuario está reservado",
      }),
    correo: z
      .string()
      .trim()
      .email("Debe ser un correo válido")
      .max(256, "El correo no puede superar 256 caracteres"),
    telefono: z
      .string()
      .trim()
      .min(1, "El teléfono es obligatorio")
      .max(20, "El teléfono no puede superar 20 caracteres")
      .regex(phonePattern, "El teléfono contiene caracteres no válidos")
      .refine((value) => {
        const digitCount = Array.from(value).filter((character) =>
          /[0-9]/.test(character),
        ).length;
        return digitCount >= 7 && digitCount <= 15;
      }, "El teléfono debe contener entre 7 y 15 dígitos"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña no puede superar 100 caracteres")
      .regex(/[A-Z]/, "Incluye al menos una mayúscula")
      .regex(/[a-z]/, "Incluye al menos una minúscula")
      .regex(/[0-9]/, "Incluye al menos un número")
      .regex(/[^a-zA-Z0-9]/, "Incluye al menos un carácter especial"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    termsAccepted: z
      .boolean()
      .refine((value) => value, "Debes aceptar los términos de uso"),
    privacyAccepted: z
      .boolean()
      .refine((value) => value, "Debes aceptar el aviso de privacidad"),
    locationIncidentConsent: z.boolean(),
    drivingPatternConsent: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type RegisterInputValues = z.infer<typeof registerSchema>;

export function toRegisterRequest(values: RegisterInputValues): RegisterRequest {
  return {
    registrationVersion: 2,
    nombre: values.nombre.trim(),
    username: values.username.trim(),
    correo: values.correo.trim(),
    telefono: values.telefono.trim(),
    password: values.password,
    termsAccepted: true,
    privacyAccepted: true,
    locationIncidentConsent: values.locationIncidentConsent,
    drivingPatternConsent: values.drivingPatternConsent,
    client: "web",
  };
}
