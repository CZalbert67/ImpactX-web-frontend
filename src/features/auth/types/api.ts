import type { components } from "@/api/generated/schema";

export type LoginRequest = components["schemas"]["LoginRequest"];
export type RegisterRequest = components["schemas"]["RegisterRequest"];
export type RefreshTokenRequest = components["schemas"]["RefreshTokenRequest"];
export type LogoutRequest = components["schemas"]["LogoutRequest"];
export type ResetPasswordRequest =
  components["schemas"]["ResetPasswordRequest"];

export interface AuthUser {
  id: string;
  username: string;
  appId: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  planActivo: string | null;
}

/**
 * AuthResponse del backend (presente en el contrato de servicio aunque no esté
 * documentada en la respuesta 200 del OpenAPI). Campos externos del DTO real.
 */
export interface AuthResponse {
  success: boolean;
  token: string | null;
  refreshToken: string | null;
  resetToken: string | null;
  mensaje: string | null;
  usuario: AuthUser | null;
}

export interface ProfileResponse {
  id: string;
  username: string;
  appId: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  planActivo: string | null;
}