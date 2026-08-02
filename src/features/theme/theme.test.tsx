import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import {
  DEFAULT_THEME,
  STORAGE_KEYS,
  THEMES,
  type ThemeId,
} from "@/lib/constants";
import {
  applyThemeToDocument,
  readStoredTheme,
  useThemeStore,
} from "@/features/theme/theme.store";

function renderSelector() {
  return render(<ThemeSelector />);
}

describe("Sistema de temas", () => {
  it("ImpactX Neon es el tema predeterminado", () => {
    expect(DEFAULT_THEME).toBe("impactx-neon");
    expect(readStoredTheme()).toBe("impactx-neon");
    useThemeStore.setState({ theme: "impactx-neon" });
    expect(useThemeStore.getState().theme).toBe("impactx-neon");
  });

  it("el selector muestra los tres temas y el activo queda marcado", () => {
    useThemeStore.setState({ theme: "impactx-neon" });
    const { container } = renderSelector();

    const group = screen.getByRole("group", { name: /temas de apariencia/i });
    const buttons = within(group).getAllByRole("button");
    expect(buttons).toHaveLength(THEMES.length);

    const active = group.querySelector('[aria-pressed="true"]');
    expect(active?.textContent).toContain("ImpactX");
    void container;
  });

  it("seleccionar un tema lo persiste y lo aplica en <html>", async () => {
    const user = userEvent.setup();
    useThemeStore.setState({ theme: "impactx-neon" });
    applyThemeToDocument("impactx-neon");
    renderSelector();

    const professional = screen.getByRole("button", {
      name: "Profesional",
    });
    await user.click(professional);

    expect(useThemeStore.getState().theme).toBe("impactx-professional");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe(
      "impactx-professional",
    );
    expect(document.documentElement.dataset.theme).toBe(
      "impactx-professional",
    );
  });

  it("respeta el tema persistido al volver a montar", () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "impactx-light" as ThemeId);
    const stored = readStoredTheme();
    useThemeStore.setState({ theme: stored });
    renderSelector();

    expect(
      screen.getByRole("button", { name: "Claro" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(useThemeStore.getState().theme).toBe("impactx-light");
  });
});