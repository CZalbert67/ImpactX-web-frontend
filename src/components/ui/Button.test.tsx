import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("en estado loading bloquea el envío doble", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Button type="submit" loading>
          Guardar
        </Button>
      </form>,
    );

    const button = screen.getByRole("button", { name: /guardar/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await user.click(button);
    await user.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cuando NO está en loading, dispara el submit correctamente", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Button type="submit">Guardar</Button>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: /guardar/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});