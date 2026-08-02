import { describe, expect, it } from "vitest";
import {
  AppApiError,
  extractErrorMessage,
} from "@/api/errors";

function makeAxiosError(status: number, data: unknown) {
  return {
    config: { url: "/api/v1/auth/register", headers: {} },
    response: { status, data },
  };
}

describe("normalización de ProblemDetails", () => {
  it("convierte un cuerpo RFC 7807 en AppApiError con detalles", () => {
    const axiosError = makeAxiosError(409, {
      type: "about:blank",
      title: "Conflict",
      status: 409,
      detail: "Este correo ya está registrado.",
      instance: "/api/v1/auth/register",
    });

    const err = AppApiError.from(axiosError);
    expect(err).toBeInstanceOf(AppApiError);
    expect(err.status).toBe(409);
    expect(err.message).toBe("Este correo ya está registrado.");
    expect(err.detail).toBe("Este correo ya está registrado.");
    expect(err.isAuthError).toBe(false);
  });

  it("mapea 401 como error de autenticación", () => {
    const axiosError = makeAxiosError(401, {
      type: "about:blank",
      title: "Invalid credentials",
      detail: "Credenciales inválidas.",
    });
    const err = AppApiError.from(axiosError);
    expect(err.status).toBe(401);
    expect(err.isAuthError).toBe(true);
    expect(err.message).toBe("Credenciales inválidas.");
  });

  it("interpreta el campo mensaje de AuthResponse", () => {
    const axiosError = makeAxiosError(401, {
      success: false,
      token: null,
      mensaje: "El correo o la contraseña son incorrectos.",
      usuario: null,
    });
    const err = AppApiError.from(axiosError);
    expect(err.message).toBe("El correo o la contraseña son incorrectos.");
  });

  it("reconoce 429 como límite de solicitudes", () => {
    const err = AppApiError.from(
      makeAxiosError(429, { type: "about:blank" }),
    );
    expect(err.status).toBe(429);
    expect(err.message).toMatch(/demasiadas solicitudes/i);
  });

  it("los errores de red no exponen detalles del payload", () => {
    const err = AppApiError.from(new TypeError("Network Error"));
    expect(err.status).toBe(0);
    expect(err.code).toBe("network");
    expect(err.message).not.toContain("token");
  });

  it("extractErrorMessage prioriza detail > title > message > mensaje", () => {
    expect(
      extractErrorMessage({ detail: "d", title: "t", message: "m", mensaje: "x" }, 400),
    ).toBe("d");
    expect(extractErrorMessage({ title: "t", message: "m" }, 400)).toBe("t");
    expect(extractErrorMessage({ message: "m" }, 400)).toBe("m");
    expect(extractErrorMessage({ mensaje: "x" }, 409)).toBe("x");
    expect(extractErrorMessage(null, 0)).toMatch(/no se pudo conectar/i);
  });
});