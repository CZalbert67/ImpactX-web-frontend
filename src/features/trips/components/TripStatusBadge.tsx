import { Badge } from "@/components/ui/Badge";
import { tripStateLabel, tripStateTone } from "@/features/trips/utils/state-labels";

export interface TripStatusBadgeProps {
  estado: string;
}

export function TripStatusBadge({ estado }: TripStatusBadgeProps) {
  return <Badge tone={tripStateTone(estado)}>{tripStateLabel(estado)}</Badge>;
}