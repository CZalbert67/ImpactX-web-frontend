import { Contact, ShieldCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function RelationshipGuide() {
  return (
    <Card>
      <h2 className="font-semibold">Cómo se relacionan las personas en ImpactX</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-panel-soft p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Users className="size-4 text-brand" aria-hidden="true" />
            Miembro del plan
          </div>
          <p className="mt-2 text-sm text-muted">
            Hereda el plan y sus límites. No obtiene acceso automático a viajes,
            alertas o ficha médica de otra persona.
          </p>
        </div>
        <div className="rounded-xl bg-panel-soft p-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
            Monitor
          </div>
          <p className="mt-2 text-sm text-muted">
            Puede consultar únicamente los datos que la persona monitoreada le
            autorice. La relación es direccional.
          </p>
        </div>
        <div className="rounded-xl bg-panel-soft p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Contact className="size-4 text-brand" aria-hidden="true" />
            Contacto de emergencia
          </div>
          <p className="mt-2 text-sm text-muted">
            Es la persona prioritaria para apoyo durante una emergencia. No ve
            información continua salvo que también exista una relación de monitoreo.
          </p>
        </div>
      </div>
    </Card>
  );
}
