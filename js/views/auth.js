// js/views/auth.js
import { state, saveState, resetDemoState, v8Slug, v8ProfileId } from '../state.js';
import { navigate, currentPath } from '../router.js';
import { esc, toast, confirmModal, validateRequired } from '../utils.js';
import { publicShell } from '../components/shell.js';
import { planOptions } from './plans.js';

export function usernameTakenInNetwork(username) {
  const normalized = v8Slug(username);
  return state.contacts.some(c => String(c.username).toLowerCase() === normalized.toLowerCase()) || 
         state.monitors.some(m => String(m.username).toLowerCase() === normalized.toLowerCase());
}

export function submitRegister(form) {
  if (!validateRequired(form, ['name','username','email','phone','password','confirm'])) return;
  if (form.elements.password.value !== form.elements.confirm.value) {
    return toast('Contraseñas no coinciden', 'Revisa los campos de contraseña.');
  }
  if (!form.elements.terms.checked || !form.elements.privacy.checked) {
    return toast('Acepta términos', 'Debes aceptar términos y privacidad.');
  }
  const username = v8Slug(form.elements.username.value);
  if (username.length < 4) return toast('Usuario muy corto', 'Usa al menos 4 caracteres.');
  if (usernameTakenInNetwork(username)) {
    return toast('Usuario no disponible', 'Ese nombre de usuario ya existe en la simulación.');
  }
  
  state.user.name = form.elements.name.value.trim();
  state.user.username = username;
  state.user.profileId = v8ProfileId(username);
  state.user.email = form.elements.email.value.trim();
  state.user.phone = form.elements.phone.value.trim();
  state.user.plan = form.elements.plan.value;
  state.driver.fullName = state.user.name;
  state.user.onboardingComplete = false;
  state.user.webPermissionsComplete = false;
  state.isLoggedIn = true;
  state.onboardingStep = 1;
  
  toast('Cuenta creada', `Tu usuario @${username} y tu ID ${state.user.profileId} quedaron registrados.`);
  saveState();
  navigate('/permisos');
}

export function submitLogin(form) {
  if (!validateRequired(form, ['login','password'])) return;
  const login = form.elements.login.value.trim().toLowerCase().replace(/^@/, '');
  const valid = [
    state.user.email?.toLowerCase(), 
    state.user.username?.toLowerCase(), 
    state.user.profileId?.toLowerCase()
  ].includes(login);
  
  if (!valid) {
    return toast('Usuario no encontrado', 'En la demo usa el correo, usuario o ID guardado en este perfil.');
  }
  
  state.isLoggedIn = true;
  toast('Sesión iniciada', `Entraste como @${state.user.username}.`);
  saveState();
  
  if (!state.user.webPermissionsComplete) navigate('/permisos');
  else if (!state.user.onboardingComplete) navigate('/onboarding');
  else if (state.user.subscriptionStatus === 'Vencida') navigate('/dashboard/suscripcion-vencida');
  else navigate('/dashboard/chats');
}

export function submitRecover(form) {
  if (!validateRequired(form, ['email'])) return;
  toast('Enlace enviado', 'Se envió un correo simulado con instrucciones.');
  navigate('/login');
}

export function logout() {
  confirmModal({ 
    title: 'Cerrar sesión', 
    body: '¿Seguro que deseas cerrar sesión?', 
    confirmText: 'Cerrar sesión', 
    danger: true, 
    onConfirm: () => { 
      state.isLoggedIn = false; 
      saveState();
      navigate('/login'); 
      toast('Sesión cerrada'); 
    } 
  });
}

export function resetDemo() {
  confirmModal({ 
    title: 'Reiniciar demo', 
    body: 'Se restaurarán datos mock, chats, solicitudes, contactos, monitores y plan.', 
    confirmText: 'Reiniciar', 
    danger: true, 
    onConfirm: () => { 
      resetDemoState(); 
      toast('Demo reiniciada'); 
      navigate('/dashboard/chats'); 
    } 
  });
}

export function cancelOnboarding() {
  confirmModal({ 
    title: 'Salir del onboarding', 
    body: 'Tu configuración inicial no se ha completado. ¿Deseas salir?', 
    confirmText: 'Salir', 
    danger: true, 
    onConfirm: () => navigate('/login') 
  });
}

export function renderRegister() {
  const queryPlan = new URLSearchParams(currentPath().split('?')[1] || '').get('plan') || state.selectedPlan;
  if (PLAN_RULES[queryPlan]) state.selectedPlan = queryPlan;
  return publicShell(`
    <section class="form-page">
      <div class="container">
        <div class="form-card">
          <span class="eyebrow">Crear titular</span>
          <h2>Registro de usuario</h2>
          <p>Esta cuenta administrará el plan, contactos, red de monitoreo e historial de incidentes.</p>
          <form id="register-form" novalidate>
            <div class="field"><label>Nombre completo</label><input name="name" value="${esc(state.user.name)}" required /></div>
            <div class="field"><label>Correo electrónico</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div>
            <div class="field"><label>Teléfono</label><input name="phone" value="${esc(state.user.phone)}" required /></div>
            <div class="form-grid">
              <div class="field"><label>Contraseña</label><input name="password" type="password" value="Impactx123" required /></div>
              <div class="field"><label>Confirmar contraseña</label><input name="confirm" type="password" value="Impactx123" required /></div>
            </div>
            <div class="field"><label>Plan inicial</label><select name="plan">${planOptions(state.selectedPlan)}</select></div>
            <label class="checkbox-row"><input name="terms" type="checkbox" checked />Acepto términos y condiciones.</label>
            <label class="checkbox-row"><input name="privacy" type="checkbox" checked />Acepto aviso de privacidad y uso de datos de emergencia.</label>
            <div class="form-actions">
              <button class="btn primary" type="submit">Crear cuenta</button>
              <button class="btn" type="button" data-route="/login">Ya tengo cuenta</button>
              <button class="btn ghost" type="button" data-route="/planes">Ver planes</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `);
}

export function renderLogin() {
  return publicShell(`
    <section class="form-page">
      <div class="container">
        <div class="form-card">
          <span class="eyebrow">Acceso</span>
          <h2>Iniciar sesión</h2>
          <p>Ahora puedes entrar con tu correo o con tu nombre de usuario único.</p>
          <form id="login-form" novalidate>
            <div class="field"><label>Correo o usuario</label><input name="login" value="${esc(state.user.username)}" required /></div>
            <div class="field"><label>Contraseña</label><input name="password" type="password" value="Impactx123" required /></div>
            <label class="checkbox-row"><input name="remember" type="checkbox" checked />Recordar sesión en este dispositivo.</label>
            <div class="form-actions">
              <button class="btn primary" type="submit">Iniciar sesión</button>
              <button class="btn" type="button" data-route="/recuperar-password">Olvidé mi contraseña</button>
              <button class="btn ghost" type="button" data-route="/registro">Crear cuenta</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `);
}

export function renderRecover() {
  return publicShell(`
    <section class="form-page">
      <div class="container">
        <div class="form-card">
          <span class="eyebrow">Recuperación</span>
          <h2>Restablecer contraseña</h2>
          <p>Simula el envío de un enlace de recuperación.</p>
          <form id="recover-form" novalidate>
            <div class="field"><label>Correo electrónico</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div>
            <div class="form-actions">
              <button class="btn primary" type="submit">Enviar enlace</button>
              <button class="btn" type="button" data-route="/login">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `);
}
