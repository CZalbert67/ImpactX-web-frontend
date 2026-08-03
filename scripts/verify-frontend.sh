#!/usr/bin/env bash
set -Eeuo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

EXPECTED_THEME_SHA="fea329e321983c723bd72908ce27cf924f39124c3341f8f9bfb3d3b436c0b5d3"
EXPECTED_CONTRACT_VERSION="2026.08.05"
PRODUCTION_API="https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net"
ACTUAL_THEME_SHA=$(sha256sum src/styles/themes.css | awk '{print $1}')

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-$PRODUCTION_API}"
export VITE_API_CONTRACT_VERSION="${VITE_API_CONTRACT_VERSION:-$EXPECTED_CONTRACT_VERSION}"

printf '\n========== ENTORNO ==========\n'
node --version
npm --version

node - <<'NODE'
const [major, minor, patch] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && (minor < 22 || (minor === 22 && patch < 2)))) {
  throw new Error('ImpactX requiere Node.js >= 22.22.2');
}
NODE

printf '\n========== PALETA ==========\n'
if [[ "$ACTUAL_THEME_SHA" != "$EXPECTED_THEME_SHA" ]]; then
  echo "ERROR: themes.css cambió. Esperado $EXPECTED_THEME_SHA, actual $ACTUAL_THEME_SHA"
  exit 1
fi
echo "OK: paleta original conservada"

printf '\n========== CONTRATO CONFIGURADO ==========\n'
[[ "$VITE_API_CONTRACT_VERSION" == "$EXPECTED_CONTRACT_VERSION" ]] || {
  echo "ERROR: versión de contrato inesperada: $VITE_API_CONTRACT_VERSION"
  exit 1
}
[[ "$VITE_API_BASE_URL" == "$PRODUCTION_API" ]] || {
  echo "ERROR: URL productiva inesperada: $VITE_API_BASE_URL"
  exit 1
}
echo "OK: API y contrato congelado configurados"

printf '\n========== SUPERFICIE WEB ==========\n'
for removed in \
  src/features/platform/pages/DevicesPage.tsx \
  src/features/platform/pages/WearablesPage.tsx \
  src/pages/ComingSoonPage.tsx; do
  [[ ! -e "$removed" ]] || { echo "ERROR: página retirada todavía existe: $removed"; exit 1; }
done

if rg -n '/app/(devices|wearables)|DevicesPage|WearablesPage|devicesApi|wearablesApi' src \
  --glob '!src/api/generated/schema.d.ts'; then
  echo "ERROR: se encontró superficie principal de dispositivos/wearables"
  exit 1
fi

echo "OK: páginas principales antiguas retiradas"

printf '\n========== REGISTRO V2 ==========\n'
rg -q 'registrationVersion: 2' src/features/auth/types/api.ts
rg -q 'client: "web"' src/features/auth/schemas/register.schema.ts
rg -q 'digitCount >= 7 && digitCount <= 15' src/features/auth/schemas/register.schema.ts
if rg -n 'planActivo' src/features/auth/schemas/register.schema.ts src/features/auth/components/RegisterForm.tsx; then
  echo "ERROR: el registro permite controlar el plan desde el cliente"
  exit 1
fi
echo "OK: creación de cuenta V2 y teléfono alineados; el plan se elige en onboarding"

printf '\n========== FRONTERA DE CAPACIDADES ==========\n'
FORBIDDEN=$(rg -n \
  'apiClient\.(post|put|patch|delete)\([^\n]*(/api/v1/trips/(start|[^\n]*/(pause|resume|finish|telemetry))|/api/v1/wearable|/api/v1/devices|/api/v1/mobile/sync|/api/v1/alerts/(detect|sos|sync-offline)|/api/v1/incidents/[^\n]*/confirm-ok)' \
  src --glob '!src/api/generated/schema.d.ts' || true)
if [[ -n "$FORBIDDEN" ]]; then
  echo "$FORBIDDEN"
  echo "ERROR: se encontraron operaciones reservadas a móvil/wearable"
  exit 1
fi

echo "OK: viajes/telemetría son lectura web y no hay operaciones reservadas"

printf '\n========== CONTACTOS SOS UNIFICADOS ==========\n'
rg -q 'GroupAccessManager' src/features/platform/pages/ContactsPage.tsx
rg -q 'sosContactLimit' src/features/family/components/GroupAccessManager.tsx
rg -q 'Prioridad de contacto SOS' src/features/family/components/GroupAccessManager.tsx
if rg -n 'contactsApi\.(createInvitation|acceptInvitation|rejectInvitation)|monitoringApi\.createInvitation' \
  src/features/platform/pages/ContactsPage.tsx src/features/monitoring/pages/MonitoringPage.tsx; then
  echo "ERROR: la interfaz todavía crea invitaciones separadas de SOS o monitoreo"
  exit 1
fi
echo "OK: SOS es una prioridad configurable entre integrantes del grupo"

printf '\n========== ONBOARDING DE REGISTRO ==========\n'
rg -q 'navigate\("/onboarding"' src/features/auth/hooks/useRegister.ts
rg -q 'profileApi\.updateMedical' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q 'vehiclesApi\.create' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q 'familyApi\.createInvitation' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
if rg -n 'contactsApi\.createInvitation|monitoringApi\.createInvitation' src/features/onboarding/pages/RegistrationOnboardingPage.tsx; then
  echo "ERROR: onboarding todavía crea invitaciones separadas"
  exit 1
fi
rg -q 'currentStep: 8' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q 'PublicIdCard' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
echo "OK: cuenta, ID público, vehículo, ficha médica e invitación única de grupo integrados"

printf '\n========== PLAN Y CAPACIDAD FAMILIAR ==========\n'
rg -q 'label: "Plan"' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q 'value: "Free"' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q '2 personas en total' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q '3 personas en total' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q '6 personas en total' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q 'familyApi\.activate' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q 'summary\.totalActivePeople' src/features/family/utils/familyCapacity.ts
rg -q 'summary\.totalPeopleLimit' src/features/family/utils/familyCapacity.ts
rg -q 'summary\.availableMemberSlots' src/features/family/utils/familyCapacity.ts
rg -q 'canManagePlan' src/features/family/pages/FamilySubscriptionPage.tsx
rg -q 'Solo la persona titular puede cambiar' src/features/family/pages/FamilySubscriptionPage.tsx
rg -q 'Abandonar grupo' src/features/family/pages/FamilySubscriptionPage.tsx
rg -q 'revokeInvitation' src/features/family/api/familyApi.ts
rg -q 'disabled=\{availableInvitationSlots <= 0\}' src/features/family/pages/FamilySubscriptionPage.tsx
echo "OK: capacidad real del backend, plan exclusivo del titular y cupos reservados"

printf '\n========== ACTUALIZACIÓN AUTOMÁTICA ==========\n'
rg -q 'refetchInterval: interval' src/api/liveQuery.ts
rg -q 'LIVE_QUERY_INTERVAL\.messages' src/features/messages/hooks/useMessages.ts
rg -q 'LIVE_QUERY_INTERVAL\.invitations' src/features/family/hooks/useFamily.ts
rg -q 'invitations/incoming' src/features/family/api/familyApi.ts
rg -q 'useIncomingFamilyInvitations' src/components/layout/NavList.tsx
rg -q 'useQuickMessageUnreadCount' src/components/layout/NavList.tsx
rg -q 'useNotifications' src/components/layout/NavList.tsx
echo "OK: invitaciones, mensajes y notificaciones se actualizan sin recarga manual"

printf '\n========== GRUPO, PRIVACIDAD Y MONITOREO ==========\n'
rg -q 'GroupAccessManager' src/features/family/pages/FamilySubscriptionPage.tsx
rg -q 'GroupAccessManager' src/features/monitoring/pages/MonitoringPage.tsx
rg -q 'GroupAccessManager' src/features/platform/pages/ContactsPage.tsx
rg -q 'viewMedicalProfile' src/features/family/components/GroupAccessManager.tsx
rg -q 'confirmMedicalConsent' src/features/family/components/GroupAccessManager.tsx
if rg -n 'Quiero que me monitoree|Yo quiero monitorearla|Invitación de monitoreo' \
  src/features/family/pages src/features/monitoring/pages src/features/platform/pages/ContactsPage.tsx; then
  echo "ERROR: la interfaz conserva el modelo anterior de relaciones separadas"
  exit 1
fi
echo "OK: integrantes conectados, privacidad por persona y consentimiento médico explícito"

printf '\n========== CONVERSACIONES =========='

rg -q 'conversations/\$\{encodeURIComponent' src/features/messages/api/messagesApi.ts
rg -q 'useMarkConversationRead' src/features/messages/pages/MessagesPage.tsx
rg -q 'Conversaciones' src/features/messages/pages/MessagesPage.tsx
rg -q 'Buscar persona' src/features/messages/pages/MessagesPage.tsx
if rg -n 'label="Destinatario"' src/features/messages/pages/MessagesPage.tsx; then
  echo "ERROR: la mensajería todavía usa selector global de destinatario"
  exit 1
fi
echo "OK: conversaciones por persona y lectura automática al abrir el chat"

printf '\n========== CATÁLOGO DE VEHÍCULOS ==========\n'
rg -q 'VEHICLE_CATALOG' src/features/vehicles/data/vehicleCatalog.ts
rg -q 'VehicleMakeModelFields' src/features/onboarding/pages/RegistrationOnboardingPage.tsx
rg -q 'VehicleMakeModelFields' src/features/vehicles/components/VehicleFormDialog.tsx
rg -q 'datalist' src/features/vehicles/components/VehicleMakeModelFields.tsx
echo "OK: marca buscable, modelos dependientes y captura personalizada"

printf '\n========== MENSAJES SEGUROS ==========\n'
rg -q 'publicClient\.interceptors\.response\.use' src/api/client.ts
rg -q 'No pudimos iniciar sesión' src/features/auth/hooks/useLogin.ts
rg -q 'No pudimos crear la cuenta' src/features/auth/hooks/useRegister.ts
if rg -n 'return (detail|title|message|mensaje)|error instanceof Error \? error\.message' src/api/errors.ts src/features/onboarding/pages/RegistrationOnboardingPage.tsx; then
  echo "ERROR: se encontraron mensajes técnicos expuestos en la interfaz"
  exit 1
fi
echo "OK: errores de API neutralizados para el usuario"

printf '\n========== MENÚ LATERAL ==========\n'
rg -q 'collapsed \? PanelLeftOpen : PanelLeftClose' src/components/layout/Sidebar.tsx
rg -q 'label=\{toggleLabel\}' src/components/layout/Sidebar.tsx
rg -q 'Expandir menú' src/components/layout/Sidebar.test.tsx
echo "OK: el control para reabrir el menú permanece visible"

printf '\n========== DEPENDENCIAS ==========\n'
npm ci --no-audit --no-fund

printf '\n========== OPENAPI ==========\n'
npm run api:generate

printf '\n========== TYPECHECK ==========\n'
npm run typecheck

printf '\n========== LINT ==========\n'
npm run lint

printf '\n========== PRUEBAS ==========\n'
npm run test:run

printf '\n========== BUILD ==========\n'
npm run build

printf '\nVALIDACIÓN COMPLETA: OK\n'
