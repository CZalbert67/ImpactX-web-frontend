import { z } from "zod";
import type { StartTripRequest } from "@/features/trips/types";

/**
 * Esquema del formulario «Iniciar viaje». Todos los campos del body
 * `StartTripRequest` son opcionales en el OpenAPI real; los campos de tipo
 * `null|string` se envían como `null` cuando el usuario los deja vacíos.
 */
export const startTripSchema = z.object({
  dispositivoId: z.string().trim().max(90).optional().default(""),
  proposito: z.string().trim().max(160).optional().default(""),
  rutaOrigen: z.string().trim().max(160).optional().default(""),
  rutaDestino: z.string().trim().max(160).optional().default(""),
});

export type StartTripFormValues = z.input<typeof startTripSchema>;

export const START_TRIP_DEFAULT_VALUES: StartTripFormValues = {
  dispositivoId: "",
  proposito: "",
  rutaOrigen: "",
  rutaDestino: "",
};

/** Traduce el formulario al body real de la API (sin campos inventados). */
export function toStartTripRequest(
  values: StartTripFormValues,
): StartTripRequest {
  return {
    ...(values.dispositivoId ? { dispositivoId: values.dispositivoId } : {}),
    proposito: values.proposito || null,
    rutaOrigen: values.rutaOrigen || null,
    rutaDestino: values.rutaDestino || null,
  };
}