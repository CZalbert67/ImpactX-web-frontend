import type { components } from "@/api/generated/schema";

export type ApiProblemDetails = components["schemas"]["ProblemDetails"];

export const API_ERROR_STATUSES = [
  400, 401, 403, 404, 409, 413, 429,
] as const;

export type ApiErrorStatus = (typeof API_ERROR_STATUSES)[number];

const NETWORK_MESSAGE =
  "No pudimos conectarnos en este momento. Revisa tu conexión e inténtalo nuevamente.";
const UNEXPECTED_MESSAGE =
  "Ocurrió un inconveniente. Inténtalo nuevamente en unos momentos.";

/**
 * Mensajes deliberadamente neutros para la interfaz.
 * La UI no muestra detalles de infraestructura, validaciones internas,
 * nombres de excepciones ni mensajes crudos del backend.
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: "Revisa la información e inténtalo nuevamente.",
  401: "Tu sesión no pudo validarse. Inicia sesión nuevamente.",
  403: "Esta acción no está disponible para tu cuenta.",
  404: "No pudimos encontrar la información solicitada.",
  409: "No pudimos guardar los cambios. Revisa la información e inténtalo nuevamente.",
  413: "No pudimos procesar la información enviada.",
  429: "Has realizado varios intentos. Espera un momento antes de continuar.",
};

export function isExpectedStatus(status: number): boolean {
  return (API_ERROR_STATUSES as readonly number[]).includes(status);
}

function fallbackMessage(status: number): string {
  if (status === 0) return NETWORK_MESSAGE;
  return STATUS_MESSAGES[status] ?? UNEXPECTED_MESSAGE;
}

/**
 * Conserva la firma histórica, pero siempre devuelve un texto seguro para el
 * usuario. El payload se ignora intencionalmente para no filtrar mensajes
 * técnicos o reglas internas del servidor.
 */
export function extractErrorMessage(_payload: unknown, status: number): string {
  return fallbackMessage(status);
}

export interface AppApiErrorOptions {
  status: number;
  message: string;
  title?: string;
  detail?: string;
  instance?: string;
  code?: string;
  data?: unknown;
  /** Segundos sugeridos por el backend en `Retry-After` (solo 429). */
  retryAfterSeconds?: number;
}

/**
 * Error tipado de la capa HTTP.
 * Su mensaje es seguro para mostrarse en la interfaz y nunca contiene tokens,
 * credenciales, nombres de excepción o detalles crudos del backend.
 */
export class AppApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly title?: string;
  readonly detail?: string;
  readonly instance?: string;
  readonly data?: unknown;
  readonly retryAfterSeconds?: number;

  constructor(options: AppApiErrorOptions) {
    super(options.message);
    this.name = "AppApiError";
    this.status = options.status;
    this.code = options.code ?? "api";
    this.title = options.title;
    this.detail = options.detail;
    this.instance = options.instance;
    this.data = options.data;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** Normaliza una excepción desconocida (Axios u otra) a AppApiError. */
  static from(error: unknown): AppApiError {
    if (error instanceof AppApiError) return error;

    const info = readAxiosError(error);

    if (!info) {
      return new AppApiError({
        status: 0,
        message: NETWORK_MESSAGE,
        code: "network",
      });
    }

    const { status } = info;
    return new AppApiError({
      status,
      message: fallbackMessage(status),
      code: status === 0 ? "network" : "api",
      retryAfterSeconds: readRetryAfterSeconds(info.headers),
    });
  }
}

/** Devuelve un mensaje seguro para componentes que reciben `unknown`. */
export function userSafeErrorMessage(
  error: unknown,
  fallback = "No pudimos completar la operación. Inténtalo nuevamente.",
): string {
  return error instanceof AppApiError ? error.message : fallback;
}

/** Lee `Retry-After` de los headers (segundos o fecha HTTP) de forma segura. */
function readRetryAfterSeconds(
  headers: Record<string, unknown> | undefined,
): number | undefined {
  if (!headers) return undefined;
  const raw = headers["retry-after"];
  if (typeof raw !== "string" || raw.trim() === "") return undefined;

  const seconds = Number.parseInt(raw, 10);
  if (Number.isFinite(seconds) && seconds > 0) return seconds;

  const httpDate = Date.parse(raw);
  if (Number.isFinite(httpDate)) {
    const delta = Math.ceil((httpDate - Date.now()) / 1000);
    return delta > 0 ? delta : undefined;
  }
  return undefined;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

interface AxiosErrorInfo {
  status: number;
  headers?: Record<string, unknown>;
}

function readAxiosError(error: unknown): AxiosErrorInfo | null {
  if (!isPlainRecord(error)) return null;

  const hasAxiosShape =
    error.config !== undefined || error.response !== undefined;
  if (!hasAxiosShape) return null;

  const response = error.response;
  if (!response || !isPlainRecord(response)) {
    return { status: 0 };
  }

  const status = typeof response.status === "number" ? response.status : 0;
  return {
    status,
    headers: isPlainRecord(response.headers)
      ? (response.headers as Record<string, unknown>)
      : undefined,
  };
}
