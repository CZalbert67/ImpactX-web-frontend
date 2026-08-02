import { NavLink } from "react-router";
import { Clock3 } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/app-navigation";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function NavList({ collapsed = false, onNavigate, className }: NavListProps) {
  return (
    <nav aria-label="Navegación principal" className={cn("space-y-1", className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === "/app/dashboard"}
            onClick={onNavigate}
            title={item.label}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]",
                collapsed ? "justify-center" : "justify-start",
isActive
                  ? "bg-panel-raised font-medium text-primary"
                  : "text-muted hover:bg-panel-soft hover:text-secondary",
              )
            }
          >
            <Icon className="size-5 shrink-0 text-current" aria-hidden="true" />
            {!collapsed ? (
              <span className="flex-1 truncate">{item.label}</span>
            ) : null}
            {!collapsed && item.soon ? (
              <Badge tone="neutral" className="shrink-0" icon={<Clock3 className="size-3" aria-hidden="true" />}>
                Próx.
              </Badge>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
}