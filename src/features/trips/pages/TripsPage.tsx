import { Car, Plus, Route } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ActiveTripCard } from "@/features/trips/components/ActiveTripCard";
import { StartTripDialog } from "@/features/trips/components/StartTripDialog";
import { TripListItem } from "@/features/trips/components/TripListItem";
import { TripListSkeleton } from "@/features/trips/components/TripListSkeleton";
import { useActiveTrip, useTrips } from "@/features/trips/hooks";
import { tripActionErrorMessage } from "@/features/trips/utils/error-messages";
import { useDisclosure } from "@/hooks/useDisclosure";

/**
 * Página de viajes: viaje activo destacado + listado paginado con
 * «Cargar más» (sin scroll infinito).
 */
export function TripsPage() {
  const trips = useTrips({ pageSize: 20 });
  const active = useActiveTrip();
  const startDialog = useDisclosure();

  const allTrips = trips.data?.pages.flatMap((page) => page.items) ?? [];
  const listErrorMessage = trips.isError
    ? tripActionErrorMessage(trips.error)
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Car}
        title="Viajes"
        description="Consulta, inicia, pausa, reanuda o finaliza tus viajes registrados."
        actions={
          <Button
            leftIcon={<Plus className="size-4" aria-hidden="true" />}
            onClick={startDialog.open}
          >
            Iniciar viaje
          </Button>
        }
      />

      <section aria-labelledby="trips-active-heading">
        <h2 id="trips-active-heading" className="mb-3 text-lg font-semibold">
          Viaje activo
        </h2>
        {active.isPending ? (
          <TripListSkeleton />
        ) : active.isError ? (
          <ErrorState
            title="No se pudo consultar el viaje activo"
            description={tripActionErrorMessage(active.error)}
            onRetry={() => void active.refetch()}
          />
        ) : (
          <ActiveTripCard trip={active.data ?? null} />
        )}
      </section>

      <section aria-labelledby="trips-history-heading">
        <h2 id="trips-history-heading" className="mb-3 text-lg font-semibold">
          Historial de viajes
        </h2>

        {trips.isLoading ? <TripListSkeleton /> : null}

        {trips.isError ? (
          <ErrorState
            title="No se pudieron cargar los viajes"
            description={listErrorMessage}
            onRetry={() => void trips.refetch()}
          />
        ) : null}

        {!trips.isError && trips.isFetched && allTrips.length === 0 ? (
          <EmptyState
            icon={Route}
            title="Aún no hay viajes"
            description="Cuando inicies un viaje aparecerá aquí su registro."
          />
        ) : null}

        {allTrips.length > 0 ? (
          <ul className="space-y-3">
            {allTrips.map((trip) => (
              <TripListItem key={trip.id} trip={trip} />
            ))}
          </ul>
        ) : null}

        {trips.hasNextPage ? (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => void trips.fetchNextPage()}
              loading={trips.isFetchingNextPage}
            >
              Cargar más
            </Button>
          </div>
        ) : null}
      </section>

      <StartTripDialog open={startDialog.isOpen} onClose={startDialog.close} />
    </div>
  );
}