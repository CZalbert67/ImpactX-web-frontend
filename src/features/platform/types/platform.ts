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
  severidad: string;
  lat: number;
  lng: number;
  lugar: string | null;
  metodoCierre: string;
  esFalsaAlarma: boolean;
  creadoEn: string;
  cerradaEn: string | null;
}

export interface IncidentDetail extends IncidentItem {
  gForce: string | null;
  decibeles: string | null;
  frecuenciaCardiaca: string | null;
  canal: string | null;
  esBypassCritico: boolean;
  nota: string | null;
  timeline: string[][];
  contactosNotificados: string[];
}

export interface IncidentFilters {
  severidad?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
  pagina?: number;
  tamano?: number;
}

export interface ContactItem {
  id: string;
  nombre: string;
  telefono: string;
  parentesco: string | null;
  username: string | null;
  appUserId: string | null;
  channel: string;
  priority: string;
  esPrincipal: boolean;
  creadoEn: string;
}

export interface ContactInput {
  nombre: string;
  telefono: string;
  parentesco?: string;
  username?: string;
  appUserId?: string;
  priority: string;
  esPrincipal: boolean;
}

export interface ContactUpdateInput {
  nombre?: string;
  telefono?: string;
  parentesco?: string;
  priority?: string;
}

export interface DeviceItem {
  id: string;
  deviceId: string;
  platform: string;
  nombre: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  ultimoUsoEn: string | null;
}

export interface DeviceRegistrationInput {
  deviceId: string;
  platform: string;
  token: string;
  name?: string;
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
  privacyAccepted: boolean;
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

export interface WearableItem {
  id: string;
  dispositivoId: string;
  nombre: string;
  modelo: string;
  vinculadoEn: string;
  ultimaSincronizacion: string | null;
  appVersion: string | null;
  connected: boolean;
  nivelBateria: number;
  calibrado: boolean;
  ultimaCalibracion: string | null;
  permisosOtorgados: string[];
  estado: string;
}

export interface SensorDiagnostics {
  acelerometro: boolean;
  giroscopio: boolean;
  magnetometro: boolean;
  gps: boolean;
  frecuenciaCardiaca: boolean;
  nivelBateria: number;
  ultimoDiagnostico: string;
}

export interface PagedBody<T> {
  items: T[];
  continuationToken: string | null;
  hasMoreResults: boolean;
  pageSize: number;
}
