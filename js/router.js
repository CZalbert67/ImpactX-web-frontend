// js/router.js
import { state, saveState, ensureState } from './state.js';
import { attachHandlers } from './handlers.js';

// Lazy imports of views to avoid circular dependency or premature executions
import { renderLanding } from './views/landing.js';
import { renderPlans } from './views/plans.js';
import { renderLogin, renderRegister, renderRecover } from './views/auth.js';
import { renderAcceptInvite, renderMonitorNetwork, renderNewInvitation, renderMonitorDetail } from './views/monitors.js';
import { renderPermissions, renderSettings } from './views/settings.js';
import { renderOnboarding } from './views/onboarding.js';
import { renderChats } from './views/chats.js';
import { renderProfile } from './views/profile.js';
import { renderWearable } from './views/wearable.js';
import { renderContacts, renderContactForm, renderContactDetail } from './views/contacts.js';
import { renderSubscription, renderChangePlan, renderPayments, renderPayment, renderSubscriptionExpired } from './views/subscription.js';
import { renderIncidents, renderIncidentDetail, renderActiveAlert } from './views/incidents.js';
import { renderNotifications } from './views/notifications.js';
import { renderHelp } from './views/help.js';
import { renderInviteApp, renderAppInviteAccept } from './views/inviteApp.js';
import { renderRoutes } from './views/routes.js';
import { dashboardShell } from './components/shell.js';

export function navigate(path) {
  const nextHash = path.startsWith('#') ? path : `#${path}`;
  if (location.hash === nextHash) {
    route();
  } else {
    location.hash = nextHash;
  }
}

export function currentPath() {
  return location.hash.replace(/^#/, '') || '/';
}

export function renderNotFound() {
  const isPrivate = currentPath().startsWith('/dashboard');
  const content = `
    <div class="empty-state">
      <h3>Página no encontrada</h3>
      <p>La ruta solicitada no existe dentro del prototipo.</p>
      <button class="btn primary" data-route="${isPrivate ? '/dashboard/chats' : '/'}">
        ${isPrivate ? 'Ir a chats internos' : 'Volver al inicio'}
      </button>
    </div>
  `;
  return isPrivate 
    ? dashboardShell('Error 404', 'Ruta inexistente.', content) 
    : `<div class="app-shell"><section class="form-page"><div class="container">${content}</div></section></div>`;
}

export function renderConnectionError() {
  const content = `
    <div class="empty-state">
      <h3>Error de conexión</h3>
      <p>No pudimos conectar con el servidor. Este prototipo simula el error y permite reintentar.</p>
      <button class="btn primary" data-action="retry-connection">Reintentar</button>
      <button class="btn" data-route="/dashboard/chats">Ir a chats</button>
    </div>
  `;
  return dashboardShell('Error de conexión', 'Estado visual para fallas de backend o red.', content);
}

export function route() {
  ensureState();
  saveState();
  const path = currentPath();
  
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  document.body.classList.toggle('sidebar-open', !!state.ui.sidebarOpen);

  if (path === '/') {
    appContainer.innerHTML = renderLanding();
  } else if (path.startsWith('/planes')) {
    appContainer.innerHTML = renderPlans(true);
  } else if (path.startsWith('/registro')) {
    appContainer.innerHTML = renderRegister();
  } else if (path === '/login') {
    appContainer.innerHTML = renderLogin();
  } else if (path === '/recuperar-password') {
    appContainer.innerHTML = renderRecover();
  } else if (path.startsWith('/invitacion/')) {
    appContainer.innerHTML = renderAcceptInvite(path.split('/')[2]);
  } else if (path === '/permisos') {
    appContainer.innerHTML = renderPermissions(false);
  } else if (path === '/onboarding') {
    appContainer.innerHTML = renderOnboarding();
  } else if (path === '/dashboard' || path === '/dashboard/overview' || path === '/dashboard/metricas' || path === '/dashboard/chats') {
    appContainer.innerHTML = renderChats();
  } else if (/^\/dashboard\/chats\/contact-\d+$/.test(path)) {
    state.ui.activeChatId = path.split('/')[3];
    appContainer.innerHTML = renderChats();
  } else if (path === '/dashboard/rutas') {
    appContainer.innerHTML = renderRoutes();
  } else if (path === '/dashboard/perfil') {
    appContainer.innerHTML = renderProfile();
  } else if (path === '/dashboard/wearable') {
    appContainer.innerHTML = renderWearable();
  } else if (path === '/dashboard/contactos') {
    appContainer.innerHTML = renderContacts();
  } else if (path === '/dashboard/contactos/nuevo') {
    appContainer.innerHTML = renderContactForm('new');
  } else if (/^\/dashboard\/contactos\/\d+\/editar$/.test(path)) {
    appContainer.innerHTML = renderContactForm('edit', path.split('/')[3]);
  } else if (/^\/dashboard\/contactos\/\d+$/.test(path)) {
    appContainer.innerHTML = renderContactDetail(path.split('/')[3]);
  } else if (path === '/dashboard/red-monitoreo') {
    appContainer.innerHTML = renderMonitorNetwork();
  } else if (path.startsWith('/dashboard/red-monitoreo/nueva-invitacion')) {
    appContainer.innerHTML = renderNewInvitation();
  } else if (/^\/dashboard\/red-monitoreo\/\d+$/.test(path)) {
    appContainer.innerHTML = renderMonitorDetail(path.split('/')[3]);
  } else if (path === '/dashboard/suscripcion') {
    appContainer.innerHTML = renderSubscription();
  } else if (path.startsWith('/dashboard/suscripcion/cambiar-plan/')) {
    appContainer.innerHTML = renderChangePlan(path.split('/')[4]);
  } else if (path === '/dashboard/suscripcion/pagos') {
    appContainer.innerHTML = renderPayments();
  } else if (path.startsWith('/dashboard/suscripcion/pago')) {
    appContainer.innerHTML = renderPayment();
  } else if (path === '/dashboard/incidentes') {
    appContainer.innerHTML = renderIncidents();
  } else if (/^\/dashboard\/incidentes\/\d+$/.test(path)) {
    appContainer.innerHTML = renderIncidentDetail(path.split('/')[3]);
  } else if (/^\/dashboard\/alerta\/\d+$/.test(path)) {
    appContainer.innerHTML = renderActiveAlert(path.split('/')[3]);
  } else if (path === '/dashboard/notificaciones') {
    appContainer.innerHTML = renderNotifications();
  } else if (path === '/dashboard/configuracion') {
    appContainer.innerHTML = renderSettings();
  } else if (path === '/dashboard/permisos') {
    appContainer.innerHTML = renderPermissions(true);
  } else if (path.startsWith('/dashboard/ayuda')) {
    appContainer.innerHTML = renderHelp();
  } else if (path === '/dashboard/suscripcion-vencida') {
    appContainer.innerHTML = renderSubscriptionExpired();
  } else if (path === '/dashboard/error-conexion') {
    appContainer.innerHTML = renderConnectionError();
  } else if (path === '/dashboard/invitar-app') {
    appContainer.innerHTML = renderInviteApp();
  } else if (path.startsWith('/registro-invitado/')) {
    appContainer.innerHTML = renderAppInviteAccept(path.split('/')[2]);
  } else {
    appContainer.innerHTML = renderNotFound();
  }
  
  attachHandlers();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
