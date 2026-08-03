import { LayoutDashboard, Route } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSession } from "@/features/auth/hooks/useSession";
import { ConnectionStatusCard } from "@/features/dashboard/components/ConnectionStatusCard";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { QuickActionsCard } from "@/features/dashboard/components/QuickActionsCard";
import { RecentTripsCard } from "@/features/dashboard/components/RecentTripsCard";
import { TripsSummaryCard } from "@/features/dashboard/components/TripsSummaryCard";
import { WelcomeCard } from "@/features/dashboard/components/WelcomeCard";
import { useDashboardState } from "@/features/dashboard/hooks/useDashboard";
import { ActiveTripCard } from "@/features/trips/components/ActiveTripCard";

export function DashboardPage() {
  const { user } = useSession();
  const dashboard = useDashboardState();
  const preparing = dashboard.view.kind === "loading";
  const failed = dashboard.view.kind === "error";

  return (
    <div aria-live="polite">
      <PageHeader icon={LayoutDashboard} title="Dashboard" description="Resumen de viajes y acceso a los módulos principales del panel web." />
      {preparing ? <DashboardSkeleton /> : null}
      {failed ? <ErrorState title="No se pudo cargar el dashboard" description={dashboard.errorMessage} onRetry={dashboard.retry} /> : null}
      {!preparing && !failed ? (
        <div className="space-y-6">
          <WelcomeCard displayName={user?.nombre || user?.username || ""} />
          {dashboard.view.kind === "empty" ? <EmptyState icon={Route} title="Aún no hay viajes" description="Los viajes iniciados desde el Galaxy Watch 8 aparecerán en este panel." /> : null}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ConnectionStatusCard connectivity={dashboard.connectivity} />
            <ActiveTripCard trip={dashboard.activeTrip} />
            <TripsSummaryCard summary={dashboard.summary} />
            <div className="lg:col-span-2"><RecentTripsCard trips={dashboard.recentTrips} /></div>
            <QuickActionsCard actions={[
              { id: "vehicles", label: "Administrar vehículos", to: "/app/vehicles" },
              { id: "family", label: "Ver plan y grupo", to: "/app/family" },
              { id: "monitoring", label: "Abrir monitoreo", to: "/app/monitoring" },
              { id: "messages", label: "Mensajes rápidos", to: "/app/messages" },
              { id: "trips", label: "Consultar viajes", to: "/app/trips" },
              { id: "account", label: "Cuenta y privacidad", to: "/app/account" },
            ]} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
