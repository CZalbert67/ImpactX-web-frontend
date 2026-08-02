import { Link } from "react-router";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-page px-4 text-center text-primary">
      <Compass className="size-10 text-muted" aria-hidden="true" />
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-muted">
        La dirección no existe o fue movida. Revisa la URL o vuelve al inicio.
      </p>
      <Link to="/" className="mt-2">
        <Button>Ir al inicio</Button>
      </Link>
    </div>
  );
}