import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDismissOn } from "@/hooks/useDisclosure";
import { cn } from "@/lib/cn";

function initialsOf(name: string | null | undefined): string {
  if (!name) return "IX";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const [first, second] = parts;
  return String(first?.[0] ?? "").toUpperCase() + String(second?.[0] ?? first?.[0] ?? "").toUpperCase();
}

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const logout = useLogout();
  const containerRef = useDismissOn<HTMLDivElement>(open, () => setOpen(false));

  const displayName = user?.nombre || user?.username || "Cuenta";
  const initials = initialsOf(user?.nombre || user?.username);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menú de usuario: ${displayName}`}
        className="focus-ring flex items-center gap-2 rounded-lg border border-line bg-panel-soft px-2 py-1.5 text-sm transition-colors hover:bg-panel-raised"
      >
        <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-panel-elevated text-xs font-bold text-brand">
          {initials}
        </span>
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

{open ? (
        <div
          role="menu"
          aria-label="Opciones de cuenta"
          className="absolute right-0 top-full z-30 mt-1 w-60 rounded-xl border border-border bg-panel-elevated p-1.5 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted">{user?.correo}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout.mutate();
            }}
            disabled={logout.isPending}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:bg-panel-soft hover:text-error"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {logout.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
        </div>
      ) : null}
    </div>
  );
}