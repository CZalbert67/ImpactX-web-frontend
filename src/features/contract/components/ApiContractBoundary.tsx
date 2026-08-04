import type { ReactNode } from "react";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useApiContract } from "@/features/contract/hooks/useApiContract";

export function ApiContractBoundary({ children }: { children: ReactNode }) {
  const state = useApiContract();

  if (import.meta.env.MODE === "test") return children;

  if (state.isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page text-primary">
        <Spinner size="lg" label="Validando contrato de la API…" />
      </div>
    );
  }

  if (state.isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page p-4 text-primary">
        <Card className="w-full max-w-lg">
          <div className="flex items-center gap-3">
            <TriangleAlert className="size-6 text-error" aria-hidden="true" />
            <h1 className="text-lg font-semibold">No se pudo validar la API</h1>
          </div>
          <p className="mt-3 text-sm text-secondary">
            El panel no habilita operaciones mientras no pueda comprobar el
            contrato publicado por ImpactX.
          </p>
          <Button className="mt-5" onClick={() => void state.retry()}>
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  if (!state.compatible) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page p-4 text-primary">
        <Card className="w-full max-w-xl">
          <Alert tone="error" title="Contrato incompatible">
            <p>
              Este frontend fue validado para el contrato {state.expectedVersion},
              pero la API publica {state.actualVersion ?? "una versión desconocida"}.
            </p>
          </Alert>
          <p className="mt-4 text-sm text-secondary">
            Por seguridad no se habilita el panel hasta actualizar y revisar
            nuevamente el frontend.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="sr-only" role="status">
        <ShieldCheck aria-hidden="true" /> Contrato ImpactX validado.
      </div>
      {children}
    </>
  );
}
