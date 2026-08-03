import type { Trip } from "@/features/trips/types";

export type MonitoringRelationshipStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Revoked"
  | "Blocked"
  | "Expired";

export type MonitoringRequestDirection =
  | "MonitorInvitesMonitored"
  | "MonitoredRequestsMonitor";

export interface MonitoringPermissions {
  viewRoutes: boolean;
  viewLocation: boolean;
  viewEmergencyLocation: boolean;
  viewIncidents: boolean;
  receiveCriticalAlerts: boolean;
  viewMedicalProfile: boolean;
  sendMessages: boolean;
  viewTelemetry: boolean;
  receiveNotifications: boolean;
}

export interface MonitoringInvitationPermissions {
  viewRoutes: boolean;
  viewLocation: boolean;
  viewEmergencyLocation: boolean;
  viewIncidents: boolean;
  receiveCriticalAlerts: boolean;
  sendMessages: boolean;
  viewTelemetry: boolean;
  receiveNotifications: boolean;
}

export interface MonitoringRelationship {
  publicRelationshipId: string;
  status: MonitoringRelationshipStatus;
  direction: MonitoringRequestDirection;
  monitorPublicProfileId: string;
  monitorUsername: string;
  monitorName: string;
  monitoredPublicProfileId: string | null;
  monitoredUsername: string | null;
  monitoredName: string | null;
  permissions: MonitoringPermissions;
  requestedAtUtc: string;
  expiresAtUtc: string;
  acceptedAtUtc: string | null;
  revokedAtUtc: string | null;
}

export interface CreateMonitoringInvitationInput {
  username?: string;
  publicProfileId?: string;
  email?: string;
  direction: MonitoringRequestDirection;
  permissions: MonitoringInvitationPermissions;
}

export interface CreateMonitoringInvitationResponse {
  relationship: MonitoringRelationship;
  manualCode: string;
}

export interface MonitoringResponseInput {
  publicRelationshipId?: string;
  code?: string;
}

export interface UpdateMonitoringPermissionsInput extends MonitoringPermissions {
  confirmMedicalConsent: boolean;
}

export interface MonitoredAlert {
  id: string;
  tipo: string;
  severidad: string;
  estado: string;
  lat: number;
  lng: number;
  lugar: string | null;
  creadoEn: string;
  cerradaEn: string | null;
}

export interface MonitoredIncident {
  id: string;
  severidad: string;
  lat: number;
  lng: number;
  lugar: string | null;
  metodoCierre: string;
  esFalsaAlarma: boolean;
  creadoEn: string;
  cerradaEn: string | null;
}

export interface MonitoredRoute {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  duracionEstimadaMin: number;
  esFrecuente: boolean;
  usadaEn: string | null;
}

export interface MedicalProfile {
  tipoSangre: string | null;
  alergias: string | null;
  condiciones: string | null;
  medicamentos: string | null;
  nota: string | null;
}

export interface MonitoredOverview {
  trips: Trip[];
  alerts: MonitoredAlert[];
  incidents: MonitoredIncident[];
  frequentRoutes: MonitoredRoute[];
  routeHistory: MonitoredRoute[];
  medicalProfile: MedicalProfile | null;
}
