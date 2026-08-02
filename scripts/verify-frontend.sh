#!/usr/bin/env bash
set -Eeuo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

EXPECTED_THEME_SHA="fea329e321983c723bd72908ce27cf924f39124c3341f8f9bfb3d3b436c0b5d3"
ACTUAL_THEME_SHA=$(sha256sum src/styles/themes.css | awk '{print $1}')

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

printf '\n========== FRONTERA WEB ==========\n'
FORBIDDEN=$(rg -n \
  'apiClient\.(post|put|patch).*trips/.+(start|pause|resume|finish|telemetry)|/api/v1/trips/start|/pause|/resume|/finish|StartTripDialog|TripActionControls|useStartTrip|usePauseTrip|useResumeTrip|useFinishTrip' \
  src --glob '!src/api/generated/schema.d.ts' || true)
if [[ -n "$FORBIDDEN" ]]; then
  echo "$FORBIDDEN"
  echo "ERROR: se encontraron mutaciones de viaje no permitidas en web"
  exit 1
fi
echo "OK: viajes y telemetría son de solo lectura"

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
