import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getEnv } from "@/config/env";
import { AppApiError } from "@/api/errors";
import { refreshAccessToken } from "@/api/refresh";
import { getSessionForHttp } from "@/features/auth/store/auth.store";

const baseURL = getEnv().apiBaseUrl;

const DEFAULT_TIMEOUT_MS = 20_000;

function createInstance(): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: { Accept: "application/json" },
  });
}

/**
 * Capa pública: sin interceptores de autenticación. Se usa para login,
 * registro y refresh. Nunca lleva `withCredentials` (el backend no usa cookies).
 */
export const publicClient: AxiosInstance = createInstance();

/**
 * Cliente autenticado: inyecta `Authorization: Bearer <token>` y gestiona
 * un único refresh en vuelo con reintento de la petición original.
 */
export const apiClient: AxiosInstance = createInstance();

const PUBLIC_AUTH_SUFFIXES = [
  "/login",
  "/register",
  "/refresh",
  "/recover-password",
  "/reset-password",
] as const;

function isPublicAuthUrl(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_SUFFIXES.some((suffix) => url.endsWith(suffix));
}

apiClient.interceptors.request.use((request) => {
  if (isPublicAuthUrl(request.url)) return request;

  const session = getSessionForHttp();
  if (session) {
    request.headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  return request;
});

type RetriableConfig = InternalAxiosRequestConfig & {
  _retried?: boolean;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as {
      config?: RetriableConfig;
      response?: { status?: number };
    };

    const config = axiosError.config;
    const status = axiosError.response?.status;

    if (!config || status !== 401 || config._retried) {
      throw AppApiError.from(error);
    }

    const session = getSessionForHttp();
    if (!session) {
      throw AppApiError.from(error);
    }

    config._retried = true;

    const nextToken = await refreshAccessToken();
    if (!nextToken) {
      throw AppApiError.from(error);
    }

    config.headers.set("Authorization", `Bearer ${nextToken}`);
    return apiClient(config);
  },
);

export { AppApiError };
export default apiClient;