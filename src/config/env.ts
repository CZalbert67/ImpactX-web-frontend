/* ---------------------------------------------------------------------------
 * Configuración de entorno tipada.
 *
 * VALIDACIÓN:
 * - VITE_API_BASE_URL debe existir.
 * - Debe ser una URL http(s) válida.
 * - No debe contener espacios.
 * - Se normaliza para nunca generar URLs con doble barra.
 * ------------------------------------------------------------------------- */

export interface AppEnv {
  apiBaseUrl: string;
}

function normalizeApiBaseUrl(raw: string | undefined): string {
  if (!raw || raw.trim() === "") {
    throw new Error(
      "Falta VITE_API_BASE_URL: define la URL de la API en un archivo .env (ver .env.example).",
    );
  }

  if (raw.includes(" ") || raw.includes("\t") || raw.includes("\n")) {
    throw new Error(
      "VITE_API_BASE_URL no puede contener espacios ni saltos de línea.",
    );
  }

  if (!/^https?:\/\//i.test(raw)) {
    throw new Error(
      "VITE_API_BASE_URL debe ser una URL absoluta http:// o https://.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("VITE_API_BASE_URL no es una URL válida.");
  }

  if (parsed.username || parsed.password) {
    throw new Error(
      "VITE_API_BASE_URL no puede incluir credenciales en la URL.",
    );
  }

  const pathname = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${pathname}`;
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const ENV: AppEnv = {
  apiBaseUrl: normalizeApiBaseUrl(rawBaseUrl),
};

export function getEnv(): AppEnv {
  return ENV;
}