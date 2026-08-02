/**
 * Contratos del dashboard. En esta rama (Frontend Foundation) se alimentan
 * con datos de demostración; estas interfaces quedan listas para sustituirse
 * por los modelos reales que devuelva la API cuando se integren los módulos.
 */

export type DashboardTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

export interface SafetyStatus {
  label: string;
  tone: DashboardTone;
  detail: string;
}

export interface ActiveTrip {
  id: string;
  destino: string;
  inicioLocal: string;
  elapsedMinutes: number;
  distanciaKm: number;
}

export interface RecentTrip {
  id: string;
  origen: string;
  destino: string;
  fecha: string;
  distanciaKm: number;
  duracionMin: number;
}

export interface RecentAlert {
  id: string;
  tipo: string;
  descripcion: string;
  nivel: "bajo" | "medio" | "alto" | "crítico";
  fecha: string;
}

export interface WearableSummary {
  conectado: boolean;
  modelo: string;
  bateriaPorcentaje: number;
  ultimaSincronizacion: string;
}

export interface ContactSummary {
  id: string;
  nombre: string;
  relacion: string;
  esPrincipal: boolean;
}

export interface NotificationSummary {
  noLeidas: number;
  resumen: string;
}

export interface DashboardDemoData {
  safety: SafetyStatus;
  activeTrip: ActiveTrip | null;
  recentTrips: RecentTrip[];
  recentAlerts: RecentAlert[];
  wearable: WearableSummary;
  contacts: ContactSummary[];
  notifications: NotificationSummary;
  quickActions: Array<{
    id: string;
    label: string;
    to: string;
  }>;
}

/** Estados que podrá cubrir la pantalla una vez conectada a la API. */
export type DashboardState =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: DashboardDemoData };