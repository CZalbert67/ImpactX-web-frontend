# ImpactX Frontend — Integración con la API

Cliente HTTP único, autenticación real contra el backend (Rutas V1) y manejo de
errores normalizado.

## Base URL

`VITE_API_BASE_URL` (ver `.env.example`). Por defecto apunta al backend real de
ImpactX:
`https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net`.

## Cliente (`src/api/client.ts`)

- `publicClient` — sin credenciales (login, register, refresh).
- `apiClient` — adjunta `Authorization: Bearer <token>` automáticamente a todo lo
  que no es una ruta pública de auth, y reintenta una vez con refresh-token
  (single-flight) cuando recibe 401.
- `timeout` 20 s y `CancelToken`/`signal` soportado.

## Autenticación (`src/features/auth/`)

1. `login`/`register` llaman a `POST /api/v1/auth/login` / `/register`.
2. El backend responde `AuthResponse` con `success`, `token`, `refreshToken`,
   `usuario`.
3. `setSession()` persiste en `sessionStorage` y actualiza el store (Zustand).
4. Guards (`ProtectedRoute`, `PublicRoute`) deciden el flujo. `RootRedirect`
   redirige según la sesión.
5. `logout` revoca la sesión y limpia storage.

## Almacenamiento

- Tokens: `sessionStorage` (sesión por pestaña), nunca `localStorage`.
- Claves: `impactx.session.v1`.

## Error handling

- `AppApiError` (RFC-7807 `ProblemDetails`) con `status`, `title`, `detail`.
- `extractError` prioriza `detail` > `title` > `message` > `mensaje`.
- 401/403 → `isAuthError`. 429 → mensaje de reintento. Error de red → `network`.

## Tipado de contrato

- `src/api/generated/schema.d.ts` regenerable con `npm run api:generate` desde el
  OpenAPI del backend (`/openapi/v1.json`).
- El tipado de `AuthResponse` se mantiene manual en `types/api.ts` para no depender
  del generador en flujos antiguos.