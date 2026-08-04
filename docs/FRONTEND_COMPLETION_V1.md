# ImpactX Frontend Completion V1

## Objetivo

Dejar el panel web listo para integrar y desplegar contra la API V1 congelada sin exponer operaciones reservadas a móvil o Galaxy Watch 8.

## Cambios principales

1. Registro V2 con username, teléfono, contraseña fuerte y aceptación legal.
2. Barrera de compatibilidad del contrato `2026.08.05`.
3. Contactos de emergencia migrados a invitaciones y relaciones aceptadas.
4. Ciclo web de incidentes: consulta, nota, falsa alarma, cierre y exportación.
5. Cuenta: exportación, política de retención, revocación de consentimientos y eliminación.
6. Plan y grupo con nombres públicos Free, Standard y Premium.
7. Eliminación de navegación y páginas principales de dispositivos/wearables.
8. Viajes y telemetría estrictamente de solo lectura en web.
9. CI/CD con URL productiva y versión de contrato explícitas.
10. Paleta de temas conservada byte por byte.

## Fuente de verdad

- API: `VITE_API_BASE_URL`
- Contrato esperado: `VITE_API_CONTRACT_VERSION`
- OpenAPI generado: `src/api/generated/schema.d.ts`
- Frontera web: `docs/WEB_CAPABILITY_BOUNDARIES.md`

## Criterio de aceptación

`bash scripts/verify-frontend.sh` debe terminar con `VALIDACIÓN COMPLETA: OK`.
