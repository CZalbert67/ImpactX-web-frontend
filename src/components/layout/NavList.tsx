import { Clock3 } from "lucide-react";
import { NavLink } from "react-router";
import { NAV_ITEMS } from "@/components/layout/app-navigation";
import { Badge } from "@/components/ui/Badge";
import { useIncomingFamilyInvitations } from "@/features/family/hooks";
import { useQuickMessageUnreadCount } from "@/features/messages/hooks";
import { useNotifications } from "@/features/platform/hooks";
import { cn } from "@/lib/cn";

export interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

function visibleCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function NavList({ collapsed = false, onNavigate, className }: NavListProps) {
  const incomingFamilyInvitations = useIncomingFamilyInvitations();
  const unreadMessages = useQuickMessageUnreadCount();
  const notifications = useNotifications();

  const liveCounts: Record<string, number> = {
    familia: incomingFamilyInvitations.data?.length ?? 0,
    mensajes: unreadMessages.data ?? 0,
    notificaciones:
      notifications.data?.filter((notification) => !notification.leida).length ?? 0,
  };

  return (
    <nav aria-label="Navegación principal" className={cn("space-y-1", className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const count = liveCounts[item.id] ?? 0;
        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === "/app/dashboard"}
            onClick={onNavigate}
            title={count > 0 ? `${item.label}: ${count} pendiente${count === 1 ? "" : "s"}` : item.label}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]",
                collapsed ? "justify-center" : "justify-start",
                isActive
                  ? "bg-panel-raised font-medium text-primary"
                  : "text-muted hover:bg-panel-soft hover:text-secondary",
              )
            }
          >
            <Icon className="size-5 shrink-0 text-current" aria-hidden="true" />
            {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
            {count > 0 ? (
              <span
                aria-label={`${count} pendiente${count === 1 ? "" : "s"}`}
                className={cn(
                  "grid min-w-5 place-items-center rounded-full bg-[var(--color-primary)] px-1.5 text-[0.65rem] font-bold leading-5 text-[var(--color-bg-main)]",
                  collapsed && "absolute right-0.5 top-0.5 min-w-4 px-1 leading-4",
                )}
              >
                {visibleCount(count)}
              </span>
            ) : null}
            {!collapsed && item.soon ? (
              <Badge
                tone="neutral"
                className="shrink-0"
                icon={<Clock3 className="size-3" aria-hidden="true" />}
              >
                Próx.
              </Badge>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
}
