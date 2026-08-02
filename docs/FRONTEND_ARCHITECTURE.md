# Arquitectura del frontend web

## Capas

```text
src/
  app/                 router, providers y guards
  api/                 Axios, errores, query keys y OpenAPI generado
  components/          layout, branding y UI reutilizable
  features/
    auth/
    dashboard/
    trips/             solo lectura en web
    telemetry/         solo lectura en web
    vehicles/
    family/
    monitoring/
    messages/
    platform/          alertas, incidentes, rutas, perfil y demás módulos web
  styles/              paleta y utilidades originales
```

## Flujo de datos

Las páginas consumen hooks de TanStack Query. Los hooks llaman a módulos API tipados y actualizan caché mediante invalidación selectiva. Estado local de formularios y diálogos no se persiste fuera del componente.

## Seguridad por cliente

Auth solicita tokens con `client: web`. El cliente de viajes expone solo `getTrips`, `getActiveTrip` y `getTripsSummary`. Telemetría solo implementa GET. Wearables solo implementan consulta y diagnóstico. Esta frontera se valida en `scripts/verify-frontend.sh` y en una prueba unitaria.

## Navegación funcional

Todas las opciones visibles del sidebar tienen página funcional: dashboard, vehículos, plan familiar, monitoreo, mensajes, viajes, rutas, alertas, incidentes, wearables, dispositivos, contactos, notificaciones, perfil y configuración.
