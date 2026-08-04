# Fronteras de capacidad del cliente web

## Permitido

- Administrar cuenta, perfil, preferencias y 2FA.
- Administrar vehículos, familia, monitoreo, contactos, mensajes, rutas y notificaciones.
- Consultar viajes, telemetría, alertas e incidentes.
- Documentar, marcar falsa alarma y cerrar incidentes cuando el endpoint permite `web`.
- Exportar datos de cuenta e incidentes según el plan efectivo.

## No permitido

- Iniciar, pausar, reanudar o finalizar viajes.
- Enviar o modificar telemetría.
- Detectar alertas, enviar SOS o ejecutar acciones reservadas al móvil/wearable.
- Confirmar `confirm-ok` de incidentes, que es exclusivo del móvil.
- Vincular, desvincular, calibrar, diagnosticar o sincronizar el Galaxy Watch 8.
- Usar los endpoints de sincronización offline móvil.

El backend vuelve a aplicar estas restricciones mediante el claim `client`. El frontend además elimina rutas, páginas, métodos HTTP y controles que no pertenecen a la web.
