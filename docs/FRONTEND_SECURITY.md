# Seguridad del frontend

- Tokens en `sessionStorage`, nunca `localStorage`.
- Login y registro solicitan capacidad `web`.
- No se imprimen tokens ni códigos de invitación en consola.
- React renderiza datos como texto; no se usa `dangerouslySetInnerHTML`.
- Invitaciones usan cuerpos JSON; no se colocan tokens o códigos en query strings.
- Mensajes rápidos envían `publicTemplateId`; la operación de envío no acepta texto libre.
- Identidad pública usa `publicProfileId`; no se muestra la primary key interna.
- Viajes y telemetría son de solo lectura en la web.
- Acciones SOS, cierre de alertas, vinculación/calibración de wearable y control de viajes no existen en el cliente web.
- 2FA muestra la clave manual únicamente durante el flujo de configuración.
- Links de mapa usan OpenStreetMap y `rel="noreferrer"`.
