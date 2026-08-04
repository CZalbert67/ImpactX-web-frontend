# Integración con la API de ImpactX

## Backend y contrato

```text
API:      https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net
OpenAPI:  /openapi/v1.json
Contrato: /api/v1/meta/contract
Web:      /api/v1/meta/clients/web
Versión:  2026.08.05
```

`npm run api:generate` actualiza `src/api/generated/schema.d.ts` desde el OpenAPI productivo.

## Autenticación

Login y registro envían `client: "web"`. El registro usa el contrato V2: username, teléfono, contraseña fuerte, aceptación legal y consentimientos opcionales. Una cuenta nueva comienza en Free; el frontend nunca permite elegir un plan durante el registro.

Los tokens se conservan en `sessionStorage`, se adjuntan mediante Axios y el refresh se ejecuta en modo single-flight.

## Módulos integrados

| Módulo | Rutas principales |
| --- | --- |
| Contrato | `/api/v1/meta/contract`, `/api/v1/meta/clients/web` |
| Cuenta | `/api/v1/account/*` |
| Vehículos | `/api/v1/vehicles/*` |
| Plan y grupo | `/api/v1/family-subscriptions/*`, incluidos `/members/access` y abandono voluntario |
| Monitoreo | consulta de relaciones unificadas mediante `/api/v1/monitoring-relationships/*` |
| Mensajes rápidos | `/api/v1/quick-messages/*` |
| Viajes | GET `/api/v1/trips`, `/active` y `/{id}/telemetry` |
| Alertas | GET `/api/v1/alerts/*` |
| Incidentes | `/api/v1/incidents/*` permitidos para web |
| Contactos SOS | prioridades entre integrantes mediante `/api/v1/family-subscriptions/members/*/access` |
| Notificaciones | `/api/v1/notifications/*` |
| Rutas | `/api/v1/routes/*` |
| Perfil | `/api/v1/profile/*` |
| Configuración | `/api/v1/settings/*` |

No se crean pantallas principales de dispositivos o wearable. La vinculación, permisos, sincronización y diagnóstico operativo pertenecen a móvil/wearable.

## Errores y caché

`AppApiError` normaliza `ProblemDetails`, estados 400/401/403/404/409/413/429 y errores de red. Las mutaciones invalidan únicamente las claves de TanStack Query afectadas.

El panel comprueba el contrato antes de renderizar el área autenticada. La versión esperada se define con `VITE_API_CONTRACT_VERSION`.

## Datos que cambian por acciones de otras personas

El panel consulta automáticamente:

- mensajes rápidos cada 3 segundos;
- invitaciones familiares cada 5 segundos;
- relaciones de monitoreo cada 5 segundos;
- notificaciones cada 8 segundos;
- alertas e incidentes cada 10 segundos en sus respectivas pantallas.

Las consultas se suspenden cuando la pestaña está oculta y se reanudan al
recuperar foco o conexión. La invitación familiar entrante se obtiene desde
`GET /api/v1/family-subscriptions/invitations/incoming`.

## Modelo unificado de personas

La web crea una sola invitación de grupo. Al aceptarla, el backend conecta a todos los integrantes mediante políticas direccionales de privacidad. La interfaz no crea invitaciones adicionales de monitoreo ni contactos SOS. Cada usuario define qué comparte y asigna prioridades SOS entre integrantes del mismo grupo.
