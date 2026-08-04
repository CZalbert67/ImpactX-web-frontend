import { describe, expect, it } from "vitest";
import { resolveFamilyCapacity } from "@/features/family/utils/familyCapacity";
import type {
  FamilyMember,
  FamilySubscriptionSummary,
} from "@/features/family/types";

const summary = {
  acceptedMembers: 1,
  invitedMemberLimit: 1,
  totalActivePeople: 2,
  totalPeopleLimit: 2,
  pendingInvitationCount: 0,
  availableMemberSlots: 0,
} as FamilySubscriptionSummary;

const members: FamilyMember[] = [
  { role: "Owner", status: "Active" } as FamilyMember,
  { role: "Member", status: "Active" } as FamilyMember,
];

describe("capacidad familiar", () => {
  it("cuenta al titular y al miembro aceptado usando el estado real", () => {
    expect(resolveFamilyCapacity(summary, members, 0)).toEqual({
      activePeople: 2,
      totalPeopleLimit: 2,
      pendingInvitations: 0,
      availableInvitationSlots: 0,
    });
  });

  it("usa el resumen del backend aunque la consulta de miembros llegue después", () => {
    expect(resolveFamilyCapacity(summary, [], 0).activePeople).toBe(2);
  });
});
