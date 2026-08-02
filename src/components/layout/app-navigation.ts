import type { ComponentType } from "react";
import {
  Activity,
  Bell,
  Car,
  Contact,
  CreditCard,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Smartphone,
  TriangleAlert,
  UserRound,
  Users,
  Watch,
  type LucideProps,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: ComponentType<LucideProps>;
  soon?: boolean;
}

/**
 * Secciones visibles de la navegación. Dashboard, Viajes y Telemetría son
 * funcionales; el resto se mantienen como «Próximamente». Telemetría
 * conduce al listado de viajes (la telemetría se elige por viaje).
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
  { id: "viajes", label: "Viajes", to: "/app/trips", icon: Car },
  { id: "telemetría", label: "Telemetría", to: "/app/trips", icon: Activity },
  { id: "alertas", label: "Alertas", to: "/app/alertas", icon: TriangleAlert, soon: true },
  { id: "incidentes", label: "Incidentes", to: "/app/incidentes", icon: ShieldAlert, soon: true },
  { id: "wearables", label: "Wearables", to: "/app/wearables", icon: Watch, soon: true },
  { id: "dispositivos", label: "Dispositivos", to: "/app/dispositivos", icon: Smartphone, soon: true },
  { id: "contactos", label: "Contactos", to: "/app/contactos", icon: Contact, soon: true },
  { id: "monitores", label: "Monitores", to: "/app/monitores", icon: Users, soon: true },
  { id: "notificaciones", label: "Notificaciones", to: "/app/notificaciones", icon: Bell, soon: true },
  { id: "suscripcion", label: "Suscripción", to: "/app/suscripcion", icon: CreditCard, soon: true },
  { id: "perfil", label: "Perfil", to: "/app/perfil", icon: UserRound, soon: true },
  { id: "configuracion", label: "Configuración", to: "/app/configuracion", icon: Settings, soon: true },
] as const;

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => pathname.startsWith(item.to));
}