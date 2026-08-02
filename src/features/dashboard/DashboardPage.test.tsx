import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "@/test/test-utils";

describe("Página de Dashboard (Frontend Foundation)", () => {
  it("muestra un estado de carga accesible durante la espera", async () => {
    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    await waitFor(() => {
      expect(document.querySelector(".skeleton")).not.toBeNull();
    });

    await screen.findByText(/viajes recientes/i);
  });

  it("da la bienvenida al usuario autenticado", async () => {
    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    expect(
      await screen.findByRole("heading", { name: /hola, maría/i }),
    ).toBeInTheDocument();
  });

  it("renderiza datos demo marcados explícitamente", async () => {
    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    expect(
      (await screen.findAllByText("Datos demo")).length,
    ).toBeGreaterThan(0);
    expect(
      (await screen.findAllByText(/estado general/i)).length,
    ).toBeGreaterThan(0);
    expect(await screen.findByText(/viajes recientes/i)).toBeInTheDocument();
    expect(await screen.findByText(/alertas recientes/i)).toBeInTheDocument();
    expect(await screen.findByText(/impactx band \(simulación\)/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/contactos de emergencia/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/accesos rápidos/i)).toBeInTheDocument();
  });

  it("muestra el viaje activo demo con su destino", async () => {
    renderApp({ initialEntries: ["/app/dashboard"], authenticated: true });

    expect(
      await screen.findByText(/hacia centro de guadalajara/i),
    ).toBeInTheDocument();
  });
});