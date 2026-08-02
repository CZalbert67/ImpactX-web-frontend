# Estado técnico del Frontend — Fase 2

Fecha de auditoría: 2026-08-02
Rama: `feat/frontend-dashboard-trips`
Scope auditado: Dashboard real, Gestión de viajes, Detalle de viaje, Telemetría vinculada a TripId, Estados de UI (carga/error/vacío/reintento), Autenticación y rutas protegidas, integración con backend ImpactX.
Contrato de referencia: `https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net/openapi/v1.json`

---

## 1. Resumen ejecutivo

La implementación de Fase 2 **está a medio camino y no compila**.

Se reconstruyeron los módulos de Viajes y Telemetría eliminando casi por completo el Dashboard demo de la Frontend Foundation y conectando consultas reales a endpoints auditados contra el OpenAPI (`/api/v1/trips`, `/api/v1/trips/active`, `/api/v1/trips/{id}/telemetry`, `/api/v1/trips/start|pause|resume|finish`, `/api/v1/analytics/trips/summary`). La arquitectura (TanStack Query + Axios + hooks por feature + parsing defensivo) es correcta y respeta el contrato real: **no se inventan endpoints ni cifras**.

Sin embargo el trabajo quedó interrumpido con **14 errores de TypeScript**, **3 errores y 2 warnings de ESLint**, **4 pruebas fallidas** (obsoletas del dashboard demo), y por lo tanto **`npm run build` falla** (EXITCODE=2). Los errores son mecánicos y acotados: un `isValidTripGuid` que no existe (debería ser `isValidGuid`), una re-exportación que falta en el barrel de tipos (`StartTripRequest`), un archivo huérfano que referencia el `dashboard/types.ts` eliminado, variables/imports sin usar y un conflicto de tipos entre el schema Zod (campos opcionales) y `useForm`.

El `npm audit` está limpio (0 vulnerabilidades).

Diagnóstico: el diseño y la capa de datos de Fase 2 están básicamente completos y bien hechos; faltan correcciones de tipado/limpieza, actualizar el test del dashboard y cerrar un par de fallas de invalidación de caché antes de declarar la fase concluida.

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

Clasificación **funcional y conectada a la API real** (salvando los bloqueos de compilación):

1. **Creación de viaje** — `POST /api/v1/trips/start` con `StartTripRequest` tipado desde OpenAPI, formulario React-Hook-Form + Zod, modal `StartTripDialog`, bloqueo de doble envío, error visible.
2. **Acciones de viaje** — `pause`, `resume`, `finish` (mutaciones, confirmación en modal, `aria-live`).
3. **Listado de viajes** — `GET /api/v1/trips` paginado por `X-Continuation-Token` con «Cargar más» (uso infinito, sin scroll).
4. **Viaje activo** — `GET /api/v1/trips/active` con tratamiento de `404` → `null`.
5. **Telemetría por viaje (solo lectura)** — `GET /api/v1/trips/{id}/telemetry` paginada, tabla + gráficas SVG propias (sin dependencias), muestreo sin alterar valores.
6. **Estados de UI** — carga (`DashboardSkeleton`, `TripListSkeleton`, skeletons de tarjeta), error (con retry), vacío (`EmptyState`) en Dashboard, Viajes, Detalle y Telemetría.
7. **Reintentos de TanStack Query** — `retryPolicy` que no reintenta 400/401/403/404/409, reintenta red/5xx/429, respeta `Retry-After`.
8. **Rutas y navegación** — nuevas rutas registradas y protegidas; los items de nav «Viajes» y «Telemetría» quedaron activos.
9. **Autenticación en las llamadas HTTP** — `apiClient` inyecta `Bearer`, single-flight refresh ante 401, logout limpia sesión.

---

## 4. Funcionalidades parcialmente implementadas

1. **Dashboard real** — estructura completa (conexión, resumen, viaje activo, recientes, accesos rápidos), pero: el summary de `TripsSummary` no se refresca tras las mutaciones (el `queryKey` que se invalida no cubre `["analytics",...]`); `GET /api/v1/analytics/dashboard` (que sí existe en OpenAPI) **no se consume**; el `queryKey ["dashboard"]` se invalida pero no se usa como raíz de ninguna consulta; `summary.isPending` no participa en el cálculo de `isLoading`.
2. **Detalle de viaje** — reconstruido desde listado/caché (no existe endpoint de detalle). Limitación documentada: si el viaje está fuera de la primera página y no se paginó hasta él, se muestra «no encontrado» (404 lógico).
3. **Nav de Telemetría** — el item «Telemetría» apunta a `/app/trips` (la telemetría se elige por viaje). Funcional pero con fricción de UX.
4. **Pruebas del dashboard** — el archivo `DashboardPage.test.tsx` sigue siendo del dashboard demo y **falla** (4 tests).
5. **Retry-After** — `AppApiError` ahora lo expone, pero `retryDelayQuery` de `retryPolicy` no lo usa en resultados prácticos (debe iterarse); además `MAX_DELAY_MS` sin usar.

---

## 5. Funcionalidades todavía no implementadas

- **Ingesta de telemetría** en el frontend (POST/PATCH `/api/v1/trips/{id}/telemetry`) — corresponde al móvil/wearable, fuera de alcance (correcto que no exista).
- **Mapa/georuta** del viaje (no existe tal página).
- **Alertas, incidentes, SOS** (Fase 3).
- **Wearables, dispositivos, contactos, monitores, notificaciones, suscripción, perfil, configuración, rutas frecuentes** (Fase 3, todos `soon: true`).
- **Consumo de `GET /api/v1/analytics/dashboard`** para el dashboard (endpoint existe; no integrado).
- Validación numérica/adición para campos de formulario más allá de `StartTripRequest` (p. ej. no hay formularios de edición de viaje).
- Tests/mocks de red para las features nuevas (no hay MSW; solo hay tests de bajo nivel en `api/`).

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
| `src/features/dashboard/types.ts` | tipos del dashboard demo | ✔️ Sí, era el contrato demo — **pero** `ActiveTripCard.tsx` quedó huérfano y por eso ahora hay TS2307 (ver §15). |
| `EmergencyContactsCard.tsx` | demo (contactos) | ✔️ Sí — no es de Fase 2. |
| `NotificationsCard.tsx` | demo (notificaciones) | ✔️ Sí — Fase 3. |
| `RecentAlertsCard.tsx` | demo (alertas) | ✔️ Sí — Fase 3. |
| `SafetyStatusCard.tsx` | demo (estado de seguridad) | ✔️ Sí — no tiene back directo en alcance. |
| `WearableCard.tsx` | demo (wearable) | ✔️ Sí — Fase 3. |

**Conclusión:** las eliminaciones fueron apropiadas. No se encontró ninguna eliminación **accidental** que rompiera algo más allá del propio huérfano `ActiveTripCard.tsx` (que debió borrarse junto con `types.ts`). `QuickActionsCard`, `RecentTripsCard` y `WelcomeCard` fueron modificadas, no borradas.

---

## 9. Rutas del frontend existentes

| Ruta | Tipo de acceso | Página | Estado | Fuente de datos |
| --- | --- | --- | --- | --- |
| `/` | Redirecciona | — | ok | — |
| `/login` | Pública (PublicRoute) | LoginPage | ok | auth API |
| `/register` | Pública (PublicRoute) | RegisterPage | ok | auth API |
| `/unauthorized` | Pública | UnauthorizedPage | ok | — |
| `/app` | Protegida | AppShell → Navigate `/app/dashboard` | ok | — |
| `/app/dashboard` | Protegida | DashboardPage | ⚠️ compila mal (bloquea) | `useTrips`, `useActiveTrip`, `useTripsSummary` (API real) |
| `/app/trips` | Protegida | TripsPage | ✅ código ok (bloqueado por tsc) | `GET /api/v1/trips`, `GET /api/v1/trips/active` |
| `/app/trips/:tripId` | Protegida | TripDetailPage | ⚠️ errores tsc en la ruta | caché listado + relectura real |
| `/app/trips/:tripId/telemetry` | Protegida | TripTelemetryPage | ⚠️ errores tsc | `GET /api/v1/trips/{id}/telemetry` |
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
- **Fallas actuales:**
  1. `queryKeys.tripsSummary = ["analytics","trips","summary"]` NO se invalida en `useStartTrip/Pause/Resume/Finish` (solo `["trips"]` y `["dashboard"]`), por lo que el resumen queda estancado tras un viaje nuevo.
  2. `queryKeys.dashboard = ["dashboard"]` se usa solo para invalidar y nunca como queryKey de trabajo (inútil).
  3. `summary.isPending` no participa en `isLoading` del view (el dashboard puede pintar «ready» antes de tener summary).
  4. No se consume `GET /api/v1/analytics/dashboard`.
- **UI de estados implementada**: skeleton loading, error con reintento, empty (sin viajes → EmptyState + botón «Iniciar viaje»).

---

## 12. Estado del módulo de Viajes

- **Página** `TripsPage`: sección "Viaje activo" + "Historial" con paginación «Cargar más», estados loading/error/empty.
- **Listado**: `GET /api/v1/trips` (infinite query, `pageSize 20`), parseo de arreglo + token `X-Continuation-Token`.
- **Acciones**: start (modal RHF+Zod), pause/resume/finish con confirmación; invalida `["trips"]` (list/detail/telemetry/active) y `["dashboard"]`.
- **Detalle** `TripDetailPage`: `useTripDetail` → caché o primera página del listado; muestra inicio/fin/duración/dispositivo + controles + link a telemetría; 404 lógico si no aparece.
- **Cambio de estado laboral**: `classifyTripState` reconoce alias en es/en. `canPause/canResume/canFinish` se derivan del estado real.
- **Deuda**:
   - `useTripDetail` limitado a primera página (sin más páginas puede dar falsos 404).
   - Errores TS pendientes (ver §15).
   - La nav de «Telemetría» conduce a `/app/trips` (elección manual del viaje).

---

## 13. Estado del módulo de Telemetría

- Relacionada **por TripId** (ruta `/api/v1/trips/{tripId}/telemetry`), paginada por `X-Continuation-Token`.
- `useTripTelemetry` deshabilitada si el GUID del viaje es inválido (nunca llama con GUID inválido).
- Muestra: gráfica velocidad (km/h) y altitud (m) contra tiempo (SVG propio, sin librerías), tabla completa accesible, botón «Cargar más».
- **Importante:** **no se grafica ni selecciona lat/lng de forma inconsistente**; la tabla sí muestra las coordenadas.
- Punto pendiente: `TimeSeriesChart` exporta las helpers `velocitySeries`/`altitudeSeries` desde el propio componente → warnings `react-refresh/only-export-components`.

---

## 14. Datos demo, mocks o valores temporales restantes

| Ubicación | Qué hay | Estado |
| --- | --- | --- |
| `src/features/dashboard/DashboardPage.test.tsx` | 4 tests que esperan «Datos demo», «ImpactX Band (simulación)», «Contactos de emergencia», «Hacia Centro de Guadalajara» | **falla** (demo eliminado) |
| `src/features/dashboard/components/ActiveTripCard.tsx` | Huérfano: import del tipo `@/features/dashboard/types` (eliminado) | Dead/demo residual — TS2307 |
| `src/config/env.ts` | `VITE_API_BASE_URL` se lee de `.env` (no en git) | correcto |
| `vitest.config.ts` | define `import.meta.env.VITE_API_BASE_URL = "https://api.test.invalid"` para tests | correcto para tests; no es demo |

**No hay** datos demo presentados como reales en el código de producción del dashboard/viajes/telemetría.

---

## 15. Errores de TypeScript

`npm run typecheck` → **EXIT=2**, listado completo:

1. `src/api/retryPolicy.ts(18,7)` — **TS6133**: `MAX_DELAY_MS` declarado y nunca usado.
2. `src/features/dashboard/components/ActiveTripCard.tsx(5,33)` — **TS2307**: `@/features/dashboard/types` no se encuentra (eliminado). Archivo huérfano.
3. `src/features/telemetry/hooks/useTripTelemetry.ts(5,10)` — **TS2724**: `guid` no exporta `isValidTripGuid` (existe `isValidGuid`).
4. `src/features/telemetry/pages/TripTelemetryPage.tsx(12,10)` — **TS2724**: ídem.
5. `src/features/trips/api/tripsApi.ts(3,15)` — **TS2305**: `@/features/trips/types` no exporta `StartTripRequest`.
6. `src/features/trips/components/StartTripDialog.tsx(37,5)` — **TS2322**: `Resolver` de `zodResolver` no encaja con `useForm<StartTripFormValues>` (input opcional vs output required).
7. `src/features/trips/components/StartTripDialog.tsx(55,34)` — **TS2345**: el argumento `TFieldValues` no es asignable a `toStartTripRequest`.
8. `src/features/trips/components/TripActionControls.tsx(66,9)` — **TS6133**: `isLoading` declarado y no usado.
9. `src/features/trips/hooks/useStartTrip.ts(4,15)` — **TS2305**: `@/features/trips/types` no exporta `StartTripRequest`.
10. `src/features/trips/hooks/useTripDetail.ts(7,10)` — **TS2724**: `isValidTripGuid` (ídem).
11. `src/features/trips/pages/TripDetailPage.tsx(4,1)` — **TS6133**: `Button` importado sin usar.
12. `src/features/trips/pages/TripDetailPage.tsx(11,10)` — **TS2724**: `isValidTripGuid` (ídem).
13. `src/features/trips/schemas/startTrip.schema.ts(2,15)` — **TS2305**: `@/features/trips/types` no exporta `StartTripRequest`.
14. `src/features/trips/utils/index.ts(1,10)` — **TS2724**: `isValidTripGuid` no exporta desde `guid`.

**Causa raíz:** 3 causas raíz:
- `guid.ts` exporta `isValidGuid`, pero en todo el código se importa `isValidTripGuid` (debería reexportarse o corregirse la importación en 5 sitios).
- `types/index.ts` (barrel) no reexporta `StartTripRequest` (que sí está definida y exportada en `types/trip.ts`).
- `StartTripDialog` usa `useForm<StartTripFormValues>` con un schema Zod cuyos campos son opcionales en input (`optional()`) → el resolver y el submit tipan distinto.

---

## 16. Errores de ESLint

`npm run lint` → **EXIT=1** (3 errores + 2 warnings):

1. **error** `src/api/retryPolicy.ts(18,7)` — `@typescript-eslint/no-unused-vars`: `MAX_DELAY_MS` sin usar.
2. **error** `src/features/trips/components/TripActionControls.tsx(66,9)` — `no-unused-vars`: `isLoading`.
3. **error** `src/features/trips/pages/TripDetailPage.tsx(4,10)` — `no-unused-vars`: import de `Button`.
4. **warning** `src/features/telemetry/components/TimeSeriesChart.tsx(106/110)` — `react-refresh/only-export-components`: `velocitySeries`/`altitudeSeries` se exportan desde un componente.

Los 3 errores son los mismos «unused» que TS. No reporta errores más allá de éstos.

---

## 17. Resultado de las pruebas

`npm run test:run` → **EXIT=1** — `1 archivo falla / 9 pasan`, `4 tests fallan / 37 pasan`.

Único archivo fallido: `src/features/dashboard/DashboardPage.test.tsx` (4 casos). Todos esperan el **dashboard demo** que ya se eliminó:
- «muestra un estado de carga accesible» → busca skeleton previo + «viajes recientes» (carga con fallos de red en vitest apuntando a `https://api.test.invalid`).
- «da la bienvenida» → busca heading `Hola, María` (el dashboard entra en estado error por red en tests).
- «renderiza datos demo marcados explícitamente» → busca «Datos demo», «estado general», «ImpactX Band (simulación)», «contactos…» → ya no existen.
- «muestra el viaje activo demo con su destino» → «Hacia Centro de Guadalajara» → no existe.

El resto (9 archivos) pasan: `api/client.test.ts`, `api/errors.test.ts`, `app/App.test.tsx`, `router/ProtectedRoute.test.tsx`, `ui/Button.test.tsx`, `auth/*schema*.test.ts`, `auth/store.auth.store.test.ts`, `theme/theme.test.tsx`.

> Nota: el `QueryClient` global de tests usa `retry` para red/5xx con retrasos de 1 s; las llamadas de red en tests apuntan a `api.test.invalid`, lo que produciría reintentos lentos. Convendrá mockear `tripsApi`/`telemetryApi` en los tests de páginas.

---

## 18. Resultado del build

`VITE_API_BASE_URL="…azurewebsites.net" npm run build` → **EXIT=2**.

El build falla en la fase `tsc -b` con los mismos **14 errores** de §15, por lo que `vite build` no se ejecuta. No hay errores de Vite independientes.

Relevante para deploy: `.env` es ignorado por git; los workflows configurados (`frontend-ci.yml`, `azure-static-web-apps-*.yml`) **no** definen `VITE_API_BASE_URL`. Esto significa que en CI/Azure el build pasa `tsc` (una vez corregidos los errores TS) pero `import.meta.env.VITE_API_BASE_URL` quedaría `undefined`, y en `src/api/client.ts` `getEnv()` lanzaría en **tiempo de ejecución** («Falta VITE_API_BASE_URL»), con la app en blanco. Actualmente ya está rojo en TS de todas formas.

---

## 19. Resultado de npm audit

`npm audit --audit-level=high` → **EXIT=0**. `found 0 vulnerabilities`.

---

## 20. Riesgos técnicos y funcionales

**Técnicos**
1. **Build/CI rojo** — 14 errores TS (raíces identificadas en §15). Bloquea `typecheck`, `lint` (parcialmente), `test:run` y el despliegue.
2. **CI y Azure sin `VITE_API_BASE_URL`** — riesgo de app en blanco en producción/preview (la validación de entorno en `client.ts` ocurre en tiempo de ejecución). Falta definir la variable en los entornos de GitHub Actions/Azure o inyectarla como constante de build.
3. **Invalidación de summary** — las mutaciones no invalidan `queryKeys.tripsSummary`, así que el resumen del dashboard queda obsoleto tras start/pause/resume/finish.
4. **`useTripDetail` limitado a primera página** — falsos «no encontrado» para viajes antiguos no paginados.
5. **Tests sin mocking de red** — el nuevo dashboard/viajes/telemetría carecen de tests con mocks (el test demo obsoleto queda roto hasta reescribírselo).
6. **`react-refresh` warnings** en `TimeSeriesChart` (separar series del componente).
7. **Nav dirigido a `/app/trips`** para “Telemetría” (fricción, no pendiente de tarea).

**Funcionales**
8. **Encaje del dashboard** — no hay dashboard con histórico anual/estado global ni uso de `/analytics/dashboard`. La tarjeta «Resumen de viajes» depende del DTO real: con el contrato actual el summary se muestra «Información no disponible» la mayoría del tiempo (valores en null).
9. **Paginación consumida** — se asume el arreglo y el header `X-Continuation-Token` (documentado en OpenAPI); si el backend devuelve otra forma el parseo defensivo devolverá items vacíos.
10. **Estado doble "ready"/"empty"** — el dashboard da `empty` solo cuando no hay viaje activo ni listados; si `summary` falla en silencio, no hay señal de error.

---

## 21. Orden exacto recomendado para terminar Fase 2

Bloques pequeños, ordenados y verificables. Tras cada bloque correr `npm run typecheck` (y al final `lint`, `test:run`, `build`).

1. **Reparar exports de base** (desbloquea 12 de 14):
   - `guid.ts`: agregar `export const isValidTripGuid = isValidGuid;` (más simple: corregir 5 imports a `isValidGuid`).
   - `types/index.ts`: reexportar `export type { StartTripRequest } from "./trip"` (o mover reexport al barrel).
   - Verificar con `npm run typecheck` que hayan caído los TS2305/TS2724.
2. **Eliminar el huérfano** `src/features/dashboard/components/ActiveTripCard.tsx` (era demo; ya existe `trips/components/ActiveTripCard.tsx` que es el que se usa). Verificar imports y eliminarlo con `git rm`.
3. **Eliminar variables/imports sin usar** (TS6133):
   - `retryPolicy.ts`: borrar `MAX_DELAY_MS` (o usarlo en el fallback exponencial).
   - `TripActionControls`: quitar `const isLoading`.
   - `TripDetailPage`: quitar import de `Button`.
4. **Reconciliar tipos de `StartTripDialog` con Zod**:
   - Definir `StartTripFormValues` como output del schema y usar `useForm` con el `input` type, o quitar los `.optional()` sobrepuestos y tipar `resolver` correctamente. Correr typecheck para los 2 errores TS2322/TS2345 del resolver.
5. **Corregir `TimeSeriesChart`** para el warning de fast-refresh: exportar `toSeries`/`velocitySeries`/`altitudeSeries` desde un módulo separado (p. ej. `telemetry/utils/series.ts`).
6. **Mejorar la invalidación de caché**:
   - Invalidar `queryKeys.tripsSummary` en las 4 mutaciones (además de `["trips"]`).
   - Decidir si se consume `GET /api/v1/analytics/dashboard` y, si se usa, definir query key root; caso contrario eliminar `["dashboard"]` (que hoy no tiene efecto).
   - Incluir `summary.isPending` en `isLoading` del dashboard.
7. **Reescribir `DashboardPage.test.tsx`**:
   - Mockear `tripsApi`/`useDashboard` (vi.mock de `@/features/trips/api/tripsApi` + `@/features/dashboard/hooks/useDashboard`), renderizar el dashboard real y probar los 3 estados (loading/empty/error) + tarjetas.
   - Si se quiere cobertura de `useTripTelemetry`/`useTrips`, crear tests con mock de `telemetryApi`/`tripsApi`.
8. **Validación de build + CI**:
   - Definir `VITE_API_BASE_URL` como variable de entorno (preferred) o de repo env para `frontend-ci.yml` y Azure SWA; DOCUMENTAR que es obligatoria en el build. (No tocar el contenido de workflows sin aprobación — anotar en README/docs.)
   - Correr `npm run typecheck`, `npm run lint`, `npm run test:run`, `npm run build`, `npm audit --audit-level=high` — todo debe pasar.
9. **Verificación manual contra el backend real** (con una cuenta autenticada):
   - Dashboard carga viajes/summary.
   - Iniciar → pausar → reanudar → finalizar un viaje; telemetría visible en el detalle.
   - Reintento y estados de error/offline visibles.
10. **Commit limpio** (cuando se apruebe el flujo) separando: `feat(api)`, `feat(trips)`, `feat(telemetry)`, `fix(dashboard-demo)`, `chore(ci/env)`.

---

## 22. Criterios para declarar concluida la Fase 2

- **Sin datos demo presentados como reales**: ninguna prueba, badge, componente ni hook usa datasets demo; `DashboardPage.test.tsx` debe validar el dashboard real (con mock). ✔️ (pendiente actualizar el test)
- **Dashboard conectado al backend**: `useDashboard` responde solo con endpoints reales; decisión de uso/no-uso de `/analytics/dashboard` documentada y validada.
- **Viajes conectados al backend**: listado + viaje activo + start/pause/resume/finish + paginación con token real.
- **Telemetría vinculada a TripId o ViajeId**: `GET /trips/{id}/telemetry`, sin ingesta manual en web.
- **Autenticación y rutas protegidas funcionando**: acceso público/privado correcto; refresh con vuelo único, sesión y logout; navegación funcional.
- **Estados de carga, error, vacío y reintento**: skeleton/empty/error(retry) en Dashboard, Viajes, Detalle y Telemetría; política de retry de Query validada.
- **Typecheck aprobado**: `npm run typecheck` exit 0.
- **Lint aprobado**: `npm run lint` exit 0 (sin warnings de react-refresh).
- **Pruebas aprobadas**: `npm run test:run` sin fallos; suite de dashboard/viajes actualizada y mockeada.
- **Build aprobado**: `npm run build` exit 0.
- **Auditoría sin vulnerabilidades altas o críticas**: `npm audit --audit-level=high` sin findings (ya OK).
- **Preview de Azure funcionando**: despliegue de PR produciendo SWA preview accesible y sin error de env.
- **Producción en Azure funcionando**: `main` desplegado; app operativa con `VITE_API_BASE_URL` resuelta.
- **Integración validada contra la API desplegada**: escenario end-to-end (iniciar/viajes/telemetría) verificado manualmente/automáticamente contra el backend Azure.

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

Ejecutar el **bloque de reparación base (pasos 1–4 del §21)** para dejar la rama **compilable** (`typecheck` y `lint` verdes con cero errores) y, a continuación, **reescribir/completar el test del dashboard** (paso 7), manteniendo el alcance estrictamente dentro de la Fase 2 (sin Fase 3), y volver a correr la validación completa. Tras eso, la siguiente iteración validará contra el backend desplegado y definirá el manejo de `VITE_API_BASE_URL` en CI/deploy (paso 8).

Nada de la Fase 3 se toca en este orden propuesto.