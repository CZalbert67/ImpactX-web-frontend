import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type {
  CreateVehicleInput,
  Vehicle,
  VehicleInput,
  VehicleType,
  VehicleUse,
} from "@/features/vehicles/types";

interface VehicleFormState {
  tipoVehiculo: VehicleType;
  marca: string;
  modelo: string;
  ano: string;
  velocidadPromedio: string;
  usoPrincipalVehiculo: VehicleUse;
  esPrincipal: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();

function initialState(vehicle?: Vehicle | null): VehicleFormState {
  return {
    tipoVehiculo: vehicle?.tipoVehiculo ?? "Automovil",
    marca: vehicle?.marca ?? "",
    modelo: vehicle?.modelo ?? "",
    ano: String(vehicle?.ano ?? CURRENT_YEAR),
    velocidadPromedio: String(vehicle?.velocidadPromedio ?? 0),
    usoPrincipalVehiculo: vehicle?.usoPrincipalVehiculo ?? "Mixto",
    esPrincipal: vehicle?.esPrincipal ?? false,
  };
}

function validate(state: VehicleFormState): string | null {
  if (!state.marca.trim()) return "La marca es obligatoria.";
  if (!state.modelo.trim()) return "El modelo es obligatorio.";
  if (state.marca.trim().length > 100 || state.modelo.trim().length > 100) {
    return "Marca y modelo deben tener como máximo 100 caracteres.";
  }
  const year = Number(state.ano);
  if (!Number.isInteger(year) || year < 1886 || year > 2100) {
    return "El año debe estar entre 1886 y 2100.";
  }
  const speed = Number(state.velocidadPromedio);
  if (!Number.isFinite(speed) || speed < 0 || speed > 300) {
    return "La velocidad promedio debe estar entre 0 y 300 km/h.";
  }
  return null;
}

export interface VehicleFormDialogProps {
  open: boolean;
  vehicle?: Vehicle | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: CreateVehicleInput | VehicleInput) => void;
}

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: CreateVehicleInput | VehicleInput) => void;
}

function VehicleForm({
  vehicle,
  loading,
  error,
  onClose,
  onSubmit,
}: VehicleFormProps) {
  const [state, setState] = useState<VehicleFormState>(() => initialState(vehicle));
  const [validationError, setValidationError] = useState<string | null>(null);

  const submit = () => {
    const message = validate(state);
    setValidationError(message);
    if (message) return;

    const base: VehicleInput = {
      tipoVehiculo: state.tipoVehiculo,
      marca: state.marca.trim(),
      modelo: state.modelo.trim(),
      ano: Number(state.ano),
      velocidadPromedio: Number(state.velocidadPromedio),
      usoPrincipalVehiculo: state.usoPrincipalVehiculo,
    };

    onSubmit(vehicle ? base : { ...base, esPrincipal: state.esPrincipal });
  };

  return (
    <div className="space-y-4">
      {validationError ? <Alert tone="warning">{validationError}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo de vehículo" required>
          {(fieldId) => (
            <Select
              id={fieldId}
              value={state.tipoVehiculo}
              onChange={(event) =>
                setState((value) => ({
                  ...value,
                  tipoVehiculo: event.target.value as VehicleType,
                }))
              }
              options={[
                { value: "Automovil", label: "Automóvil" },
                { value: "Suv", label: "SUV" },
                { value: "Camioneta", label: "Camioneta" },
                { value: "Van", label: "Van" },
              ]}
            />
          )}
        </FormField>
        <FormField label="Uso principal" required>
          {(fieldId) => (
            <Select
              id={fieldId}
              value={state.usoPrincipalVehiculo}
              onChange={(event) =>
                setState((value) => ({
                  ...value,
                  usoPrincipalVehiculo: event.target.value as VehicleUse,
                }))
              }
              options={[
                { value: "Ciudad", label: "Ciudad" },
                { value: "Carretera", label: "Carretera" },
                { value: "Mixto", label: "Mixto" },
              ]}
            />
          )}
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Marca" required>
          {(fieldId) => (
            <Input
              id={fieldId}
              value={state.marca}
              maxLength={100}
              onChange={(event) =>
                setState((value) => ({ ...value, marca: event.target.value }))
              }
              placeholder="Nissan"
            />
          )}
        </FormField>
        <FormField label="Modelo" required>
          {(fieldId) => (
            <Input
              id={fieldId}
              value={state.modelo}
              maxLength={100}
              onChange={(event) =>
                setState((value) => ({ ...value, modelo: event.target.value }))
              }
              placeholder="Versa"
            />
          )}
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Año" required>
          {(fieldId) => (
            <Input
              id={fieldId}
              type="number"
              min={1886}
              max={2100}
              value={state.ano}
              onChange={(event) =>
                setState((value) => ({ ...value, ano: event.target.value }))
              }
            />
          )}
        </FormField>
        <FormField
          label="Velocidad promedio"
          hint="Kilómetros por hora, entre 0 y 300."
          required
        >
          {(fieldId) => (
            <Input
              id={fieldId}
              type="number"
              min={0}
              max={300}
              step="0.1"
              value={state.velocidadPromedio}
              onChange={(event) =>
                setState((value) => ({
                  ...value,
                  velocidadPromedio: event.target.value,
                }))
              }
            />
          )}
        </FormField>
      </div>

      {!vehicle ? (
        <label className="flex items-start gap-2.5 rounded-lg border border-line bg-panel-soft p-3 text-sm text-secondary">
          <Checkbox
            checked={state.esPrincipal}
            onChange={(event) =>
              setState((value) => ({
                ...value,
                esPrincipal: event.target.checked,
              }))
            }
          />
          <span>
            Establecer como vehículo principal. El primer vehículo activo será
            principal automáticamente.
          </span>
        </label>
      ) : null}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={submit} loading={loading}>
          {vehicle ? "Guardar cambios" : "Registrar vehículo"}
        </Button>
      </div>
    </div>
  );
}

export function VehicleFormDialog({
  open,
  vehicle,
  loading = false,
  error,
  onClose,
  onSubmit,
}: VehicleFormDialogProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title={vehicle ? "Editar vehículo" : "Registrar vehículo"}
      description="Los datos se usarán para identificar el vehículo en viajes y monitoreo."
    >
      <VehicleForm
        vehicle={vehicle}
        loading={loading}
        error={error}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
