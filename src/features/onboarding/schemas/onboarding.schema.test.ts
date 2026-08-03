import { describe, expect, it } from "vitest";
import {
  medicalOnboardingSchema,
  protectionOnboardingSchema,
  vehicleOnboardingSchema,
} from "@/features/onboarding/schemas/onboarding.schema";

describe("onboarding de registro", () => {
  it("acepta un vehículo compatible con el contrato V1", () => {
    expect(
      vehicleOnboardingSchema.safeParse({
        tipoVehiculo: "Automovil",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2025,
        velocidadPromedio: 45,
        usoPrincipalVehiculo: "Mixto",
        color: "Blanco",
        placa: "ABC-123",
      }).success,
    ).toBe(true);
  });

  it("rechaza vehículos fuera de los límites del backend", () => {
    expect(
      vehicleOnboardingSchema.safeParse({
        tipoVehiculo: "Automovil",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 1800,
        velocidadPromedio: 400,
        usoPrincipalVehiculo: "Mixto",
        color: "",
        placa: "",
      }).success,
    ).toBe(false);
  });

  it("permite omitir todos los campos médicos", () => {
    expect(
      medicalOnboardingSchema.safeParse({
        tipoSangre: "",
        alergias: "",
        condiciones: "",
        medicamentos: "",
        nota: "",
      }).success,
    ).toBe(true);
  });

  it("exige relación para un contacto de emergencia", () => {
    expect(
      protectionOnboardingSchema.safeParse({
        invitationKind: "contact",
        targetType: "username",
        target: "persona_confianza",
        relationship: "",
        priority: "Primary",
        makePrimaryWhenAccepted: true,
      }).success,
    ).toBe(false);
  });

  it("acepta una invitación de monitor por ID público", () => {
    expect(
      protectionOnboardingSchema.safeParse({
        invitationKind: "monitor",
        targetType: "publicProfileId",
        target: "PUB-123456",
        relationship: "",
        priority: "Secondary",
        makePrimaryWhenAccepted: false,
      }).success,
    ).toBe(true);
  });
});
