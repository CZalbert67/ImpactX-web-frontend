import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ComponentType<LucideProps>;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-panel-soft">
            <Icon className="size-5 text-brand" aria-hidden="true" />
          </div>
        ) : null}
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-prose text-sm text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}