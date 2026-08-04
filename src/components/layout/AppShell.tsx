import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { STORAGE_KEYS } from "@/lib/constants";
import { localStorageAdapter } from "@/lib/storage";
import { ApiContractBoundary } from "@/features/contract";

function readCollapsedState(): boolean {
  return localStorageAdapter.get(STORAGE_KEYS.sidebarCollapsed) === "true";
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsedState);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorageAdapter.set(STORAGE_KEYS.sidebarCollapsed, String(next));
      return next;
    });
  };

  return (
    <ApiContractBoundary>
      <div className="flex min-h-dvh bg-page text-primary">
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <MobileNavigation
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <ContentContainer>
            <Outlet />
          </ContentContainer>
        </div>
      </div>
    </ApiContractBoundary>
  );
}