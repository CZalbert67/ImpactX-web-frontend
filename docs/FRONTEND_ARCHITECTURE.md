# Arquitectura del frontend web

## Capas

```text
src/
  app/                 router, providers y guards
  api/                 Axios, errores, query keys y OpenAPI generado
  components/          layout, branding y UI reutilizable
  features/
    account/           privacidad, exportación y eliminación
    auth/
    contract/          compatibilidad API y capacidades web
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

Auth solicita tokens con `client: web`. El cliente de viajes y telemetría solo expone lecturas. El control de viajes y la ingesta pertenecen al Galaxy Watch 8. No existen páginas principales ni clientes HTTP de dispositivos/wearables en la web. Esta frontera se valida en `scripts/verify-frontend.sh`.

## Navegación funcional

Todas las opciones visibles del sidebar tienen página funcional: dashboard, vehículos, plan y grupo, monitoreo, mensajes, viajes, rutas, alertas, incidentes, contactos, notificaciones, perfil, configuración y cuenta/privacidad.
