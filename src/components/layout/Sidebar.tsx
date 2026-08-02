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

export function Sidebar({ collapsed, onToggleCollapsed, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-panel md:flex",
        collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]",
        "transition-[width] duration-200",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-line px-3 py-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link to="/app/dashboard" aria-label="Ir al Dashboard">
          <ImpactXLogo showText={!collapsed} size={26} />
        </Link>
        {!collapsed ? (
          <IconButton
            icon={PanelLeftClose}
            label="Colapsar menú"
            onClick={onToggleCollapsed}
          />
        ) : null}
      </div>

      <NavList collapsed={collapsed} className="flex-1 overflow-y-auto px-2 py-4" />

      {collapsed ? (
        <div className="flex justify-center border-t border-line py-2">
          <IconButton icon={PanelLeftOpen} label="Expandir menú" onClick={onToggleCollapsed} />
        </div>
      ) : (
        <div className="border-t border-line px-3 py-3 text-xs text-muted">
          ImpactX · Panel web
        </div>
      )}
    </aside>
  );
}