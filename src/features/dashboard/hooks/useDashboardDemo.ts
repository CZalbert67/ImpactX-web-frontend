import { useCallback, useEffect, useState } from "react";
import { DASHBOARD_DEMO_DATA } from "@/features/dashboard/demo-data";
import type { DashboardState } from "@/features/dashboard/types";

/**
 * Estado de la pantalla Dashboard. Durante Frontend Foundation se resuelve
 * con datos de demostración tras un breve retardo de carga, para poder
 * apreciar los estados de loading/empty/error/ready.
 */
export interface DashboardController {
  state: DashboardState;
  retry: () => void;
}

export function useDashboardDemo(): DashboardController {
  const [state, setState] = useState<DashboardState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    const timer = window.setTimeout(() => {
      if (!active) return;
      setState({ kind: "ready", data: DASHBOARD_DEMO_DATA });
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ kind: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  return { state, retry };
}