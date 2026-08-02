import { useLocation } from "react-router";
import { Hammer } from "lucide-react";
import { findNavItem } from "@/components/layout/app-navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function ComingSoonPage() {
  const { pathname } = useLocation();
  const item = findNavItem(pathname);

  const title = item?.label ?? "Módulo";
  const description =
    item?.label ??
    "Este módulo se encuentra en construcción dentro de Frontend Foundation.";

  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <Hammer className="size-9 text-muted" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Próximamente</h2>
        <p className="max-w-md text-sm text-muted">
          El módulo «{title}» se integrará en una fase posterior de ImpactX.
          La navegación y la arquitectura ya están preparadas.
        </p>
        <Badge tone="info">Frontend Foundation</Badge>
      </Card>
    </div>
  );
}