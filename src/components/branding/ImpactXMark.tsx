import { cn } from "@/lib/cn";

interface ImpactXMarkProps {
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Símbolo de ImpactX: escudo + pulso cardiaco.
 * SVG propio, sin imágenes externas ni logotipos protegidos.
 */
export function ImpactXMark({
  size = 28,
  className,
  ariaHidden = true,
}: ImpactXMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden={ariaHidden}
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="ix-shield-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-secondary)" />
        </linearGradient>
      </defs>
      <path
        d="M32 5 L53 13 V31 C53 44 43.5 53.5 32 59 C20.5 53.5 11 44 11 31 V13 Z"
        fill="var(--color-panel-elevated)"
        stroke="var(--color-border-strong)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 32.2 H26.5 L30.5 24 L36 40 L40 32.2 H46.5"
        stroke="url(#impactx-shield-gradient)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M29 11.5 L35 11.5"
        stroke="url(#impactx-shield-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}