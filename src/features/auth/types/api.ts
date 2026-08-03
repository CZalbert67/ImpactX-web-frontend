export interface LoginRequest {
  identifier: string;
  password: string;
  client: "web";
}

export interface RegisterRequest {
  registrationVersion: 2;
  nombre: string;
  username: string;
  correo: string;
  telefono: string;
  password: string;
  termsAccepted: true;
  privacyAccepted: true;
  locationIncidentConsent: boolean;
  drivingPatternConsent: boolean;
  client: "web";
}

export interface RegistrationContract {
  contractVersion: number;
  termsVersion: string;
  privacyNoticeVersion: string;
  supportedClients: string[];
  requiredFields: string[];
  username: {
    minLength: number;
    maxLength: number;
    pattern: string;
    description: string;
  };
  password: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireDigit: boolean;
    requireSpecialCharacter: boolean;
  };
  confirmPasswordIsClientOnly: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  publicProfileId: string;
  username: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  planActivo: string | null;
}

export interface AuthResponse {
  success: boolean;
  token: string | null;
  refreshToken: string | null;
  resetToken: string | null;
  mensaje: string | null;
  usuario: AuthUser | null;
}

export type ProfileResponse = AuthUser;
