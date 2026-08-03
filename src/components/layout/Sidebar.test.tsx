import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/layout/Sidebar";


vi.mock("@/features/family/hooks", () => ({
  useIncomingFamilyInvitations: () => ({ data: [] }),
}));
vi.mock("@/features/messages/hooks", () => ({
  useQuickMessageUnreadCount: () => ({ data: 0 }),
}));
vi.mock("@/features/platform/hooks", () => ({
  useNotifications: () => ({ data: [] }),
}));

function renderSidebar(collapsed: boolean, onToggleCollapsed = vi.fn()) {
  render(
    <MemoryRouter>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
      />
    </MemoryRouter>,
  );
  return onToggleCollapsed;
}

describe("Sidebar", () => {
  it("mantiene visible el control para expandir cuando está colapsado", () => {
    const onToggle = renderSidebar(true);

    const button = screen.getByRole("button", { name: "Expandir menú" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("permite colapsar desde el encabezado", () => {
    const onToggle = renderSidebar(false);

    fireEvent.click(
      screen.getByRole("button", { name: "Colapsar menú" }),
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
