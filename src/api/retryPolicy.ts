import { AppApiError } from "@/api/errors";

/**
 * Política de reintentos de TanStack Query.
 *
 * - 400, 401, 403, 404 y 409: nunca se reintentan (errores de cliente).
 * - Red (status 0) y 5xx: reintentos limitados (fallos transitorios).
 * - 429: reintentos limitados respetando `Retry-After` cuando el backend lo
 *   entrega; sin él, se usa una espera exponencial conservadora.
 * - Cualquier otro estado: sin reintentos.
 */

const NO_RETRY_STATUSES = new Set([400, 401, 403, 404, 409]);

const MAX_RETRIES_TRANSIENT = 3;
const MAX_RETRIES_RATE_LIMIT = 3;
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 8_000;

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = error instanceof AppApiError ? error.status : null;

  if (status !== null && NO_RETRY_STATUSES.has(status)) return false;

  if (status === 429) {
    return failureCount < MAX_RETRIES_RATE_LIMIT;
  }

  if (status === null || status === 0 || status >= 500) {
    return failureCount < MAX_RETRIES_TRANSIENT;
  }

  return false;
}

export function retryDelayQuery(
  failureCount: number,
  error: unknown,
): number {
  const apiError = error instanceof AppApiError ? error : null;

  if (apiError?.status === 429 && apiError.retryAfterSeconds) {
    return Math.min(apiError.retryAfterSeconds * 1000, 60_000);
  }

  const exponential = BASE_DELAY_MS * 2 ** (failureCount - 1);
  return Math.min(exponential, MAX_DELAY_MS);
}