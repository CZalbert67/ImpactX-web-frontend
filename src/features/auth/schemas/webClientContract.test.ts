import { describe, expect, it } from "vitest";
import { toLoginRequest } from "@/features/auth/schemas/login.schema";
import { toRegisterRequest } from "@/features/auth/schemas/register.schema";

describe("contrato de capacidades del cliente web", () => {
  it("marca login y registro como cliente web", () => {
    expect(toLoginRequest({ identifier: "usuario", password: "password123" }).client).toBe("web");
    expect(toRegisterRequest({ nombre: "Usuario", correo: "usuario@example.com", password: "password123" }).client).toBe("web");
  });
});
