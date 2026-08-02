import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Card } from "@/components/ui/Card";

export interface DashboardQuickAction {
  id: string;
  label: string;
  to: string;
}

export function QuickActionsCard({ actions }: { actions: DashboardQuickAction[] }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-secondary">Accesos rápidos</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <Link key={action.id} to={action.to} className="group flex items-center justify-between gap-2 rounded-lg border border-line bg-panel-soft px-3 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-panel-raised hover:text-primary">
            {action.label}<ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
