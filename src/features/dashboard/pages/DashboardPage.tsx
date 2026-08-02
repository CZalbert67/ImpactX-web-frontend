import { LayoutDashboard, Route, Play } from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useDashboardState } from "@/features/dashboard/hooks/useDashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { WelcomeCard } from "@/features/dashboard/components/WelcomeCard";
import { ConnectionStatusCard } from "@/features/dashboard/components/ConnectionStatusCard";
import { TripsSummaryCard } from "@/features/dashboard/components/TripsSummaryCard";
import { RecentTripsCard } from "@/features/dashboard/components/RecentTripsCard";
import { QuickActionsCard } from "@/features/dashboard/components/QuickActionsCard";
import { ActiveTripCard } from "@/features/trips/components/ActiveTripCard";
import { StartTripDialog } from "@/features/trips/components/StartTripDialog";
import { useDisclosure } from "@/hooks/useDisclosure";

export function DashboardPage() {
  const { user } = useSession();
  const dashboard = useDashboardState();
  const startDialog = useDisclosure();

  const displayName = user?.nombre || user?.username || "";
  const preparing = dashboard.view.kind === "loading";
  const failed = dashboard.view.kind === "error";

  return (
    <div aria-live="polite">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Resumen de tus viajes y del estado de la plataforma."
      />

      {preparing ? <DashboardSkeleton /> : null}

      {failed ? (
        <ErrorState
          title="No se pudo cargar el dashboard"
          description={dashboard.errorMessage}
          onRetry={dashboard.retry}
        />
      ) : null}

      {!preparing && !failed ? (
        <div className="space-y-6">
          <WelcomeCard displayName={displayName} />

          {dashboard.view.kind === "empty" ? (
            <EmptyState
              icon={Route}
              title="Aún no hay viajes"
              description="Cuando inicies tu primer viaje aparecerá aquí su resumen."
              action={
                <Button
                  leftIcon={<Play className="size-4" aria-hidden="true" />}
                  onClick={startDialog.open}
                >
                  Iniciar viaje
                </Button>
              }
            />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ConnectionStatusCard connectivity={dashboard.connectivity} />
            <ActiveTripCard trip={dashboard.activeTrip} />
            <TripsSummaryCard summary={dashboard.summary} />

            <div className="lg:col-span-2">
              <RecentTripsCard trips={dashboard.recentTrips} />
            </div>
            <QuickActionsCard
              actions={[
                { id: "viajes", label: "Ver viajes", to: "/app/trips" },
                {
                  id: "telemetria",
                  label: "Ver telemetría",
                  to: "/app/trips",
                },
              ]}
              startLabel="Iniciar viaje"
              onStart={startDialog.open}
            />
          </div>
        </div>
      ) : null}

      <StartTripDialog open={startDialog.isOpen} onClose={startDialog.close} />
    </div>
  );
}