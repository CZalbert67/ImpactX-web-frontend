import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

export interface EmptyStateProps {
  icon?: ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      {Icon ? (
        <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-panel-soft">
          <Icon className="size-6 text-muted" aria-hidden="true" />
        </div>
      ) : null}
      <p className="font-medium text-secondary">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}