# ImpactX Web Frontend

Panel web React de ImpactX conectado al backend productivo en Azure y al contrato API V1 congelado `2026.08.04`.

La web administra los recursos permitidos para el cliente `web`. Los viajes y la telemetría son de solo lectura; iniciar, pausar, reanudar, finalizar y enviar telemetría corresponde exclusivamente al Galaxy Watch 8.

## Stack

- React 19 + TypeScript estricto
- Vite 8
- React Router 8
- TanStack Query + Axios
- React Hook Form + Zod
- Zustand
- Tailwind CSS 4
- Vitest + React Testing Library

## Requisitos

- Node.js `>= 22.22.2`
- npm `>= 10.9.0`

## Instalación

```bash
npm ci
cp .env.example .env
npm run api:generate
npm run dev
```

Configuración de producción incluida en `.env.example`:

```text
VITE_API_BASE_URL=https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net
VITE_API_CONTRACT_VERSION=2026.08.04
```

## Validación completa

```bash
bash scripts/verify-frontend.sh
```

El script comprueba la paleta original, fronteras de capacidad web, contrato OpenAPI, typecheck, lint, pruebas y build.

## Módulos web

- Registro V2, login, refresh y sesión web.
- Dashboard.
- Vehículos y vehículo principal.
- Plan familiar, miembros, invitaciones y renovación simulada.
- Relaciones de monitoreo y permisos.
- Mensajes rápidos.
- Viajes y telemetría en modo consulta.
- Alertas e incidentes.
- Contactos de emergencia mediante invitaciones aceptadas.
- Notificaciones.
- Rutas frecuentes e historial.
- Perfil, ficha médica opcional, preferencias y onboarding.
- Configuración y 2FA.
- Exportación, consentimientos, retención y eliminación de cuenta.

Las páginas principales antiguas de dispositivos y wearables fueron retiradas. El wearable se administra desde la aplicación móvil y el estado relevante se consulta mediante los módulos autorizados.

## Contrato y seguridad

Al entrar al panel se validan:

- `apiVersion: v1`
- `contractVersion: 2026.08.04`
- `status: frozen`
- capacidades publicadas para `web`

Ante una versión incompatible, el panel se bloquea para evitar operar contra un contrato no revisado.

## Temas

`src/styles/themes.css` se conserva byte por byte respecto al frontend recibido. Temas disponibles:

- ImpactX Neon
- Profesional
- Claro

## Documentación

- `docs/FRONTEND_COMPLETION_V1.md`
- `docs/FRONTEND_ARCHITECTURE.md`
- `docs/API_INTEGRATION.md`
- `docs/WEB_CAPABILITY_BOUNDARIES.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/FRONTEND_SECURITY.md`
