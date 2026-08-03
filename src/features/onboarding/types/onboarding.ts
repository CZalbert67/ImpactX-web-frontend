export type RegistrationOnboardingStep = 2 | 3 | 4 | 5 | 6;

export interface RegistrationInvitationResult {
  kind: "contact" | "monitor";
  manualCode: string;
}
