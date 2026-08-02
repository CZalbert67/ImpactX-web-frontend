import { useState } from "react";
import { Car, Plus } from "lucide-react";
import { AppApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { VehicleCard } from "@/features/vehicles/components/VehicleCard";
import { VehicleFormDialog } from "@/features/vehicles/components/VehicleFormDialog";
import {
  useCreateVehicle,
  useDeleteVehicle,
  useSetPrimaryVehicle,
  useUpdateVehicle,
  useVehicles,
} from "@/features/vehicles/hooks";
import type {
  CreateVehicleInput,
  Vehicle,
  VehicleInput,
} from "@/features/vehicles/types";

function errorMessage(error: unknown): string {
  return error instanceof AppApiError
    ? error.message
    : "No se pudo completar la operación.";
}

export function VehiclesPage() {
  const vehicles = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const setPrimary = useSetPrimaryVehicle();
  const removeVehicle = useDeleteVehicle();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const formMutation = editing ? updateVehicle : createVehicle;
  const actionBusy =
    createVehicle.isPending ||
    updateVehicle.isPending ||
    setPrimary.isPending ||
    removeVehicle.isPending;

  const openCreate = () => {
    setEditing(null);
    createVehicle.reset();
    updateVehicle.reset();
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    createVehicle.reset();
    updateVehicle.reset();
    setFormOpen(true);
  };

  const submitVehicle = (input: CreateVehicleInput | VehicleInput) => {
    setNotice(null);
    if (editing) {
      updateVehicle.mutate(
        { publicVehicleId: editing.publicVehicleId, input },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditing(null);
            setNotice("Vehículo actualizado correctamente.");
          },
        },
      );
      return;
    }

    createVehicle.mutate(input as CreateVehicleInput, {
      onSuccess: () => {
        setFormOpen(false);
        setNotice("Vehículo registrado correctamente.");
      },
    });
  };

  const makePrimary = (vehicle: Vehicle) => {
    setNotice(null);
    setPrimary.mutate(vehicle.publicVehicleId, {
      onSuccess: () => setNotice(`${vehicle.marca} ${vehicle.modelo} ahora es principal.`),
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setNotice(null);
    removeVehicle.mutate(deleting.publicVehicleId, {
      onSuccess: () => {
        setNotice("Vehículo eliminado. La cuota del plan quedó disponible.");
        setDeleting(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Car}
        title="Vehículos"
        description="Administra los vehículos asociados a tu cuenta. El plan efectivo determina el límite disponible."
        actions={
          <Button leftIcon={<Plus className="size-4" aria-hidden="true" />} onClick={openCreate}>
            Agregar vehículo
          </Button>
        }
      />

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {setPrimary.isError ? <Alert tone="error">{errorMessage(setPrimary.error)}</Alert> : null}

      {vehicles.isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((value) => (
            <div key={value} className="panel h-72 p-5">
              <div className="skeleton h-full" />
            </div>
          ))}
        </div>
      ) : null}

      {vehicles.isError ? (
        <ErrorState
          title="No se pudieron cargar los vehículos"
          description={errorMessage(vehicles.error)}
          onRetry={() => void vehicles.refetch()}
        />
      ) : null}

      {vehicles.data && vehicles.data.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No tienes vehículos registrados"
          description="Registra el primero para asociarlo a tus viajes y aplicar las reglas de tu plan."
          action={<Button onClick={openCreate}>Registrar vehículo</Button>}
        />
      ) : null}

      {vehicles.data && vehicles.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.data.map((vehicle) => (
            <VehicleCard
              key={vehicle.publicVehicleId}
              vehicle={vehicle}
              actionBusy={actionBusy}
              onEdit={() => openEdit(vehicle)}
              onSetPrimary={() => makePrimary(vehicle)}
              onDelete={() => {
                removeVehicle.reset();
                setDeleting(vehicle);
              }}
            />
          ))}
        </div>
      ) : null}

      <VehicleFormDialog
        open={formOpen}
        vehicle={editing}
        loading={formMutation.isPending}
        error={formMutation.isError ? errorMessage(formMutation.error) : null}
        onClose={() => {
          if (!formMutation.isPending) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
        onSubmit={submitVehicle}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar vehículo"
        description={
          deleting
            ? `Se eliminará ${deleting.marca} ${deleting.modelo}. Si es el principal, ImpactX promoverá otro vehículo activo de forma automática.`
            : ""
        }
        confirmLabel="Eliminar"
        busyLabel="Eliminando…"
        danger
        loading={removeVehicle.isPending}
        error={removeVehicle.isError ? errorMessage(removeVehicle.error) : null}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!removeVehicle.isPending) setDeleting(null);
        }}
      />
    </div>
  );
}
