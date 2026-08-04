import apiClient from "@/api/client";
import type {
  AccountRetention,
  DeleteAccountInput,
  DeleteAccountResponse,
  RevokeConsentsInput,
} from "@/features/account/types";

export const accountApi = {
  async getRetention(signal?: AbortSignal): Promise<AccountRetention> {
    const { data } = await apiClient.get<AccountRetention>(
      "/api/v1/account/retention",
      { signal },
    );
    return data;
  },

  async exportAccount(): Promise<unknown> {
    const { data } = await apiClient.get<unknown>("/api/v1/account/export");
    return data;
  },

  async revokeConsents(input: RevokeConsentsInput): Promise<void> {
    await apiClient.post("/api/v1/account/consents/revoke", input);
  },

  async deleteAccount(input: DeleteAccountInput): Promise<DeleteAccountResponse> {
    const { data } = await apiClient.delete<DeleteAccountResponse>(
      "/api/v1/account",
      { data: input },
    );
    return data;
  },
};
