import apiClient from "@/api/client";
import type {
  AlertItem,
  ContactInvitationInput,
  ContactInvitationResponse,
  ContactItem,
  ContactResponseInput,
  ContactUpdateInput,
  DriverProfile,
  IncidentActionResponse,
  IncidentDetail,
  IncidentFilters,
  IncidentItem,
  IncidentMapData,
  MedicalProfile,
  NotificationItem,
  Onboarding,
  PagedBody,
  RouteInput,
  RouteItem,
  SettingsData,
  Setup2FaResponse,
  UserPreferences,
  UserProfile,
} from "@/features/platform/types";

function listFrom<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as PagedBody<T>).items)) {
    return (value as PagedBody<T>).items;
  }
  return [];
}

function idPath(value: string): string {
  return encodeURIComponent(value);
}

export const alertsApi = {
  async getAll(signal?: AbortSignal): Promise<AlertItem[]> {
    const { data } = await apiClient.get<unknown>("/api/v1/alerts", {
      params: { pageSize: 100 },
      signal,
    });
    return listFrom<AlertItem>(data);
  },
  async getById(id: string): Promise<AlertItem> {
    const { data } = await apiClient.get<AlertItem>(`/api/v1/alerts/${idPath(id)}`);
    return data;
  },
};

export const incidentsApi = {
  async getAll(filters: IncidentFilters = {}, signal?: AbortSignal): Promise<IncidentItem[]> {
    const { data } = await apiClient.get<unknown>("/api/v1/incidents", {
      params: { pagina: 1, tamano: 100, ...filters },
      signal,
    });
    return listFrom<IncidentItem>(data);
  },
  async getActive(signal?: AbortSignal): Promise<IncidentItem[]> {
    const { data } = await apiClient.get<IncidentItem[]>("/api/v1/incidents/active", { signal });
    return Array.isArray(data) ? data : [];
  },
  async getById(id: string): Promise<IncidentDetail> {
    const { data } = await apiClient.get<IncidentDetail>(`/api/v1/incidents/${idPath(id)}`);
    return data;
  },
  async close(id: string, metodoCierre: string, nota?: string): Promise<IncidentActionResponse> {
    const { data } = await apiClient.post<IncidentActionResponse>(
      `/api/v1/incidents/${idPath(id)}/close`,
      { metodoCierre, nota: nota?.trim() || null },
    );
    return data;
  },
  async markFalseAlarm(id: string, nota?: string): Promise<void> {
    await apiClient.patch(`/api/v1/incidents/${idPath(id)}/mark-false-alarm`, { nota: nota || null });
  },
  async updateNote(id: string, nota: string): Promise<void> {
    await apiClient.patch(`/api/v1/incidents/${idPath(id)}/note`, { nota });
  },
  async getMap(id: string): Promise<IncidentMapData> {
    const { data } = await apiClient.get<IncidentMapData>(`/api/v1/incidents/${idPath(id)}/map`);
    return data;
  },
  async exportFile(format: "csv" | "txt"): Promise<Blob> {
    const { data } = await apiClient.get<Blob>("/api/v1/incidents/export", {
      params: { formato: format },
      responseType: "blob",
    });
    return data;
  },
};

export const contactsApi = {
  async getAll(signal?: AbortSignal): Promise<ContactItem[]> {
    const { data } = await apiClient.get<ContactItem[]>("/api/v1/contacts", {
      params: { pageSize: 100 },
      signal,
    });
    return Array.isArray(data) ? data : [];
  },
  async createInvitation(input: ContactInvitationInput): Promise<ContactInvitationResponse> {
    const { data } = await apiClient.post<ContactInvitationResponse>(
      "/api/v1/contacts/invitations",
      input,
    );
    return data;
  },
  async accept(input: ContactResponseInput): Promise<void> {
    await apiClient.post("/api/v1/contacts/invitations/accept", input);
  },
  async reject(input: ContactResponseInput): Promise<void> {
    await apiClient.post("/api/v1/contacts/invitations/reject", input);
  },
  async update(id: string, input: ContactUpdateInput): Promise<ContactItem> {
    const { data } = await apiClient.patch<ContactItem>(
      `/api/v1/contacts/${idPath(id)}`,
      input,
    );
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/contacts/${idPath(id)}`);
  },
  async makePrimary(id: string): Promise<ContactItem> {
    const { data } = await apiClient.patch<ContactItem>(
      `/api/v1/contacts/${idPath(id)}/primary`,
    );
    return data;
  },
  async block(id: string): Promise<void> {
    await apiClient.post(`/api/v1/contacts/${idPath(id)}/block`);
  },
};

export const notificationsApi = {
  async getAll(signal?: AbortSignal): Promise<NotificationItem[]> {
    const { data } = await apiClient.get<NotificationItem[]>("/api/v1/notifications", {
      params: { pageSize: 100 }, signal,
    });
    return listFrom<NotificationItem>(data);
  },
  async toggleRead(id: string, leida: boolean): Promise<void> {
    await apiClient.patch(`/api/v1/notifications/${idPath(id)}/read`, { leida });
  },
  async readAll(): Promise<void> {
    await apiClient.patch("/api/v1/notifications/read-all");
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/${idPath(id)}`);
  },
  async removeAll(): Promise<void> {
    await apiClient.delete("/api/v1/notifications");
  },
};

export const routesApi = {
  async getFrequent(signal?: AbortSignal): Promise<RouteItem[]> {
    const { data } = await apiClient.get<RouteItem[]>("/api/v1/routes/frequent", {
      params: { pageSize: 100 }, signal,
    });
    return listFrom<RouteItem>(data);
  },
  async getHistory(signal?: AbortSignal): Promise<RouteItem[]> {
    const { data } = await apiClient.get<RouteItem[]>("/api/v1/routes/history", {
      params: { pageSize: 100 }, signal,
    });
    return listFrom<RouteItem>(data);
  },
  async create(input: RouteInput): Promise<RouteItem> {
    const { data } = await apiClient.post<RouteItem>("/api/v1/routes/frequent", input);
    return data;
  },
  async update(id: string, input: Partial<RouteInput>): Promise<RouteItem> {
    const { data } = await apiClient.put<RouteItem>(`/api/v1/routes/frequent/${idPath(id)}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/routes/frequent/${idPath(id)}`);
  },
  async selectToday(id: string): Promise<RouteItem> {
    const { data } = await apiClient.patch<RouteItem>("/api/v1/routes/select-today", { rutaId: id });
    return data;
  },
};

export const profileApi = {
  async get(signal?: AbortSignal): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>("/api/v1/profile", { signal });
    return data;
  },
  async update(input: { nombre?: string; telefono?: string }): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>("/api/v1/profile", input);
    return data;
  },
  async updateUsername(username: string): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>("/api/v1/profile/username", { username });
    return data;
  },
  async getPreferences(signal?: AbortSignal): Promise<UserPreferences> {
    const { data } = await apiClient.get<UserPreferences>("/api/v1/profile/preferences", { signal });
    return data;
  },
  async updatePreferences(input: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data } = await apiClient.put<UserPreferences>("/api/v1/profile/preferences", input);
    return data;
  },
  async getDriver(signal?: AbortSignal): Promise<DriverProfile> {
    const { data } = await apiClient.get<DriverProfile>("/api/v1/profile/driver", { signal });
    return data;
  },
  async updateDriver(input: Partial<DriverProfile>): Promise<DriverProfile> {
    const { data } = await apiClient.put<DriverProfile>("/api/v1/profile/driver", input);
    return data;
  },
  async getMedical(signal?: AbortSignal): Promise<MedicalProfile> {
    const { data } = await apiClient.get<MedicalProfile>("/api/v1/profile/medical", { signal });
    return data;
  },
  async updateMedical(input: Partial<MedicalProfile>): Promise<MedicalProfile> {
    const { data } = await apiClient.put<MedicalProfile>("/api/v1/profile/medical", input);
    return data;
  },
  async getOnboarding(signal?: AbortSignal): Promise<Onboarding> {
    const { data } = await apiClient.get<Onboarding>("/api/v1/profile/onboarding", { signal });
    return data;
  },
  async updateOnboarding(input: Partial<Onboarding>): Promise<Onboarding> {
    const body = {
      currentStep: input.currentStep,
      status: input.status,
      medicalProfileStatus: input.medicalProfileStatus,
      privacyAccepted: input.privacyAccepted,
      locationIncidentConsent: input.locationIncidentConsent,
      drivingPatternConsent: input.drivingPatternConsent,
    };
    const { data } = await apiClient.put<Onboarding>("/api/v1/profile/onboarding", body);
    return data;
  },
};

export const settingsApi = {
  async get(signal?: AbortSignal): Promise<SettingsData> {
    const { data } = await apiClient.get<SettingsData>("/api/v1/settings", { signal });
    return data;
  },
  async update(input: Partial<SettingsData>): Promise<SettingsData> {
    const body = {
      idioma: input.idioma,
      unidadVelocidad: input.unidadVelocidad,
      notificacionesPush: input.notificacionesPush,
      notificacionesEmail: input.notificacionesEmail,
      compartirUbicacion: input.compartirUbicacion,
    };
    const { data } = await apiClient.put<SettingsData>("/api/v1/settings", body);
    return data;
  },
  async setup2Fa(): Promise<Setup2FaResponse> {
    const { data } = await apiClient.post<Setup2FaResponse>("/api/v1/settings/2fa/setup");
    return data;
  },
  async enable2Fa(code: string): Promise<void> {
    await apiClient.post("/api/v1/settings/2fa/enable", { code });
  },
  async disable2Fa(code: string): Promise<void> {
    await apiClient.delete("/api/v1/settings/2fa", { data: { code } });
  },
};
