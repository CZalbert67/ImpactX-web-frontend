import { Menu } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { IconButton } from "@/components/ui/IconButton";
import { UserMenu } from "@/components/layout/UserMenu";

export interface TopbarProps {
  onOpenMobileNav: () => void;
}

export function Topbar({ onOpenMobileNav }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-[var(--topbar-height)] items-center gap-3 border-b border-line bg-page px-4 md:px-6">
      <IconButton
        icon={Menu}
        label="Abrir menú de navegación"
        className="md:hidden"
        onClick={onOpenMobileNav}
      />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <ThemeSelector compact className="hidden sm:flex" />
        <UserMenu />
      </div>
    </header>
  );
}