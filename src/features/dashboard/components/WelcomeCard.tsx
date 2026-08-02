import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
          Este es tu resumen general de seguridad, viajes y monitoreo.
        </p>
      </div>
      <Badge tone="info" icon={<Sparkles className="size-3" />}>
        Datos demo
      </Badge>
    </Card>
  );
}