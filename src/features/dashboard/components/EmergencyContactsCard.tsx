import { Contact } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ContactSummary } from "@/features/dashboard/types";

export interface EmergencyContactsCardProps {
  contacts: ContactSummary[];
}

export function EmergencyContactsCard({
  contacts,
}: EmergencyContactsCardProps) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-secondary">
        Contactos de emergencia
      </h3>
      {contacts.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="Sin contactos"
          description="Agrega contactos de emergencia desde el módulo de contactos."
        />
      ) : (
        <ul className="space-y-3">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-panel-soft text-xs font-bold text-brand">
                {contact.nombre.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{contact.nombre}</p>
                <p className="text-xs text-muted">{contact.relacion}</p>
              </div>
              {contact.esPrincipal ? (
                <span className="text-[11px] font-medium text-success">
                  Principal
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}