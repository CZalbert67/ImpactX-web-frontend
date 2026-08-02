import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import {
  startTripSchema,
  START_TRIP_DEFAULT_VALUES,
  toStartTripRequest,
  type StartTripFormValues,
} from "@/features/trips/schemas";
import { useStartTrip } from "@/features/trips/hooks";
import { tripActionErrorMessage } from "@/features/trips/utils/error-messages";

export interface StartTripDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal para iniciar un viaje. Todo los campos son opcionales según
 * `StartTripRequest`. Bloquea el doble envío y se cierra solo cuando la
 * mutación termina con éxito.
 */
export function StartTripDialog({ open, onClose }: StartTripDialogProps) {
  const startTrip = useStartTrip();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StartTripFormValues>({
    resolver: zodResolver(startTripSchema),
    defaultValues: START_TRIP_DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(START_TRIP_DEFAULT_VALUES);
    }
  }, [open, reset]);

  const closeIfIdle = () => {
    if (startTrip.isPending) return;
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    if (startTrip.isPending) return;
    startTrip.mutate(
      { body: toStartTripRequest(values) },
      { onSuccess: onClose },
    );
  });

  return (
    <Modal
      open={open}
      onClose={closeIfIdle}
      title="Iniciar viaje"
      description="Todos los campos son opcionales."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {startTrip.isError ? (
          <Alert tone="error" role="alert">
            {tripActionErrorMessage(startTrip.error)}
          </Alert>
        ) : null}

        <FormField
          label="Identificador del dispositivo"
          hint="Por ejemplo, el ID de tu wearable o del móvil que registra el viaje."
          error={errors.dispositivoId?.message}
        >
          {(fieldId) => (
            <Input
              id={fieldId}
              autoComplete="off"
              placeholder="Opcional"
              invalid={Boolean(errors.dispositivoId)}
              {...register("dispositivoId")}
            />
          )}
        </FormField>

        <FormField
          label="Propósito"
          hint="Motivo del viaje (trabajo, viaje personal, etc.)."
          error={errors.proposito?.message}
        >
          {(fieldId) => (
            <Input
              id={fieldId}
              autoComplete="off"
              placeholder="Opcional"
              invalid={Boolean(errors.proposito)}
              {...register("proposito")}
            />
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Ruta de origen"
            hint="Nombre o descripción del punto de partida."
            error={errors.rutaOrigen?.message}
          >
            {(fieldId) => (
              <Input
                id={fieldId}
                autoComplete="off"
                placeholder="Opcional"
                invalid={Boolean(errors.rutaOrigen)}
                {...register("rutaOrigen")}
              />
            )}
          </FormField>

          <FormField
            label="Ruta de destino"
            hint="Nombre o descripción del destino."
            error={errors.rutaDestino?.message}
          >
            {(fieldId) => (
              <Input
                id={fieldId}
                autoComplete="off"
                placeholder="Opcional"
                invalid={Boolean(errors.rutaDestino)}
                {...register("rutaDestino")}
              />
            )}
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeIfIdle}
            disabled={startTrip.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={startTrip.isPending}>
            {startTrip.isPending ? "Iniciando…" : "Iniciar viaje"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}