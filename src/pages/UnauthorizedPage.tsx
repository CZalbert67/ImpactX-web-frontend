import { Link, useLocation } from "react-router";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UnauthorizedPage() {
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/app/dashboard";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-page px-4 text-center text-primary">
      <ShieldX className="size-10 text-error" aria-hidden="true" />
      <h1 className="text-3xl font-bold">Acceso denegado</h1>
      <p className="max-w-sm text-sm text-muted">
        No tienes permisos para ver este recurso. Ponte en contacto con el
        administrador si crees que es un error.
      </p>
      <Link to={from} className="mt-2">
        <Button>Volver</Button>
      </Link>
    </div>
  );
}