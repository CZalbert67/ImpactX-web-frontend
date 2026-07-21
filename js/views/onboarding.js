// js/views/onboarding.js
import { state, normalizeVehicleType, plan, VEHICLE_TYPES } from '../state.js';
import { route } from '../router.js';
import { esc, toast, validateRequired } from '../utils.js';
import { publicShell } from '../components/shell.js';
import { addContact } from './contacts.js';
import { usernameAvailable, profileIdAvailable } from './chats.js';
import { v8Slug, v8ProfileId } from '../state.js';

export function options(items, selected) {
  return items.map(item => `<option value="${esc(item)}" ${item === selected ? 'selected' : ''}>${esc(item)}</option>`).join('');
}

export function infoRows(obj) {
  return Object.entries(obj).map(([k, v]) => `<div class="info-row"><span>${esc(k)}</span><strong>${esc(v || 'No configurado')}</strong></div>`).join('');
}

export function submitOnboardingPersonal(form) {
  if (!validateRequired(form, ['fullName','phone','city'])) return;
  state.driver.fullName = form.elements.fullName.value.trim();
  state.user.name = state.driver.fullName;
  state.user.phone = form.elements.phone.value.trim();
  state.user.city = form.elements.city.value.trim();
  state.onboardingStep = 2;
  route();
}

export function submitOnboardingMedical(form) {
  state.driver.bloodType = form.elements.bloodType.value.trim() || 'No especificado';
  state.driver.hasMedicalCondition = form.elements.hasMedicalCondition.value;
  state.driver.medicalConditions = form.elements.medicalConditions.value.trim() || (state.driver.hasMedicalCondition === 'Sí' ? 'No especificado' : 'Ninguno registrado');
  state.driver.allergies = form.elements.allergies.value.trim() || 'Sin alergias registradas';
  state.driver.medications = form.elements.medications.value.trim() || 'No toma medicamentos registrados';
  state.driver.emergencyNotes = form.elements.emergencyNotes.value.trim() || 'Sin indicaciones adicionales';
  state.driver.shareMedicalInfo = form.elements.shareMedicalInfo.checked;
  state.onboardingStep = 3;
  toast('Ficha médica guardada', 'Se agregó al perfil y estará disponible en alertas si autorizaste compartirla.');
  route();
}

export function submitOnboardingVehicle(form) {
  if (!validateRequired(form, ['brand','model','year','avgSpeed'])) return;
  state.driver.vehicleType = normalizeVehicleType(form.elements.vehicleType.value);
  state.driver.brand = form.elements.brand.value.trim();
  state.driver.model = form.elements.model.value.trim();
  state.driver.year = form.elements.year.value.trim();
  state.driver.avgSpeed = form.elements.avgSpeed.value.trim();
  state.driver.usage = form.elements.usage.value;
  state.onboardingStep = 4;
  route();
}

export function submitOnboardingContact(form) {
  if (!validateRequired(form, ['name','relation','username'])) return;
  const username = v8Slug(form.elements.username.value);
  if (!usernameAvailable(username)) {
    return toast('Usuario duplicado', 'Esa persona ya está en tu red interna o corresponde a tu propio usuario.');
  }
  const profileId = form.elements.profileId.value.trim().toUpperCase() || v8ProfileId(username);
  if (!profileIdAvailable(profileId)) {
    return toast('ID duplicado', 'Ese ID de perfil ya está registrado en tu red.');
  }
  
  addContact({
    name: form.elements.name.value.trim(),
    relation: form.elements.relation.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: '',
    username,
    profileId,
    priority: state.contacts.length ? 'Secundario' : 'Principal',
    status: 'Activo',
    channel: 'Chat interno',
    notes: 'Agregado desde onboarding.'
  });
  state.onboardingStep = 5;
  route();
}

export function renderOnboarding() {
  const step = state.onboardingStep;
  const stepContent = step === 1 ? onboardingPersonal() 
                    : step === 2 ? onboardingMedical() 
                    : step === 3 ? onboardingVehicle() 
                    : step === 4 ? onboardingContact() 
                    : onboardingConfirm();
  const stepLabels = ['Datos', 'Ficha médica', 'Vehículo', 'Contacto', 'Confirmación'];
  return publicShell(`
    <section class="form-page">
      <div class="container">
        <div class="form-card wide">
          <span class="eyebrow">Configuración inicial</span>
          <h2>Onboarding del conductor</h2>
          <p>Completa la información mínima para que el panel web quede listo. La ficha médica se captura desde el alta porque se usará durante una alerta.</p>
          <div class="onboarding-steps">
            ${[1,2,3,4,5].map(n => `<div class="step-pill ${step === n ? 'active' : ''}">${n}. ${stepLabels[n - 1]}</div>`).join('')}
          </div>
          ${stepContent}
        </div>
      </div>
    </section>
  `);
}

function onboardingPersonal() {
  return `
    <form id="onboarding-personal" novalidate>
      <div class="form-grid">
        <div class="field"><label>Nombre completo</label><input name="fullName" value="${esc(state.driver.fullName)}" required /></div>
        <div class="field"><label>Teléfono principal</label><input name="phone" value="${esc(state.user.phone)}" required /></div>
        <div class="field"><label>Correo electrónico</label><input value="${esc(state.user.email)}" disabled /></div>
        <div class="field"><label>Ciudad o zona habitual</label><input name="city" value="${esc(state.user.city)}" required /></div>
      </div>
      <div class="form-actions"><button class="btn warning" type="button" data-action="cancel-onboarding">Cancelar</button><button class="btn primary" type="submit">Siguiente</button></div>
    </form>
  `;
}

function onboardingMedical() {
  return `
    <form id="onboarding-medical" novalidate>
      <div class="alert-box info"><div>🩺</div><div><strong>Ficha médica de emergencia</strong><p>Estos datos no son para diagnóstico; sirven para que el titular y sus monitores tengan contexto rápido si se genera una alerta.</p></div></div>
      <div class="form-grid">
        <div class="field"><label>Tipo de sangre</label><input name="bloodType" value="${esc(state.driver.bloodType)}" placeholder="Ej. O+, A-, B+" /></div>
        <div class="field"><label>¿Tienes algún padecimiento?</label><select name="hasMedicalCondition">${options(['No','Sí'], state.driver.hasMedicalCondition || 'No')}</select><small class="field-hint">Ejemplo: diabetes, hipertensión, epilepsia, asma u otro antecedente importante.</small></div>
        <div class="field field-full"><label>Padecimientos o condiciones médicas</label><textarea name="medicalConditions" placeholder="Describe padecimientos relevantes o escribe Ninguno.">${esc(state.driver.medicalConditions)}</textarea></div>
        <div class="field field-full"><label>Alergias</label><textarea name="allergies" placeholder="Ej. penicilina, látex, alimentos, o Sin alergias registradas.">${esc(state.driver.allergies)}</textarea></div>
        <div class="field field-full"><label>Medicamentos que tomas actualmente</label><textarea name="medications" placeholder="Ej. losartán, insulina, inhalador, o No toma medicamentos.">${esc(state.driver.medications)}</textarea></div>
        <div class="field field-full"><label>Notas adicionales para emergencia</label><textarea name="emergencyNotes" placeholder="Indicaciones especiales, contacto médico, recomendaciones, etc.">${esc(state.driver.emergencyNotes)}</textarea></div>
      </div>
      <label class="checkbox-row"><input name="shareMedicalInfo" type="checkbox" ${state.driver.shareMedicalInfo ? 'checked' : ''}/>Permitir que esta ficha se muestre en alertas activas y reportes de emergencia.</label>
      <div class="form-actions"><button class="btn" type="button" data-action="onboarding-prev">Atrás</button><button class="btn primary" type="submit">Siguiente</button></div>
    </form>
  `;
}

function onboardingVehicle() {
  return `
    <form id="onboarding-vehicle" novalidate>
      <div class="alert-box info"><div>🚘</div><div><strong>Registro orientado a vehículos de 4 ruedas</strong><p>Configura autos, SUV, camionetas, pick-up o vanes familiares para que el panel use datos coherentes de conducción y severidad.</p></div></div>
      <div class="form-grid">
        <div class="field"><label>Tipo de vehículo de 4 ruedas</label><select name="vehicleType">${options(VEHICLE_TYPES, normalizeVehicleType(state.driver.vehicleType))}</select><small class="field-hint">Selecciona la categoría del vehículo registrado para contextualizar velocidad, severidad y telemetría.</small></div>
        <div class="field"><label>Marca</label><input name="brand" value="${esc(state.driver.brand)}" required /></div>
        <div class="field"><label>Modelo exacto</label><input name="model" value="${esc(state.driver.model)}" required /></div>
        <div class="field"><label>Año</label><input name="year" value="${esc(state.driver.year)}" required /></div>
        <div class="field"><label>Velocidad promedio</label><input name="avgSpeed" value="${esc(state.driver.avgSpeed)}" required /></div>
        <div class="field"><label>Uso principal</label><select name="usage">${options(['Ciudad','Carretera','Mixto'], state.driver.usage)}</select></div>
      </div>
      <div class="form-actions"><button class="btn" type="button" data-action="onboarding-prev">Atrás</button><button class="btn primary" type="submit">Siguiente</button></div>
    </form>
  `;
}

function onboardingContact() {
  return `
    <form id="onboarding-contact" novalidate>
      <div class="alert-box info"><div>🤝</div><div><strong>Primer contacto en red interna</strong><p>Configura el usuario único o ID de perfil de la persona. Debe tener cuenta Impact.X.</p></div></div>
      <div class="form-grid">
        <div class="field"><label>Nombre de la persona</label><input name="name" placeholder="Nombre completo o alias" required /></div>
        <div class="field"><label>Usuario Impact.X</label><input name="username" placeholder="Ej. maria_segura" required /></div>
        <div class="field"><label>ID de perfil (opcional)</label><input name="profileId" placeholder="Ej. IX-MARIA-8X2K" /></div>
        <div class="field"><label>Relación / Parentesco</label><input name="relation" placeholder="Ej. Madre, Pareja, Amigo" required /></div>
        <div class="field" style="display:none;"><input name="phone" value="" /></div>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="onboarding-prev">Atrás</button>
        <button class="btn" type="button" data-action="onboarding-skip-contact">Omitir por ahora</button>
        <button class="btn primary" type="submit">Agregar y continuar</button>
      </div>
    </form>
  `;
}

function onboardingConfirm() {
  return `
    <div class="grid grid-3">
      <div class="card soft"><h3>Conductor</h3>${infoRows({Nombre: state.driver.fullName, Teléfono: state.user.phone, Ciudad: state.user.city, Plan: plan().name})}</div>
      <div class="card soft"><h3>Ficha médica</h3>${infoRows({'Tipo de sangre': state.driver.bloodType, Padecimiento: state.driver.hasMedicalCondition, Alergias: state.driver.allergies, Medicamentos: state.driver.medications})}</div>
      <div class="card soft"><h3>Vehículo</h3>${infoRows({Tipo: state.driver.vehicleType, Marca: state.driver.brand, Modelo: state.driver.model, 'Velocidad promedio': state.driver.avgSpeed})}</div>
    </div>
    <div class="form-actions"><button class="btn" type="button" data-action="onboarding-edit">Editar datos</button><button class="btn primary" type="button" data-action="finish-onboarding">Finalizar configuración</button></div>
  `;
}
