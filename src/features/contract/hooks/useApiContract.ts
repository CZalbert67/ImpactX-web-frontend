import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { getEnv } from "@/config/env";
import { contractApi } from "@/features/contract/api/contractApi";

export function useApiContract() {
  const expectedVersion = getEnv().apiContractVersion;
  const enabled = import.meta.env.MODE !== "test";
  const contract = useQuery({
    queryKey: queryKeys.apiContract,
    queryFn: ({ signal }) => contractApi.getContract(signal),
    staleTime: 60 * 60 * 1000,
    enabled,
  });
  const capabilities = useQuery({
    queryKey: queryKeys.webCapabilities,
    queryFn: ({ signal }) => contractApi.getWebCapabilities(signal),
    staleTime: 60 * 60 * 1000,
    enabled,
  });

  const actualVersion = contract.data?.contractVersion ?? null;
  const capabilityVersion = capabilities.data?.contractVersion ?? null;
  const compatible =
    contract.data?.apiVersion === "v1" &&
    contract.data.status === "frozen" &&
    contract.data.supportedClients.includes("web") &&
    capabilities.data?.client === "web" &&
    capabilities.data.capabilities.includes("trips:read") &&
    actualVersion === expectedVersion &&
    capabilityVersion === expectedVersion;

  return {
    expectedVersion,
    actualVersion,
    capabilityVersion,
    compatible,
    contract,
    capabilities,
    isPending: contract.isPending || capabilities.isPending,
    isError: contract.isError || capabilities.isError,
    error: contract.error ?? capabilities.error,
    retry: async () => {
      await Promise.all([contract.refetch(), capabilities.refetch()]);
    },
  };
}
