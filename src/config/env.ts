/* ---------------------------------------------------------------------------
 * Configuración de entorno tipada.
 *
 * VALIDACIÓN:
 * - VITE_API_BASE_URL debe existir y ser una URL http(s) válida.
 * - VITE_API_CONTRACT_VERSION debe existir para impedir que el frontend
 *   escriba contra un contrato distinto al que fue revisado.
 * - La URL se normaliza para evitar dobles barras.
 * ------------------------------------------------------------------------- */

export interface AppEnv {
  apiBaseUrl: string;
  apiContractVersion: string;
}

function normalizeApiBaseUrl(raw: string | undefined): string {
  if (!raw || raw.trim() === "") {
    throw new Error(
      "Falta VITE_API_BASE_URL: define la URL de la API en un archivo .env (ver .env.example).",
    );
  }

  if (/\s/.test(raw)) {
    throw new Error("VITE_API_BASE_URL no puede contener espacios ni saltos de línea.");
  }

  if (!/^https?:\/\//i.test(raw)) {
    throw new Error("VITE_API_BASE_URL debe ser una URL absoluta http:// o https://.");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("VITE_API_BASE_URL no es una URL válida.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("VITE_API_BASE_URL no puede incluir credenciales en la URL.");
  }

  const pathname = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${pathname}`;
}

function normalizeContractVersion(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) {
    throw new Error(
      "Falta VITE_API_CONTRACT_VERSION: define la versión del contrato congelado.",
    );
  }
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(value)) {
    throw new Error(
      "VITE_API_CONTRACT_VERSION debe usar el formato YYYY.MM.DD.",
    );
  }
  return value;
}

export const ENV: AppEnv = {
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  apiContractVersion: normalizeContractVersion(
    import.meta.env.VITE_API_CONTRACT_VERSION,
  ),
};

export function getEnv(): AppEnv {
  return ENV;
}
