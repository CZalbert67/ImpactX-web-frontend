import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      <Card>
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton className="mt-3 h-16" />
      </Card>
      <Card>
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton className="mt-3 h-16" />
      </Card>
      <Card>
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton className="mt-3 h-16" />
      </Card>
      <Card className="md:col-span-2">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton className="mt-3 h-24" />
      </Card>
    </div>
  );
}