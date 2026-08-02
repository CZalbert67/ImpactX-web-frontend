import type { components } from "@/api/generated/schema";

export type ApiProblemDetails = components["schemas"]["ProblemDetails"];

export const API_ERROR_STATUSES = [
  400, 401, 403, 404, 409, 413, 429,
] as const;

export type ApiErrorStatus = (typeof API_ERROR_STATUSES)[number];

const STATUS_MESSAGES: Record<number, string> = {
  400: "La solicitud no es válida.",
  401: "Tu sesión expiró. Vuelve a iniciar sesión.",
  403: "No tienes permisos para realizar esta acción.",
  404: "El recurso solicitado no existe.",
  409: "La solicitud entra en conflicto con el estado actual del servidor.",
  413: "La solicitud es demasiado grande para el servidor.",
  429: "Demasiadas solicitudes. Inténtalo de nuevo en un momento.",
};

export function isExpectedStatus(status: number): boolean {
  return (API_ERROR_STATUSES as readonly number[]).includes(status);
}

function fallbackMessage(status: number): string {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status] as string;
  return "Ocurrió un error inesperado en el servidor.";
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

/**
 * Extrae un detalle legible del cuerpo de la respuesta.
 * Soporta ProblemDetails (RFC 7807) y AuthResponse (campo `mensaje`).
 */
export function extractErrorMessage(payload: unknown, status: number): string {
  if (!isPlainRecord(payload)) {
    return status === 0
      ? "No se pudo conectar con el servidor. Revisa tu conexión."
      : fallbackMessage(status);
  }

  const { detail, title, message, mensaje } = payload;

  if (typeof detail === "string" && detail.length > 0) return detail;
  if (typeof title === "string" && title.length > 0) return title;
  if (typeof message === "string" && message.length > 0) return message;
  if (
    status !== 0 &&
    isExpectedStatus(status) &&
    typeof mensaje === "string" &&
    mensaje.length > 0
  ) {
    return mensaje;
  }

  return status === 0
    ? "No se pudo conectar con el servidor. Revisa tu conexión."
    : fallbackMessage(status);
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
 * Nunca contiene tokens, credenciales ni payloads sensibles.
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
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      return new AppApiError({ status: 0, message, code: "network" });
    }

    const { status, data } = info;
    const problem = asProblemDetails(data);
    return new AppApiError({
      status,
      message:
        extractErrorMessage(data, status) ||
        problem?.title ||
        fallbackMessage(status),
      title: problem?.title ?? undefined,
      detail: problem?.detail ?? undefined,
      instance: problem?.instance ?? undefined,
      data,
      retryAfterSeconds: readRetryAfterSeconds(info.headers),
    });
  }
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

function asProblemDetails(data: unknown): ApiProblemDetails | undefined {
  if (!isPlainRecord(data)) return undefined;
  return data as unknown as ApiProblemDetails;
}

interface AxiosErrorInfo {
  status: number;
  data: unknown;
  headers?: Record<string, unknown>;
}

function readAxiosError(error: unknown): AxiosErrorInfo | null {
  if (!isPlainRecord(error)) return null;
  // Un error de Axios real siempre expone `config` y/o `response` como
  // objetos planos. Cualquier otro objeto (p. ej. TypeError, DOMException)
  // se trata como fallo de red.
  const hasAxiosShape =
    error.config !== undefined || error.response !== undefined;
  if (!hasAxiosShape) return null;

  const response = error.response;
  if (!response || !isPlainRecord(response)) {
    return { status: 0, data: undefined };
  }
  const status = typeof response.status === "number" ? response.status : 0;
  return {
    status,
    data: response.data,
    headers: isPlainRecord(response.headers)
      ? (response.headers as Record<string, unknown>)
      : undefined,
  };
}