import type { DashboardDemoData } from "@/features/dashboard/types";

/**
 * Datos de DEMOSTRACIÓN de la Frontend Foundation.
 *
 * No provienen de la API real. Se dejan explícitamente marcados en la
 * interfaz con una insignia «Datos demo» y se sustituirán por datos reales
 * cuando se conecten los módulos de viajes/telemetría/alertas.
 */
export const DASHBOARD_DEMO_DATA: DashboardDemoData = {
  safety: {
    label: "Buen estado general",
    tone: "success",
    detail: "Sin alertas críticas en las últimas 24 horas.",
  },
  activeTrip: {
    id: "demo-trip-1",
    destino: "Centro de Guadalajara",
    inicioLocal: "08:35",
    elapsedMinutes: 24,
    distanciaKm: 12.4,
  },
  recentTrips: [
    {
      id: "demo-trip-2",
      origen: "Casa",
      destino: "Oficina",
      fecha: "Hoy · 08:10",
      distanciaKm: 9.8,
      duracionMin: 22,
    },
    {
      id: "demo-trip-3",
      origen: "Gimnasio",
      destino: "Casa",
      fecha: "Ayer · 19:42",
      distanciaKm: 6.2,
      duracionMin: 15,
    },
  ],
  recentAlerts: [
    {
      id: "demo-alert-1",
      tipo: "Frenado repentino",
      descripcion: "Registrado sin impacto. Revisado por ti.",
      nivel: "medio",
      fecha: "Hace 2 horas",
    },
  ],
  wearable: {
    conectado: true,
    modelo: "ImpactX Band (simulación)",
    bateriaPorcentaje: 76,
    ultimaSincronizacion: "Hace 2 minutos",
  },
  contacts: [
    {
      id: "demo-contact-1",
      nombre: "Ana López",
      relacion: "Principal",
      esPrincipal: true,
    },
    {
      id: "demo-contact-2",
      nombre: "Carlos Ruiz",
      relacion: "Familiar",
      esPrincipal: false,
    },
  ],
  notifications: {
    noLeidas: 3,
    resumen: "Resumen de notificaciones de tu cuenta.",
  },
  quickActions: [
    { id: "qa-viajes", label: "Iniciar viaje", to: "/app/viajes" },
    { id: "qa-alertas", label: "Ver alertas", to: "/app/alertas" },
    { id: "qa-wearable", label: "Sincronizar wearable", to: "/app/wearables" },
  ],
};