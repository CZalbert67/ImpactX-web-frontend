import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { SafetyStatus } from "@/features/dashboard/types";

const TONE_TO_BADGE: Record<SafetyStatus["tone"], BadgeTone> = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  neutral: "neutral",
};

export interface SafetyStatusCardProps {
  status: SafetyStatus;
}

export function SafetyStatusCard({ status }: SafetyStatusCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Estado general</p>
          <p className="mt-1 text-lg font-semibold">{status.label}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-panel-soft">
          <ShieldCheck
            className="size-5 text-[var(--color-success)]"
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="mt-3">
        <Badge tone={TONE_TO_BADGE[status.tone]}>{status.label}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted">{status.detail}</p>
    </Card>
  );
}