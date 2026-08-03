import type {
  FamilyMember,
  FamilySubscriptionSummary,
} from "@/features/family/types";

export interface FamilyCapacityView {
  activePeople: number;
  totalPeopleLimit: number;
  pendingInvitations: number;
  availableInvitationSlots: number;
}

export function resolveFamilyCapacity(
  summary: FamilySubscriptionSummary | null,
  members: FamilyMember[],
  queriedPendingInvitations: number,
): FamilyCapacityView {
  if (!summary) {
    return {
      activePeople: 0,
      totalPeopleLimit: 0,
      pendingInvitations: 0,
      availableInvitationSlots: 0,
    };
  }

  const activeMembers = members.filter(
    (member) => member.status === "Active",
  ).length;
  const backendActivePeople = summary.totalActivePeople
    ?? summary.acceptedMembers + 1;
  const totalPeopleLimit = summary.totalPeopleLimit
    ?? summary.invitedMemberLimit + 1;

  return {
    activePeople: Math.max(activeMembers, backendActivePeople),
    totalPeopleLimit,
    pendingInvitations: Math.max(
      queriedPendingInvitations,
      summary.pendingInvitationCount ?? 0,
    ),
    availableInvitationSlots: Math.max(0, summary.availableMemberSlots),
  };
}
