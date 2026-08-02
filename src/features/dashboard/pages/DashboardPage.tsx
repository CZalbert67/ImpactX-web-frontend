import { LayoutDashboard } from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useDashboardDemo } from "@/features/dashboard/hooks/useDashboardDemo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { WelcomeCard } from "@/features/dashboard/components/WelcomeCard";
import { SafetyStatusCard } from "@/features/dashboard/components/SafetyStatusCard";
import { ActiveTripCard } from "@/features/dashboard/components/ActiveTripCard";
import { RecentTripsCard } from "@/features/dashboard/components/RecentTripsCard";
import { RecentAlertsCard } from "@/features/dashboard/components/RecentAlertsCard";
import { WearableCard } from "@/features/dashboard/components/WearableCard";
import { EmergencyContactsCard } from "@/features/dashboard/components/EmergencyContactsCard";
import { NotificationsCard } from "@/features/dashboard/components/NotificationsCard";
import { QuickActionsCard } from "@/features/dashboard/components/QuickActionsCard";

export function DashboardPage() {
  const { state, retry } = useDashboardDemo();
  const { user } = useSession();
  const displayName = user?.nombre || user?.username || "";

  return (
    <div aria-live="polite">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Resumen de seguridad, viajes y dispositivos."
        actions={<Badge tone="info">Datos demo</Badge>}
      />

      {state.kind === "loading" ? <DashboardSkeleton /> : null}

      {state.kind === "error" ? (
        <ErrorState
          title="No se pudo cargar el dashboard"
          description={state.message}
          onRetry={retry}
        />
      ) : null}

      {state.kind === "empty" ? (
        <EmptyState
          title="Aún no hay información"
          description="Conecta un wearable o inicia tu primer viaje cuando los módulos estén listos."
        />
      ) : null}

      {state.kind === "ready" ? (
        <div className="space-y-6">
          <WelcomeCard displayName={displayName} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SafetyStatusCard status={state.data.safety} />
            <ActiveTripCard trip={state.data.activeTrip} />
            <WearableCard wearable={state.data.wearable} />

            <RecentTripsCard trips={state.data.recentTrips} />
            <RecentAlertsCard alerts={state.data.recentAlerts} />
            <NotificationsCard summary={state.data.notifications} />

            <div className="md:col-span-2">
              <EmergencyContactsCard contacts={state.data.contacts} />
            </div>
            <QuickActionsCard actions={state.data.quickActions} />
          </div>
        </div>
      ) : null}
    </div>
  );
}