import { classifyTripState } from "@/features/trips/types/trip";
import type { BadgeTone } from "@/components/ui/Badge";

/** Etiqueta en español del estado real del backend. */
export function tripStateLabel(estado: string): string {
  const state = classifyTripState(estado);
  switch (state) {
    case "activo":
      return "En curso";
    case "pausado":
      return "Pausado";
    case "finalizado":
      return "Finalizado";
    default:
      return estado.trim() !== "" ? estado : "Sin estado";
  }
}

/** Tonos del badge según el estado real. */
export function tripStateTone(estado: string): BadgeTone {
  const state = classifyTripState(estado);
  switch (state) {
    case "activo":
      return "success";
    case "pausado":
      return "warning";
    case "finalizado":
      return "neutral";
    default:
      return "info";
  }
}