import { describe, expect, it } from "vitest";
import {
  registerSchema,
  toRegisterRequest,
} from "@/features/auth/schemas/register.schema";

const valid = {
  nombre: "María López",
  username: "maria.lopez",
  correo: "maria@ejemplo.com",
  telefono: "521234567890",
  password: "Secreto123!",
  confirmPassword: "Secreto123!",
  termsAccepted: true,
  privacyAccepted: true,
  locationIncidentConsent: false,
  drivingPatternConsent: false,
};

describe("registerSchema", () => {
  it("acepta el contrato de registro V2 completo", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza un usuario fuera del patrón", () => {
    expect(
      registerSchema.safeParse({ ...valid, username: "usuario..doble" }).success,
    ).toBe(false);
  });

  it("acepta separadores telefónicos compatibles con el backend", () => {
    expect(
      registerSchema.safeParse({ ...valid, telefono: "+52 (123) 456-7890" }).success,
    ).toBe(true);
  });

  it("rechaza teléfonos con caracteres inválidos o fuera de 7 a 15 dígitos", () => {
    expect(
      registerSchema.safeParse({ ...valid, telefono: "+52 123 ABC" }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...valid, telefono: "123456" }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...valid, telefono: "1".repeat(16) }).success,
    ).toBe(false);
  });

  it("exige una contraseña fuerte", () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        password: "password123",
        confirmPassword: "password123",
      }).success,
    ).toBe(false);
  });

  it("exige que las contraseñas coincidan", () => {
    expect(
      registerSchema.safeParse({ ...valid, confirmPassword: "Otra123!" }).success,
    ).toBe(false);
  });

  it("exige términos y privacidad", () => {
    expect(registerSchema.safeParse({ ...valid, termsAccepted: false }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, privacyAccepted: false }).success).toBe(false);
  });

  it("toRegisterRequest genera el contrato V2 sin plan controlado por cliente", () => {
    const request = toRegisterRequest(valid);
    expect(request.registrationVersion).toBe(2);
    expect(request.client).toBe("web");
    expect(request.username).toBe("maria.lopez");
    expect(request.telefono).toBe("521234567890");
    expect(request.termsAccepted).toBe(true);
    expect(request.privacyAccepted).toBe(true);
    expect("planActivo" in request).toBe(false);
  });
});
