import apiClient from "@/api/client";
import type {
  CreateVehicleInput,
  Vehicle,
  VehicleInput,
} from "@/features/vehicles/types";

function vehiclePath(publicVehicleId: string): string {
  return `/api/v1/vehicles/${encodeURIComponent(publicVehicleId)}`;
}

export const vehiclesApi = {
  async getAll(signal?: AbortSignal): Promise<Vehicle[]> {
    const { data } = await apiClient.get<Vehicle[]>("/api/v1/vehicles", {
      signal,
    });
    return Array.isArray(data) ? data : [];
  },

  async create(input: CreateVehicleInput): Promise<Vehicle> {
    const { data } = await apiClient.post<Vehicle>("/api/v1/vehicles", input);
    return data;
  },

  async update(
    publicVehicleId: string,
    input: VehicleInput,
  ): Promise<Vehicle> {
    const { data } = await apiClient.put<Vehicle>(
      vehiclePath(publicVehicleId),
      input,
    );
    return data;
  },

  async setPrimary(publicVehicleId: string): Promise<void> {
    await apiClient.patch(`${vehiclePath(publicVehicleId)}/primary`);
  },

  async remove(publicVehicleId: string): Promise<void> {
    await apiClient.delete(vehiclePath(publicVehicleId));
  },
};
