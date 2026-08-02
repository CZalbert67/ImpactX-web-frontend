import { AppApiError } from "@/api/errors";

/**
 * Mensajes en español para los errores de las acciones de viaje. Nunca se
 * expone `Exception.Message` crudo: se mapea por status y, como último
 * recurso, se usa el mensaje ya normalizado del `AppApiError`.
 */
export function tripActionErrorMessage(error: unknown): string {
  if (error instanceof AppApiError) {
    switch (error.status) {
      case 400:
        return "La solicitud no es válida. Revisa los datos.";
      case 401:
        return "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo de nuevo.";
      case 403:
        return "No tienes permisos para realizar esta acción.";
      case 404:
        return "El viaje ya no está disponible.";
      case 409:
        return "El estado actual del viaje no permite esta acción.";
      case 413:
        return "La solicitud es demasiado grande para el servidor.";
      case 429:
        return "Demasiadas solicitudes. Inténtalo de nuevo en un momento.";
      case 0:
        return "No se pudo conectar con la API. Revisa tu conexión.";
      default:
        if (error.status >= 500) {
          return "Ocurrió un error temporal en la API. Inténtalo en un momento.";
        }
    }

    if (error.message.trim() !== "") return error.message;
    return "No se pudo completar la acción.";
  }

  if (error instanceof Error && error.message.trim() !== "") {
    return "No se pudo completar la acción.";
  }
  return "Ocurrió un error inesperado.";
}