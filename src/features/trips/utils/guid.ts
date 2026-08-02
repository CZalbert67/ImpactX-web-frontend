/**
 * Validación de GUIDs previa a cualquier llamada HTTP (verificación 14:
 * un GUID inválido se rechaza antes de contactar la API).
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidGuid(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  return UUID_RE.test(value.trim());
}