import { describe, expect, it } from "vitest";
import {
  registerSchema,
  toRegisterRequest,
} from "@/features/auth/schemas/register.schema";

const valid = {
  nombre: "María López",
  correo: "maria@ejemplo.com",
  password: "secreto123",
};

describe("registerSchema", () => {
  it("acepta un registro válido sin teléfono", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("acepta teléfono dentro del límite", () => {
    const result = registerSchema.safeParse({
      ...valid,
      telefono: "521234567890",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza teléfonos de más de 20 caracteres", () => {
    const result = registerSchema.safeParse({
      ...valid,
      telefono: "1".repeat(21),
    });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña corta (mínimo 8)", () => {
    const result = registerSchema.safeParse({ ...valid, password: "abc1234" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre vacío", () => {
    const result = registerSchema.safeParse({ ...valid, nombre: " " });
    expect(result.success).toBe(false);
  });

  it("rechaza correo no válido", () => {
    const result = registerSchema.safeParse({ ...valid, correo: "malo" });
    expect(result.success).toBe(false);
  });

  it("toRegisterRequest omite teléfono si queda vacío", () => {
    const request = toRegisterRequest({ ...valid, telefono: "   " });
    expect(request.telefono).toBeUndefined();
    expect(request.client).toBe("web");
  });

  it("toRegisterRequest conserva un teléfono válido", () => {
    const request = toRegisterRequest({ ...valid, telefono: "521234567890" });
    expect(request.telefono).toBe("521234567890");
  });
});