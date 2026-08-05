import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderApp } from "@/test/test-utils";

describe("App (render de la aplicación)", () => {
  it("renderiza la presentación pública cuando no hay sesión", async () => {
    renderApp({ initialEntries: ["/"] });

    expect(
      await screen.findByRole("heading", { name: /tu viaje, acompañado desde la muñeca/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver en mercado libre/i }),
    ).toHaveAttribute("target", "_blank");
  });

  it("no registra tokens en el DOM", async () => {
    renderApp({ initialEntries: ["/"] });

    await screen.findByRole("heading", { name: /tu viaje, acompañado desde la muñeca/i });
    const html = document.body.textContent ?? "";
    expect(html).not.toContain("access-token");
    expect(html).not.toContain("refresh-token");
  });
});
