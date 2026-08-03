import { describe, expect, it } from "vitest";
import {
  AppApiError,
  extractErrorMessage,
  userSafeErrorMessage,
} from "@/api/errors";

function makeAxiosError(status: number, data: unknown) {
  return {
    config: { url: "/api/v1/auth/register", headers: {} },
    response: { status, data },
  };
}

describe("mensajes de error seguros para el usuario", () => {
  it("no expone detalles RFC 7807 enviados por el backend", () => {
    const err = AppApiError.from(
      makeAxiosError(409, {
        type: "about:blank",
        title: "Conflict",
        status: 409,
        detail: "Índice interno duplicado en la partición Usuarios.",
        instance: "/api/v1/auth/register",
      }),
    );

    expect(err).toBeInstanceOf(AppApiError);
    expect(err.status).toBe(409);
    expect(err.message).toMatch(/no pudimos guardar/i);
    expect(err.message).not.toContain("partición");
    expect(err.detail).toBeUndefined();
    expect(err.data).toBeUndefined();
  });

  it("mapea 401 como error de autenticación sin repetir el backend", () => {
    const err = AppApiError.from(
      makeAxiosError(401, {
        title: "Invalid credentials",
        detail: "Hash Argon2 inválido.",
      }),
    );

    expect(err.status).toBe(401);
    expect(err.isAuthError).toBe(true);
    expect(err.message).toMatch(/sesión no pudo validarse/i);
    expect(err.message).not.toContain("Argon2");
  });

  it("ignora el campo mensaje de AuthResponse", () => {
    const err = AppApiError.from(
      makeAxiosError(400, {
        success: false,
        mensaje: "La colección interna no pudo escribirse.",
      }),
    );

    expect(err.message).toBe("Revisa la información e inténtalo nuevamente.");
  });

  it("reconoce 429 como límite de solicitudes", () => {
    const err = AppApiError.from(makeAxiosError(429, { type: "about:blank" }));
    expect(err.status).toBe(429);
    expect(err.message).toMatch(/varios intentos/i);
  });

  it("los errores de red no muestran Network Error", () => {
    const err = AppApiError.from(new TypeError("Network Error"));
    expect(err.status).toBe(0);
    expect(err.code).toBe("network");
    expect(err.message).toMatch(/no pudimos conectarnos/i);
    expect(err.message).not.toContain("Network Error");
  });

  it("extractErrorMessage nunca devuelve datos crudos del payload", () => {
    expect(
      extractErrorMessage(
        { detail: "SQL timeout", title: "Internal error", mensaje: "x" },
        500,
      ),
    ).toMatch(/inconveniente/i);
    expect(extractErrorMessage(null, 0)).toMatch(/no pudimos conectarnos/i);
  });

  it("userSafeErrorMessage aplica fallback para errores desconocidos", () => {
    expect(userSafeErrorMessage(new Error("stack interno"))).toBe(
      "No pudimos completar la operación. Inténtalo nuevamente.",
    );
  });
});
