import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  CarFront,
  Check,
  CheckCircle2,
  Copy,
  HeartPulse,
  ShieldCheck,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router";
import { userSafeErrorMessage } from "@/api/errors";
import { queryKeys } from "@/api/queryKeys";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { useSession } from "@/features/auth/hooks/useSession";
import { familyApi } from "@/features/family/api/familyApi";
import type {
  CreateFamilyInvitationInput,
  FamilyPlanName,
  FamilySubscriptionSummary,
} from "@/features/family/types";
import { profileApi } from "@/features/platform/api/platformApi";
import type { MedicalProfile } from "@/features/platform/types";
import {
  medicalOnboardingSchema,
  protectionOnboardingSchema,
  vehicleOnboardingSchema,
  type MedicalOnboardingValues,
  type ProtectionOnboardingValues,
  type VehicleOnboardingValues,
} from "@/features/onboarding/schemas/onboarding.schema";
import type {
  RegistrationInvitationResult,
  RegistrationOnboardingStep,
} from "@/features/onboarding/types";
import { vehiclesApi } from "@/features/vehicles/api/vehiclesApi";
import { VehicleMakeModelFields } from "@/features/vehicles/components/VehicleMakeModelFields";
import { VEHICLE_TYPES, VEHICLE_USES } from "@/features/vehicles/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";


const FLOW_STEPS = [
  { label: "Cuenta", icon: UserRoundCheck },
  { label: "Plan", icon: WalletCards },
  { label: "Vehículo", icon: CarFront },
  { label: "Ficha médica", icon: HeartPulse },
  { label: "Protección", icon: ShieldCheck },
] as const;

const ONBOARDING_PLANS: ReadonlyArray<{
  value: FamilyPlanName;
  label: string;
  price: string;
  people: string;
  vehicles: string;
  description: string;
}> = [
  {
    value: "Free",
    label: "Gratuito",
    price: "0 MXN",
    people: "2 personas en total",
    vehicles: "1 vehículo por usuario",
    description: "La opción inicial para probar la red de protección.",
  },
  {
    value: "Standard",
    label: "Estándar",
    price: "99 MXN / mes",
    people: "3 personas en total",
    vehicles: "3 vehículos por usuario",
    description: "Para una familia pequeña con varios vehículos.",
  },
  {
    value: "Premium",
    label: "Premium",
    price: "199 MXN / mes",
    people: "6 personas en total",
    vehicles: "Vehículos sin límite fijo",
    description: "Mayor capacidad con protecciones técnicas contra abuso.",
  },
];

function messageOf(error: unknown): string {
  return userSafeErrorMessage(
    error,
    "No pudimos guardar esta información. Inténtalo nuevamente.",
  );
}

function cleanOptional(value: string): string | null {
  const clean = value.trim();
  return clean.length > 0 ? clean : null;
}

function stepFromBackend(
  status: string | undefined,
  currentStep: number | undefined,
): RegistrationOnboardingStep {
  if (status === "Completed" || (currentStep ?? 0) >= 8) return 6;
  if ((currentStep ?? 0) >= 6) return 5;
  if ((currentStep ?? 0) >= 5) return 4;
  if ((currentStep ?? 0) >= 4) return 3;
  return 2;
}

type InvitationTarget = Pick<
  CreateFamilyInvitationInput,
  "username" | "publicProfileId" | "email"
>;

function invitationTarget(
  targetType: ProtectionOnboardingValues["targetType"],
  target: string,
): InvitationTarget {
  if (targetType === "email") return { email: target };
  if (targetType === "publicProfileId") return { publicProfileId: target };
  return { username: target };
}

function Progress({ step }: { step: RegistrationOnboardingStep }) {
  const activeIndex = step === 6 ? FLOW_STEPS.length : step - 1;

  return (
    <ol className="grid grid-cols-5 gap-2" aria-label="Progreso del registro">
      {FLOW_STEPS.map(({ label, icon: Icon }, index) => {
        const completed = index < activeIndex;
        const active = step !== 6 && index === activeIndex;
        return (
          <li key={label} className="min-w-0">
            <div
              className={cn(
                "flex h-1.5 rounded-full bg-panel-raised",
                (completed || active) && "bg-[var(--color-primary)]",
              )}
            />
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border border-line bg-panel-soft text-muted",
                  completed &&
                    "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-bg-main)]",
                  active && "border-[var(--color-primary)] text-brand",
                )}
              >
                {completed ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Icon className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <span
                className={cn(
                  "hidden truncate text-muted sm:inline",
                  (completed || active) && "font-medium text-primary",
                )}
              >
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PublicIdCard({ publicProfileId }: { publicProfileId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard?.writeText(publicProfileId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-xl border border-line bg-panel-soft p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Tu ID público de ImpactX
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-panel-raised px-3 py-2 text-sm font-semibold text-primary">
          {publicProfileId}
        </code>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Copy className="size-3.5" aria-hidden="true" />}
          onClick={() => void copy()}
        >
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Se generó automáticamente, es único y puedes compartirlo para recibir
        invitaciones. No sirve para iniciar sesión.
      </p>
    </div>
  );
}

function canonicalFamilyPlan(
  planName: string | null | undefined,
): FamilyPlanName {
  if (planName === "Basic" || planName === "Standard") return "Standard";
  if (planName === "Premium") return "Premium";
  return "Free";
}

interface PlanStepProps {
  current: FamilySubscriptionSummary | null | undefined;
  loading: boolean;
  error: unknown;
  onSubmit: (plan: FamilyPlanName) => void;
}

function PlanStep({ current, loading, error, onSubmit }: PlanStepProps) {
  const [selected, setSelected] = useState<FamilyPlanName>(() =>
    canonicalFamilyPlan(current?.planName),
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Paso 2 de 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Elige tu plan y grupo</h1>
        <p className="mt-1 text-sm text-muted">
          El plan Gratuito ya está seleccionado. Solo cambia la opción si deseas
          activar un plan de pago simulado.
        </p>
      </div>

      {error ? <Alert tone="error">{messageOf(error)}</Alert> : null}

      <div className="grid gap-3 lg:grid-cols-3">
        {ONBOARDING_PLANS.map((plan) => {
          const active = selected === plan.value;
          return (
            <button
              key={plan.value}
              type="button"
              className={cn(
                "rounded-xl border bg-panel p-4 text-left transition-colors",
                active
                  ? "border-[var(--color-primary)] outline outline-2 outline-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
                  : "border-line hover:border-line-strong",
              )}
              aria-pressed={active}
              onClick={() => setSelected(plan.value)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">{plan.label}</p>
                  <p className="mt-1 text-sm font-medium text-brand">
                    {plan.price}
                  </p>
                </div>
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full border border-line text-transparent",
                    active &&
                      "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-bg-main)]",
                  )}
                >
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-sm text-muted">{plan.description}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-secondary">
                <li>• {plan.people}</li>
                <li>• {plan.vehicles}</li>
              </ul>
            </button>
          );
        })}
      </div>

      <Alert tone="info">
        La capacidad total incluye a la persona titular. Los cobros de Estándar
        y Premium son simulados en esta versión.
      </Alert>

      <div className="flex justify-end">
        <Button loading={loading} onClick={() => onSubmit(selected)}>
          {selected === "Free"
            ? "Continuar con Gratuito"
            : `Activar ${ONBOARDING_PLANS.find((plan) => plan.value === selected)?.label}`}
        </Button>
      </div>
    </div>
  );
}

interface VehicleStepProps {
  hasVehicle: boolean;
  loading: boolean;
  error: unknown;
  onSubmit: (values: VehicleOnboardingValues) => void;
  onSkip: () => void;
  onUseExisting: () => void;
}

function VehicleStep({
  hasVehicle,
  loading,
  error,
  onSubmit,
  onSkip,
  onUseExisting,
}: VehicleStepProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleOnboardingValues>({
    resolver: zodResolver(vehicleOnboardingSchema),
    defaultValues: {
      tipoVehiculo: "Automovil",
      marca: "",
      modelo: "",
      ano: new Date().getFullYear(),
      velocidadPromedio: 40,
      usoPrincipalVehiculo: "Mixto",
      color: "",
      placa: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Paso 3 de 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          Registra tu vehículo principal
        </h1>
        <p className="mt-1 text-sm text-muted">
          Con estos datos identificaremos correctamente los viajes, alertas e
          incidentes asociados a tu cuenta.
        </p>
      </div>

      {hasVehicle ? (
        <Alert tone="success" title="Ya tienes un vehículo registrado">
          Puedes usarlo y continuar, o registrar otro si tu plan lo permite.
          <div className="mt-3">
            <Button size="sm" onClick={onUseExisting}>
              Usar vehículo existente
            </Button>
          </div>
        </Alert>
      ) : null}

      {error ? <Alert tone="error">{messageOf(error)}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Tipo de vehículo"
          required
          error={errors.tipoVehiculo?.message}
        >
          {(fieldId) => (
            <Select
              id={fieldId}
              className="h-10"
              options={VEHICLE_TYPES.map((value) => ({ value, label: value }))}
              invalid={Boolean(errors.tipoVehiculo)}
              {...register("tipoVehiculo")}
            />
          )}
        </FormField>
        <FormField
          label="Uso principal"
          required
          error={errors.usoPrincipalVehiculo?.message}
        >
          {(fieldId) => (
            <Select
              id={fieldId}
              className="h-10"
              options={VEHICLE_USES.map((value) => ({ value, label: value }))}
              invalid={Boolean(errors.usoPrincipalVehiculo)}
              {...register("usoPrincipalVehiculo")}
            />
          )}
        </FormField>
        <Controller
          name="marca"
          control={control}
          render={({ field: makeField }) => (
            <Controller
              name="modelo"
              control={control}
              render={({ field: modelField }) => (
                <VehicleMakeModelFields
                  make={makeField.value}
                  model={modelField.value}
                  makeError={errors.marca?.message}
                  modelError={errors.modelo?.message}
                  onMakeChange={makeField.onChange}
                  onModelChange={modelField.onChange}
                />
              )}
            />
          )}
        />
        <FormField label="Año" required error={errors.ano?.message}>
          {(fieldId) => (
            <Input
              id={fieldId}
              type="number"
              min={1886}
              max={2100}
              invalid={Boolean(errors.ano)}
              {...register("ano", { valueAsNumber: true })}
            />
          )}
        </FormField>
        <FormField
          label="Velocidad promedio"
          required
          hint="Kilómetros por hora aproximados."
          error={errors.velocidadPromedio?.message}
        >
          {(fieldId) => (
            <Input
              id={fieldId}
              type="number"
              min={0}
              max={300}
              step="0.1"
              invalid={Boolean(errors.velocidadPromedio)}
              {...register("velocidadPromedio", { valueAsNumber: true })}
            />
          )}
        </FormField>
        <FormField label="Color" error={errors.color?.message}>
          {(fieldId) => (
            <Input id={fieldId} placeholder="Blanco" {...register("color")} />
          )}
        </FormField>
        <FormField label="Placa" error={errors.placa?.message}>
          {(fieldId) => (
            <Input
              id={fieldId}
              autoCapitalize="characters"
              placeholder="ABC-123"
              {...register("placa")}
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={onSkip}
        >
          Omitir por ahora
        </Button>
        <Button type="submit" loading={loading}>
          Guardar y continuar
        </Button>
      </div>
    </form>
  );
}

interface MedicalStepProps {
  initial: MedicalProfile | null | undefined;
  loading: boolean;
  error: unknown;
  onSubmit: (values: MedicalOnboardingValues) => void;
  onSkip: () => void;
}

function MedicalStep({
  initial,
  loading,
  error,
  onSubmit,
  onSkip,
}: MedicalStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicalOnboardingValues>({
    resolver: zodResolver(medicalOnboardingSchema),
    defaultValues: {
      tipoSangre: initial?.tipoSangre ?? "",
      alergias: initial?.alergias ?? "",
      condiciones: initial?.condiciones ?? "",
      medicamentos: initial?.medicamentos ?? "",
      nota: initial?.nota ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Paso 4 de 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          Ficha médica de emergencia
        </h1>
        <p className="mt-1 text-sm text-muted">
          Es opcional, pero puede ayudar a tus contactos durante un incidente.
          Solo se comparte con consentimiento explícito.
        </p>
      </div>

      {error ? <Alert tone="error">{messageOf(error)}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo de sangre" error={errors.tipoSangre?.message}>
          {(fieldId) => (
            <Select
              id={fieldId}
              className="h-10"
              placeholder="Selecciona"
              options={[
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
                "No lo sé",
              ].map((value) => ({ value, label: value }))}
              {...register("tipoSangre")}
            />
          )}
        </FormField>
        <FormField label="Alergias" error={errors.alergias?.message}>
          {(fieldId) => (
            <Input
              id={fieldId}
              placeholder="Medicamentos, alimentos…"
              {...register("alergias")}
            />
          )}
        </FormField>
        <FormField
          label="Condiciones o padecimientos"
          error={errors.condiciones?.message}
        >
          {(fieldId) => (
            <Textarea
              id={fieldId}
              placeholder="Diabetes, hipertensión…"
              {...register("condiciones")}
            />
          )}
        </FormField>
        <FormField
          label="Medicamentos actuales"
          error={errors.medicamentos?.message}
        >
          {(fieldId) => (
            <Textarea
              id={fieldId}
              placeholder="Nombre y dosis, si aplica"
              {...register("medicamentos")}
            />
          )}
        </FormField>
      </div>

      <FormField label="Nota para una emergencia" error={errors.nota?.message}>
        {(fieldId) => (
          <Textarea
            id={fieldId}
            rows={4}
            placeholder="Información breve que debería conocer un contacto de confianza."
            {...register("nota")}
          />
        )}
      </FormField>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={onSkip}
        >
          Prefiero omitirla
        </Button>
        <Button type="submit" loading={loading}>
          Guardar y continuar
        </Button>
      </div>
    </form>
  );
}

interface ProtectionStepProps {
  loading: boolean;
  error: unknown;
  onSubmit: (values: ProtectionOnboardingValues) => void;
  onSkip: () => void;
}

function ProtectionStep({
  loading,
  error,
  onSubmit,
  onSkip,
}: ProtectionStepProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProtectionOnboardingValues>({
    resolver: zodResolver(protectionOnboardingSchema),
    defaultValues: {
      targetType: "username",
      target: "",
    },
  });

  const targetType = useWatch({
    control,
    name: "targetType",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Paso 5 de 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          Invita a tu grupo de protección
        </h1>
        <p className="mt-1 text-sm text-muted">
          Una sola invitación integra a la persona a tu plan. Después, cada
          integrante decide qué datos comparte y a quién designa como contacto
          SOS.
        </p>
      </div>

      {error ? <Alert tone="error">{messageOf(error)}</Alert> : null}

      <Alert tone="info" title="Modelo unificado">
        Ya no se envían invitaciones separadas de monitor y contacto de
        emergencia. Todos los integrantes pueden comunicarse y protegerse entre
        sí con permisos individuales.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-[13rem_1fr]">
        <FormField label="Buscar mediante" required>
          {(fieldId) => (
            <Select
              id={fieldId}
              className="h-10"
              options={[
                { value: "username", label: "Nombre de usuario" },
                { value: "publicProfileId", label: "ID público" },
                { value: "email", label: "Correo electrónico" },
              ]}
              {...register("targetType")}
            />
          )}
        </FormField>
        <FormField
          label="Persona a invitar"
          required
          error={errors.target?.message}
        >
          {(fieldId) => (
            <Input
              id={fieldId}
              placeholder={
                targetType === "email"
                  ? "persona@ejemplo.com"
                  : targetType === "publicProfileId"
                    ? "ID público de ImpactX"
                    : "nombre_usuario"
              }
              invalid={Boolean(errors.target)}
              {...register("target")}
            />
          )}
        </FormField>
      </div>


      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={onSkip}
        >
          Terminar sin invitar
        </Button>
        <Button type="submit" loading={loading}>
          Enviar invitación de grupo
        </Button>
      </div>
    </form>
  );
}

interface CompletionProps {
  publicProfileId: string;
  invitation: RegistrationInvitationResult | null;
  onDashboard: () => void;
}

function Completion({
  publicProfileId,
  invitation,
  onDashboard,
}: CompletionProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!invitation) return;
    await navigator.clipboard?.writeText(invitation.manualCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] text-success">
        <CheckCircle2 className="size-9" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-success">
          Registro completado
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Tu cuenta está lista</h1>
        <p className="mt-2 text-sm text-muted">
          Ya puedes consultar y administrar ImpactX desde tu panel.
        </p>
      </div>

      <PublicIdCard publicProfileId={publicProfileId} />

      {invitation ? (
        <Alert tone="warning" title="Guarda este código de invitación">
          <p className="mb-3">
            Se muestra una sola vez. Compártelo únicamente con la persona que
            invitaste a tu grupo de protección.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 rounded-lg bg-panel-raised px-3 py-2 text-center font-semibold text-primary">
              {invitation.manualCode}
            </code>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Copy className="size-3.5" aria-hidden="true" />}
              onClick={() => void copyCode()}
            >
              {copied ? "Copiado" : "Copiar código"}
            </Button>
          </div>
        </Alert>
      ) : null}

      <Button size="lg" fullWidth onClick={onDashboard}>
        Ir al panel principal
      </Button>
    </div>
  );
}

export function RegistrationOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [stepOverride, setStep] = useState<RegistrationOnboardingStep | null>(
    null,
  );
  const [invitationResult, setInvitationResult] =
    useState<RegistrationInvitationResult | null>(null);

  const profile = useQuery({
    queryKey: queryKeys.fullProfile,
    queryFn: ({ signal }) => profileApi.get(signal),
  });
  const vehicles = useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: ({ signal }) => vehiclesApi.getAll(signal),
  });

  const family = useQuery({
    queryKey: queryKeys.familyCurrent,
    queryFn: ({ signal }) => familyApi.getCurrent(signal),
  });

  const step =
    stepOverride ??
    (profile.data
      ? stepFromBackend(
          profile.data.onboarding?.status,
          profile.data.onboarding?.currentStep,
        )
      : 2);

  const publicProfileId =
    profile.data?.publicProfileId ?? user?.publicProfileId ?? user?.id ?? "";

  const refreshAfterStep = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.fullProfile }),
      queryClient.invalidateQueries({ queryKey: queryKeys.profileOnboarding }),
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles }),
      queryClient.invalidateQueries({ queryKey: queryKeys.family }),
    ]);
  };

  const planMutation = useMutation({
    mutationFn: async (planName: FamilyPlanName) => {
      const currentPlan = family.data
        ? canonicalFamilyPlan(family.data.planName)
        : null;

      if (!family.data) {
        await familyApi.activate(planName);
      } else if (currentPlan !== planName) {
        await familyApi.changePlan(planName);
      }

      await profileApi.updateOnboarding({ currentStep: 4 });
    },
    onSuccess: async () => {
      setStep(3);
      await refreshAfterStep();
    },
  });

  const vehicleMutation = useMutation({
    mutationFn: async (values: VehicleOnboardingValues) => {
      await profileApi.updateDriver({
        tipoVehiculo: values.tipoVehiculo,
        marca: values.marca.trim(),
        modelo: values.modelo.trim(),
        anio: values.ano,
        color: cleanOptional(values.color),
        placa: cleanOptional(values.placa),
        uso: values.usoPrincipalVehiculo,
        velocidadPromedioLabel: `${values.velocidadPromedio} km/h`,
      });
      await vehiclesApi.create({
        tipoVehiculo: values.tipoVehiculo,
        marca: values.marca.trim(),
        modelo: values.modelo.trim(),
        ano: values.ano,
        velocidadPromedio: values.velocidadPromedio,
        usoPrincipalVehiculo: values.usoPrincipalVehiculo,
        esPrincipal: true,
      });
      await profileApi.updateOnboarding({ currentStep: 5 });
    },
    onSuccess: async () => {
      setStep(4);
      await refreshAfterStep();
    },
  });

  const vehicleSkipMutation = useMutation({
    mutationFn: () => profileApi.updateOnboarding({ currentStep: 5 }),
    onSuccess: async () => {
      setStep(4);
      await refreshAfterStep();
    },
  });

  const medicalMutation = useMutation({
    mutationFn: async (values: MedicalOnboardingValues) => {
      await profileApi.updateMedical({
        tipoSangre: cleanOptional(values.tipoSangre),
        alergias: cleanOptional(values.alergias),
        condiciones: cleanOptional(values.condiciones),
        medicamentos: cleanOptional(values.medicamentos),
        nota: cleanOptional(values.nota),
      });
      await profileApi.updateOnboarding({
        currentStep: 6,
        medicalProfileStatus: "Completed",
      });
    },
    onSuccess: async () => {
      setStep(5);
      await refreshAfterStep();
    },
  });

  const medicalSkipMutation = useMutation({
    mutationFn: () =>
      profileApi.updateOnboarding({
        currentStep: 6,
        medicalProfileStatus: "Skipped",
      }),
    onSuccess: async () => {
      setStep(5);
      await refreshAfterStep();
    },
  });

  const protectionMutation = useMutation({
    mutationFn: async (
      values: ProtectionOnboardingValues,
    ): Promise<RegistrationInvitationResult> => {
      const target = values.target.trim();
      const targetFields = invitationTarget(values.targetType, target);

      const response = await familyApi.createInvitation(targetFields);
      await profileApi.updateOnboarding({
        currentStep: 8,
        status: "Completed",
      });
      return { kind: "group", manualCode: response.manualCode };
    },
    onSuccess: async (result) => {
      setInvitationResult(result);
      setStep(6);
      await Promise.all([
        refreshAfterStep(),
        queryClient.invalidateQueries({ queryKey: queryKeys.family }),
        queryClient.invalidateQueries({ queryKey: queryKeys.monitoring }),
      ]);
    },
  });

  const protectionSkipMutation = useMutation({
    mutationFn: () =>
      profileApi.updateOnboarding({ currentStep: 8, status: "Completed" }),
    onSuccess: async () => {
      setInvitationResult(null);
      setStep(6);
      await refreshAfterStep();
    },
  });

  const currentError = useMemo(() => {
    if (step === 2) return planMutation.error;
    if (step === 3) return vehicleMutation.error ?? vehicleSkipMutation.error;
    if (step === 4) return medicalMutation.error ?? medicalSkipMutation.error;
    if (step === 5)
      return protectionMutation.error ?? protectionSkipMutation.error;
    return null;
  }, [
    step,
    planMutation.error,
    vehicleMutation.error,
    vehicleSkipMutation.error,
    medicalMutation.error,
    medicalSkipMutation.error,
    protectionMutation.error,
    protectionSkipMutation.error,
  ]);

  if (profile.isPending || vehicles.isPending || family.isPending) {
    return (
      <AuthShell size="xl">
        <div className="grid min-h-80 place-items-center">
          <Spinner size="lg" label="Preparando tu registro…" />
        </div>
      </AuthShell>
    );
  }

  if (
    profile.isError ||
    vehicles.isError ||
    family.isError ||
    !publicProfileId
  ) {
    return (
      <AuthShell size="xl">
        <Alert tone="error" title="No pudimos preparar el registro">
          {messageOf(profile.error ?? vehicles.error ?? family.error)}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                void profile.refetch();
                void vehicles.refetch();
                void family.refetch();
              }}
            >
              Reintentar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/app/dashboard", { replace: true })}
            >
              Ir al panel
            </Button>
          </div>
        </Alert>
      </AuthShell>
    );
  }

  const busy =
    planMutation.isPending ||
    vehicleMutation.isPending ||
    vehicleSkipMutation.isPending ||
    medicalMutation.isPending ||
    medicalSkipMutation.isPending ||
    protectionMutation.isPending ||
    protectionSkipMutation.isPending;

  return (
    <AuthShell size="xl">
      <div className="space-y-6">
        <Progress step={step} />

        {step !== 6 ? <PublicIdCard publicProfileId={publicProfileId} /> : null}

        {step === 2 ? (
          <PlanStep
            current={family.data}
            loading={busy}
            error={currentError}
            onSubmit={(plan) => planMutation.mutate(plan)}
          />
        ) : null}

        {step === 3 ? (
          <VehicleStep
            hasVehicle={(vehicles.data?.length ?? 0) > 0}
            loading={busy}
            error={currentError}
            onSubmit={(values) => vehicleMutation.mutate(values)}
            onSkip={() => vehicleSkipMutation.mutate()}
            onUseExisting={() => vehicleSkipMutation.mutate()}
          />
        ) : null}

        {step === 4 ? (
          <MedicalStep
            initial={profile.data.fichaMedica}
            loading={busy}
            error={currentError}
            onSubmit={(values) => medicalMutation.mutate(values)}
            onSkip={() => medicalSkipMutation.mutate()}
          />
        ) : null}

        {step === 5 ? (
          <ProtectionStep
            loading={busy}
            error={currentError}
            onSubmit={(values) => protectionMutation.mutate(values)}
            onSkip={() => protectionSkipMutation.mutate()}
          />
        ) : null}

        {step === 6 ? (
          <Completion
            publicProfileId={publicProfileId}
            invitation={invitationResult}
            onDashboard={() => navigate("/app/dashboard", { replace: true })}
          />
        ) : null}
      </div>
    </AuthShell>
  );
}
