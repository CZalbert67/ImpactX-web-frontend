# Integración con la API de ImpactX

## Backend

```text
https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net
```

El documento de contrato se obtiene desde `/openapi/v1.json` mediante `npm run api:generate`.

## Autenticación

Login y registro envían siempre:

```json
{"client":"web"}
```

El login usa `identifier`, por lo que acepta correo o nombre de usuario. Los tokens se guardan en `sessionStorage`, se adjuntan con el interceptor Axios y el refresh se ejecuta en modo single-flight.

## Módulos integrados

| Módulo | Rutas principales |
| --- | --- |
| Vehículos | `/api/v1/vehicles` |
| Familia | `/api/v1/family-subscriptions/*` |
| Monitoreo | `/api/v1/monitoring-relationships/*` |
| Mensajes rápidos | `/api/v1/quick-messages/*` |
| Viajes | GET `/api/v1/trips`, `/active`, `/{id}/telemetry` |
| Alertas | GET `/api/v1/alerts` |
| Incidentes | `/api/v1/incidents/*` |
| Contactos | `/api/v1/contacts/*` |
| Dispositivos | `/api/v1/devices/*` |
| Notificaciones | `/api/v1/notifications/*` |
| Rutas | `/api/v1/routes/*` |
| Perfil | `/api/v1/profile/*` |
| Configuración | `/api/v1/settings/*` |
| Wearables | GET `/api/v1/wearable/all` y diagnóstico legacy autorizado |

## Errores

`AppApiError` normaliza `ProblemDetails`, códigos 400/401/403/404/409/413/429 y errores de red. Las mutaciones invalidan únicamente las claves de TanStack Query afectadas.

## Contratos manuales

Los módulos nuevos conservan DTOs manuales explícitos para evitar exponer identificadores internos. El esquema OpenAPI generado sigue siendo la referencia para tipos compartidos y auditoría del servidor.
