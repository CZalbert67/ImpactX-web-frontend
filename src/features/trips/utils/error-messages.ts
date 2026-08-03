import { AppApiError } from "@/api/errors";

/** Mensajes neutrales y accionables para la interfaz de viajes. */
export function tripActionErrorMessage(error: unknown): string {
  if (error instanceof AppApiError) {
    switch (error.status) {
      case 400:
        return "Revisa la información e inténtalo nuevamente.";
      case 401:
        return "Tu sesión terminó. Vuelve a iniciar sesión.";
      case 403:
        return "Esta acción no está disponible para tu cuenta.";
      case 404:
        return "El viaje ya no está disponible.";
      case 409:
        return "El viaje cambió de estado. Actualiza la información e inténtalo nuevamente.";
      case 413:
        return "No pudimos procesar la información enviada.";
      case 429:
        return "Has realizado varios intentos. Espera un momento antes de continuar.";
      case 0:
        return "No pudimos conectarnos. Revisa tu conexión e inténtalo nuevamente.";
      default:
        return "Ocurrió un inconveniente. Inténtalo nuevamente en unos momentos.";
    }
  }

  return "No pudimos completar la acción. Inténtalo nuevamente.";
}
