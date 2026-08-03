export type FamilySubscriptionStatus =
  | "Active"
  | "PastDue"
  | "Suspended"
  | "Cancelled"
  | "Expired";
export type FamilyMembershipRole = "Owner" | "Member";
export type FamilyMembershipStatus =
  | "Pending"
  | "Active"
  | "Rejected"
  | "Left"
  | "Removed"
  | "Expired";
export type FamilyInvitationStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Expired"
  | "Revoked"
  | "Consumed";

export type FamilyPlanName = "Free" | "Standard" | "Premium";

export interface SimulatedPayment {
  publicPaymentId: string;
  result: string;
  planName: string;
  amount: number;
  currency: string;
  occurredAtUtc: string;
}

export interface FamilySubscriptionSummary {
  publicSubscriptionId: string;
  planName: string;
  status: FamilySubscriptionStatus;
  currentUserRole: FamilyMembershipRole;
  ownerPublicProfileId: string;
  ownerUsername: string;
  ownerName: string;
  acceptedMembers: number;
  invitedMemberLimit: number;
  totalActivePeople: number;
  totalPeopleLimit: number;
  pendingInvitationCount: number;
  availableMemberSlots: number;
  vehicleLimitPerUser: number;
  pendingAdjustment: boolean;
  pendingPlanName: string | null;
  periodStartUtc: string;
  periodEndUtc: string;
  nextBillingAtUtc?: string | null;
  graceEndsAtUtc?: string | null;
  autoRenew?: boolean;
  latestPayment: SimulatedPayment | null;
}

export interface FamilyMember {
  publicMembershipId: string;
  publicProfileId: string;
  username: string;
  displayName: string;
  role: FamilyMembershipRole;
  status: FamilyMembershipStatus;
  acceptedAtUtc: string | null;
}

export interface FamilyInvitation {
  publicInvitationId: string;
  targetUsername: string | null;
  targetPublicProfileId: string | null;
  targetEmail: string | null;
  status: FamilyInvitationStatus;
  createdAtUtc: string;
  expiresAtUtc: string;
}

export interface IncomingFamilyInvitation extends FamilyInvitation {
  ownerPublicProfileId: string;
  ownerUsername: string;
  ownerName: string;
  planName: FamilyPlanName;
}

export interface CreateFamilyInvitationInput {
  username?: string;
  publicProfileId?: string;
  email?: string;
  createMonitoringRelationship: boolean;
}

export interface CreateFamilyInvitationResponse {
  invitation: FamilyInvitation;
  manualCode: string;
}
