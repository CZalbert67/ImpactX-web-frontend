import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md";
  interactive?: boolean;
}

export function Card({
  padding = "md",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const paddingClass =
    padding === "none" ? "" : padding === "sm" ? "p-3" : "p-5";
  return (
    <div
      className={cn(
        "panel relative text-primary",
        paddingClass,
        interactive &&
          "transition-transform hover:-translate-y-0.5 hover:border-line-strong",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}