# ImpactX Frontend — Seguridad

Decisiones de seguridad del Frontend Foundation.

## Tokens

- Los tokens viven en `sessionStorage` (`impactx.session.v1`) — nunca en
  `localStorage` ni en cookies.
- No se registran tokens por consola ni en logs de red; los interceptores evitan
  imprimir headers sensibles.
- El `Authorization` se añade solo a rutas no públicas de auth.
- El store de sesión nunca expone tokens en el DOM ni en el bloque de estado.

## XSS

- React escapa el contenido por defecto; los errores del backend se renderizan
  como texto (`<p>`, `Alert`).
- El cliente HTTP rechaza payloads no-ProblemDetails en `AppApiError` con
  datos estructurados (sin devolver HTML).
- No se usa `dangerouslySetInnerHTML`.
- El dashboard demo solo renderiza componentes React y texto; no se inyecta
  HTML sin escapar.

## Autorización

- El frontend no confía en el `localStorage` para decidir estado: siempre usa el
  `AuthStatus` de Zustand y redirige si hay sesión expirada.
- `ProtectedRoute` muestra estado de carga mientras se restaura la sesión.

## Reduce exposición de datos

- El store solo guarda `user` (Id, Username, AppId, Nombre, Correo, Teléfono,
  PlanActivo) — sin contraseñas.
- Los prompts de login/registro esperan contraseña mínima, pero la validación final
  la hace el backend (zod supervisa el formato local).

## Dependencias

- `npm audit` sin vulnerabilidades al momento de la Fundación (se documenta en CI).
- `npm ci` como regla en CI para lockfile reproducible.

## CI

- Workflow `frontend-ci.yml`: typecheck + lint + test:run + build + npm audit.
- Workflow `frontend-codeql.yml`: análisis SAST JS/TS en push y PR a `main`.