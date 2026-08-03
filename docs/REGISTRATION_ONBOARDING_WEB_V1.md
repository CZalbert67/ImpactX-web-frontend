# Registro y onboarding web V1.1

El registro web de ImpactX se completa en cuatro pasos breves y conserva la
paleta visual existente.

1. **Cuenta:** nombre, username, correo, teléfono, contraseña, términos,
   privacidad y consentimientos opcionales. La API genera automáticamente el
   `PublicProfileId` y devuelve la sesión.
2. **Vehículo principal:** crea el vehículo de la colección y actualiza el
   perfil del conductor con color y placa opcionales. Puede omitirse.
3. **Ficha médica:** tipo de sangre, alergias, condiciones, medicamentos y
   nota de emergencia. Puede guardarse o marcarse explícitamente como omitida.
4. **Red de protección:** permite invitar a una persona como contacto de
   emergencia o monitor mediante username, `PublicProfileId` o correo. También
   puede omitirse.

## Criterios de experiencia

- Cada pantalla solicita únicamente la información del paso actual.
- Vehículo, ficha médica e invitación permiten continuar sin completar el
  formulario para no bloquear la creación de la cuenta.
- El ID público se muestra en modo lectura y tiene un botón para copiarlo; el
  usuario nunca lo escribe ni lo elige.
- Si un guardado posterior falla, la cuenta y la sesión ya creadas se conservan.
- Los mensajes visibles son neutros y no muestran detalles del backend,
  nombres de excepciones, infraestructura ni mensajes como `Network Error`.

## Reanudación

El backend mantiene `currentStep`, `medicalProfileStatus` y `status`. Al
recargar `/onboarding`, la web reanuda desde el paso pendiente. La cuenta no se
pierde si una operación posterior al registro falla.

## Endpoints

- `POST /api/v1/auth/register`
- `PUT /api/v1/profile/driver`
- `POST /api/v1/vehicles`
- `PUT /api/v1/profile/medical`
- `PUT /api/v1/profile/onboarding`
- `POST /api/v1/contacts/invitations`
- `POST /api/v1/monitoring-relationships/invitations`

La ficha médica continúa protegida por consentimiento del servidor y no se
concede a un monitor desde la invitación inicial.

## Menú lateral

El control para expandir o colapsar el menú se mantiene en el encabezado del
sidebar. Aunque el estado colapsado se guarde en `localStorage`, el botón
**Expandir menú** siempre permanece visible al volver a cargar la aplicación.
