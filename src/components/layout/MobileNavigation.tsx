import { X } from "lucide-react";
import { ImpactXLogo } from "@/components/branding/ImpactXLogo";
import { NavList } from "@/components/layout/NavList";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

export interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  if (!open) return null;

  return (
    <div className="md:hidden">
      <div className="bg-overlay fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-panel shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <ImpactXLogo size={26} />
          <IconButton icon={X} label="Cerrar menú de navegación" onClick={onClose} />
        </div>
        <NavList onNavigate={onClose} className="flex-1 overflow-y-auto px-2 py-3" />
        <div className="border-t border-line p-3">
          <ThemeSelector className="w-full justify-center" />
        </div>
      </div>
    </div>
  );
}