import { useState } from "react";
import { Pause, Play, Flag } from "lucide-react";
import type { Trip } from "@/features/trips/types";
import {
  canPauseTrip,
  canResumeTrip,
  canFinishTrip,
  classifyTripState,
} from "@/features/trips/types/trip";
import { ConfirmDialog } from "@/features/trips/components/ConfirmDialog";
import {
  usePauseTrip,
  useResumeTrip,
  useFinishTrip,
} from "@/features/trips/hooks";
import { tripActionErrorMessage } from "@/features/trips/utils/error-messages";
import { Button } from "@/components/ui/Button";

type PendingAction = "pause" | "resume" | "finish";

const ACTION_META: Record<
  PendingAction,
  { title: string; description: string; confirmLabel: string; danger?: boolean }
> = {
  pause: {
    title: "Pausar viaje",
    description: "El viaje quedará en pausa y podrás reanudarlo después.",
    confirmLabel: "Pausar viaje",
  },
  resume: {
    title: "Reanudar viaje",
    description:
      "El viaje volverá a estar en curso y se reanudará el registro.",
    confirmLabel: "Reanudar viaje",
  },
  finish: {
    title: "Finalizar viaje",
    description:
      "Al finalizar ya no podrás pausarlo ni reanudarlo. La telemetría quedará guardada. ¿Deseas continuar?",
    confirmLabel: "Sí, finalizar viaje",
    danger: true,
  },
};

export interface TripActionControlsProps {
  trip: Trip;
}

/**
 * Controles de acción según el estado real del viaje. Cada mutación exige
 * confirmación, bloquea el doble envío y anuncia el resultado con aria-live.
 * Si el estado no es accionable no se renderiza ningún botón.
 */
export function TripActionControls({
  trip,
}: TripActionControlsProps) {
  const pause = usePauseTrip();
  const resume = useResumeTrip();
  const finish = useFinishTrip();

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [announce, setAnnounce] = useState<string | null>(null);

  const mutation =
    pending === "pause" ? pause : pending === "resume" ? resume : finish;
  const isLoading = mutation.isPending;

  const currentError =
    mutation.error && pending !== null
      ? tripActionErrorMessage(mutation.error)
      : null;

  const hasActions =
    canPauseTrip(trip) || canResumeTrip(trip) || canFinishTrip(trip);

  const runAction = () => {
    if (pending === null) return;
    const target =
      pending === "pause" ? pause : pending === "resume" ? resume : finish;

    target.mutate(trip.id, {
      onSuccess: () => {
        setAnnounce(announceFor(pending));
        setPending(null);
      },
    });
  };

  const cancel = () => {
    if (mutation.isPending) return;
    setPending(null);
  };

  const meta = pending ? ACTION_META[pending] : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {canPauseTrip(trip) ? (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Pause className="size-4" aria-hidden="true" />}
            onClick={() => setPending("pause")}
          >
            Pausar
          </Button>
        ) : null}

        {canResumeTrip(trip) ? (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Play className="size-4" aria-hidden="true" />}
            onClick={() => setPending("resume")}
          >
            Reanudar
          </Button>
        ) : null}

        {canFinishTrip(trip) ? (
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Flag className="size-4" aria-hidden="true" />}
            onClick={() => setPending("finish")}
          >
            Finalizar
          </Button>
        ) : null}

        {!hasActions && classifyTripState(trip.estado) !== "desconocido" ? (
          <span className="text-xs text-muted">Solo lectura</span>
        ) : null}
      </div>

      {pending && meta ? (
        <ConfirmDialog
          open
          title={meta.title}
          description={meta.description}
          confirmLabel={meta.confirmLabel}
          danger={meta.danger}
          loading={mutation.isPending}
          error={currentError}
          onConfirm={runAction}
          onCancel={cancel}
        />
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {announce ?? ""}
      </p>
    </>
  );
}

function announceFor(action: PendingAction): string {
  switch (action) {
    case "pause":
      return "Viaje pausado.";
    case "resume":
      return "Viaje reanudado.";
    case "finish":
      return "Viaje finalizado.";
  }
}