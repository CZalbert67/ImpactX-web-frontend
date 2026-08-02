import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type SpinnerSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
};

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", label = "Cargando", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2 text-muted", className)}
    >
      <LoaderCircle className={cn("spin", SIZE_CLASSES[size])} aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </span>
  );
}