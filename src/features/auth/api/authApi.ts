import { apiClient, publicClient } from "@/api/client";
import type {
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  ProfileResponse,
  RegisterRequest,
} from "@/features/auth/types/api";

/**
 * Capa de acceso de autenticación. Rutas auditadas contra el OpenAPI real:
 *   POST /api/v1/auth/login        (público)
 *   POST /api/v1/auth/register     (público)
 *   POST /api/v1/auth/logout       (autenticado)
 *   GET  /api/v1/profile           (autenticado)
 */
export const authApi = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await publicClient.post<AuthResponse>(
      "/api/v1/auth/login",
      request,
    );
    return data;
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const { data } = await publicClient.post<AuthResponse>(
      "/api/v1/auth/register",
      request,
    );
    return data;
  },

  async logout(request: LogoutRequest): Promise<void> {
    await apiClient.post("/api/v1/auth/logout", request);
  },

  async getProfile(): Promise<ProfileResponse> {
    const { data } = await apiClient.get<ProfileResponse>("/api/v1/profile");
    return data;
  },
};