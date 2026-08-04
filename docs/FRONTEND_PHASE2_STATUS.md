# Estado técnico del frontend

Fecha: 2026-08-03

## Candidato de integración V1

El frontend fue alineado con el backend ImpactX desplegado y con el contrato `2026.08.05`. La paleta original se conserva sin cambios.

## Implementado

- Registro V2 y autenticación web.
- Validación de contrato y capacidades antes de abrir el panel.
- Dashboard, vehículos, plan y grupo y monitoreo.
- Mensajes rápidos, alertas, incidentes y contactos canónicos.
- Viajes y telemetría de solo lectura, controlados exclusivamente por Galaxy Watch 8.
- Notificaciones, rutas, perfil, onboarding, configuración y 2FA.
- Exportación, consentimientos, retención y eliminación de cuenta.
- Eliminación de las páginas principales antiguas de dispositivos y wearables.

## Validación requerida

Ejecutar `bash scripts/verify-frontend.sh` con Node.js `>=22.22.2`. El entorno de preparación del paquete no pudo completar `npm ci` por una limitación de su mirror/red, por lo que el build definitivo debe confirmarse en la máquina del repositorio o GitHub Actions.

## Ajuste V1.2 — planes, cupos y actualización automática

- El onboarding permite elegir Gratuito, Estándar o Premium antes del vehículo;
  Gratuito queda seleccionado de forma predeterminada.
- La capacidad visible es total e incluye al titular: 2, 3 y 6 personas.
- Las invitaciones pendientes reservan espacio y la interfaz bloquea nuevas
  invitaciones cuando el backend reporta cero lugares disponibles.
- Invitaciones familiares, mensajes rápidos y notificaciones se consultan
  automáticamente mientras la pestaña está visible, además de actualizarse al
  recuperar foco o conexión. Es actualización casi en tiempo real por polling,
  no mensajería WebSocket/SignalR.
- Marca y modelo usan un catálogo local buscable; los modelos dependen de la
  marca, pero se permiten valores personalizados.
