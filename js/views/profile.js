// js/views/profile.js
import { state, normalizeVehicleType, VEHICLE_TYPES, v8Slug } from '../state.js';
import { route, navigate } from '../router.js';
import { esc, toast, validateRequired } from '../utils.js';
import { dashboardShell } from '../components/shell.js';
import { options, infoRows } from './onboarding.js';
import { knownUsernames } from './chats.js';

export function submitProfile(form) {
  if (!validateRequired(form, ['fullName','username','phone','email','city','brand','model','year','avgSpeed'])) return;
  const username = v8Slug(form.elements.username.value);
  if (username.length < 4) return toast('Usuario muy corto', 'Usa al menos 4 caracteres.');
  if (username !== state.user.username && knownUsernames().includes(username)) {
    return toast('Usuario no disponible', 'Ese usuario ya existe en tu red interna.');
  }
  state.driver.fullName = form.elements.fullName.value.trim();
  state.user.name = state.driver.fullName;
  state.user.username = username;
  state.user.phone = form.elements.phone.value.trim();
  state.user.email = form.elements.email.value.trim();
  state.user.city = form.elements.city.value.trim();
  state.driver.bloodType = form.elements.bloodType.value.trim() || 'No especificado';
  state.driver.hasMedicalCondition = form.elements.hasMedicalCondition.value;
  state.driver.medicalConditions = form.elements.medicalConditions.value.trim() || (state.driver.hasMedicalCondition === 'Sí' ? 'No especificado' : 'Ninguno registrado');
  state.driver.allergies = form.elements.allergies.value.trim() || 'Sin alergias registradas';
  state.driver.medications = form.elements.medications.value.trim() || 'No toma medicamentos registrados';
  state.driver.emergencyNotes = form.elements.emergencyNotes.value.trim() || 'Sin indicaciones adicionales';
  state.driver.shareMedicalInfo = form.elements.shareMedicalInfo.checked;
  state.driver.vehicleType = normalizeVehicleType(form.elements.vehicleType.value);
  state.driver.brand = form.elements.brand.value.trim();
  state.driver.model = form.elements.model.value.trim();
  state.driver.year = form.elements.year.value.trim();
  state.driver.avgSpeed = form.elements.avgSpeed.value.trim();
  state.driver.usage = form.elements.usage.value;
  state.driver.allowLocation = form.elements.allowLocation.checked;
  state.driver.allowAiLearning = form.elements.allowAiLearning.checked;
  toast('Perfil actualizado', 'Identidad, datos médicos y vehículo fueron guardados.');
  route();
}

export function renderProfile() {
  ensureState();
  const content = `
    <form id="profile-form" novalidate>
      <div class="grid grid-3">
        <div class="card"><h3>Identidad Impact.X</h3>
          <div class="alert-box info mini"><div>🪪</div><div><strong>Perfil interno</strong><p>Tu usuario e ID sirven para iniciar sesión, recibir invitaciones y abrir chats dentro del aplicativo.</p></div></div>
          <div class="field"><label>ID único de perfil</label><div class="copy-field"><input name="profileId" value="${esc(state.user.profileId)}" disabled /><button class="btn small" type="button" data-action="copy-profile-id">Copiar ID</button></div></div>
          <div class="field"><label>Nombre de usuario único</label><div class="copy-field"><input name="username" value="${esc(state.user.username)}" required /><button class="btn small" type="button" data-action="copy-username">Copiar usuario</button></div><small class="field-hint">Debe ser irrepetible dentro de la simulación.</small></div>
          <div class="field"><label>Nombre completo</label><input name="fullName" value="${esc(state.driver.fullName)}" required /></div>
          <div class="field"><label>Teléfono de referencia</label><input name="phone" value="${esc(state.user.phone)}" required /></div>
          <div class="field"><label>Correo de cuenta</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div>
          <div class="field"><label>Ciudad</label><input name="city" value="${esc(state.user.city)}" required /></div>
        </div>
        <div class="card"><h3>Datos médicos de emergencia</h3>
          <div class="field"><label>Tipo de sangre</label><input name="bloodType" value="${esc(state.driver.bloodType)}" placeholder="Ej. O+" /></div>
          <div class="field"><label>¿Tiene algún padecimiento?</label><select name="hasMedicalCondition">${options(['No','Sí'], state.driver.hasMedicalCondition || 'No')}</select></div>
          <div class="field"><label>Padecimientos o condiciones médicas</label><textarea name="medicalConditions">${esc(state.driver.medicalConditions)}</textarea></div>
          <div class="field"><label>Alergias</label><textarea name="allergies">${esc(state.driver.allergies)}</textarea></div>
          <div class="field"><label>Medicamentos actuales</label><textarea name="medications">${esc(state.driver.medications)}</textarea></div>
          <div class="field"><label>Notas médicas/emergencia</label><textarea name="emergencyNotes">${esc(state.driver.emergencyNotes)}</textarea></div>
          <label class="checkbox-row"><input name="shareMedicalInfo" type="checkbox" ${state.driver.shareMedicalInfo ? 'checked' : ''}/>Mostrar ficha médica en alertas activas y reportes de emergencia.</label>
        </div>
        <div class="card"><h3>Datos del vehículo</h3>
          <div class="alert-box info mini"><div>🚘</div><div><strong>Vehículos de 4 ruedas</strong><p>Autos, SUV, camionetas, pick-up y vanes familiares.</p></div></div>
          <div class="field"><label>Tipo de vehículo de 4 ruedas</label><select name="vehicleType">${options(VEHICLE_TYPES, normalizeVehicleType(state.driver.vehicleType))}</select></div>
          <div class="field"><label>Marca</label><input name="brand" value="${esc(state.driver.brand)}" required /></div>
          <div class="field"><label>Modelo exacto</label><input name="model" value="${esc(state.driver.model)}" required /></div>
          <div class="field"><label>Año</label><input name="year" value="${esc(state.driver.year)}" required /></div>
          <div class="field"><label>Velocidad promedio</label><input name="avgSpeed" value="${esc(state.driver.avgSpeed)}" required /></div>
          <div class="field"><label>Uso principal</label><select name="usage">${options(['Ciudad','Carretera','Mixto'], state.driver.usage)}</select></div>
        </div>
      </div>
      <div class="card" style="margin-top:16px"><h3>Permisos de seguridad</h3>
        <label class="checkbox-row"><input name="allowLocation" type="checkbox" ${state.driver.allowLocation ? 'checked' : ''}/>Permitir uso de ubicación en incidentes.</label>
        <label class="checkbox-row"><input name="allowAiLearning" type="checkbox" ${state.driver.allowAiLearning ? 'checked' : ''}/>Permitir aprendizaje de patrones de conducción para mejorar detección.</label>
        <label class="checkbox-row"><input name="internalChat" type="checkbox" checked disabled />Usar chat interno como único canal de comunicación de emergencia.</label>
        <div class="form-actions"><button class="btn primary" type="submit">Guardar cambios</button><button class="btn" type="button" data-route="/dashboard/chats">Abrir chats</button><button class="btn" type="button" data-route="/dashboard/wearable">Ver wearable</button></div>
      </div>
    </form>
  `;
  return dashboardShell('Perfil del conductor', 'Identidad interna, ficha médica, vehículo y permisos utilizados en incidentes.', content);
}

function ensureState() {
  if (!state.user) state.user = {};
  if (!state.driver) state.driver = {};
}
