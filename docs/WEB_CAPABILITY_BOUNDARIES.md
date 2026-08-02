# Fronteras de capacidad del cliente web

## Permitido

- Consultar viajes, telemetría, alertas, incidentes y wearables.
- CRUD de vehículos, contactos y rutas.
- Administrar familia, monitoreo, mensajes, perfil, configuración, dispositivos y notificaciones.

## No permitido

- Iniciar, pausar, reanudar o finalizar viajes.
- Enviar lotes o puntos de telemetría.
- Detectar alertas, enviar SOS, confirmar o cerrar alertas.
- Vincular, desvincular, calibrar o sincronizar wearables.

El backend vuelve a aplicar estas restricciones mediante claims de capacidad. La ausencia de controles y métodos en el frontend evita ofrecer acciones que siempre serían rechazadas.
