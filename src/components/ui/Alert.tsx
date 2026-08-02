import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertTone = "info" | "success" | "warning" | "error";

const TONE_MAP = {
  info: {
    icon: Info,
    classes: "border-line-strong bg-panel-soft text-secondary",
    title: "text-info",
    iconColor: "text-info",
  },
  success: {
    icon: CircleCheck,
    classes: "border-[color-mix(in_srgb,var(--color-success)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-primary",
    title: "text-success",
    iconColor: "text-success",
  },
  warning: {
    icon: TriangleAlert,
    classes: "border-[color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-primary",
    title: "text-warning",
    iconColor: "text-warning",
  },
  error: {
    icon: CircleAlert,
    classes: "border-[color-mix(in_srgb,var(--color-error)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] text-primary",
    title: "text-error",
    iconColor: "text-error",
  },
} as const;

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
  role?: "alert" | "status";
}

export function Alert({
  tone = "info",
  title,
  children,
  className,
  role = tone === "error" ? "alert" : "status",
}: AlertProps) {
  const { icon: Icon, classes, title: titleClass, iconColor } = TONE_MAP[tone];
  return (
    <div
      role={role}
      className={cn("flex gap-3 rounded-xl border p-4 text-sm", classes, className)}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconColor)} aria-hidden="true" />
      <div className="min-w-0">
        {title ? <p className={cn("font-semibold", titleClass)}>{title}</p> : null}
        <div className="text-inherit">{children}</div>
      </div>
    </div>
  );
}