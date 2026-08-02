# ImpactX Web Frontend

Panel web de ImpactX conectado al backend productivo en Azure. El frontend permite administrar la cuenta, vehículos, familia, monitoreo y recursos web autorizados, manteniendo el control de viajes y la ingesta de telemetría exclusivamente en móvil y wearable.

## Stack

- React 19 + TypeScript 5.9 estricto
- Vite 8
- React Router 8
- TanStack Query 5 + Axios
- React Hook Form + Zod
- Zustand
- Tailwind CSS 4 con los tres temas originales
- Vitest + React Testing Library

## Requisitos

- Node.js `>= 22.22.2`
- npm `>= 10.9.0`

Las versiones mínimas reflejan los requisitos de React Router 8 y JSDOM incluidos en el lockfile.

## Instalación

```bash
npm ci
cp .env.example .env
npm run api:generate
npm run dev
```

La URL predeterminada es:

```text
https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net
```

## Validación

```bash
bash scripts/verify-frontend.sh
```

La validación ejecuta generación OpenAPI, typecheck, lint, pruebas y build. También comprueba que la paleta original no haya cambiado y que la capa web no incluya mutaciones de control de viajes o telemetría.

## Módulos web

- Autenticación por correo o usuario, siempre con capacidad `web`.
- Dashboard y consulta de viajes/telemetría.
- Vehículos y vehículo principal.
- Suscripción familiar, miembros e invitaciones.
- Relaciones de monitoreo y permisos.
- Mensajes rápidos oficiales y personalizados.
- Alertas e incidentes.
- Rutas frecuentes e historial.
- Contactos de emergencia.
- Dispositivos y tokens de notificación.
- Notificaciones.
- Wearables en modo consulta.
- Perfil, ficha médica opcional, preferencias y onboarding.
- Configuración y 2FA.

## Límite de capacidad web

El frontend web **no** inicia, pausa, reanuda ni finaliza viajes; tampoco envía telemetría, crea alertas SOS ni vincula/calibra wearables. Aunque el OpenAPI generado describe el contrato completo del servidor, esos métodos no existen en la capa HTTP ni en la interfaz web.

## Temas

La paleta de `src/styles/themes.css` se conserva byte por byte respecto al `main` recibido. Temas disponibles:

- ImpactX Neon
- Profesional
- Claro

## Documentación

- `docs/FRONTEND_ARCHITECTURE.md`
- `docs/API_INTEGRATION.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/FRONTEND_SECURITY.md`
- `docs/FRONTEND_PHASE2_STATUS.md`
- `docs/WEB_CAPABILITY_BOUNDARIES.md`
