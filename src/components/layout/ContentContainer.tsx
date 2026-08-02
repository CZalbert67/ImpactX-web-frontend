import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  return <main id="app-content" className={cn("content-wrap py-6 md:py-8", className)}>{children}</main>;
}