// js/views/settings.js
import { state, saveState, ensureState, initialState, resetDemoState } from '../state.js';
import { route, navigate } from '../router.js';
import { esc, toast, confirmModal, validateRequired, $ } from '../utils.js';
import { dashboardShell, publicShell } from '../components/shell.js';
import { options } from './onboarding.js';

export function submitSettings(form) {
  if (!validateRequired(form, ['name','email','phone'])) return;
  state.user.name = form.elements.name.value.trim();
  state.user.email = form.elements.email.value.trim();
  state.user.phone = form.elements.phone.value.trim();
  state.user.twoFactor = form.elements.twoFactor.checked;
  toast('Cuenta actualizada', 'Datos principales guardados.');
  route();
}

export function submitPermissions(form) {
  state.webPermissions.browserNotifications = form.elements.browserNotifications.checked;
  state.webPermissions.geolocation = form.elements.geolocation.checked;
  state.webPermissions.localStorage = form.elements.localStorage.checked;
  state.webPermissions.emergencySharing = form.elements.emergencySharing.checked;
  state.webPermissions.internalChat = form.elements.internalChat.checked;
  state.webPermissions.mapLinks = form.elements.mapLinks.checked;
  state.webPermissions.callLinks = false;
  state.webPermissions.acceptedAt = new Date().toLocaleString('es-MX');
  state.user.webPermissionsComplete = true;
  toast('Permisos guardados', 'La demo usará chat interno, mapas y persistencia local según esta configuración.');
  if (location.hash.startsWith('#/dashboard')) navigate('/dashboard/configuracion');
  else navigate('/onboarding');
}

export function grantAllPermissions() {
  Object.assign(state.webPermissions, {
    browserNotifications: true,
    geolocation: true,
    localStorage: true,
    emergencySharing: true,
    internalChat: true,
    mapLinks: true,
    callLinks: false,
    backgroundSyncNotice: true,
    acceptedAt: new Date().toLocaleString('es-MX')
  });
  state.user.webPermissionsComplete = true;
  toast('Permisos activados', 'Todas las funciones internas quedaron habilitadas en la demo.');
  route();
}

export function clearPermissions() {
  Object.assign(state.webPermissions, {
    browserNotifications: false,
    geolocation: false,
    localStorage: true,
    emergencySharing: false,
    internalChat: false,
    mapLinks: false,
    callLinks: false,
    backgroundSyncNotice: false,
    acceptedAt: new Date().toLocaleString('es-MX')
  });
  state.user.webPermissionsComplete = true;
  toast('Permisos desactivados', 'Se conservará localStorage para que la demo pueda persistir cambios.');
  route();
}

export function changePassword() {
  const form = $('#settings-form');
  if (!form) return;
  const pass = form.elements.newPassword.value;
  const confirm = form.elements.confirmPassword.value;
  if (!pass || !confirm) return toast('Campos incompletos', 'Captura nueva contraseña y confirmación.');
  if (pass !== confirm) return toast('No coincide', 'La confirmación no coincide.');
  toast('Contraseña actualizada', 'Cambio simulado correctamente.');
}

export function savePreferences() {
  const form = $('#settings-form');
  if (!form) return;
  state.user.language = form.elements.language.value;
  state.user.timezone = form.elements.timezone.value;
  state.user.notifyEmail = form.elements.notifyEmail.checked;
  state.user.notifySms = form.elements.notifySms.checked;
  state.user.notifyWhatsapp = form.elements.notifyWhatsapp.checked;
  toast('Preferencias guardadas');
  route();
}

export function downloadData() {
  const data = JSON.stringify({ 
    user: state.user, 
    driver: state.driver, 
    contacts: state.contacts, 
    monitors: state.monitors, 
    incidents: state.incidents 
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'impactx-datos-demo.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Datos descargados', 'Archivo JSON generado.');
}

export function deleteAccount() {
  confirmModal({ 
    title: 'Eliminar cuenta', 
    body: 'Esta acción eliminará todos los datos simulados y cerrará sesión.', 
    confirmText: 'Eliminar definitivamente', 
    danger: true, 
    onConfirm: () => { 
      resetDemoState();
      state.isLoggedIn = false; 
      saveState();
      toast('Cuenta eliminada', 'Datos restaurados en la demo.'); 
      navigate('/login'); 
    } 
  });
}

export function renderSettings() {
  ensureState();
  const content = `
    <form id="settings-form" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>Cuenta</h3>
          <div class="field"><label>Nombre</label><input name="name" value="${esc(state.user.name)}" required /></div>
          <div class="field"><label>Correo</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div>
          <div class="field"><label>Teléfono</label><input name="phone" value="${esc(state.user.phone)}" required /></div>
          <button class="btn primary" type="submit">Guardar datos</button>
        </div>
        <div class="card"><h3>Seguridad</h3>
          <div class="field"><label>Contraseña actual</label><input name="currentPassword" type="password" /></div>
          <div class="field"><label>Nueva contraseña</label><input name="newPassword" type="password" /></div>
          <div class="field"><label>Confirmar nueva contraseña</label><input name="confirmPassword" type="password" /></div>
          <label class="checkbox-row"><input name="twoFactor" type="checkbox" ${state.user.twoFactor ? 'checked' : ''}/>Activar verificación en dos pasos.</label>
          <button class="btn" type="button" data-action="change-password">Cambiar contraseña</button>
        </div>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><h3>Preferencias</h3>
          <div class="field"><label>Idioma</label><select name="language">${options(['Español','English'], state.user.language)}</select></div>
          <div class="field"><label>Zona horaria</label><select name="timezone">${options(['America/Mexico_City','America/Monterrey','America/Cancun'], state.user.timezone)}</select></div>
          <label class="checkbox-row"><input name="notifyEmail" type="checkbox" ${state.user.notifyEmail ? 'checked' : ''}/>Notificaciones por correo.</label>
          <label class="checkbox-row"><input name="notifySms" type="checkbox" ${state.user.notifySms ? 'checked' : ''}/>Notificaciones por SMS.</label>
          <label class="checkbox-row"><input name="notifyWhatsapp" type="checkbox" ${state.user.notifyWhatsapp ? 'checked' : ''}/>Notificaciones por WhatsApp.</label>
          <button class="btn" type="button" data-action="save-preferences">Guardar preferencias</button>
        </div>
        <div class="card"><h3>Privacidad</h3>
          <p>Acciones de datos personales del prototipo.</p>
          <div class="card-actions">
            <button class="btn" type="button" data-action="download-data">Descargar mis datos</button>
            <button class="btn warning" type="button" data-action="close-sessions">Cerrar sesiones activas</button>
            <button class="btn" type="button" data-route="/dashboard/permisos">Gestionar permisos web</button>
            <button class="btn danger" type="button" data-action="delete-account">Eliminar cuenta</button>
          </div>
        </div>
      </div>
    </form>
  `;
  return dashboardShell('Configuración', 'Preferencias de cuenta, contraseña, notificaciones y descarga de datos personales.', content);
}

export function renderPermissions(privateMode = true) {
  ensureState();
  const content = `
    <form id="permissions-form" novalidate>
      <div class="alert-box info"><div>🔐</div><div><strong>Permisos lógicos del portal web</strong><p>La web no lee sensores directamente. Usa permisos para mapas, notificaciones, almacenamiento local y chat interno de emergencias.</p></div></div>
      <div class="grid grid-2">
        <div class="card"><h3>Permisos del navegador</h3><label class="checkbox-row"><input name="browserNotifications" type="checkbox" ${state.webPermissions.browserNotifications ? 'checked' : ''}/>Notificaciones internas del navegador.</label><label class="checkbox-row"><input name="geolocation" type="checkbox" ${state.webPermissions.geolocation ? 'checked' : ''}/>Mostrar ubicación del incidente en mapas.</label><label class="checkbox-row"><input name="localStorage" type="checkbox" ${state.webPermissions.localStorage ? 'checked' : ''}/>Guardar simulación en localStorage.</label></div>
        <div class="card"><h3>Permisos de emergencia</h3><label class="checkbox-row"><input name="emergencySharing" type="checkbox" ${state.webPermissions.emergencySharing ? 'checked' : ''}/>Compartir datos del incidente con la red interna.</label><label class="checkbox-row"><input name="internalChat" type="checkbox" ${state.webPermissions.internalChat ? 'checked' : ''}/>Activar chat interno como canal único.</label><label class="checkbox-row"><input name="mapLinks" type="checkbox" ${state.webPermissions.mapLinks ? 'checked' : ''}/>Permitir abrir mapas externos como referencia.</label></div>
      </div>
      <div class="card" style="margin-top:16px"><h3>Resumen</h3><p class="muted">En producción estos permisos requerirían consentimiento claro, revocación y políticas de privacidad. Para la maqueta, sirven para mostrar el flujo real.</p><div class="form-actions"><button class="btn primary" type="submit">Guardar permisos</button><button class="btn" type="button" data-action="grant-all-permissions">Permitir todo</button><button class="btn warning" type="button" data-action="clear-permissions">Desactivar permisos</button>${privateMode ? '<button class="btn" type="button" data-route="/dashboard/configuracion">Volver</button>' : '<button class="btn" type="button" data-route="/onboarding">Omitir por ahora</button>'}</div></div>
    </form>
  `;
  return privateMode 
    ? dashboardShell('Permisos web', 'Permisos para mapas, alertas, chat interno y persistencia local.', content) 
    : publicShell(`<section class="form-page"><div class="container"><div class="form-card wide"><span class="eyebrow">Permisos</span><h2>Configurar permisos web</h2>${content}</div></div></section>`);
}
