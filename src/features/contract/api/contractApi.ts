import { publicClient } from "@/api/client";
import type {
  ApiContractSnapshot,
  ClientCapabilityContract,
} from "@/features/contract/types";

export const contractApi = {
  async getContract(signal?: AbortSignal): Promise<ApiContractSnapshot> {
    const { data } = await publicClient.get<ApiContractSnapshot>(
      "/api/v1/meta/contract",
      { signal },
    );
    return data;
  },

  async getWebCapabilities(
    signal?: AbortSignal,
  ): Promise<ClientCapabilityContract> {
    const { data } = await publicClient.get<ClientCapabilityContract>(
      "/api/v1/meta/clients/web",
      { signal },
    );
    return data;
  },
};
