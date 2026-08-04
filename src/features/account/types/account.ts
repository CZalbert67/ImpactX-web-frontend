export interface AccountRetention {
  tripsAndTelemetryDays: number;
  alertsAndIncidentsDays: number;
  notificationsDays: number;
  accountActive: boolean;
  deletedAtUtc: string | null;
  dataAnonymizedAtUtc: string | null;
  deletionMode: string;
}

export interface RevokeConsentsInput {
  revokeLocationIncidentConsent: boolean;
  revokeDrivingPatternConsent: boolean;
  removeMedicalProfile: boolean;
}

export interface DeleteAccountInput {
  password: string;
  confirmation: "DELETE";
  reason?: string;
}

export interface DeleteAccountResponse {
  deleted: boolean;
  deletedAtUtc: string;
  identityAnonymized: boolean;
  retentionSummary: string;
}
