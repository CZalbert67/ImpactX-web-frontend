/**
 * Paginación real de las rutas V1 (auditada en OpenAPI):
 *
 * - `pageSize`: query opcional (1–100, default 20).
 * - `continuationToken`: query opcional, opaco.
 * - El token de la siguiente página puede viajar en el header
 *   `X-Continuation-Token` o en `continuationToken` dentro del cuerpo paginado.
 * - El cliente conserva compatibilidad con respuestas antiguas en forma de arreglo.
 *
 * El token nunca se muestra, registra ni persiste: solo se reenvía tal cual
 * en la siguiente petición.
 */

import type { AxiosResponse } from "axios";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const CONTINUATION_TOKEN_HEADER = "x-continuation-token";

export interface PaginatedResult<T> {
  items: T[];
  nextToken: string | null;
}

/** Normaliza `pageSize` fuera de rango/ausente al intervalado del backend. */
export function normalizePageSize(
  value: number | string | null | undefined,
): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(
    String(value ?? ""),
    10,
  );
  if (!Number.isFinite(parsed)) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(1, parsed));
}

/** Lee el token de continuación de los headers de la respuesta. */
export function readContinuationToken(
  headers: AxiosResponse["headers"],
): string | null {
  const raw = headers?.[CONTINUATION_TOKEN_HEADER];
  if (typeof raw !== "string" || raw.trim() === "") return null;
  return raw;
}

/**
 * Construye los parámetros de paginación. Nunca envía un token vacío:
 * «el token vacío no tiene sentido» es una protección contra peticiones
 * redundantes.
 */
export function buildPaginationParams(
  pageSize: number,
  continuationToken: string | null | undefined,
): { pageSize?: number; continuationToken?: string } {
  const params: { pageSize?: number; continuationToken?: string } = {};
  params.pageSize = normalizePageSize(pageSize);

  if (continuationToken && continuationToken.trim() !== "") {
    params.continuationToken = continuationToken;
  }

  return params;
}

/** Página única de viajes con su token de la siguiente página. */
export interface TripPageMore<T> {
  items: T[];
  nextToken: string | null;
  /** true cuando no hay más páginas (no hay token de continuación). */
  hasMore: boolean;
}

export function toPageMore<T>(
  items: T[],
  nextToken: string | null,
): TripPageMore<T> {
  return {
    items,
    nextToken,
    hasMore: nextToken !== null,
  };
}