import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "error" | "info";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-panel-soft text-secondary",
  brand: "bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] text-primary",
  success: "bg-[color-mix(in_srgb,var(--color-success)_16%,transparent)] text-success",
  warning: "bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-warning",
  error: "bg-[color-mix(in_srgb,var(--color-error)_16%,transparent)] text-error",
  info: "bg-[color-mix(in_srgb,var(--color-info)_16%,transparent)] text-info",
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}