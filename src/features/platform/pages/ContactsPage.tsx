import { Contact } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { GroupAccessManager } from "@/features/family/components/GroupAccessManager";

export function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Contact}
        title="Contactos SOS del grupo"
        description="Elige entre los integrantes del plan quién debe recibir primero una alerta de emergencia."
      />

      <Alert tone="info" title="No es otra invitación">
        Un contacto SOS ya debe pertenecer a tu grupo. Marcarlo como principal o secundario
        solo define el orden de aviso y no le concede acceso adicional a tus datos.
      </Alert>

      <Alert tone="info" title="Flujo del reloj">
        Cuando el wearable envía un SOS, ImpactX avisa primero a los contactos priorizados y
        después a los demás integrantes que tengan habilitadas las alertas críticas.
      </Alert>

      <GroupAccessManager
        title="Prioridad SOS y permisos"
        description="Prioridad 1 es el contacto principal. Los planes con más integrantes permiten prioridades adicionales."
      />
    </div>
  );
}
