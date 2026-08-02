import { useState } from "react";
import { HeartPulse, IdCard, ShieldCheck, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import {
  useDriverProfile,
  useFullProfile,
  useMedicalProfile,
  useOnboarding,
  useProfilePreferences,
  useUpdateDriverProfile,
  useUpdateMedicalProfile,
  useUpdateOnboarding,
  useUpdatePreferences,
  useUpdateProfile,
  useUpdateUsername,
} from "@/features/platform/hooks";
import { platformError } from "@/features/platform/pages/shared";
import type {
  DriverProfile,
  MedicalProfile,
  Onboarding,
  UserPreferences,
  UserProfile,
} from "@/features/platform/types";

function value(input: string | null | undefined): string {
  return input ?? "";
}

interface ProfileEditorProps {
  profile: UserProfile;
  preferences: UserPreferences;
  driver: DriverProfile;
  medical: MedicalProfile;
  onboarding: Onboarding;
}

function ProfileEditor({
  profile,
  preferences,
  driver,
  medical,
  onboarding,
}: ProfileEditorProps) {
  const updateProfile = useUpdateProfile();
  const updateUsername = useUpdateUsername();
  const updatePreferences = useUpdatePreferences();
  const updateDriver = useUpdateDriverProfile();
  const updateMedical = useUpdateMedicalProfile();
  const updateOnboarding = useUpdateOnboarding();

  const [basic, setBasic] = useState({
    nombre: profile.nombre,
    telefono: profile.telefono ?? "",
    username: profile.username,
  });
  const [prefs, setPrefs] = useState(preferences);
  const [driverForm, setDriverForm] = useState(driver);
  const [medicalForm, setMedicalForm] = useState(medical);
  const [onboardingForm, setOnboardingForm] = useState(onboarding);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <>
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <IdCard className="size-5 text-brand" />
          <h2 className="font-semibold">Datos de cuenta</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="Nombre"
            value={basic.nombre}
            onChange={(event) =>
              setBasic({ ...basic, nombre: event.target.value })
            }
          />
          <Input
            placeholder="Teléfono"
            value={basic.telefono}
            onChange={(event) =>
              setBasic({ ...basic, telefono: event.target.value })
            }
          />
          <Input disabled value={profile.correo} aria-label="Correo" />
          <Input
            placeholder="Nombre de usuario"
            value={basic.username}
            onChange={(event) =>
              setBasic({ ...basic, username: event.target.value })
            }
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          ID público: {profile.publicProfileId} · Plan: {profile.planActivo || "Sin plan"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            loading={updateProfile.isPending}
            onClick={() =>
              updateProfile.mutate(
                {
                  nombre: basic.nombre.trim(),
                  telefono: basic.telefono.trim(),
                },
                { onSuccess: () => setNotice("Perfil actualizado.") },
              )
            }
          >
            Guardar datos
          </Button>
          <Button
            variant="outline"
            loading={updateUsername.isPending}
            onClick={() =>
              updateUsername.mutate(basic.username.trim(), {
                onSuccess: () => setNotice("Nombre de usuario actualizado."),
              })
            }
          >
            Guardar usuario
          </Button>
        </div>
        {updateProfile.isError || updateUsername.isError ? (
          <Alert className="mt-4" tone="error">
            {platformError(updateProfile.error || updateUsername.error)}
          </Alert>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Preferencias</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            value={prefs.idioma ?? "es-MX"}
            onChange={(event) =>
              setPrefs({ ...prefs, idioma: event.target.value })
            }
            options={[
              { value: "es-MX", label: "Español (México)" },
              { value: "en-US", label: "English" },
            ]}
          />
          <Select
            value={prefs.unidadVelocidad ?? "km/h"}
            onChange={(event) =>
              setPrefs({ ...prefs, unidadVelocidad: event.target.value })
            }
            options={[
              { value: "km/h", label: "Kilómetros por hora" },
              { value: "mph", label: "Millas por hora" },
            ]}
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(
            [
              ["notificacionesPush", "Push"],
              ["notificacionesEmail", "Correo"],
              ["compartirUbicacion", "Compartir ubicación"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={prefs[key]}
                onChange={(event) =>
                  setPrefs({ ...prefs, [key]: event.target.checked })
                }
              />
              {label}
            </label>
          ))}
        </div>
        {updatePreferences.isError ? (
          <Alert className="mt-4" tone="error">
            {platformError(updatePreferences.error)}
          </Alert>
        ) : null}
        <Button
          className="mt-4"
          loading={updatePreferences.isPending}
          onClick={() =>
            updatePreferences.mutate(prefs, {
              onSuccess: (data) => {
                setPrefs(data);
                setNotice("Preferencias actualizadas.");
              },
            })
          }
        >
          Guardar preferencias
        </Button>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Perfil de conducción heredado</h2>
        <Alert tone="info">
          Los vehículos actuales se administran en el módulo Vehículos. Esta sección
          conserva el perfil de conducción legacy del backend.
        </Alert>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Tipo"
            value={value(driverForm.tipoVehiculo)}
            onChange={(event) =>
              setDriverForm({ ...driverForm, tipoVehiculo: event.target.value })
            }
          />
          <Input
            placeholder="Marca"
            value={value(driverForm.marca)}
            onChange={(event) =>
              setDriverForm({ ...driverForm, marca: event.target.value })
            }
          />
          <Input
            placeholder="Modelo"
            value={value(driverForm.modelo)}
            onChange={(event) =>
              setDriverForm({ ...driverForm, modelo: event.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Año"
            value={driverForm.anio ?? ""}
            onChange={(event) =>
              setDriverForm({
                ...driverForm,
                anio: event.target.value ? Number(event.target.value) : null,
              })
            }
          />
          <Input
            placeholder="Color"
            value={value(driverForm.color)}
            onChange={(event) =>
              setDriverForm({ ...driverForm, color: event.target.value })
            }
          />
          <Input
            placeholder="Placa"
            value={value(driverForm.placa)}
            onChange={(event) =>
              setDriverForm({ ...driverForm, placa: event.target.value })
            }
          />
          <Input
            placeholder="Uso"
            value={value(driverForm.uso)}
            onChange={(event) =>
              setDriverForm({ ...driverForm, uso: event.target.value })
            }
          />
          <Input
            placeholder="Velocidad promedio"
            value={value(driverForm.velocidadPromedioLabel)}
            onChange={(event) =>
              setDriverForm({
                ...driverForm,
                velocidadPromedioLabel: event.target.value,
              })
            }
          />
        </div>
        {updateDriver.isError ? (
          <Alert className="mt-4" tone="error">
            {platformError(updateDriver.error)}
          </Alert>
        ) : null}
        <Button
          className="mt-4"
          loading={updateDriver.isPending}
          onClick={() =>
            updateDriver.mutate(driverForm, {
              onSuccess: (data) => {
                setDriverForm(data);
                setNotice("Perfil de conducción actualizado.");
              },
            })
          }
        >
          Guardar conducción
        </Button>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <HeartPulse className="size-5 text-brand" />
          <h2 className="font-semibold">Ficha médica opcional</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="Tipo de sangre"
            value={value(medicalForm.tipoSangre)}
            onChange={(event) =>
              setMedicalForm({ ...medicalForm, tipoSangre: event.target.value })
            }
          />
          <Input
            placeholder="Alergias"
            value={value(medicalForm.alergias)}
            onChange={(event) =>
              setMedicalForm({ ...medicalForm, alergias: event.target.value })
            }
          />
          <Input
            placeholder="Condiciones"
            value={value(medicalForm.condiciones)}
            onChange={(event) =>
              setMedicalForm({ ...medicalForm, condiciones: event.target.value })
            }
          />
          <Input
            placeholder="Medicamentos"
            value={value(medicalForm.medicamentos)}
            onChange={(event) =>
              setMedicalForm({ ...medicalForm, medicamentos: event.target.value })
            }
          />
          <Input
            className="sm:col-span-2"
            placeholder="Nota"
            value={value(medicalForm.nota)}
            onChange={(event) =>
              setMedicalForm({ ...medicalForm, nota: event.target.value })
            }
          />
        </div>
        {updateMedical.isError ? (
          <Alert className="mt-4" tone="error">
            {platformError(updateMedical.error)}
          </Alert>
        ) : null}
        <Button
          className="mt-4"
          loading={updateMedical.isPending}
          onClick={() =>
            updateMedical.mutate(medicalForm, {
              onSuccess: (data) => {
                setMedicalForm(data);
                setNotice("Ficha médica actualizada.");
              },
            })
          }
        >
          Guardar ficha médica
        </Button>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="size-5 text-brand" />
          <h2 className="font-semibold">Consentimientos y onboarding</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["privacyAccepted", "Privacidad"],
              ["locationIncidentConsent", "Ubicación en incidentes"],
              ["drivingPatternConsent", "Patrones de conducción"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={onboardingForm[key]}
                onChange={(event) =>
                  setOnboardingForm({
                    ...onboardingForm,
                    [key]: event.target.checked,
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Input
            type="number"
            min={1}
            value={onboardingForm.currentStep}
            onChange={(event) =>
              setOnboardingForm({
                ...onboardingForm,
                currentStep: Number(event.target.value),
              })
            }
          />
          <Input
            value={onboardingForm.status}
            onChange={(event) =>
              setOnboardingForm({
                ...onboardingForm,
                status: event.target.value,
              })
            }
          />
          <Input
            value={onboardingForm.medicalProfileStatus}
            onChange={(event) =>
              setOnboardingForm({
                ...onboardingForm,
                medicalProfileStatus: event.target.value,
              })
            }
          />
        </div>
        {updateOnboarding.isError ? (
          <Alert className="mt-4" tone="error">
            {platformError(updateOnboarding.error)}
          </Alert>
        ) : null}
        <Button
          className="mt-4"
          loading={updateOnboarding.isPending}
          onClick={() =>
            updateOnboarding.mutate(onboardingForm, {
              onSuccess: (data) => {
                setOnboardingForm(data);
                setNotice("Onboarding actualizado.");
              },
            })
          }
        >
          Guardar consentimientos
        </Button>
      </Card>
    </>
  );
}

export function ProfilePage() {
  const profile = useFullProfile();
  const preferences = useProfilePreferences();
  const driver = useDriverProfile();
  const medical = useMedicalProfile();
  const onboarding = useOnboarding();

  const anyError =
    profile.error ||
    preferences.error ||
    driver.error ||
    medical.error ||
    onboarding.error;
  const pending =
    profile.isPending ||
    preferences.isPending ||
    driver.isPending ||
    medical.isPending ||
    onboarding.isPending;
  const editorData =
    profile.data &&
    preferences.data &&
    driver.data &&
    medical.data &&
    onboarding.data
      ? {
          profile: profile.data,
          preferences: preferences.data,
          driver: driver.data,
          medical: medical.data,
          onboarding: onboarding.data,
        }
      : null;

  if (anyError) {
    return (
      <ErrorState
        title="No se pudo cargar el perfil"
        description={platformError(anyError)}
        onRetry={() => {
          void profile.refetch();
          void preferences.refetch();
          void driver.refetch();
          void medical.refetch();
          void onboarding.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserRound}
        title="Perfil"
        description="Administra tu identidad pública, preferencias y datos opcionales."
      />
      {pending ? <div className="skeleton h-72" /> : null}
      {editorData ? <ProfileEditor {...editorData} /> : null}
    </div>
  );
}
