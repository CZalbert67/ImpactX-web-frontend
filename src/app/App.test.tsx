import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderApp } from "@/test/test-utils";

describe("App (render de la aplicación)", () => {
  it("renderiza la pantalla de login cuando no hay sesión", async () => {
    renderApp({ initialEntries: ["/"] });

    expect(
      await screen.findByRole("heading", { name: /inicia sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/correo electrónico/i),
    ).toBeInTheDocument();
  });

  it("no registra tokens en el DOM", async () => {
    renderApp({ initialEntries: ["/"] });

    await screen.findByRole("heading", { name: /inicia sesión/i });
    const html = document.body.textContent ?? "";
    expect(html).not.toContain("access-token");
    expect(html).not.toContain("refresh-token");
  });
});