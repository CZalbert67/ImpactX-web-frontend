import { userSafeErrorMessage } from "@/api/errors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { queryKeys } from "@/api/queryKeys";
import {
  registerSchema,
  type RegisterInputValues,
} from "@/features/auth/schemas/register.schema";
import { authApi } from "@/features/auth/api/authApi";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

export function RegisterForm() {
  const registerMutation = useRegister();
  const contract = useQuery({
    queryKey: queryKeys.registrationContract,
    queryFn: ({ signal }) => authApi.getRegistrationContract(signal),
    staleTime: 60 * 60 * 1000,
  });

  const {
    register: bind,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      username: "",
      correo: "",
      telefono: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      privacyAccepted: false,
      locationIncidentConsent: false,
      drivingPatternConsent: false,
    },
  });

  const onSubmit = handleSubmit((values) => registerMutation.mutate(values));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Paso 1 de 4
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-muted">
          Después te preguntaremos por tu vehículo, ficha médica y una persona
          de confianza. Puedes omitir los datos opcionales. Tu cuenta inicia en
          el plan Gratuito.
        </p>
      </div>

      {contract.isError ? (
        <Alert tone="warning">
          No fue posible consultar las versiones legales. Reintenta antes de
          completar el registro.
        </Alert>
      ) : null}

      {registerMutation.isError ? (
        <Alert tone="error" role="alert">
          {userSafeErrorMessage(registerMutation.error, "No pudimos crear la cuenta. Inténtalo nuevamente.")}
        </Alert>
      ) : null}

      <FormField label="Nombre" required error={errors.nombre?.message}>
        {(fieldId) => (
          <Input
            id={fieldId}
            autoComplete="name"
            placeholder="Tu nombre completo"
            invalid={Boolean(errors.nombre)}
            {...bind("nombre")}
          />
        )}
      </FormField>

      <FormField
        label="Nombre de usuario"
        required
        error={errors.username?.message}
        hint={contract.data?.username.description}
      >
        {(fieldId) => (
          <Input
            id={fieldId}
            autoComplete="username"
            placeholder="tu_usuario"
            invalid={Boolean(errors.username)}
            {...bind("username")}
          />
        )}
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Correo electrónico"
          required
          error={errors.correo?.message}
        >
          {(fieldId) => (
            <Input
              id={fieldId}
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              invalid={Boolean(errors.correo)}
              {...bind("correo")}
            />
          )}
        </FormField>

        <FormField
          label="Teléfono"
          required
          error={errors.telefono?.message}
        >
          {(fieldId) => (
            <Input
              id={fieldId}
              type="tel"
              autoComplete="tel"
              placeholder="55 0000 0000"
              invalid={Boolean(errors.telefono)}
              {...bind("telefono")}
            />
          )}
        </FormField>
      </div>

      <FormField
        label="Contraseña"
        required
        error={errors.password?.message}
        hint="8–100 caracteres, con mayúscula, minúscula, número y símbolo."
      >
        {(fieldId) => (
          <PasswordInput
            id={fieldId}
            newPassword
            placeholder="Crea una contraseña segura"
            invalid={Boolean(errors.password)}
            {...bind("password")}
          />
        )}
      </FormField>

      <FormField
        label="Confirmar contraseña"
        required
        error={errors.confirmPassword?.message}
      >
        {(fieldId) => (
          <PasswordInput
            id={fieldId}
            newPassword
            placeholder="Repite tu contraseña"
            invalid={Boolean(errors.confirmPassword)}
            {...bind("confirmPassword")}
          />
        )}
      </FormField>

      <div className="space-y-3 rounded-xl border border-line bg-panel-soft p-4">
        <label className="flex items-start gap-2.5 text-sm text-secondary">
          <Checkbox {...bind("termsAccepted")} invalid={Boolean(errors.termsAccepted)} />
          <span>
            Acepto los Términos de uso
            {contract.data ? ` (${contract.data.termsVersion})` : ""}.
          </span>
        </label>
        {errors.termsAccepted ? (
          <p className="text-xs text-error">{errors.termsAccepted.message}</p>
        ) : null}

        <label className="flex items-start gap-2.5 text-sm text-secondary">
          <Checkbox {...bind("privacyAccepted")} invalid={Boolean(errors.privacyAccepted)} />
          <span>
            Acepto el Aviso de privacidad
            {contract.data ? ` (${contract.data.privacyNoticeVersion})` : ""}.
          </span>
        </label>
        {errors.privacyAccepted ? (
          <p className="text-xs text-error">{errors.privacyAccepted.message}</p>
        ) : null}

        <label className="flex items-start gap-2.5 text-sm text-secondary">
          <Checkbox {...bind("locationIncidentConsent")} />
          Permito usar mi ubicación únicamente durante incidentes y viajes.
        </label>
        <label className="flex items-start gap-2.5 text-sm text-secondary">
          <Checkbox {...bind("drivingPatternConsent")} />
          Permito analizar patrones de conducción para mejorar la detección.
        </label>
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={registerMutation.isPending}
        disabled={contract.isPending || contract.isError}
      >
        {registerMutation.isPending ? "Creando cuenta…" : "Crear cuenta y continuar"}
      </Button>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
