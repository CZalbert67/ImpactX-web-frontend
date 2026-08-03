import apiClient from "@/api/client";
import type {
  CreateFamilyInvitationInput,
  CreateFamilyInvitationResponse,
  FamilyInvitation,
  IncomingFamilyInvitation,
  FamilyMember,
  FamilyPlanName,
  FamilySubscriptionSummary,
} from "@/features/family/types";

const BASE = "/api/v1/family-subscriptions";

export const familyApi = {
  async getCurrent(signal?: AbortSignal): Promise<FamilySubscriptionSummary | null> {
    const response = await apiClient.get<FamilySubscriptionSummary | null>(
      `${BASE}/current`,
      { signal },
    );
    if (response.status === 204 || !response.data) return null;
    return response.data;
  },

  async activate(planName: FamilyPlanName): Promise<FamilySubscriptionSummary> {
    const { data } = await apiClient.post<FamilySubscriptionSummary>(
      `${BASE}/activate`,
      { planName },
    );
    return data;
  },

  async changePlan(planName: FamilyPlanName): Promise<FamilySubscriptionSummary> {
    const { data } = await apiClient.post<FamilySubscriptionSummary>(
      `${BASE}/change-plan`,
      { planName },
    );
    return data;
  },

  async renew(): Promise<FamilySubscriptionSummary> {
    const { data } = await apiClient.post<FamilySubscriptionSummary>(
      `${BASE}/renew`,
    );
    return data;
  },

  async cancel(): Promise<void> {
    await apiClient.post(`${BASE}/cancel`);
  },

  async getMembers(signal?: AbortSignal): Promise<FamilyMember[]> {
    const { data } = await apiClient.get<FamilyMember[]>(`${BASE}/members`, {
      signal,
    });
    return Array.isArray(data) ? data : [];
  },

  async removeMember(publicMembershipId: string): Promise<void> {
    await apiClient.delete(
      `${BASE}/members/${encodeURIComponent(publicMembershipId)}`,
    );
  },

  async leave(): Promise<void> {
    await apiClient.post(`${BASE}/leave`);
  },

  async getInvitations(signal?: AbortSignal): Promise<FamilyInvitation[]> {
    const { data } = await apiClient.get<FamilyInvitation[]>(
      `${BASE}/invitations`,
      { signal },
    );
    return Array.isArray(data) ? data : [];
  },

  async getIncomingInvitations(
    signal?: AbortSignal,
  ): Promise<IncomingFamilyInvitation[]> {
    const { data } = await apiClient.get<IncomingFamilyInvitation[]>(
      `${BASE}/invitations/incoming`,
      { signal },
    );
    return Array.isArray(data) ? data : [];
  },

  async createInvitation(
    input: CreateFamilyInvitationInput,
  ): Promise<CreateFamilyInvitationResponse> {
    const { data } = await apiClient.post<CreateFamilyInvitationResponse>(
      `${BASE}/invitations`,
      input,
    );
    return data;
  },

  async acceptInvitation(publicInvitationId: string): Promise<void> {
    await apiClient.post(
      `${BASE}/invitations/${encodeURIComponent(publicInvitationId)}/accept`,
    );
  },

  async rejectInvitation(publicInvitationId: string): Promise<void> {
    await apiClient.post(
      `${BASE}/invitations/${encodeURIComponent(publicInvitationId)}/reject`,
    );
  },

  async redeemInvitation(code: string): Promise<void> {
    await apiClient.post(`${BASE}/invitations/redeem`, { code });
  },
};
