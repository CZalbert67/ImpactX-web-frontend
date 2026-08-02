import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/** Skeleton del listado de viajes (zona accesible solo como decoración). */
export function TripListSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton className="mt-3 h-12" />
        </Card>
      ))}
    </div>
  );
}