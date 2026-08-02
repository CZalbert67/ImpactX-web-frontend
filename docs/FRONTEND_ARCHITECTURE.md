# ImpactX Frontend — Arquitectura

Documento de arquitectura de la Frontend Foundation. Complementa este `README.md` y
el `AGENTS.md` del backend.

## Objetivos

- Login/registro **funcionales contra el backend real** (Rutas V1 `POST /api/v1/auth/*`).
- Base profesional reutilizable: layout, themes 3, router, enlace HTTP, auth-store,
  manejo de errores, pruebas y CI.
- Cero endpoints inventados: todo consumido está auditado contra la OpenAPI del
  backend.

## Stack

| Área | Tecnología |
| --- | --- |
| UI | React 19 |
| Lenguaje | TypeScript 5.9 (strict) |
| Build | Vite 8 |
| Router | React Router 8 |
| HTTP | Axios (timeout, interceptors, refresh single-flight) |
| Server state | TanStack Query 5 |
| Forms | React Hook Form + Zod 4 |
| Estado cliente | Zustand 5 |
| Estilos | Tailwind CSS 4 + tokens |

## Estructura

```
src/
  app/         # Router, providers (Query, Theme, Session), guards/redirects
  api/         # client.ts, authApi, errors.ts, queryKeys.ts, generated schema.d.ts
  components/  # ui (Button, Input, ...), branding, layout (Shell, Sidebar, Topbar)
  config/      # env.ts (valida VITE_API_BASE_URL fail-fast)
  features/    # auth (login/register), dashboard (demo), theme
  hooks/       # useTheme, etc.
  lib/         # cn.ts, storage.ts, constants.ts
  pages/       # 404, 401, coming-soon
  styles/      # themes.css, globals.css, utilities.css
  test/        # setup + test-utils (renderApp, API mock)
```

## Flujo de auth

1. `AppProviders` → `SessionBootstrap` restaura sesión de `sessionStorage`.
2. `ProtectedRoute` valida `isAuthenticated`; si no, redirige a `/login?from=...`.
3. Login/register → `useLogin`/`useRegister` → `authApi.login/register` → store.
4. `RootRedirect` dirige `/` a la vista adecuada.

## Manejo de errores

- `extractErrorMessage`, `AppApiError` (RFC-7807) en `api/errors.ts`.
- UX: `isPending`/`isError`/`error` de Mutation → `Alert` o `ErrorState` muestran
  el mensaje del `AppApiError`.

## Seguridad

- Tokens solo en `sessionStorage`, nunca en logs/DOM.
- Interceptor de Axios añade `Authorization: Bearer` salvo rutas públicas de auth.
- `refresh` single-flight; fallo → `clearSession` + evento `session-expired`.