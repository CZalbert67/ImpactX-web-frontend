# Estado técnico del Frontend — Fase 2

Fecha de auditoría: 2026-08-02
Rama: `feat/frontend-dashboard-trips`
Scope auditado: Dashboard real, Gestión de viajes, Detalle de viaje, Telemetría vinculada a TripId, Estados de UI (carga/error/vacío/reintento), Autenticación y rutas protegidas, integración con backend ImpactX.
Contrato de referencia: `https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net/openapi/v1.json`

---

## 1. Resumen ejecutivo

La implementación de Fase 2 **fue corregida y ya compila**: el bloque de reparación (pasos 1–7 del §21) quedó aplicado en el working tree y toda la validación automatizada está en verde.

Se reconstruyeron los módulos de Viajes y Telemetría eliminando el Dashboard demo de la Frontend Foundation y conectando consultas reales a endpoints auditados contra el OpenAPI (`/api/v1/trips`, `/api/v1/trips/active`, `/api/v1/trips/{id}/telemetry`, `/api/v1/trips/start|pause|resume|finish`, `/api/v1/analytics/trips/summary`). La arquitectura (TanStack Query + Axios + hooks por feature + parsing defensivo) es correcta y respeta el contrato real: **no se inventan endpoints ni cifras**.

Después de las correcciones, el estado técnico es:

| Comprobación | Resultado |
| --- | --- |
| TypeScript (`npm run typecheck`) | **0 errores** |
| ESLint (`npm run lint`) | **0 errores y 0 warnings** |
| Pruebas (`npm run test`) | **42/42 aprobadas** (10 archivos) |
| `DashboardPage.test.tsx` | **5/5 aprobadas** |
| Build (`npm run build`) | **Aprobado** (EXIT=0) |
| `npm audit --audit-level=high` | **0 vulnerabilidades** |

Correcciones aplicadas destacadas: se eliminó el `ActiveTripCard` demo huérfano (`src/features/dashboard/components/ActiveTripCard.tsx`); se repararon los exports de `isValidTripGuid` y `StartTripRequest`; se reconciliaron los tipos Zod ↔ React Hook Form en `StartTripDialog`; las funciones `velocitySeries`/`altitudeSeries` se movieron a `src/features/telemetry/utils/series.ts` (fin de los warnings `react-refresh`); las 4 mutaciones de viaje invalidan `queryKeys.tripsSummary`; y `summary.isPending` participa en el cálculo de `isLoading` del dashboard.

> **IMPORTANTE — La Fase 2 NO se declara concluida.** El código está verde en el working tree, pero todavía **faltan**:
> 1. **Commit y push** del bloque introducido.
> 2. **Pull Request y Azure Preview** (CI/Preview con la variable `VITE_API_BASE_URL` definida).
> 3. **Validación manual contra el backend desplegado** (escenario end-to-end).
> 4. **Aprobación y merge** de la rama.
> 5. **Despliegue y verificación en producción**.

Diagnóstico: la capa de datos y la implementación de Fase 2 están completas y en verde; el resto del trabajo es de proceso (commit, PR/preview, validación contra el backend desplegado, aprobación/merge y producción), no de código.

---

## 2. Estado actual de Git

- Rama actual: `feat/frontend-dashboard-trips`.
- La rama está **1 commit adelante** de `origin/feat/frontend-dashboard-trips` (commit `701350f chore: restore Azure Static Web App deployment workflow deleted during refactor`).
- **Todos los cambios de Fase 2 están SIN agregar a staging y son de "working tree"** (modificados/borrados + archivos nuevos sin rastrear). Todavía no se realizó ningún commit de la nueva implementación.
- No se ejecutaron `git stash`, `git reset`, `git rebase`, `git pull`, `git add`, `git commit` ni `git push` durante esta auditoría. No se modificó nada en `.github/workflows`.

### Cambios sin rastrear (working tree)

**Modificados (sin staging):**

| Archivo | Tipo de cambio |
| --- | --- |
| `src/api/errors.ts` | + `retryAfterSeconds` (lee `Retry-After` en 429) |
| `src/api/queryKeys.ts` | + `dashboard`, `trips`, `tripsList`, `tripDetail`, `activeTrip`, `tripTelemetry`, `tripsSummary` |
| `src/app/providers/QueryProvider.tsx` | + política de reintentos (`shouldRetryQuery`/`retryDelayQuery`) |
| `src/app/router/createAppRouter.tsx` | + rutas `/app/trips`, `/app/trips/:tripId`, `/app/trips/:tripId/telemetry` |
| `src/app/router/lazyRoutes.tsx` | + lazy de `TripsPage`, `TripDetailPage`, `TripTelemetryPage` |
| `src/components/layout/app-navigation.ts` | Viajes/Telemetría dejan de ser `soon`; apuntan a `/app/trips` |
| `src/features/dashboard/components/QuickActionsCard.tsx` | Soporta acciones reales + botón «Iniciar viaje» |
| `src/features/dashboard/components/RecentTripsCard.tsx` | Consume `Trip` real desde el listado |
| `src/features/dashboard/components/WelcomeCard.tsx` | Elimina el badge «Datos demo» |
| `src/features/dashboard/pages/DashboardPage.tsx` | Reescrito: consume datos reales |

**Borrados (working tree, 8):**
- `src/features/dashboard/components/EmergencyContactsCard.tsx`
- `src/features/dashboard/components/NotificationsCard.tsx`
- `src/features/dashboard/components/RecentAlertsCard.tsx`
- `src/features/dashboard/components/SafetyStatusCard.tsx`
- `src/features/dashboard/components/WearableCard.tsx`
- `src/features/dashboard/demo-data.ts`
- `src/features/dashboard/hooks/useDashboardDemo.ts`
- `src/features/dashboard/types.ts`

**Sin rastrear (untracked, 6 rutas / ~27 archivos):**
- `src/api/retryPolicy.ts`
- `src/features/dashboard/components/ConnectionStatusCard.tsx`
- `src/features/dashboard/components/TripsSummaryCard.tsx`
- `src/features/dashboard/hooks/useDashboard.ts`
- `src/features/telemetry/` (toda la feature: api, components, hooks, pages, types, utils)
- `src/features/trips/` (toda la feature: api, components, hooks, pages, schemas, types, utils)

**Otros:**
- `.env` y `.env.example` contienen `VITE_API_BASE_URL=https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net`. `.env` está en `.gitignore`.
- `dist/` y `coverage/` presentes (builds previos) — también ignorados por git (verificado aparte).

---

## 3. Funcionalidades completamente implementadas

Clasificación **funcional y conectada a la API real** (verificada: typecheck/lint/tests/build en verde):

1. **Creación de viaje** — `POST /api/v1/trips/start` con `StartTripRequest` tipado desde OpenAPI, formulario React-Hook-Form + Zod, modal `StartTripDialog`, bloqueo de doble envío, error visible. *(Tipos Zod ↔ RHF reconciliados.)*
2. **Acciones de viaje** — `pause`, `resume`, `finish` (mutaciones, confirmación en modal, `aria-live`).
3. **Listado de viajes** — `GET /api/v1/trips` paginado por `X-Continuation-Token` con «Cargar más» (uso infinito, sin scroll).
4. **Viaje activo** — `GET /api/v1/trips/active` con tratamiento de `404` → `null`.
5. **Telemetría por viaje (solo lectura)** — `GET /api/v1/trips/{id}/telemetry` paginada, tabla + gráficas SVG propias (sin dependencias), muestreo sin alterar valores.
6. **Estados de UI** — carga (`DashboardSkeleton`, `TripListSkeleton`, skeletons de tarjeta), error (con retry), vacío (`EmptyState`) en Dashboard, Viajes, Detalle y Telemetría.
7. **Reintentos de TanStack Query** — `retryPolicy` que no reintenta 400/401/403/404/409, reintenta red/5xx/429, respeta `Retry-After` (y ya sin la constante muerta `MAX_DELAY_MS`).
8. **Rutas y navegación** — nuevas rutas registradas y protegidas; los items de nav «Viajes» y «Telemetría» quedaron activos.
9. **Autenticación en las llamadas HTTP** — `apiClient` inyecta `Bearer`, single-flight refresh ante 401, logout limpia sesión.
10. **Invalidación de caché tras mutaciones** — start/pause/resume/finish invalidan `["trips"]`, `["dashboard"]` **y ahora `tripsSummary`** (el resumen del dashboard deja de quedar obsoleto).
11. **Estado de carga del dashboard** — `summary.isPending` participa en `isLoading` de `useDashboard` (no se pinta «ready» antes de tener el summary).

> Fase 2 **no está declarada concluida** (ver §1): quedan pendientes commit/push, PR + Azure Preview, validación manual, aprobación/merge y despliegue en producción.

---

## 4. Funcionalidades parcialmente implementadas

1. **Dashboard real** — estructura completa (conexión, resumen, viaje activo, recientes, accesos rápidos). Ya se invalidó `tripsSummary` tras mutaciones y `summary.isPending` participa en `isLoading`. **Residual:** `GET /api/v1/analytics/dashboard` (que sí existe en OpenAPI) **no se consume**; el `queryKey ["dashboard"]` se invalida en las mutaciones pero no se usa como raíz de ninguna consulta (decidir su uso o eliminarlo, ver §21 paso 6).
2. **Detalle de viaje** — reconstruido desde listado/caché (no existe endpoint de detalle). Limitación documentada: si el viaje está fuera de la primera página y no se paginó hasta él, se muestra «no encontrado» (404 lógico).
3. **Nav de Telemetría** — el item «Telemetría» apunta a `/app/trips` (la telemetría se elige por viaje). Funcional pero con fricción de UX.
4. **Pruebas de páginas** — `DashboardPage.test.tsx` reescrito con mocks de `tripsApi` y **5/5 verde**; aún **no hay** tests con mock para las páginas de Viajes ni para `useTripTelemetry` (el resto de la suite permanece en pruebas de bajo nivel en `api/`).

---

## 5. Funcionalidades todavía no implementadas

- **Ingesta de telemetría** en el frontend (POST/PATCH `/api/v1/trips/{id}/telemetry`) — corresponde al móvil/wearable, fuera de alcance (correcto que no exista).
- **Mapa/georuta** del viaje (no existe tal página).
- **Alertas, incidentes, SOS** (Fase 3).
- **Wearables, dispositivos, contactos, monitores, notificaciones, suscripción, perfil, configuración, rutas frecuentes** (Fase 3, todos `soon: true`).
- **Consumo de `GET /api/v1/analytics/dashboard`** para el dashboard (endpoint existe; no integrado).
- Validación numérica/adición para campos de formulario más allá de `StartTripRequest` (p. ej. no hay formularios de edición de viaje).
- Tests con mock para las páginas de Viajes y `useTripTelemetry` (solo el dashboard cuenta con mocks de `tripsApi`; no hay MSW).

---

## 6. Archivos modificados y propósito de cada cambio

| Archivo | Cambio | Propósito |
| --- | --- | --- |
| `src/api/errors.ts` | + `retryAfterSeconds` del header `Retry-After` (429) | Respetar backoff del backend en rate limit |
| `src/api/queryKeys.ts` | + `dashboard`, `trips`, subtablas y `tripsSummary` | Centralizar claves de consulta |
| `src/app/providers/QueryProvider.tsx` | `retry: 1` → `shouldRetryQuery`/`retryDelayQuery` | Política de reintentos granular |
| `src/app/router/createAppRouter.tsx` | + rutas Trips/Detalle/Telemetría | Enrutado de Fase 2 |
| `src/app/router/lazyRoutes.tsx` | + lazy loaders de las 3 páginas nuevas | Code splitting |
| `src/components/layout/app-navigation.ts` | Viajes/Telemetría funcionales | Navegación real |
| `src/features/dashboard/components/QuickActionsCard.tsx` | Tipado real + inicia viaje | Accesos rápidos conectados |
| `src/features/dashboard/components/RecentTripsCard.tsx` | usa `Trip` real, link a detalle | Recientes reales |
| `src/features/dashboard/components/WelcomeCard.tsx` | sin insignia «Datos demo» | Fin del demo |
| `src/features/dashboard/pages/DashboardPage.tsx` | composición real | Página real |

---

## 7. Archivos nuevos y propósito de cada archivo

**Feature Trips (`src/features/trips/`)**
| Archivo | Propósito |
| --- | --- |
| `api/tripsApi.ts` + `api/index.ts` | Capa HTTP de viajes (listado, activo, start, pause, resume, finish, summary) |
| `components/ActiveTripCard.tsx` | Tarjeta del viaje activo (estado real, sin duración inventada) |
| `components/ConfirmDialog.tsx` | Diálogo de confirmación reutilizable |
| `components/StartTripDialog.tsx` | Modal de inicio con RHF+Zod |
| `components/TripActionControls.tsx` | Controles pausa/reanudar/finalizar según el estado real del viaje |
| `components/TripListItem.tsx` | Fila del listado con links a detalle/telemetría |
| `components/TripListSkeleton.tsx` | Skeleton del listado |
| `components/TripStatusBadge.tsx` | Badge por estado real |
| `components/index.ts` | Barrel |
| `hooks/useTrips.ts`, `useActiveTrip.ts`, `useTripsSummary.ts`, `useTripDetail.ts` | Consultas reales |
| `hooks/useStartTrip.ts`, `usePauseTrip.ts`, `useResumeTrip.ts`, `useFinishTrip.ts` | Mutaciones con invalidación del listado |
| `hooks/tripCache.ts` | Lectura del listado desde caché (para detalle) |
| `hooks/index.ts` | Barrel |
| `pages/TripsPage.tsx`, `pages/TripDetailPage.tsx` | Páginas listado/detalle |
| `schemas/startTrip.schema.ts` + `schemas/index.ts` | Schema Zod + mapeo al DTO real |
| `types/trip.ts` + `types/index.ts` | Modelo de dominio + `TripsSummary` |
| `utils/display.ts`, `utils/error-messages.ts`, `utils/format.ts`, `utils/guid.ts`, `utils/pagination.ts`, `utils/state-labels.ts`, `utils/index.ts` | Formato, validación GUID, paginación con `X-Continuation-Token`, etiquetas, mensajes |

**Feature Telemetría (`src/features/telemetry/`)**
| Archivo | Propósito |
| --- | --- |
| `api/telemetryApi.ts` + `api/index.ts` | `GET /api/v1/trips/{id}/telemetry` |
| `components/TimeSeriesChart.tsx` | Gráfica SVG (velocidad/altitud) |
| `components/TelemetryCharts.tsx` | Composición de gráficas |
| `components/TelemetryTable.tsx` | Tabla accesible de datos |
| `components/index.ts` | Barrel |
| `hooks/useTripTelemetry.ts` + `hooks/index.ts` | Query paginada |
| `pages/TripTelemetryPage.tsx` + `pages/index.ts` | Página |
| `types/telemetry.ts` + `types/index.ts` | `TelemetryPointDto` + parseo defensivo |
| `utils/sample.ts` | Muestreo de series (sin alterar valores) |
| `utils/series.ts` | `SeriesDatum` + `toSeries`/`velocitySeries`/`altitudeSeries` (extraídas de `TimeSeriesChart`) |

**Dashboard (nuevos)**
| Archivo | Propósito |
| --- | --- |
| `src/features/dashboard/hooks/useDashboard.ts` | Estado del dashboard real (viaje activo + listado + summary) |
| `src/features/dashboard/components/ConnectionStatusCard.tsx` | Estado de conexión derivado de la API |
| `src/features/dashboard/components/TripsSummaryCard.tsx` | Métricas del summary (con «no disponible») |

**API**
| Archivo | Propósito |
| --- | --- |
| `src/api/retryPolicy.ts` | Política de reintentos de TanStack Query |

---

## 8. Archivos eliminados y justificación de cada eliminación

Todos los eliminados eran **documentación/demo puro** de la «Frontend Foundation» (su propia cabecera lo indicaba) y su eliminación forma parte de la nueva implementación real del dashboard. **Ninguno se restaura.**

| File | Tipo | ¿Fue correcto borrarlo? |
| --- | --- | --- |
| `src/features/dashboard/demo-data.ts` | demo-data | ✔️ Sí (datos demo). |
| `src/features/dashboard/hooks/useDashboardDemo.ts` | hook de demo | ✔️ Sí (simula 350ms con datos demo). |
| `src/features/dashboard/types.ts` | tipos del dashboard demo | ✔️ Sí, era el contrato demo. |
| `EmergencyContactsCard.tsx` | demo (contactos) | ✔️ Sí — no es de Fase 2. |
| `NotificationsCard.tsx` | demo (notificaciones) | ✔️ Sí — Fase 3. |
| `RecentAlertsCard.tsx` | demo (alertas) | ✔️ Sí — Fase 3. |
| `SafetyStatusCard.tsx` | demo (estado de seguridad) | ✔️ Sí — no tiene back directo en alcance. |
| `WearableCard.tsx` | demo (wearable) | ✔️ Sí — Fase 3. |
| `src/features/dashboard/components/ActiveTripCard.tsx` | demo huérfano (importaba `@/features/dashboard/types`, eliminado) | ✔️ Sí — borrado en la corrección; se usa `trips/components/ActiveTripCard.tsx`. |

**Conclusión:** las eliminaciones fueron apropiadas. Tras las correcciones ya no queda ningún huérfano residual que rompa el build; el `ActiveTripCard` demo se borró como parte del bloque de reparación. `QuickActionsCard`, `RecentTripsCard` y `WelcomeCard` fueron modificadas, no borradas.

---

## 9. Rutas del frontend existentes

| Ruta | Tipo de acceso | Página | Estado | Fuente de datos |
| --- | --- | --- | --- | --- |
| `/` | Redirecciona | — | ok | — |
| `/login` | Pública (PublicRoute) | LoginPage | ok | auth API |
| `/register` | Pública (PublicRoute) | RegisterPage | ok | auth API |
| `/unauthorized` | Pública | UnauthorizedPage | ok | — |
| `/app` | Protegida | AppShell → Navigate `/app/dashboard` | ok | — |
| `/app/dashboard` | Protegida | DashboardPage | ✅ ok | `useTrips`, `useActiveTrip`, `useTripsSummary` (API real) |
| `/app/trips` | Protegida | TripsPage | ✅ ok | `GET /api/v1/trips`, `GET /api/v1/trips/active` |
| `/app/trips/:tripId` | Protegida | TripDetailPage | ✅ ok | caché listado + relectura real |
| `/app/trips/:tripId/telemetry` | Protegida | TripTelemetryPage | ✅ ok | `GET /api/v1/trips/{id}/telemetry` |
| `/app/*` (otras) | Protegida | ComingSoonPage | ok | — |
| `*` | 404 | NotFoundPage | ok | — |

Nota: las rutas heredadas de la nav (`/app/alertas`, `/app/contactos`, etc.) siguen `soon` y caen en ComingSoon.

---

## 10. Integraciones HTTP existentes

| Método | Endpoint | Hook / servicio | DTO | ¿Llamada real (no demo)? | Correspondencia OpenAPI |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/trips` | `useTrips` → `tripsApi.getTrips` | `Trip` (parseo defensivo) | ✅ | Endpoint real; resp. sin content-type en contratos; paginación por `pageSize` + `X-Continuation-Token` |
| GET | `/api/v1/trips/active` | `useActiveTrip` → `tripsApi.getActiveTrip` | `Trip \| null` (404→null) | ✅ | Existe; respuesta sin esquema en el contrato |
| POST | `/api/v1/trips/start` | `useStartTrip` → `tripsApi.startTrip` | body `StartTripRequest` | ✅ | Existe; body documentado |
| POST | `/api/v1/trips/{id}/pause` | `usePauseTrip` | — | ✅ | Existe |
| POST | `/api/v1/trips/{id}/resume` | `useResumeTrip` | — | ✅ | Existe |
| POST | `/api/v1/trips/{id}/finish` | `useFinishTrip` | — | ✅ | Existe |
| GET | `/api/v1/trips/{id}/telemetry` | `useTripTelemetry` → `telemetryApi.getTripTelemetry` | `TelemetryPointDto` → `TelemetryRow` | ✅ | Existe; paginación igual |
| GET | `/api/v1/analytics/trips/summary` | `useTripsSummary` → `tripsApi.getTripsSummary` | `TripsSummary` (defensivo) | ✅ | Existe (respuesta sin esquema en el contrato) |

**Observaciones de contrato:**
- **No existe** `GET /api/v1/trips/{id}` → el detalle se reconstruye con listado/caché (decisión correcta y documentada).
- **No se consume** `GET /api/v1/analytics/dashboard` pese a existir.
- Las respuestas 200 de trips/active/telemetry/summary **no declaran content-schema** en el OpenAPI (200 sin `content`): el frontend parsea defensivamente y no inventa números. Coherente con la restricción de «no inventar endpoints / datos».
- `POST /trips/{id}/telemetry` y `PATCH /trips/{id}/telemetry` existen pero corresponden a la ingesta (móvil/wearable); correctamente **no** se enviarán desde el navegador.

---

## 11. Estado del Dashboard

- **Hook** `useDashboard` (`src/features/dashboard/hooks/useDashboard.ts`) compone 3 consultas real de la API: viaje activo, listado reciente (primera página, `pageSize=5`) y summary.
- View lógico cubre loading/error/empty/ready; conectividad "online/offline" según red.
- Tarjetas: `WelcomeCard`, `ConnectionStatusCard`, `ActiveTripCard` (trips), `TripsSummaryCard`, `RecentTripsCard`, `QuickActionsCard`.
- El dashboard **no inventa métricas**: si el DTO no trae `distanciaTotalKm`/`duracionPromedioMin`/`total` finitos muestra «Información no disponible».
- **Correcciones aplicadas:** `queryKeys.tripsSummary` ya se invalida en `useStartTrip/Pause/Resume/Finish` (el resumen deja de quedar estancado), y `summary.isPending` participa en `isLoading` del view (no pinta «ready» sin summary).
- **Puntos abiertos:**
  1. `queryKeys.dashboard = ["dashboard"]` se usa solo para invalidar y no como queryKey de trabajo (decidir si se consume `GET /api/v1/analytics/dashboard` o se elimina la clave).
  2. No se consume `GET /api/v1/analytics/dashboard` pese a existir en el OpenAPI.
- **UI de estados implementada**: skeleton loading, error con reintento, empty (sin viajes → EmptyState + botón «Iniciar viaje»). Cubierto por `DashboardPage.test.tsx` (5/5, con mocks de `tripsApi`).

---

## 12. Estado del módulo de Viajes

- **Página** `TripsPage`: sección "Viaje activo" + "Historial" con paginación «Cargar más», estados loading/error/empty.
- **Listado**: `GET /api/v1/trips` (infinite query, `pageSize 20`), parseo de arreglo + token `X-Continuation-Token`.
- **Acciones**: start (modal RHF+Zod), pause/resume/finish con confirmación; invalida `["trips"]` (list/detail/telemetry/active) y `["dashboard"]`.
- **Detalle** `TripDetailPage`: `useTripDetail` → caché o primera página del listado; muestra inicio/fin/duración/dispositivo + controles + link a telemetría; 404 lógico si no aparece.
- **Cambio de estado laboral**: `classifyTripState` reconoce alias en es/en. `canPause/canResume/canFinish` se derivan del estado real.
- **Deuda**:
   - `useTripDetail` limitado a primera página (sin más páginas puede dar falsos 404).
   - Sin tests con mock para las páginas de Viajes (ver §4).
   - La nav de «Telemetría» conduce a `/app/trips` (elección manual del viaje).

---

## 13. Estado del módulo de Telemetría

- Relacionada **por TripId** (ruta `/api/v1/trips/{tripId}/telemetry`), paginada por `X-Continuation-Token`.
- `useTripTelemetry` deshabilitada si el GUID del viaje es inválido (nunca llama con GUID inválido).
- Muestra: gráfica velocidad (km/h) y altitud (m) contra tiempo (SVG propio, sin librerías), tabla completa accesible, botón «Cargar más».
- **Importante:** **no se grafica ni selecciona lat/lng de forma inconsistente**; la tabla sí muestra las coordenadas.
- Las helpers de series (`SeriesDatum`, `toSeries`, `velocitySeries`, `altitudeSeries`) viven en `src/features/telemetry/utils/series.ts`; `TimeSeriesChart` es únicamente el componente (cero warnings `react-refresh`).

---

## 14. Datos demo, mocks o valores temporales restantes

| Ubicación | Qué hay | Estado |
| --- | --- | --- |
| `src/features/dashboard/DashboardPage.test.tsx` | Reescrito con mocks de `tripsApi` (ready/empty/error/loading + bienvenida) sobre el dashboard real | ✔️ 5/5 aprobadas, sin datos demo |
| `src/features/dashboard/components/ActiveTripCard.tsx` | Huérfano del demo (importaba `@/features/dashboard/types` eliminado) | **eliminado** (usado: `trips/components/ActiveTripCard.tsx`) |
| `src/config/env.ts` | `VITE_API_BASE_URL` se lee de `.env` (no en git) | correcto |
| `vitest.config.ts` | define `import.meta.env.VITE_API_BASE_URL = "https://api.test.invalid"` para tests | correcto para tests; no es demo |

**No hay** datos demo presentados como reales en el código de producción del dashboard/viajes/telemetría.

---

## 15. Errores de TypeScript

`npm run typecheck` → **EXIT=0, 0 errores**.

Los 14 errores del estado previo fueron corregidos:

1. **TS2724** — `guid.ts` no exportaba `isValidTripGuid`: se agregó `export const isValidTripGuid = isValidGuid;` en `src/features/trips/utils/guid.ts`. (Afectaba a `useTripTelemetry`, `TripTelemetryPage`, `useTripDetail`, `TripDetailPage`, `trips/utils/index.ts`.)
2. **TS2305** — barrel `types/index.ts` no reexportaba `StartTripRequest`: se añadió `export type { StartTripRequest } from "@/features/trips/types/trip";`. (Afectaba a `tripsApi`, `useStartTrip`, `startTrip.schema`.)
3. **TS2307** — `ActiveTripCard.tsx` huérfano que importaba `@/features/dashboard/types` (eliminado): el archivo demo fue **borrado**; el dashboard usa `@/features/trips/components/ActiveTripCard`.
4. **TS6133 (unused)** — eliminados: `MAX_DELAY_MS` en `retryPolicy.ts`, `isLoading` en `TripActionControls.tsx`, e import de `Button` en `TripDetailPage.tsx`.
5. **TS2322 / TS2345 (resolver)** — `StartTripFormValues` ahora usa `z.input<typeof startTripSchema>` (en lugar de `z.infer`), alineando el input opcional del schema con `useForm` y el `zodResolver`; `toStartTripRequest` acepta ese tipo. Ver `src/features/trips/schemas/startTrip.schema.ts`.

**Causa raíz resuelta:** las tres causas identificadas (export faltante de `isValidTripGuid`, barrel sin `StartTripRequest`, y desajuste Zod ↔ RHF) fueron abordadas sin inventar API ni cambiar el contrato.

---

## 16. Errores de ESLint

`npm run lint` → **EXIT=0, 0 errores y 0 warnings**.

Los 3 errores `no-unused-vars` (imports/variables muertas en `retryPolicy.ts`, `TripActionControls.tsx` y `TripDetailPage.tsx`) se eliminaron junto con los TS6133 de §15, y los **2 warnings `react-refresh/only-export-components`** desaparecieron al mover `velocitySeries`/`altitudeSeries` (y `SeriesDatum`) al módulo `src/features/telemetry/utils/series.ts`: `TimeSeriesChart.tsx` vuelve a ser un componente puro.

---

## 17. Resultado de las pruebas

`npm run test` → **EXIT=0, 10 archivos y 42/42 pruebas aprobadas**.

- **`src/features/dashboard/DashboardPage.test.tsx` → 5/5 aprobadas.** Fue reescrito por completo: ahora valida el **dashboard real** con `vi.mock("@/features/trips/api/tripsApi")` (se mockean `getActiveTrip`, `getTrips`, `getTripsSummary`) y `renderApp` autenticado. Casos cubiertos: bienvenida al usuario; vista «ready» con viaje activo + resumen + viajes recientes + estado «Conectado»; estado vacío; estado de error recuperable (con botón de reintento); y skeleton de carga durante la espera. Ya no depende de ningún dato demo.
- El resto (9 archivos) también pasan: `api/client.test.ts`, `api/errors.test.ts`, `app/App.test.tsx`, `app/router/ProtectedRoute.test.tsx`, `components/ui/Button.test.tsx`, `features/auth/schemas/login.schema.test.ts`, `features/auth/schemas/register.schema.test.ts`, `features/auth/store/auth.store.test.ts`, `features/theme/theme.test.tsx`.

Nota: el `QueryClient` de tests sigue usando la política de reintentos real; en el dashboard las llamadas de red se evitan mockeando `tripsApi` (nada apunta a `api.test.invalid`). Quedan fuera de la suite los tests con mock de `telemetryApi`/páginas de Viajes (ver §4).

---

## 18. Resultado del build

`npm run build` → **EXIT=0 (aprobado)**.

La fase `tsc -b` pasa sin errores (§15) y `vite build` completa la generación de `dist/` correctamente. No hay errores de Vite.

Relevante para deploy (**pendiente, ver §21/§24**): `.env` es ignorado por git; los workflows configurados (`frontend-ci.yml`, `azure-static-web-apps-*.yml`) **no** definen `VITE_API_BASE_URL`. Con el build ahora verde, en CI/Azure `import.meta.env.VITE_API_BASE_URL` quedaría `undefined` y `getEnv()` en `src/api/client.ts` lanzaría en **tiempo de ejecución** («Falta VITE_API_BASE_URL»), con la app en blanco en preview/CI. Definir la variable en los entornos de GitHub Actions/Azure (o inyectarla como constante de build) **antes de declarar concluida** la fase.

---

## 19. Resultado de npm audit

`npm audit --audit-level=high` → **EXIT=0**. `found 0 vulnerabilities`.

---

## 20. Riesgos técnicos y funcionales

**Técnicos**
1. **CI y Azure sin `VITE_API_BASE_URL`** *(vigente, crítico)* — riesgo de app en blanco en preview/CI/producción: la validación de entorno en `client.ts` ocurre en **tiempo de ejecución** y, con el build verde, el error ya no queda tapado por `tsc`. Falta definir la variable en los entornos de GitHub Actions/Azure o inyectarla como constante de build antes del merge.
2. **`useTripDetail` limitado a primera página** — falsos «no encontrado» para viajes antiguos no paginados. Sin cambio previsto en Fase 2.
3. **`queryKeys.dashboard` sin uso como raíz** — se invalida en las mutaciones, pero ninguna consulta lo usa; `GET /api/v1/analytics/dashboard` no se consume (decisión pendiente, §21 paso 6).
4. **Cobertura de páginas incompleta** — `DashboardPage.test.tsx` ya está con mocks (5/5), pero Viajes y `useTripTelemetry` aún no tienen tests con mock.
5. **Nav dirigido a `/app/trips`** para "telemetría" (fricción, no pendiente de bloqueo).
6. **Sin mock de red a nivel e2e (MSW)** — la suite mockea `tripsApi` vía `vi.mock`; no hay server HTTP de e2e.

**Funcionales**
7. **Encaje del dashboard** — no hay dashboard con histórico anual/estado global ni uso de `/analytics/dashboard`. La tarjeta «Resumen de viajes» depende del DTO real: con el contrato actual el summary se muestra «Información no disponible» la mayoría del tiempo (valores en null).
8. **Paginación consumida** — se asume el arreglo y el header `X-Continuation-Token` (documentado en OpenAPI); si el backend devuelve otra forma, el parseo defensivo devolverá items vacíos.
9. **Estado doble "ready"/"empty"** — el dashboard da `empty` solo cuando no hay viaje activo ni listados; si `summary` falla en silencio, no hay señal de error.

> **Riesgos de proceso (Fase 2 NO concluida):** pendientes commit/push, PR + Azure Preview, validación manual contra el backend desplegado, aprobación/merge y despliegue en producción (§1, §24). Un preview sin `VITE_API_BASE_URL` se vería en blanco (riesgo #1).

---

## 21. Orden exacto recomendado para terminar Fase 2

Estado: **pasos 1–7 COMPLETADOS y verificados en verde** (typecheck 0, lint 0, tests 42/42, build OK). Pendientes: **pasos 8–10 (CI/env, validación manual y commit) y todo el flujo de publicación**.

**✔️ Bloques de código ya ejecutados (1–7):**
1. **Reparar exports de base** — ✔️ `guid.ts`: `export const isValidTripGuid = isValidGuid;`; barrel `types/index.ts`: `export type { StartTripRequest } from "./trip"`. Desaparecieron los TS2305/TS2724.
2. **Eliminar el huérfano** — ✔️ borrado `src/features/dashboard/components/ActiveTripCard.tsx` (demo); sigue usándose `trips/components/ActiveTripCard.tsx`.
3. **Eliminar variables/imports sin usar** — ✔️ `MAX_DELAY_MS` en `retryPolicy.ts`, `const isLoading` en `TripActionControls`, import de `Button` en `TripDetailPage`.
4. **Reconciliar tipos de `StartTripDialog` con Zod** — ✔️ `StartTripFormValues = z.input<typeof startTripSchema>`; `useForm` tipado contra el input del schema; resuelve TS2322/TS2345.
5. **Corregir `TimeSeriesChart`** — ✔️ `SeriesDatum`, `toSeries`, `velocitySeries` y `altitudeSeries` movidos a `telemetry/utils/series.ts`; `TimeSeriesChart` queda como componente puro (0 warnings `react-refresh`).
6. **Mejorar la invalidación de caché** — ✔️ las 4 mutaciones invalidan `queryKeys.tripsSummary`; ✔️ `summary.isPending` integrado en `isLoading` del dashboard. Pendiente *solicitado* dentro de este bloque: decidir uso de `GET /api/v1/analytics/dashboard` y destino de `["dashboard"]`.
7. **Reescribir `DashboardPage.test.tsx`** — ✔️ mock de `tripsApi` vía `vi.mock`, dashboard real, casos ready/empty/error/loading + bienvenida (5/5). Opcional: ampliar cobertura a `useTripTelemetry`/`useTrips`.

**Bloques pendientes:**
8. **Validación de build + CI/env**:
   - Definir `VITE_API_BASE_URL` como variable de entorno (preferred) o de repo env para `frontend-ci.yml` y Azure SWA; DOCUMENTAR que es obligatoria en el build. (No tocar el contenido de workflows sin aprobación — anotar en README/docs.)
   - Reconfirmar en orden `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm audit --audit-level=high` — ya todo en verde (ver §15–§19).
9. **Verificación manual contra el backend real** (con una cuenta autenticada):
   - Dashboard carga viajes/summary/viaje activo.
   - Iniciar → pausar → reanudar → finalizar un viaje; telemetría visible en el detalle.
   - Reintento y estados de error/offline visibles.
10. **Cierre de flujo** (cuando se apruebe): commit del bloque con mensajes separados (`feat(api)`, `feat(trips)`, `feat(telemetry)`, `fix(dashboard-demo)`, `chore(ci/env)`), **push**, PR con Azure Preview y validación del entorno, aprobación/merge y despliegue en producción (§22).

---

## 22. Criterios para declarar concluida la Fase 2

Estado: **criterios de código ✔️ cumplidos; la Fase 2 NO está concluida** (faltan los criterios de proceso y despliegue, §21 bloques 8–10 y checklist de cierre abajo).

**Criterios TÉCNICOS DE CÓDIGO (ya cumplidos en working tree):**
- ✔️ **Sin datos demo presentados como reales** — ninguna prueba, badge, componente ni hook usa datasets demo; `DashboardPage.test.tsx` valida el dashboard real con mock (5/5).
- ✔️ **Viajes conectados al backend** — listado + viaje activo + start/pause/resume/finish + paginación con token real.
- ✔️ **Telemetría vinculada a TripId** — `GET /trips/{id}/telemetry`, sin ingesta manual en web.
- ✔️ **Autenticación y rutas protegidas funcionando** — acceso público/privado correcto; refresh con vuelo único, sesión y logout; navegación funcional.
- ✔️ **Estados de carga, error, vacío y reintento** — skeleton/empty/error(retry) en Dashboard, Viajes, Detalle y Telemetría; política de retry de Query validada.
- ✔️ **Typecheck aprobado** — `npm run typecheck` exit 0 (0 errores).
- ✔️ **Lint aprobado** — `npm run lint` exit 0 (0 errores y 0 warnings; sin `react-refresh` legacy).
- ✔️ **Pruebas aprobadas** — `npm run test` exit 0; **42/42** (dashboard **5/5** con mocks de `tripsApi`).
- ✔️ **Build aprobado** — `npm run build` exit 0.
- ✔️ **Auditoría sin vulnerabilidades** — `npm audit --audit-level=high`: 0 findings.

**⚪ Criterios de cierre RESTANTES (pendientes — imprescindibles para la conclusión):**
- ⚪ **Commit y push** del bloque corregido.
- ⚪ **CI verde en GitHub Actions** (con `VITE_API_BASE_URL` definida, §18/§20).
- ⚪ **Preview de Azure funcionando** — despliegue de PR produciendo SWA preview accesible y sin error de env.
- ⚪ **Integración validada contra la API desplegada** — escenario end-to-end (iniciar/pausar/reanudar/finalizar/telemetría) verificado contra el backend Azure.
- ⚪ **Aprobación y merge** de la rama.
- ⚪ **Producción en Azure funcionando** — `main` desplegado; app operativa con `VITE_API_BASE_URL` resuelta.

---

## 23. Elementos que pertenecen a Fase 3 y no deben implementarse todavía

- Módulos UI: Alertas, Incidentes, Wearables, Dispositivos, Contactos, Monitores, Notificaciones, Suscripción, Perfil, Configuración, rutas frecuentes.
- **Ingesta de telemetría** desde el navegador (`POST/PATCH /api/v1/trips/{id}/telemetry`) — es del móvil/wearable.
- **Detalles del sensor** del wearable, mapas/georutas, incidentes/mapa (`/incidents/{id}/map`).
- **Gestión de invitaciones de monitores** con tokens (`invite`, `accept`, `details`) — cualquier token de invitación en query args/URL está prohibida.
- **Roles, permisos web/móvil, preferencias y perfil médico completo**.
- **UI de vehículos** (seguir fuera del alcance de esta fase).
- **Endpoints no auditados** que no forman parte de Fase 2 en la web (evitar consumirlos sin autorización).

---

## 24. Próxima tarea recomendada

Los **pasos 1–7 del §21 ya están ejecutados y verificados** (typecheck/lint/tests/build en verde, §15–§19). La siguiente tarea es **cerrar el flujo de publicación**, manteniendo el alcance estrictamente dentro de la Fase 2 (sin Fase 3):

1. **Commit y push** del bloque de correcciones (mensajes separados por área, ver §21 paso 10).
2. **Abrir la PR** y comprobar que el **CI pasa** con `VITE_API_BASE_URL` definida (paso 8 del §21) y que el **Azure Preview** despliega sin error de env.
3. **Validación manual contra el backend desplegado** (paso 9): dashboard con viajes/summary, ciclo iniciar → pausar → reanudar → finalizar y telemetría en el detalle, más estados de error/offline.
4. **Aprobación y merge**, y **despliegue/verificación en producción**.
5. Reconfirmar los criterios de §22 antes de proclamar la fase concluida.

> La Fase 2 **NO se declara concluida** hasta completar commit/push, PR + preview, validación manual, aprobación/merge y producción (ver §1).

Nada de la Fase 3 se toca en este orden propuesto.