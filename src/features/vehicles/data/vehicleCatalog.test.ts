import { describe, expect, it } from "vitest";
import {
  VEHICLE_BRANDS,
  vehicleModelsForBrand,
} from "@/features/vehicles/data/vehicleCatalog";

describe("vehicleCatalog", () => {
  it("ofrece marcas comunes y modelos dependientes", () => {
    expect(VEHICLE_BRANDS).toContain("Nissan");
    expect(vehicleModelsForBrand("Nissan")).toContain("Versa");
    expect(vehicleModelsForBrand("Toyota")).toContain("Corolla");
  });

  it("normaliza marcas con nombre de presentación", () => {
    expect(vehicleModelsForBrand("Mercedes-Benz")).toContain("Clase C");
    expect(vehicleModelsForBrand("Land Rover")).toContain("Defender");
  });

  it("permite continuar con valores personalizados", () => {
    expect(vehicleModelsForBrand("Marca artesanal")).toEqual([]);
  });
});
