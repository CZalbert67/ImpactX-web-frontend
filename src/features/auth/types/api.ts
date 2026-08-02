export interface LoginRequest {
  identifier: string;
  password: string;
  client: "web";
}

export interface RegisterRequest {
  nombre: string;
  correo: string;
  telefono?: string;
  password: string;
  planActivo?: string;
  client: "web";
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
