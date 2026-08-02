import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import {
  registerSchema,
  type RegisterInputValues,
} from "@/features/auth/schemas/register.schema";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

export function RegisterForm() {
  const registerMutation = useRegister();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      correo: "",
      telefono: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!acceptedTerms) return;
    registerMutation.mutate(values);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-muted">
          Empieza a proteger tus viajes y tu salud con ImpactX.
        </p>
      </div>

      {registerMutation.isError ? (
        <Alert tone="error" role="alert">
          {registerMutation.error instanceof Error
            ? registerMutation.error.message
            : "No se pudo completar el registro."}
        </Alert>
      ) : null}

      <FormField
        label="Nombre"
        required
        error={errors.nombre?.message}
      >
        {(fieldId) => (
          <Input
            id={fieldId}
            autoComplete="name"
            placeholder="Tu nombre completo"
            invalid={Boolean(errors.nombre)}
            {...register("nombre")}
          />
        )}
      </FormField>

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
            {...register("correo")}
          />
        )}
      </FormField>

      <FormField
        label="Teléfono (opcional)"
        error={errors.telefono?.message}
      >
        {(fieldId) => (
          <Input
            id={fieldId}
            type="tel"
            autoComplete="tel"
            placeholder="55 0000 0000"
            invalid={Boolean(errors.telefono)}
            {...register("telefono")}
          />
        )}
      </FormField>

      <FormField
        label="Contraseña"
        required
        error={errors.password?.message}
        hint="Mínimo 8 caracteres."
      >
        {(fieldId) => (
          <PasswordInput
            id={fieldId}
            newPassword
            placeholder="Crea una contraseña segura"
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
        )}
      </FormField>

      <div className="flex items-start gap-2.5">
        <Checkbox
          id="register-terms"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
        />
<label
          htmlFor="register-terms"
          className="cursor-pointer text-sm text-muted"
        >
          Acepto los{" "}
          <span className="font-medium text-secondary underline">
            Términos de uso
          </span>{" "}
          y la{" "}
          <span className="font-medium text-secondary underline">
            Política de Privacidad
          </span>{" "}
          provisionales de ImpactX (se afinarán en la versión final).
        </label>
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={registerMutation.isPending}
        disabled={!acceptedTerms}
      >
        {registerMutation.isPending ? "Creando cuenta…" : "Crear cuenta"}
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