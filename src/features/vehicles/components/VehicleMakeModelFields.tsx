import { useId } from "react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import {
  VEHICLE_BRANDS,
  vehicleModelsForBrand,
} from "@/features/vehicles/data/vehicleCatalog";

export interface VehicleMakeModelFieldsProps {
  make: string;
  model: string;
  makeError?: string;
  modelError?: string;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
}

export function VehicleMakeModelFields({
  make,
  model,
  makeError,
  modelError,
  onMakeChange,
  onModelChange,
}: VehicleMakeModelFieldsProps) {
  const instanceId = useId().replace(/:/g, "");
  const brandsListId = `impactx-vehicle-brands-${instanceId}`;
  const modelsListId = `impactx-vehicle-models-${instanceId}`;
  const models = vehicleModelsForBrand(make);

  const changeMake = (nextMake: string) => {
    const previousModels = vehicleModelsForBrand(make);
    const nextModels = vehicleModelsForBrand(nextMake);
    onMakeChange(nextMake);

    if (
      model.trim() &&
      previousModels.length > 0 &&
      nextModels.length > 0 &&
      !nextModels.some(
        (value) => value.toLocaleLowerCase("es-MX") === model.trim().toLocaleLowerCase("es-MX"),
      )
    ) {
      onModelChange("");
    }
  };

  return (
    <>
      <FormField
        label="Marca"
        required
        hint="Busca una marca o escribe otra que no aparezca en la lista."
        error={makeError}
      >
        {(fieldId) => (
          <>
            <Input
              id={fieldId}
              list={brandsListId}
              value={make}
              maxLength={100}
              autoComplete="off"
              placeholder="Busca, por ejemplo: Nissan"
              invalid={Boolean(makeError)}
              onChange={(event) => changeMake(event.target.value)}
            />
            <datalist id={brandsListId}>
              {VEHICLE_BRANDS.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </>
        )}
      </FormField>

      <FormField
        label="Modelo"
        required
        hint={
          !make.trim()
            ? "Primero escribe o selecciona una marca."
            : models.length > 0
              ? "La lista se ajusta a la marca; también puedes escribir otro modelo."
              : "La marca no está en el catálogo; escribe el modelo manualmente."
        }
        error={modelError}
      >
        {(fieldId) => (
          <>
            <Input
              id={fieldId}
              list={modelsListId}
              value={model}
              maxLength={100}
              autoComplete="off"
              disabled={!make.trim()}
              placeholder={make.trim() ? "Busca o escribe el modelo" : "Selecciona una marca"}
              invalid={Boolean(modelError)}
              onChange={(event) => onModelChange(event.target.value)}
            />
            <datalist id={modelsListId}>
              {models.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </>
        )}
      </FormField>
    </>
  );
}
