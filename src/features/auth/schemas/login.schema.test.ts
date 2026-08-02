import { describe, expect, it } from "vitest";
import { loginSchema, toLoginRequest } from "@/features/auth/schemas/login.schema";

describe("loginSchema", () => {
  it("acepta correo y contraseña válidos", () => {
    const result = loginSchema.safeParse({
      correo: "ana@ejemplo.com",
      password: "secreto123",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    const result = loginSchema.safeParse({
      correo: "no-es-correo",
      password: "secreto123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/correo/i);
    }
  });

  it("rechaza una contraseña vacía", () => {
    const result = loginSchema.safeParse({
      correo: "ana@ejemplo.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("no supera 256 caracteres en el correo", () => {
    const tooLong = `${"a".repeat(250)}@ejemplo.com`;
    const result = loginSchema.safeParse({
      correo: tooLong,
      password: "secreto123",
    });
    expect(result.success).toBe(false);
  });

  it("toLoginRequest recorta el correo", () => {
    const request = toLoginRequest({
      correo: "  ana@ejemplo.com  ",
      password: "secreto123",
    });
    expect(request.correo).toBe("ana@ejemplo.com");
    expect(request.password).toBe("secreto123");
  });
});