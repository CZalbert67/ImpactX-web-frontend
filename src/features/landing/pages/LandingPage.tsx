import {
  Activity,
  BellRing,
  CarFront,
  ChevronRight,
  ExternalLink,
  Gauge,
  HeartPulse,
  LockKeyhole,
  MapPinned,
  Play,
  Route,
  ShieldCheck,
  Users,
  Watch,
} from "lucide-react";
import { Link } from "react-router";
import { AppLogo } from "@/components/branding/AppLogo";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

const MARKETPLACE_URL =
  "https://www.mercadolibre.com.mx/smartwatch-samsung-galaxy-watch-8-44mm-blanco-con-correa-milanes-de-plata/p/MLM52053588#polycard_client=search-desktop&be_origin=backend&overlay_label=not_apply&search_layout=grid&position=4&type=product&tracking_id=501aa4a3-66ea-4a60-91e7-33b39a1daabb&wid=MLM4156751980&sid=search";

const CAPABILITIES = [
  {
    icon: Watch,
    title: "Control desde el wearable",
    description:
      "Inicia, pausa, reanuda y finaliza cada viaje directamente desde el reloj, sin depender del navegador.",
  },
  {
    icon: Activity,
    title: "Telemetría del recorrido",
    description:
      "Centraliza ubicación, movimiento y señales compatibles para analizar el comportamiento del viaje.",
  },
  {
    icon: BellRing,
    title: "Alertas y seguimiento",
    description:
      "Ante un posible incidente, ImpactX coordina avisos para las personas autorizadas dentro del grupo.",
  },
  {
    icon: Users,
    title: "Protección compartida",
    description:
      "Configura integrantes, permisos, contactos SOS y privacidad de manera individual y transparente.",
  },
] as const;

const FLOW_STEPS = [
  {
    number: "01",
    icon: Play,
    title: "Inicia el viaje",
    description: "El conductor activa manualmente el recorrido desde el Galaxy Watch8.",
  },
  {
    number: "02",
    icon: Gauge,
    title: "Registra señales",
    description: "El wearable recopila la información necesaria durante el trayecto.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Evalúa el evento",
    description: "ImpactX procesa la telemetría para identificar situaciones que requieren atención.",
  },
  {
    number: "04",
    icon: MapPinned,
    title: "Mantiene informados",
    description: "Los usuarios autorizados consultan alertas, ubicación, rutas e historial desde la web.",
  },
] as const;

const WATCH_FEATURES = [
  "Wear OS Powered by Samsung",
  "GPS y tecnologías de ubicación",
  "Acelerómetro y giroscopio",
  "Sensor óptico de frecuencia cardiaca",
] as const;

const WATCH_GALLERY = [
  {
    src: "/images/landing/galaxy-watch8-front.webp",
    alt: "Vista frontal y lateral del Samsung Galaxy Watch8",
  },
  {
    src: "/images/landing/galaxy-watch8-sensors.webp",
    alt: "Sensores posteriores del Samsung Galaxy Watch8",
  },
  {
    src: "/images/landing/galaxy-watch8-wrist.webp",
    alt: "Samsung Galaxy Watch8 colocado en una muñeca",
  },
  {
    src: "/images/landing/galaxy-watch8-design.webp",
    alt: "Composición promocional del diseño del Samsung Galaxy Watch8",
  },
] as const;

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-secondary sm:text-lg">
        {description}
      </p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-page text-primary">
      <header className="sticky top-0 z-50 border-b border-line bg-[color-mix(in_srgb,var(--color-bg-main)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Ir al inicio de ImpactX">
            <AppLogo />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-secondary lg:flex" aria-label="Navegación principal">
            <a className="transition-colors hover:text-primary" href="#impactx">
              Qué es ImpactX
            </a>
            <a className="transition-colors hover:text-primary" href="#funcionamiento">
              Cómo funciona
            </a>
            <a className="transition-colors hover:text-primary" href="#wearable">
              Wearable recomendado
            </a>
            <a className="transition-colors hover:text-primary" href="#seguridad">
              Seguridad y privacidad
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSelector compact className="hidden xl:flex" />
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-line-strong px-4 text-sm font-semibold text-primary transition-colors hover:bg-panel-soft"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="hidden h-10 items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-bg-main)] transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-[var(--color-primary)] opacity-10 blur-3xl" />
          <div className="pointer-events-none absolute -right-40 top-20 size-[28rem] rounded-full bg-[var(--color-secondary)] opacity-10 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.03fr_0.97fr] lg:px-8 lg:py-32">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-panel-soft px-3 py-1.5 text-sm font-medium text-secondary">
                <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
                Seguridad vial conectada
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Tu viaje, acompañado desde la muñeca.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-secondary sm:text-xl">
                ImpactX conecta wearable, aplicación móvil y plataforma web para registrar viajes,
                analizar telemetría y mantener informadas a las personas que tú autorices.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#funcionamiento"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 font-semibold text-[var(--color-bg-main)] transition-opacity hover:opacity-90"
                >
                  Conocer cómo funciona
                  <ChevronRight className="size-5" aria-hidden="true" />
                </a>
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-line-strong bg-panel px-6 font-semibold text-primary transition-colors hover:bg-panel-soft"
                >
                  Comenzar con ImpactX
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
                {[
                  ["Viajes", "Controlados desde el reloj"],
                  ["Monitoreo", "Sólo con autorización"],
                  ["Historial", "Disponible en la web"],
                ].map(([title, detail]) => (
                  <div key={title} className="border-l-2 border-[var(--color-primary)] pl-4">
                    <p className="font-semibold text-primary">{title}</p>
                    <p className="mt-1 text-sm text-muted">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-4 rounded-[2rem] bg-[var(--color-secondary)] opacity-10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-panel-raised p-3 shadow-[var(--shadow-lg)]">
                <img
                  src="/images/landing/galaxy-watch8-wrist.webp"
                  alt="Galaxy Watch8 utilizado como wearable objetivo de ImpactX"
                  className="aspect-square w-full rounded-[1.5rem] object-cover"
                  fetchPriority="high"
                />

                <div className="absolute bottom-7 left-7 right-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-line-strong bg-[color-mix(in_srgb,var(--color-bg-main)_86%,transparent)] p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <HeartPulse className="size-4 text-brand" aria-hidden="true" />
                      Señales del viaje
                    </div>
                    <p className="mt-1 text-xs text-secondary">Movimiento, ubicación y datos compatibles.</p>
                  </div>
                  <div className="rounded-xl border border-line-strong bg-[color-mix(in_srgb,var(--color-bg-main)_86%,transparent)] p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Route className="size-4 text-brand" aria-hidden="true" />
                      Consulta web
                    </div>
                    <p className="mt-1 text-xs text-secondary">Rutas, alertas, grupo e historial.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="impactx" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Plataforma ImpactX"
              title="Una experiencia de protección antes, durante y después del viaje"
              description="Cada módulo trabaja en conjunto para ofrecer seguimiento del recorrido sin quitarle al usuario el control de su información."
            />

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {CAPABILITIES.map(({ icon: Icon, title, description }) => (
                <article key={title} className="panel group p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-panel-soft text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-secondary">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="funcionamiento" className="scroll-mt-24 border-y border-line bg-secondary px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Flujo de protección"
              title="El viaje empieza en el reloj y continúa en todo tu ecosistema"
              description="El control del ciclo de vida permanece en el wearable. La web y el móvil permiten consultar el estado y la información autorizada."
            />

            <div className="mt-14 grid gap-4 lg:grid-cols-4">
              {FLOW_STEPS.map(({ number, icon: Icon, title, description }, index) => (
                <article key={number} className="relative rounded-2xl border border-line bg-panel p-6">
                  {index < FLOW_STEPS.length - 1 ? (
                    <div className="absolute -right-3 top-12 z-10 hidden size-6 items-center justify-center rounded-full border border-line-strong bg-panel-raised text-brand lg:flex">
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-panel-soft text-brand">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold tracking-[0.18em] text-muted">{number}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-secondary">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="wearable" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-[0.94fr_1.06fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-panel-soft px-3 py-1.5 text-sm font-medium text-secondary">
                  <Watch className="size-4 text-brand" aria-hidden="true" />
                  Wearable recomendado
                </div>
                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  Samsung Galaxy Watch8
                </h2>
                <p className="mt-5 text-lg leading-8 text-secondary">
                  Es el dispositivo objetivo del prototipo de ImpactX. Desde este reloj se controla
                  manualmente el viaje y se recopilan las señales compatibles que alimentan la experiencia.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {WATCH_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
                      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                      <span className="text-sm font-medium text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={MARKETPLACE_URL}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 font-semibold text-[var(--color-bg-main)] transition-opacity hover:opacity-90"
                  >
                    Ver en Mercado Libre
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                  <Link
                    to="/register"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-line-strong px-6 font-semibold text-primary transition-colors hover:bg-panel-soft"
                  >
                    Crear cuenta en ImpactX
                  </Link>
                </div>

                <p className="mt-4 text-xs leading-5 text-muted">
                  La disponibilidad, precio, versión y condiciones de compra dependen del vendedor.
                  ImpactX no procesa la venta del dispositivo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {WATCH_GALLERY.map((image, index) => (
                  <figure
                    key={image.src}
                    className={`overflow-hidden rounded-2xl border border-line bg-panel shadow-[var(--shadow-sm)] ${
                      index === 2 ? "row-span-2" : ""
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className={`h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03] ${
                        index === 2 ? "min-h-72" : "aspect-[16/10]"
                      }`}
                    />
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="seguridad" className="scroll-mt-24 border-y border-line bg-secondary px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Privacidad primero</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Tú decides quién puede ver cada dato.</h2>
              <p className="mt-4 leading-7 text-secondary">
                ImpactX separa los permisos de ubicación, rutas, telemetría, alertas y ficha médica para que
                cada relación tenga únicamente el acceso necesario.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
              {[
                {
                  icon: LockKeyhole,
                  title: "Permisos individuales",
                  description: "Cada integrante recibe una configuración propia y modificable.",
                },
                {
                  icon: HeartPulse,
                  title: "Consentimiento médico",
                  description: "La ficha médica requiere una autorización explícita e independiente.",
                },
                {
                  icon: CarFront,
                  title: "Control exclusivo del reloj",
                  description: "La web no inicia ni modifica el ciclo de vida de un viaje.",
                },
                {
                  icon: Route,
                  title: "Consulta trazable",
                  description: "El dashboard concentra viajes, incidencias y actividad autorizada.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-2xl border border-line bg-panel p-6">
                  <Icon className="size-6 text-brand" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-line-strong bg-panel-raised px-6 py-12 text-center shadow-[var(--shadow-lg)] sm:px-12">
            <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-[var(--color-primary)] opacity-10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-[var(--color-secondary)] opacity-10 blur-3xl" />
            <div className="relative">
              <ShieldCheck className="mx-auto size-10 text-brand" aria-hidden="true" />
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Construye tu red de protección con ImpactX
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-secondary">
                Registra tu cuenta, configura tu vehículo y conecta a las personas que deben acompañarte
                durante tus trayectos.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-primary)] px-7 font-semibold text-[var(--color-bg-main)] transition-opacity hover:opacity-90"
                >
                  Crear cuenta
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-line-strong px-7 font-semibold transition-colors hover:bg-panel-soft"
                >
                  Ya tengo una cuenta
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <AppLogo />
            <p className="mt-3 max-w-lg leading-6">
              Plataforma de seguridad vial y monitoreo autorizado. ImpactX no reemplaza a los servicios de
              emergencia ni a una evaluación médica profesional.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a className="hover:text-primary" href="#impactx">Qué es ImpactX</a>
            <a className="hover:text-primary" href="#wearable">Galaxy Watch8</a>
            <Link className="hover:text-primary" to="/legal/terms">Términos</Link>
            <Link className="hover:text-primary" to="/legal/privacy">Privacidad</Link>
            <Link className="hover:text-primary" to="/legal/consents">Consentimientos</Link>
            <Link className="hover:text-primary" to="/login">Iniciar sesión</Link>
            <Link className="hover:text-primary" to="/register">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
