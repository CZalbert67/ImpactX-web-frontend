import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link } from "react-router";
import { ImpactXLogo } from "@/components/branding/ImpactXLogo";
import { NavList } from "@/components/layout/NavList";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  className?: string;
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  className,
}: SidebarProps) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const toggleLabel = collapsed ? "Expandir menú" : "Colapsar menú";

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-panel md:flex",
        collapsed
          ? "w-[var(--sidebar-width-collapsed)]"
          : "w-[var(--sidebar-width)]",
        "transition-[width] duration-200",
        className,
      )}
    >
      <div
        className={cn(
          "flex border-b border-line px-3 py-3",
          collapsed
            ? "flex-col items-center gap-2"
            : "items-center justify-between",
        )}
      >
        <Link to="/app/dashboard" aria-label="Ir al Dashboard">
          <ImpactXLogo showText={!collapsed} size={26} />
        </Link>
        <IconButton
          icon={ToggleIcon}
          label={toggleLabel}
          onClick={onToggleCollapsed}
        />
      </div>

      <NavList
        collapsed={collapsed}
        className="min-h-0 flex-1 overflow-y-auto px-2 py-4"
      />

      {!collapsed ? (
        <div className="border-t border-line px-3 py-3 text-xs text-muted">
          ImpactX · Panel web
        </div>
      ) : null}
    </aside>
  );
}
