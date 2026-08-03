import { z } from "zod";
import {
  VEHICLE_TYPES,
  VEHICLE_USES,
} from "@/features/vehicles/types";

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message);

export const vehicleOnboardingSchema = z.object({
  tipoVehiculo: z.enum(VEHICLE_TYPES),
  marca: z
    .string()
    .trim()
    .min(1, "La marca es obligatoria")
    .max(100, "La marca no puede superar 100 caracteres"),
  modelo: z
    .string()
    .trim()
    .min(1, "El modelo es obligatorio")
    .max(100, "El modelo no puede superar 100 caracteres"),
  ano: z
    .number()
    .int("El año debe ser entero")
    .min(1886, "El año no puede ser menor a 1886")
    .max(2100, "El año no puede ser mayor a 2100"),
  velocidadPromedio: z
    .number()
    .min(0, "La velocidad no puede ser negativa")
    .max(300, "La velocidad no puede superar 300 km/h"),
  usoPrincipalVehiculo: z.enum(VEHICLE_USES),
  color: optionalText(50, "El color no puede superar 50 caracteres"),
  placa: optionalText(20, "La placa no puede superar 20 caracteres"),
});

export type VehicleOnboardingValues = z.infer<typeof vehicleOnboardingSchema>;

export const medicalOnboardingSchema = z.object({
  tipoSangre: optionalText(10, "El tipo de sangre no puede superar 10 caracteres"),
  alergias: optionalText(500, "Las alergias no pueden superar 500 caracteres"),
  condiciones: optionalText(500, "Las condiciones no pueden superar 500 caracteres"),
  medicamentos: optionalText(500, "Los medicamentos no pueden superar 500 caracteres"),
  nota: optionalText(1000, "La nota no puede superar 1000 caracteres"),
});

export type MedicalOnboardingValues = z.infer<typeof medicalOnboardingSchema>;

export const protectionOnboardingSchema = z
  .object({
    invitationKind: z.enum(["contact", "monitor"]),
    targetType: z.enum(["username", "publicProfileId", "email"]),
    target: z
      .string()
      .trim()
      .min(2, "Escribe el usuario, ID público o correo de la persona")
      .max(256, "El identificador no puede superar 256 caracteres"),
    relationship: optionalText(100, "La relación no puede superar 100 caracteres"),
    priority: z.enum(["Primary", "Secondary"]),
    makePrimaryWhenAccepted: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.invitationKind === "contact" && values.relationship.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["relationship"],
        message: "Indica qué relación tiene contigo",
      });
    }

    if (values.targetType === "email") {
      const email = z.string().email().safeParse(values.target);
      if (!email.success) {
        context.addIssue({
          code: "custom",
          path: ["target"],
          message: "Escribe un correo válido",
        });
      }
    }
  });

export type ProtectionOnboardingValues = z.infer<
  typeof protectionOnboardingSchema
>;
