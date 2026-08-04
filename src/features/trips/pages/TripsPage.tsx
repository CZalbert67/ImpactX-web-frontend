import { Car, Route } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ActiveTripCard } from "@/features/trips/components/ActiveTripCard";
import { TripListItem } from "@/features/trips/components/TripListItem";
import { TripListSkeleton } from "@/features/trips/components/TripListSkeleton";
import { useActiveTrip, useTrips } from "@/features/trips/hooks";
import { tripActionErrorMessage } from "@/features/trips/utils/error-messages";

export function TripsPage() {
  const trips = useTrips({ pageSize: 20 });
  const active = useActiveTrip();
  const allTrips = trips.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Car}
        title="Viajes"
        description="Consulta viajes y telemetría. Por seguridad, la web no inicia, pausa, reanuda ni finaliza viajes."
      />
      <Alert tone="info">
        El Galaxy Watch 8 inicia, pausa, reanuda y finaliza los viajes. Este panel web es exclusivamente de consulta.
      </Alert>

      <section aria-labelledby="trips-active-heading">
        <h2 id="trips-active-heading" className="mb-3 text-lg font-semibold">Viaje activo</h2>
        {active.isPending ? <TripListSkeleton /> : active.isError ? (
          <ErrorState title="No se pudo consultar el viaje activo" description={tripActionErrorMessage(active.error)} onRetry={() => void active.refetch()} />
        ) : <ActiveTripCard trip={active.data ?? null} />}
      </section>

      <section aria-labelledby="trips-history-heading">
        <h2 id="trips-history-heading" className="mb-3 text-lg font-semibold">Historial de viajes</h2>
        {trips.isLoading ? <TripListSkeleton /> : null}
        {trips.isError ? <ErrorState title="No se pudieron cargar los viajes" description={tripActionErrorMessage(trips.error)} onRetry={() => void trips.refetch()} /> : null}
        {!trips.isError && trips.isFetched && allTrips.length === 0 ? (
          <EmptyState icon={Route} title="Aún no hay viajes" description="Los viajes iniciados desde el Galaxy Watch 8 aparecerán aquí." />
        ) : null}
        {allTrips.length > 0 ? <ul className="space-y-3">{allTrips.map((trip) => <TripListItem key={trip.id} trip={trip} />)}</ul> : null}
        {trips.hasNextPage ? <div className="mt-4 flex justify-center"><Button variant="outline" onClick={() => void trips.fetchNextPage()} loading={trips.isFetchingNextPage}>Cargar más</Button></div> : null}
      </section>
    </div>
  );
}
