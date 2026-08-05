import { ArrowLeft, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { AppLogo } from "@/components/branding/AppLogo";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

interface LegalSection {
  title: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
}

interface LegalDocumentProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  version: string;
  updatedAt: string;
  summary: string;
  sections: readonly LegalSection[];
}

const PROTOTYPE_NOTICE =
  "Documento informativo del prototipo ImpactX. Antes de una operación comercial deben completarse la identidad, domicilio y canal de contacto del responsable, y el texto debe ser revisado por una persona profesional en materia legal y de protección de datos.";

function LegalDocument({
  icon: Icon,
  eyebrow,
  title,
  version,
  updatedAt,
  summary,
  sections,
}: LegalDocumentProps) {
  return (
    <div className="min-h-dvh bg-page text-primary">
      <header className="sticky top-0 z-40 border-b border-line bg-[color-mix(in_srgb,var(--color-bg-main)_90%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="Volver a la presentación de ImpactX">
            <AppLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line-strong px-3 text-sm font-semibold transition-colors hover:bg-panel-soft sm:px-4"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Volver a la presentación</span>
              <span className="sm:hidden">Inicio</span>
            </Link>
            <ThemeSelector compact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="panel overflow-hidden">
          <div className="border-b border-line bg-panel-soft px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex size-12 items-center justify-center rounded-xl bg-panel text-brand shadow-[var(--shadow-sm)]">
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-secondary">{summary}</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span>Versión: {version}</span>
              <span>Última actualización: {updatedAt}</span>
            </div>
          </div>

          <div className="space-y-9 px-6 py-8 sm:px-10 sm:py-10">
            <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4 text-sm leading-6 text-secondary">
              <strong className="text-primary">Aviso importante:</strong> {PROTOTYPE_NOTICE}
            </div>

            {sections.map((section) => (
              <section key={section.title} className="scroll-mt-24">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 leading-7 text-secondary">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-secondary marker:text-brand">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link to="/" className="font-semibold text-brand hover:underline">
            Volver a ImpactX
          </Link>
          <div className="flex flex-wrap gap-4 text-muted">
            <Link to="/legal/terms" className="hover:text-primary">Términos</Link>
            <Link to="/legal/privacy" className="hover:text-primary">Privacidad</Link>
            <Link to="/legal/consents" className="hover:text-primary">Consentimientos</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    title: "1. Objeto y aceptación",
    paragraphs: [
      "Estos Términos regulan el acceso y uso del prototipo ImpactX, una plataforma de seguridad vial que conecta un wearable, una aplicación móvil y una interfaz web. Al crear una cuenta y aceptar esta versión, la persona usuaria manifiesta haber leído y comprendido sus condiciones.",
    ],
  },
  {
    title: "2. Alcance del servicio",
    bullets: [
      "El inicio, pausa, reanudación y finalización de viajes se realiza exclusivamente desde el wearable compatible.",
      "La web permite consultar viajes, telemetría, alertas, incidentes, rutas, grupo y permisos, pero no controla el ciclo de vida del viaje.",
      "ImpactX es una herramienta preventiva y de apoyo; no sustituye a los servicios de emergencia, a una evaluación médica ni a las autoridades competentes.",
      "Las funciones, límites de planes, cobros y suscripciones pueden ser simulados mientras el producto permanezca en fase de prototipo.",
    ],
  },
  {
    title: "3. Cuenta y responsabilidades",
    bullets: [
      "La persona usuaria debe proporcionar información correcta, mantener sus credenciales en secreto y cerrar sesiones en dispositivos compartidos.",
      "No se permite utilizar la plataforma para acceder a información ajena, hostigar, suplantar identidades, enviar datos falsos o interferir con la operación del servicio.",
      "La persona usuaria es responsable de verificar que el wearable, la aplicación móvil, la conectividad y los permisos necesarios estén configurados antes de conducir.",
    ],
  },
  {
    title: "4. Grupos, monitoreo y permisos",
    paragraphs: [
      "Las relaciones de monitoreo requieren aceptación. Cada integrante controla los permisos que concede, incluidos ubicación, rutas, telemetría, alertas, incidentes, mensajes y ficha médica. La prioridad SOS no autoriza automáticamente el acceso a información adicional.",
    ],
  },
  {
    title: "5. Disponibilidad y limitaciones",
    paragraphs: [
      "El servicio puede interrumpirse por conectividad, batería, permisos del sistema, mantenimiento, fallos de terceros o condiciones fuera del control razonable de ImpactX. No se garantiza que una alerta sea recibida de forma inmediata ni que toda situación de riesgo sea detectada.",
    ],
  },
  {
    title: "6. Propiedad intelectual",
    paragraphs: [
      "La interfaz, código, documentación, identidad visual y demás contenidos propios de ImpactX están protegidos por la legislación aplicable. Las marcas, fotografías y productos de terceros pertenecen a sus respectivos titulares y se muestran únicamente con fines informativos o de compatibilidad.",
    ],
  },
  {
    title: "7. Suspensión, baja y cambios",
    paragraphs: [
      "La cuenta puede suspenderse o eliminarse por solicitud de la persona usuaria, incumplimiento grave, riesgo de seguridad o terminación del prototipo. Los cambios relevantes a estos Términos se comunicarán mediante la plataforma y se identificarán con una nueva versión.",
    ],
  },
  {
    title: "8. Ley aplicable y contacto",
    paragraphs: [
      "Este borrador está pensado para una operación en México. Antes de ofrecer el servicio comercialmente deben incorporarse la razón social, domicilio, medios de contacto, mecanismos de reclamación y, cuando corresponda, disposiciones de protección al consumidor y contratos de adhesión aplicables.",
    ],
  },
];

const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    title: "1. Responsable",
    paragraphs: [
      "ImpactX actúa como nombre del prototipo que determina el tratamiento de los datos. Antes de la operación comercial deben publicarse la identidad o razón social del responsable, su domicilio y un canal verificable para solicitudes de privacidad.",
    ],
  },
  {
    title: "2. Datos tratados",
    bullets: [
      "Identificación y contacto: nombre, correo, teléfono, nombre de usuario e identificador público.",
      "Cuenta y seguridad: credenciales protegidas, sesiones, roles, preferencias y registros técnicos.",
      "Vehículos y viajes: vehículo, estado del viaje, fechas, rutas, ubicación y métricas del recorrido.",
      "Telemetría del wearable: movimiento, aceleración, giroscopio, velocidad, ubicación y señales compatibles.",
      "Datos potencialmente sensibles: ficha médica, alergias, condiciones, medicamentos y señales fisiológicas que la persona decida proporcionar.",
      "Relaciones: integrantes del grupo, permisos, prioridades SOS, invitaciones, mensajes rápidos y notificaciones.",
    ],
  },
  {
    title: "3. Finalidades",
    bullets: [
      "Crear y administrar la cuenta, autenticar sesiones y proteger el acceso.",
      "Registrar y consultar viajes, telemetría, alertas, incidentes y rutas.",
      "Aplicar reglas de detección, generar avisos y mostrar información a personas autorizadas.",
      "Gestionar grupos, permisos, contactos SOS, mensajes y preferencias.",
      "Mantener seguridad, trazabilidad, diagnóstico, prevención de abuso y mejora del servicio.",
    ],
  },
  {
    title: "4. Consentimiento y datos sensibles",
    paragraphs: [
      "La ubicación durante viajes e incidentes, el análisis de patrones de conducción y la consulta de la ficha médica se sujetan a consentimientos específicos. La persona puede negar o retirar los consentimientos opcionales, aunque algunas funciones dejarán de estar disponibles.",
    ],
  },
  {
    title: "5. Compartición y encargados",
    paragraphs: [
      "Los datos sólo se muestran a integrantes con una relación vigente y los permisos concedidos. Proveedores de infraestructura, almacenamiento, notificaciones o seguridad pueden tratar información únicamente para prestar esos servicios y bajo las medidas contractuales aplicables. ImpactX no vende datos personales.",
    ],
  },
  {
    title: "6. Conservación",
    bullets: [
      "Viajes y telemetría: hasta 90 días en la configuración contractual actual del prototipo.",
      "Alertas e incidentes: hasta 365 días.",
      "Notificaciones: hasta 30 días.",
      "Otros datos se conservan mientras la cuenta esté activa o durante el periodo necesario para seguridad, cumplimiento y responsabilidades aplicables.",
    ],
  },
  {
    title: "7. Derechos y controles",
    paragraphs: [
      "La persona usuaria puede consultar y corregir su perfil, modificar permisos, retirar consentimientos, exportar información y solicitar la eliminación de la cuenta desde las funciones disponibles. Antes de operación comercial debe publicarse también un procedimiento integral para ejercer derechos de acceso, rectificación, cancelación y oposición, así como los medios para limitar uso o divulgación.",
    ],
  },
  {
    title: "8. Seguridad y cambios",
    paragraphs: [
      "ImpactX aplica autenticación, autorización, cifrado en tránsito, controles de acceso, registros técnicos y validaciones de servidor. Ningún sistema es infalible; los incidentes relevantes se atenderán conforme al procedimiento aplicable. Las modificaciones del aviso se identificarán mediante una nueva versión y fecha.",
    ],
  },
];

const CONSENT_SECTIONS: readonly LegalSection[] = [
  {
    title: "1. Ubicación durante viajes e incidentes",
    paragraphs: [
      "Permite registrar y procesar ubicación cuando existe un viaje o incidente para mostrar recorridos, mapas y alertas a las personas autorizadas. Negar o retirar este consentimiento puede impedir esas funciones, pero no debe bloquear el acceso básico a la cuenta.",
    ],
  },
  {
    title: "2. Patrones de conducción",
    paragraphs: [
      "Autoriza analizar señales del recorrido para mejorar reglas de detección y métricas. El prototipo debe evitar utilizar estos datos para decisiones comerciales, crediticias, laborales o de seguros sin un consentimiento separado y una base jurídica específica.",
    ],
  },
  {
    title: "3. Ficha médica y señales fisiológicas",
    paragraphs: [
      "La ficha médica y las señales fisiológicas pueden constituir datos sensibles. Su captura es opcional y su consulta por otra persona exige un permiso específico y consentimiento explícito del titular. No sustituyen un expediente clínico ni una valoración profesional.",
    ],
  },
  {
    title: "4. Telemetría del wearable",
    bullets: [
      "El wearable controla manualmente el viaje y envía únicamente información compatible con la versión instalada.",
      "La disponibilidad depende de sensores, batería, permisos, conectividad y sincronización.",
      "La persona debe revisar en el reloj y en la aplicación móvil que el viaje fue iniciado correctamente.",
    ],
  },
  {
    title: "5. Retiro del consentimiento",
    paragraphs: [
      "Los consentimientos opcionales pueden modificarse desde perfil, configuración, permisos del grupo o los controles del dispositivo. El retiro aplica hacia el futuro y puede limitar funciones que dependen técnicamente de los datos correspondientes.",
    ],
  },
];

export function TermsPage() {
  return (
    <LegalDocument
      icon={FileCheck2}
      eyebrow="Documento legal"
      title="Términos de uso"
      version="1.0-2026-08-03"
      updatedAt="3 de agosto de 2026"
      summary="Condiciones generales para utilizar el prototipo ImpactX y comprender sus alcances, responsabilidades y limitaciones."
      sections={TERMS_SECTIONS}
    />
  );
}

export function PrivacyNoticePage() {
  return (
    <LegalDocument
      icon={LockKeyhole}
      eyebrow="Protección de datos"
      title="Aviso de privacidad integral"
      version="1.0-2026-08-03"
      updatedAt="3 de agosto de 2026"
      summary="Información sobre las categorías de datos, finalidades, permisos, conservación y controles disponibles en ImpactX."
      sections={PRIVACY_SECTIONS}
    />
  );
}

export function DataConsentsPage() {
  return (
    <LegalDocument
      icon={ShieldCheck}
      eyebrow="Control de la persona usuaria"
      title="Consentimientos de datos y sensores"
      version="1.0-2026-08-03"
      updatedAt="3 de agosto de 2026"
      summary="Explicación de los consentimientos opcionales relacionados con ubicación, conducción, ficha médica y telemetría del wearable."
      sections={CONSENT_SECTIONS}
    />
  );
}
