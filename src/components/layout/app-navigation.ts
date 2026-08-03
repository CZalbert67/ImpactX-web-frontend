import type { ComponentType } from "react";
import {
  Activity,
  Bell,
  Car,
  Contact,
  LayoutDashboard,
  MapPinned,
  MessageCircle,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  UserCog,
  UserRound,
  Users,
  type LucideProps,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: ComponentType<LucideProps>;
  soon?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
  { id: "vehiculos", label: "Vehículos", to: "/app/vehicles", icon: Car },
  { id: "familia", label: "Plan familiar", to: "/app/family", icon: Users },
  { id: "monitoreo", label: "Monitoreo", to: "/app/monitoring", icon: ShieldCheck },
  { id: "mensajes", label: "Mensajes", to: "/app/messages", icon: MessageCircle },
  { id: "viajes", label: "Viajes", to: "/app/trips", icon: Activity },
  { id: "rutas", label: "Rutas", to: "/app/routes", icon: MapPinned },
  { id: "alertas", label: "Alertas", to: "/app/alerts", icon: TriangleAlert },
  { id: "incidentes", label: "Incidentes", to: "/app/incidents", icon: ShieldAlert },
  { id: "contactos", label: "Contactos", to: "/app/contacts", icon: Contact },
  { id: "notificaciones", label: "Notificaciones", to: "/app/notifications", icon: Bell },
  { id: "perfil", label: "Perfil", to: "/app/profile", icon: UserRound },
  { id: "configuracion", label: "Configuración", to: "/app/settings", icon: Settings },
  { id: "cuenta", label: "Cuenta y privacidad", to: "/app/account", icon: UserCog },
] as const;

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => pathname.startsWith(item.to));
}
