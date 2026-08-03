export interface AlertItem {
  id: string;
  tipo: string;
  severidad: string;
  estado: string;
  lat: number;
  lng: number;
  lugar: string | null;
  gForce: string | null;
  decibeles: string | null;
  frecuenciaCardiaca: string | null;
  modo: string;
  canal: string | null;
  viajeId: string | null;
  esBypassCritico: boolean;
  esOffline: boolean;
  tiempoRespuesta: string | null;
  creadoEn: string;
  enviadaEn: string | null;
  confirmadaEn: string | null;
  cerradaEn: string | null;
  metodoCierre: string | null;
  nota: string | null;
  timeline: string[][];
  contactosNotificados: string[];
}

export interface IncidentItem {
  id: string;
  alertaId: string;
  tipo: string;
  severidad: string;
  estado: string;
  lat: number;
  lng: number;
  lugar: string | null;
  metodoCierre: string;
  esFalsaAlarma: boolean;
  creadoEn: string;
  actualizadoEn: string;
  cerradaEn: string | null;
}

export interface IncidentDetail extends IncidentItem {
  gForce: string | null;
  decibeles: string | null;
  frecuenciaCardiaca: string | null;
  canal: string | null;
  viajeId: string | null;
  sourceTelemetryEventId: string | null;
  detectionLabel: string | null;
  ruleVersion: string | null;
  detectionScore: number | null;
  esBypassCritico: boolean;
  esOffline: boolean;
  nota: string | null;
  timeline: string[][];
  contactosNotificados: string[];
  enviadaEn: string | null;
  confirmadaEn: string | null;
}

export interface IncidentFilters {
  severidad?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
  pagina?: number;
  tamano?: number;
}

export interface IncidentActionResponse {
  incidentId: string;
  alertId: string;
  estado: string;
  mensaje: string;
}

export interface IncidentMapData {
  lat: number;
  lng: number;
  lugar: string | null;
  mapsUrl: string;
}

export type EmergencyContactStatus =
  | "LegacyUnverified"
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Revoked"
  | "Blocked"
  | "Expired";

export interface ContactItem {
  publicContactId: string;
  status: EmergencyContactStatus;
  isOwner: boolean;
  ownerPublicProfileId: string;
  ownerUsername: string;
  ownerName: string;
  contactPublicProfileId: string | null;
  contactUsername: string | null;
  contactName: string | null;
  targetEmailHint: string | null;
  relationship: string | null;
  priority: "Primary" | "Secondary" | string;
  isPrimary: boolean;
  requestedAtUtc: string;
  expiresAtUtc: string;
  acceptedAtUtc: string | null;
  rejectedAtUtc: string | null;
  revokedAtUtc: string | null;
  blockedAtUtc: string | null;
  updatedAtUtc: string;
}

export interface ContactInvitationInput {
  username?: string;
  publicProfileId?: string;
  email?: string;
  relationship?: string;
  priority: "Primary" | "Secondary";
  makePrimaryWhenAccepted: boolean;
}

export interface ContactInvitationResponse {
  contact: ContactItem;
  manualCode: string;
}

export interface ContactResponseInput {
  publicContactId?: string;
  code?: string;
}

export interface ContactUpdateInput {
  relationship?: string;
  priority?: "Primary" | "Secondary";
}

export interface NotificationItem {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  referenciaId: string | null;
  referenciaTipo: string | null;
  leida: boolean;
  leidaEn: string | null;
  creadoEn: string;
}

export interface RouteItem {
  id: string;
  nombre: string;
  origen: string;
  origenLat: number;
  origenLng: number;
  destino: string;
  destinoLat: number;
  destinoLng: number;
  distanciaKm: number;
  duracionEstimadaMin: number;
  esFrecuente: boolean;
  seleccionadaHoy: boolean;
  creadoEn: string;
  usadaEn: string | null;
}

export interface RouteInput {
  nombre: string;
  origen: string;
  origenLat: number;
  origenLng: number;
  destino: string;
  destinoLat: number;
  destinoLng: number;
  distanciaKm: number;
  duracionEstimadaMin: number;
  esFrecuente: boolean;
}

export interface UserPreferences {
  notificacionesPush: boolean;
  notificacionesEmail: boolean;
  compartirUbicacion: boolean;
  idioma: string | null;
  unidadVelocidad: string | null;
}

export interface DriverProfile {
  tipoVehiculo: string | null;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  color: string | null;
  placa: string | null;
  uso: string | null;
  velocidadPromedioLabel: string | null;
}

export interface MedicalProfile {
  tipoSangre: string | null;
  alergias: string | null;
  condiciones: string | null;
  medicamentos: string | null;
  nota: string | null;
}

export interface Onboarding {
  status: string;
  currentStep: number;
  medicalProfileStatus: string;
  termsAccepted?: boolean;
  termsVersion?: string | null;
  privacyAccepted: boolean;
  privacyNoticeVersion?: string | null;
  locationIncidentConsent: boolean;
  drivingPatternConsent: boolean;
  completedAtUtc: string | null;
  updatedAtUtc: string | null;
}

export interface UserProfile {
  id: string;
  publicProfileId: string;
  username: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  planActivo: string | null;
  emailConfirmed: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  onboarding: Onboarding | null;
  perfilConduccion: DriverProfile | null;
  fichaMedica: MedicalProfile | null;
  preferencias: UserPreferences | null;
}

export interface SettingsData {
  idioma: string | null;
  unidadVelocidad: string | null;
  notificacionesPush: boolean;
  notificacionesEmail: boolean;
  compartirUbicacion: boolean;
  twoFactorEnabled: boolean;
}

export interface Setup2FaResponse {
  secret: string;
  qrCodeUri: string;
  manualKey: string;
}

export interface PagedBody<T> {
  items: T[];
  continuationToken: string | null;
  hasMoreResults: boolean;
  pageSize: number;
}
