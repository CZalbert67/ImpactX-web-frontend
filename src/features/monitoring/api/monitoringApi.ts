import apiClient from "@/api/client";
import type { Trip } from "@/features/trips/types";
import { parseTripFromTrip } from "@/features/trips/types/trip";
import type {
  CreateMonitoringInvitationInput,
  CreateMonitoringInvitationResponse,
  MedicalProfile,
  MonitoredAlert,
  MonitoredIncident,
  MonitoredRoute,
  MonitoringRelationship,
  MonitoringResponseInput,
  UpdateMonitoringPermissionsInput,
} from "@/features/monitoring/types";

const BASE = "/api/v1/monitoring-relationships";

function relationshipPath(publicRelationshipId: string): string {
  return `${BASE}/${encodeURIComponent(publicRelationshipId)}`;
}

function toTrips(data: unknown): Trip[] {
  if (!Array.isArray(data)) return [];
  return data
    .map(parseTripFromTrip)
    .filter((trip): trip is Trip => trip !== null);
}

export const monitoringApi = {
  async getAll(signal?: AbortSignal): Promise<MonitoringRelationship[]> {
    const { data } = await apiClient.get<MonitoringRelationship[]>(BASE, {
      signal,
    });
    return Array.isArray(data) ? data : [];
  },

  async createInvitation(
    input: CreateMonitoringInvitationInput,
  ): Promise<CreateMonitoringInvitationResponse> {
    const { data } = await apiClient.post<CreateMonitoringInvitationResponse>(
      `${BASE}/invitations`,
      input,
    );
    return data;
  },

  async accept(input: MonitoringResponseInput): Promise<void> {
    await apiClient.post(`${BASE}/invitations/accept`, input);
  },

  async reject(input: MonitoringResponseInput): Promise<void> {
    await apiClient.post(`${BASE}/invitations/reject`, input);
  },

  async updatePermissions(
    publicRelationshipId: string,
    input: UpdateMonitoringPermissionsInput,
  ): Promise<MonitoringRelationship> {
    const { data } = await apiClient.patch<MonitoringRelationship>(
      `${relationshipPath(publicRelationshipId)}/permissions`,
      input,
    );
    return data;
  },

  async block(publicRelationshipId: string): Promise<void> {
    await apiClient.post(`${relationshipPath(publicRelationshipId)}/block`);
  },

  async revoke(publicRelationshipId: string): Promise<void> {
    await apiClient.delete(relationshipPath(publicRelationshipId));
  },

  async getTrips(publicRelationshipId: string, signal?: AbortSignal): Promise<Trip[]> {
    const { data } = await apiClient.get<unknown>(
      `${relationshipPath(publicRelationshipId)}/trips`,
      { params: { pageSize: 20 }, signal },
    );
    return toTrips(data);
  },

  async getAlerts(
    publicRelationshipId: string,
    signal?: AbortSignal,
  ): Promise<MonitoredAlert[]> {
    const { data } = await apiClient.get<MonitoredAlert[]>(
      `${relationshipPath(publicRelationshipId)}/alerts`,
      { params: { pageSize: 20 }, signal },
    );
    return Array.isArray(data) ? data : [];
  },

  async getIncidents(
    publicRelationshipId: string,
    signal?: AbortSignal,
  ): Promise<MonitoredIncident[]> {
    const { data } = await apiClient.get<MonitoredIncident[]>(
      `${relationshipPath(publicRelationshipId)}/incidents`,
      { params: { pagina: 1, tamano: 20 }, signal },
    );
    return Array.isArray(data) ? data : [];
  },

  async getFrequentRoutes(
    publicRelationshipId: string,
    signal?: AbortSignal,
  ): Promise<MonitoredRoute[]> {
    const { data } = await apiClient.get<MonitoredRoute[]>(
      `${relationshipPath(publicRelationshipId)}/routes/frequent`,
      { params: { pageSize: 20 }, signal },
    );
    return Array.isArray(data) ? data : [];
  },

  async getRouteHistory(
    publicRelationshipId: string,
    signal?: AbortSignal,
  ): Promise<MonitoredRoute[]> {
    const { data } = await apiClient.get<MonitoredRoute[]>(
      `${relationshipPath(publicRelationshipId)}/routes/history`,
      { params: { pageSize: 20 }, signal },
    );
    return Array.isArray(data) ? data : [];
  },

  async getMedicalProfile(
    publicRelationshipId: string,
    signal?: AbortSignal,
  ): Promise<MedicalProfile | null> {
    const response = await apiClient.get<MedicalProfile | null>(
      `${relationshipPath(publicRelationshipId)}/medical-profile`,
      { signal },
    );
    return response.status === 204 ? null : response.data;
  },
};
