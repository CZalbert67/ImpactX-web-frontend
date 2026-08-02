import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Inicia sesión</h1>
        <p className="mt-1 text-sm text-muted">
          Accede a tu panel de monitoreo de ImpactX.
        </p>
      </div>

      {login.isError ? (
        <Alert tone="error" role="alert">
          {login.error instanceof Error
            ? login.error.message
            : "No se pudo iniciar sesión."}
        </Alert>
      ) : null}

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
        label="Contraseña"
        required
        error={errors.password?.message}
      >
        {(fieldId) => (
          <PasswordInput
            id={fieldId}
            placeholder="Tu contraseña"
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
        )}
      </FormField>

      <Button type="submit" size="lg" fullWidth loading={login.isPending}>
        {login.isPending ? "Verificando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted">
        ¿Aún no tienes cuenta?{" "}
        <Link
          to="/register"
          className="font-medium text-brand hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}