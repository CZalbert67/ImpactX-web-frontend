import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router";
import { findNavItem } from "@/components/layout/app-navigation";

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const active = findNavItem(pathname);

  return (
    <nav aria-label="Hilo de navegación" className="text-sm text-muted">
      <ol className="flex min-w-0 items-center gap-1.5">
<li>
          <Link to="/app" className="hover:text-secondary">
            ImpactX
          </Link>
        </li>
        {active && active.to !== "/app/dashboard" ? (
          <>
            <li aria-hidden="true">
              <ChevronRight className="size-4" />
            </li>
            <li className="truncate font-medium text-secondary" aria-current="page">
              {active.label}
            </li>
          </>
        ) : null}
        {!active ? (
          <>
            <li aria-hidden="true">
              <ChevronRight className="size-4" />
            </li>
            <li className="truncate font-medium text-secondary" aria-current="page">
              {pathname.split("/").filter(Boolean).join(" · ") || "Inicio"}
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}