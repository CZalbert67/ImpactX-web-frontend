export const VEHICLE_TYPES = ["Automovil", "Suv", "Camioneta", "Van"] as const;
export const VEHICLE_USES = ["Ciudad", "Carretera", "Mixto"] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type VehicleUse = (typeof VEHICLE_USES)[number];

export interface Vehicle {
  publicVehicleId: string;
  tipoVehiculo: VehicleType;
  marca: string;
  modelo: string;
  ano: number;
  velocidadPromedio: number;
  usoPrincipalVehiculo: VehicleUse;
  esPrincipal: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface VehicleInput {
  tipoVehiculo: VehicleType;
  marca: string;
  modelo: string;
  ano: number;
  velocidadPromedio: number;
  usoPrincipalVehiculo: VehicleUse;
}

export interface CreateVehicleInput extends VehicleInput {
  esPrincipal?: boolean;
}
