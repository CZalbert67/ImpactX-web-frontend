import { cn } from "@/lib/cn";
import { ImpactXMark } from "@/components/branding/ImpactXMark";

export interface ImpactXLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

/**
 * Logo con marca + logotipo de ImpactX.
 * Si `linkTo` se provee, envuelve en un enlace accesible.
 */
export function ImpactXLogo({
  size = 30,
  showText = true,
  className,
  linkTo,
}: ImpactXLogoProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-primary",
        !showText && "gap-0",
        className,
      )}
    >
      <ImpactXMark size={size} />
      {showText ? (
        <span className="text-lg font-bold tracking-tight">
          Impact<span className="text-brand">X</span>
        </span>
      ) : null}
    </span>
  );

  if (linkTo) {
    return <a href={linkTo}>{content}</a>;
  }
  return content;
}