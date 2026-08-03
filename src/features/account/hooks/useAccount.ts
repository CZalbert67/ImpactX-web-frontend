import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { accountApi } from "@/features/account/api/accountApi";
import type {
  DeleteAccountInput,
  RevokeConsentsInput,
} from "@/features/account/types";

export function useAccountRetention() {
  return useQuery({
    queryKey: queryKeys.accountRetention,
    queryFn: ({ signal }) => accountApi.getRetention(signal),
  });
}

export function useExportAccount() {
  return useMutation({ mutationFn: () => accountApi.exportAccount() });
}

export function useRevokeAccountConsents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RevokeConsentsInput) => accountApi.revokeConsents(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.fullProfile }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profileOnboarding }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profileMedical }),
      ]);
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (input: DeleteAccountInput) => accountApi.deleteAccount(input),
  });
}
