import { Check, Palette } from "lucide-react";
import { THEMES, type ThemeId } from "@/lib/constants";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

const THEME_LABELS: Record<ThemeId, string> = {
  "impactx-neon": "ImpactX Neon",
  "impactx-professional": "Profesional",
  "impactx-light": "Claro",
};

export interface ThemeSelectorProps {
  /** Variante horizontal para la barra superior (select compacto). */
  compact?: boolean;
  className?: string;
}

/** Selector de tema accesible: grupo de botones con `aria-pressed`. */
export function ThemeSelector({ compact = false, className }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Temas de apariencia"
      className={cn(
        "flex items-center gap-1 rounded-lg border border-line bg-panel-soft p-1",
        className,
      )}
    >
      <Palette className="mx-1 size-4 text-muted" aria-hidden="true" />
      {THEMES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          aria-pressed={theme === id}
          title={THEME_LABELS[id]}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            theme === id
              ? "bg-panel-raised text-primary shadow-sm"
              : "text-muted hover:text-secondary",
          )}
        >
          {compact ? THEME_LABELS[id].split(" ")[0] : THEME_LABELS[id]}
          {theme === id ? (
            <Check className="ml-1.5 inline size-3 text-brand" aria-hidden="true" />
          ) : null}
        </button>
      ))}
    </div>
  );
}