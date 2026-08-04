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

  it("rechaza una invitación de grupo con correo inválido", () => {
    expect(
      protectionOnboardingSchema.safeParse({
        targetType: "email",
        target: "correo-invalido",
      }).success,
    ).toBe(false);
  });

  it("acepta una invitación de grupo por ID público", () => {
    expect(
      protectionOnboardingSchema.safeParse({
        targetType: "publicProfileId",
        target: "PUB-123456",
      }).success,
    ).toBe(true);
  });
});
