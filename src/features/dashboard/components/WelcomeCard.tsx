import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface WelcomeCardProps {
  displayName: string;
}

export function WelcomeCard({ displayName }: WelcomeCardProps) {
  return (
    <Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-xl font-semibold">
          Hola, {displayName || "conductor"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Este es tu resumen general de viajes y monitoreo.
        </p>
      </div>
      <Sparkles className="size-5 text-brand" aria-hidden="true" />
    </Card>
  );
}