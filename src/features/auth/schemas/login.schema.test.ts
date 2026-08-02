import { describe, expect, it } from "vitest";
import { loginSchema, toLoginRequest } from "@/features/auth/schemas/login.schema";

describe("loginSchema", () => {
  it("acepta correo o username y contraseña", () => {
    expect(loginSchema.safeParse({ identifier: "ana@ejemplo.com", password: "secreto123" }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: "ana.usuario", password: "secreto123" }).success).toBe(true);
  });

  it("rechaza un identificador vacío", () => {
    expect(loginSchema.safeParse({ identifier: " ", password: "secreto123" }).success).toBe(false);
  });

  it("rechaza una contraseña vacía", () => {
    expect(loginSchema.safeParse({ identifier: "ana.usuario", password: "" }).success).toBe(false);
  });

  it("no supera 256 caracteres", () => {
    expect(loginSchema.safeParse({ identifier: "a".repeat(257), password: "secreto123" }).success).toBe(false);
  });

  it("genera siempre una sesión web", () => {
    const request = toLoginRequest({ identifier: "  ana.usuario  ", password: "secreto123" });
    expect(request).toEqual({ identifier: "ana.usuario", password: "secreto123", client: "web" });
  });
});
