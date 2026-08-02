# Estado técnico del frontend

Fecha: 2026-08-02

## Estado candidato

El `main` recibido fue ampliado para consumir el backend ImpactX desplegado. La paleta original permanece sin cambios y los módulos de negocio principales ya no dependen de páginas “Próximamente”.

## Implementado

- Auth web por correo/usuario.
- Dashboard con datos reales.
- Viajes y telemetría en modo consulta.
- Vehículos.
- Plan familiar, membresías e invitaciones.
- Monitoreo y permisos.
- Mensajes rápidos.
- Alertas, incidentes, rutas, contactos, dispositivos y notificaciones.
- Wearables de solo lectura.
- Perfil, ficha médica, preferencias, onboarding, configuración y 2FA.

## Validación pendiente en la máquina del repositorio

Este paquete debe pasar `scripts/verify-frontend.sh` después de instalar dependencias y regenerar el contrato OpenAPI. El entorno de generación del paquete no pudo descargar `zustand@5.0.14` desde su mirror interno, por lo que no se afirma un build local sin esa ejecución.
