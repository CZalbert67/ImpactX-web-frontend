import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { AppApiError } from "@/api/errors";

export function platformError(error: unknown): string {
  return error instanceof AppApiError ? error.message : "No se pudo completar la operación.";
}

export function formatPlatformDate(value: string | null | undefined): string {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function DataValue({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 break-words text-sm text-secondary">{children}</dd></div>;
}

export function MapLink({ lat, lng, label = "Abrir mapa" }: { lat: number; lng: number; label?: string }) {
  const href = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(lat))}&mlon=${encodeURIComponent(String(lng))}#map=16/${encodeURIComponent(String(lat))}/${encodeURIComponent(String(lng))}`;
  return <a className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline" href={href} target="_blank" rel="noreferrer">{label}<ExternalLink className="size-3.5" aria-hidden="true" /></a>;
}
