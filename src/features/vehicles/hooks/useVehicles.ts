import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { vehiclesApi } from "@/features/vehicles/api/vehiclesApi";
import type {
  CreateVehicleInput,
  VehicleInput,
} from "@/features/vehicles/types";

export function useVehicles() {
  return useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: ({ signal }) => vehiclesApi.getAll(signal),
  });
}

function useRefreshVehicles() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles }),
      queryClient.invalidateQueries({ queryKey: queryKeys.familyCurrent }),
    ]);
  };
}

export function useCreateVehicle() {
  const refresh = useRefreshVehicles();
  return useMutation({
    mutationFn: (input: CreateVehicleInput) => vehiclesApi.create(input),
    onSuccess: refresh,
  });
}

export function useUpdateVehicle() {
  const refresh = useRefreshVehicles();
  return useMutation({
    mutationFn: ({
      publicVehicleId,
      input,
    }: {
      publicVehicleId: string;
      input: VehicleInput;
    }) => vehiclesApi.update(publicVehicleId, input),
    onSuccess: refresh,
  });
}

export function useSetPrimaryVehicle() {
  const refresh = useRefreshVehicles();
  return useMutation({
    mutationFn: (publicVehicleId: string) =>
      vehiclesApi.setPrimary(publicVehicleId),
    onSuccess: refresh,
  });
}

export function useDeleteVehicle() {
  const refresh = useRefreshVehicles();
  return useMutation({
    mutationFn: (publicVehicleId: string) => vehiclesApi.remove(publicVehicleId),
    onSuccess: refresh,
  });
}
