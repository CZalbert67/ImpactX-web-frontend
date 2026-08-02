# ImpactX Web Frontend

Aplicación web de [ImpactX](https://impactx.app) — plataforma de seguridad vial, salud y monitoreo. Este repositorio contiene el **Frontend Foundation**: la base profesional del frontend web, construida desde cero sobre el backend real (Rutas V1 en Azure).
<!-- Trigger deployment with updated token -->

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | React 19 + TypeScript 5.9 (estricto) |
| Build | Vite 8 |
| Router | React Router 8 (`createBrowserRouter`) |
| Datos servidor | TanStack Query 5 + Axios 1 |
| Formularios | React Hook Form + Zod 4 |
| Estado cliente | Zustand 5 |
| Estilos | Tailwind CSS 4 + tokens de tema (3 temas) |
| Pruebas | Vitest 4 + React Testing Library |

## Repositorio

- **Rama de trabajo**: `feat/frontend-foundation`
- **Remoto:** `https://github.com/CZalbert67/ImpactX-web-frontend.git`
- **Característica de respaldo:** `refs/heads/backup/frontend-before-rebuild-2026-08-01` (inventario previo en `c465498`)

## Requisitos

- Node.js `>= 20.19.0` y npm `>= 10.0.0`
- Una URL de API accesible (por defecto el backend real de ImpactX)

## Instalación

```bash
npm install
```

Copia el ejemplo de entorno y ajústalo si es necesario:

```bash
cp .env.example .env
```

> `.env` está en `.gitignore`. **Nunca se versiona** ninguna clave, token ni URL privada. El valor por defecto de `VITE_API_BASE_URL` es el backend de ImpactX en Azure.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Typecheck + build de producción |
| `npm run preview` | Previsualización del build |
| `npm run typecheck` | `tsc -b` (sin emitir) |
| `npm run lint` | ESLint sobre el proyecto |
| `npm test` | Vitest (modo watch) |
| `npm run test:run` | Vitest de una sola pasada |
| `npm run test:coverage` | Cobertura |
| `npm run api:generate` | Regenera `src/api/generated/schema.d.ts` desde la OpenAPI del backend |

## Scripts disponibles

```bash
VITE_API_BASE_URL=http://localhost:5000 npm run dev
```

## Calidad

```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```

## Documentación

- [`docs/FRONTEND_ARCHITECTURE.md`](docs/FRONTEND_ARCHITECTURE.md) — estructura, flujo de datos, seguridad, decisiones.
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — sistema de diseño, temas y tokens.
- [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md) — cliente API, autenticación, errores, refresh token.
- [`docs/FRONTEND_SECURITY.md`](docs/FRONTEND_SECURITY.md) — decisiones de seguridad del frontend.

## Estado del alcance

- Auth funcional contra el backend real (`POST /api/v1/auth/*`).
- Resto de módulos representados con páginas «Próximamente» (dashboard demo).
- Marking «Datos demo» en el dashboard de la Frontend Foundation.