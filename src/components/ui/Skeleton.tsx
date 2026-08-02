import { cn } from "@/lib/cn";

export type SkeletonVariant = "sm" | "rect" | "circle" | "text";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

const DEFAULT_CLASSES: Record<SkeletonVariant, string> = {
  sm: "h-8 w-full rounded-md",
  rect: "h-10 w-full rounded-md",
  circle: "h-10 w-10 rounded-full",
  text: "h-3 w-24 rounded-sm",
};

export function Skeleton({ variant = "rect", className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton", DEFAULT_CLASSES[variant], className)}
    />
  );
}