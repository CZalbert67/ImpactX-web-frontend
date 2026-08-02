import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "@/test/test-utils";

describe("Rutas protegidas y públicas", () => {
  it("ProtectedRoute sin sesión redirige a /login y conserva la ubicación", async () => {
    renderApp({ initialEntries: ["/app/dashboard"] });

    expect(
      await screen.findByRole("heading", { name: /inicia sesión/i }),
    ).toBeInTheDocument();
  });

  it("PublicRoute con sesión evita volver al login", async () => {
    renderApp({ initialEntries: ["/login"], authenticated: true });

    expect(
      await screen.findByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it("permite navegar a /register sin sesión", async () => {
    renderApp({ initialEntries: ["/login"] });

    const registerLink = await screen.findByRole("link", {
      name: /regístrate/i,
    });
    await userEvent.click(registerLink);

    expect(await screen.findByRole("heading", { name: /crea tu cuenta/i })).toBeInTheDocument();
  });

  it("404 muestra la página «No encontrada»", async () => {
    renderApp({ initialEntries: ["/ruta/inexistente"] });

    expect(
      await screen.findByRole("heading", { name: /página no encontrada/i }),
    ).toBeInTheDocument();
  });
});