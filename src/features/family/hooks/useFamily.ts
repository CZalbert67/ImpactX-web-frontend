import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { LIVE_QUERY_INTERVAL, liveQueryOptions } from "@/api/liveQuery";
import { familyApi } from "@/features/family/api/familyApi";
import type {
  CreateFamilyInvitationInput,
  FamilyPlanName,
  UpdateFamilyMemberAccessInput,
} from "@/features/family/types";

export function useCurrentFamilySubscription() {
  return useQuery({
    queryKey: queryKeys.familyCurrent,
    queryFn: ({ signal }) => familyApi.getCurrent(signal),
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.invitations),
  });
}

export function useFamilyMembers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: ({ signal }) => familyApi.getMembers(signal),
    enabled,
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.invitations),
  });
}

export function useFamilyMemberAccess(enabled = true) {
  return useQuery({
    queryKey: queryKeys.familyAccess,
    queryFn: ({ signal }) => familyApi.getMemberAccess(signal),
    enabled,
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.invitations),
  });
}

export function useFamilyInvitations(enabled = true) {
  return useQuery({
    queryKey: queryKeys.familyInvitations,
    queryFn: ({ signal }) => familyApi.getInvitations(signal),
    enabled,
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.invitations),
  });
}

export function useIncomingFamilyInvitations(enabled = true) {
  return useQuery({
    queryKey: queryKeys.familyIncomingInvitations,
    queryFn: ({ signal }) => familyApi.getIncomingInvitations(signal),
    enabled,
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.invitations),
  });
}

function useInvalidateFamily() {
  const client = useQueryClient();
  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.family }),
      client.invalidateQueries({ queryKey: queryKeys.familyIncomingInvitations }),
      client.invalidateQueries({ queryKey: queryKeys.vehicles }),
      client.invalidateQueries({ queryKey: queryKeys.monitoring }),
    ]);
  };
}

export function useActivateFamily() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: (planName: FamilyPlanName) => familyApi.activate(planName),
    onSuccess: invalidate,
  });
}

export function useChangeFamilyPlan() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: (planName: FamilyPlanName) => familyApi.changePlan(planName),
    onSuccess: invalidate,
  });
}

export function useRenewFamily() {
  const invalidate = useInvalidateFamily();
  return useMutation({ mutationFn: familyApi.renew, onSuccess: invalidate });
}

export function useCancelFamily() {
  const invalidate = useInvalidateFamily();
  return useMutation({ mutationFn: familyApi.cancel, onSuccess: invalidate });
}

export function useLeaveFamily() {
  const invalidate = useInvalidateFamily();
  return useMutation({ mutationFn: familyApi.leave, onSuccess: invalidate });
}

export function useRemoveFamilyMember() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: (publicMembershipId: string) =>
      familyApi.removeMember(publicMembershipId),
    onSuccess: invalidate,
  });
}

export function useUpdateFamilyMemberAccess() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: ({
      targetPublicProfileId,
      input,
    }: {
      targetPublicProfileId: string;
      input: UpdateFamilyMemberAccessInput;
    }) => familyApi.updateMemberAccess(targetPublicProfileId, input),
    onSuccess: invalidate,
  });
}

export function useCreateFamilyInvitation() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: (input: CreateFamilyInvitationInput) =>
      familyApi.createInvitation(input),
    onSuccess: invalidate,
  });
}

export function useAcceptFamilyInvitation() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: (publicInvitationId: string) =>
      familyApi.acceptInvitation(publicInvitationId),
    onSuccess: invalidate,
  });
}

export function useRejectFamilyInvitation() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: (publicInvitationId: string) =>
      familyApi.rejectInvitation(publicInvitationId),
    onSuccess: invalidate,
  });
}

export function useRevokeFamilyInvitation() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: (publicInvitationId: string) =>
      familyApi.revokeInvitation(publicInvitationId),
    onSuccess: invalidate,
  });
}

export function useRedeemFamilyInvitation() {
  const invalidate = useInvalidateFamily();
  return useMutation({
    mutationFn: (code: string) => familyApi.redeemInvitation(code),
    onSuccess: invalidate,
  });
}
