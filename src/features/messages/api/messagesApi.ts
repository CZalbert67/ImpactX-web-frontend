import apiClient from "@/api/client";
import type {
  QuickMessage,
  QuickMessageTemplate,
  SendQuickMessageInput,
  UnreadCountResponse,
  UpsertQuickMessageTemplateInput,
} from "@/features/messages/types";

const BASE = "/api/v1/quick-messages";

export const messagesApi = {
  async getTemplates(signal?: AbortSignal): Promise<QuickMessageTemplate[]> {
    const { data } = await apiClient.get<QuickMessageTemplate[]>(
      `${BASE}/templates`,
      { signal },
    );
    return Array.isArray(data) ? data : [];
  },

  async createTemplate(
    input: UpsertQuickMessageTemplateInput,
  ): Promise<QuickMessageTemplate> {
    const { data } = await apiClient.post<QuickMessageTemplate>(
      `${BASE}/templates`,
      input,
    );
    return data;
  },

  async updateTemplate(
    publicTemplateId: string,
    input: UpsertQuickMessageTemplateInput,
  ): Promise<QuickMessageTemplate> {
    const { data } = await apiClient.put<QuickMessageTemplate>(
      `${BASE}/templates/${encodeURIComponent(publicTemplateId)}`,
      input,
    );
    return data;
  },

  async deleteTemplate(publicTemplateId: string): Promise<void> {
    await apiClient.delete(
      `${BASE}/templates/${encodeURIComponent(publicTemplateId)}`,
    );
  },

  async send(input: SendQuickMessageInput): Promise<QuickMessage> {
    const { data } = await apiClient.post<QuickMessage>(`${BASE}/send`, input);
    return data;
  },

  async getHistory(
    otherPublicProfileId?: string | null,
    signal?: AbortSignal,
  ): Promise<QuickMessage[]> {
    const { data } = await apiClient.get<QuickMessage[]>(`${BASE}/history`, {
      params: otherPublicProfileId ? { otherPublicProfileId } : undefined,
      signal,
    });
    return Array.isArray(data) ? data : [];
  },

  async getUnreadCount(signal?: AbortSignal): Promise<number> {
    const { data } = await apiClient.get<UnreadCountResponse>(
      `${BASE}/unread-count`,
      { signal },
    );
    return Number.isFinite(data?.unreadCount) ? data.unreadCount : 0;
  },

  async markRead(publicMessageId: string): Promise<void> {
    await apiClient.patch(
      `${BASE}/${encodeURIComponent(publicMessageId)}/read`,
    );
  },
};
