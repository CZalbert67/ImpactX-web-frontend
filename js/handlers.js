// js/handlers.js
import { state, saveState, ensureState, plan } from './state.js';
import { navigate, route } from './router.js';
import { $, $$, toast, closeModal, confirmModal, premiumBlocked, limitBlocked, copyText } from './utils.js';

// Action and submit functions from views
import { choosePlan } from './views/plans.js';
import { logout, resetDemo, cancelOnboarding } from './views/auth.js';
import { syncWearable, pairingGuide, unlinkWearable } from './views/wearable.js';
import { goAddContact, cancelContactForm, deleteContact, makePrimary, copyContactProfile, acceptContactRequest, pauseContactRequest } from './views/contacts.js';
import { copyInvite, sendWhatsapp, resendInvite, revokeMonitor, restoreMonitor, activateMonitor, expireMonitor, rejectInvite } from './views/monitors.js';
import { confirmPlanChange, expireSubscription, cancelSubscription } from './views/subscription.js';
import { exportIncidents, downloadReport, openExternalMap, markFalseAlarm, addIncidentNote, simulateCriticalIncident, simulateDashboardDay, exportDashboardSummary, markAlertAttended } from './views/incidents.js';
import { toggleRead, deleteNotification, deleteAllNotifications } from './views/notifications.js';
import { changePassword, savePreferences, downloadData, deleteAccount, grantAllPermissions, clearPermissions } from './views/settings.js';
import { copyAppInvite, openAppInvite, markAppInviteUsed, cancelAppInvite } from './views/inviteApp.js';
import { simulateMobileRoute, copyRouteSummary, sendRouteContext } from './views/routes.js';
import { openChatContact, openChatFromMonitor, openPrimaryChat, selectChat, sendChatMessage, simulateReply, broadcastAccident } from './views/chats.js';

// Submit handlers
import { submitRegister, submitLogin, submitRecover } from './views/auth.js';
import { submitOnboardingPersonal, submitOnboardingMedical, submitOnboardingVehicle, submitOnboardingContact } from './views/onboarding.js';
import { submitProfile } from './views/profile.js';
import { saveContactFromForm } from './views/contacts.js';
import { submitInvite, submitAcceptInvite } from './views/monitors.js';
import { submitPayment } from './views/subscription.js';
import { submitSettings } from './views/settings.js';
import { submitSupport } from './views/help.js';
import { submitAppInvite, submitAppAccount } from './views/inviteApp.js';
import { submitChat } from './views/chats.js';
import { submitPermissions } from './views/settings.js';

export function attachHandlers() {
  const modalRoot = document.getElementById('modal-root');

  $$('[data-route]').forEach(el => el.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(el.dataset.route);
  }));

  $$('[data-action]').forEach(el => el.addEventListener('click', (event) => {
    handleAction(event, el.dataset.action, el);
  }));

  $$('[data-filter]').forEach(el => el.addEventListener('input', () => {
    handleFilter(el);
  }));

  $$('form').forEach(form => {
    form.addEventListener('submit', handleSubmit);
  });

  if (modalRoot) {
    modalRoot.querySelectorAll('[data-action="close-modal"]').forEach(el => {
      el.addEventListener('click', closeModal);
    });
    modalRoot.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target.dataset.closeModal) closeModal();
    });
  }
}

export function handleFilter(el) {
  const key = el.dataset.filter;
  state.filters[key] = el.value;
  route();
}

export function handleAction(event, action, el) {
  event.preventDefault();
  ensureState();
  
  const id = el.dataset.id;
  const planKey = el.dataset.plan;
  const token = el.dataset.token;
  const tab = el.dataset.tab;
  const message = el.dataset.message;
  
  switch (action) {
    case 'scroll-how': 
      document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' }); 
      break;
    case 'choose-plan': 
      choosePlan(planKey); 
      break;
    case 'toggle-avatar-menu': 
      state.ui.avatarMenu = !state.ui.avatarMenu; 
      route(); 
      break;
    case 'toggle-sidebar': 
      state.ui.sidebarOpen = !state.ui.sidebarOpen;
      document.body.classList.toggle('sidebar-open', state.ui.sidebarOpen);
      break;
    case 'logout': 
      logout(); 
      break;
    case 'reset-demo': 
      resetDemo(); 
      break;
    case 'cancel-onboarding': 
      cancelOnboarding(); 
      break;
    case 'onboarding-prev': 
      state.onboardingStep = Math.max(1, state.onboardingStep - 1); 
      route(); 
      break;
    case 'onboarding-skip-contact': 
      state.onboardingStep = 5; 
      toast('Persona omitida', 'Puedes agregarla después desde Personas de emergencia.'); 
      route(); 
      break;
    case 'onboarding-edit': 
      state.onboardingStep = 1; 
      route(); 
      break;
    case 'finish-onboarding': 
      state.user.onboardingComplete = true; 
      state.isLoggedIn = true; 
      toast('Configuración completa', 'Bienvenido a chats internos.'); 
      navigate('/dashboard/chats'); 
      break;
    case 'sync-wearable': 
      syncWearable(); 
      break;
    case 'show-pairing-guide': 
      pairingGuide(); 
      break;
    case 'simulate-low-battery': 
      state.wearable.battery = 12; 
      // Add notification (this function is usually in incidents/notifications, let's look at incidents.js or notifications.js helper)
      state.notifications.unshift({ 
        id: Math.max(1000, ...state.notifications.map(n => n.id)) + 1, 
        title: 'Batería baja', 
        body: 'Tu wearable tiene 12% de batería.', 
        type: 'wearable', 
        unread: true, 
        date: new Date().toLocaleString('es-MX') 
      });
      toast('Batería baja simulada'); 
      route(); 
      break;
    case 'toggle-wearable-connection': 
      state.wearable.connection = state.wearable.connection === 'connected' ? 'disconnected' : 'connected'; 
      toast('Estado cambiado', `Wearable ${state.wearable.connection === 'connected' ? 'conectado' : 'desconectado'}.`); 
      route(); 
      break;
    case 'unlink-wearable': 
      unlinkWearable(); 
      break;
    case 'go-add-contact': 
      goAddContact(); 
      break;
    case 'clear-contact-filters': 
      state.filters.contacts = ''; 
      state.filters.contactStatus = 'todos'; 
      route(); 
      break;
    case 'clear-incident-filters': 
      state.filters.incidents = ''; 
      state.filters.severity = 'todos'; 
      state.filters.incidentStatus = 'todos'; 
      route(); 
      break;
    case 'save-contact-invite': 
      saveContactFromForm(true); 
      break;
    case 'cancel-contact-form': 
      cancelContactForm(); 
      break;
    case 'delete-contact': 
      deleteContact(id); 
      break;
    case 'make-primary': 
      makePrimary(id); 
      break;
    case 'invite-contact': 
      navigate(`/dashboard/red-monitoreo/nueva-invitacion?contacto=${id}`); 
      break;
    case 'copy-invite': 
      copyInvite(id); 
      break;
    case 'copy-last-invite': 
      copyText(state.drafts.inviteUrl, 'Token/ruta copiado'); 
      break;
    case 'open-last-invite': 
      navigate(new URL(state.drafts.inviteUrl).hash.replace('#', '')); 
      break;
    case 'send-whatsapp': 
      openChatFromMonitor(id); 
      break;
    case 'resend-invite': 
      resendInvite(id); 
      break;
    case 'revoke-monitor': 
      revokeMonitor(id); 
      break;
    case 'restore-monitor': 
      restoreMonitor(id); 
      break;
    case 'activate-monitor': 
      activateMonitor(id); 
      break;
    case 'expire-monitor': 
      expireMonitor(id); 
      break;
    case 'clear-monitor-filters': 
      state.filters.monitorStatus = 'todos'; 
      route(); 
      break;
    case 'reject-invite': 
      rejectInvite(token); 
      break;
    case 'confirm-plan-change': 
      confirmPlanChange(planKey); 
      break;
    case 'expire-subscription': 
      expireSubscription(); 
      break;
    case 'cancel-subscription': 
      cancelSubscription(); 
      break;
    case 'download-payment': 
      toast('Comprobante simulado', 'Se generaría un PDF de pago.'); 
      break;
    case 'export-incidents': 
      exportIncidents(); 
      break;
    case 'view-incident-map': 
      if (plan().maps) navigate(`/dashboard/incidentes/${id}`); 
      else premiumBlocked('El mapa de incidentes'); 
      break;
    case 'download-report': 
      downloadReport(id); 
      break;
    case 'open-external-map': 
      openExternalMap(id); 
      break;
    case 'mark-false-alarm': 
      markFalseAlarm(id); 
      break;
    case 'add-incident-note': 
      addIncidentNote(id); 
      break;
    case 'simulate-critical-incident': 
      simulateCriticalIncident(); 
      break;
    case 'simulate-dashboard-day': 
      simulateDashboardDay(); 
      break;
    case 'export-dashboard': 
      exportDashboardSummary(); 
      break;
    case 'call-primary-contact': 
      openPrimaryChat(); 
      break;
    case 'mark-alert-attended': 
      markAlertAttended(id); 
      break;
    case 'mark-all-read': 
      state.notifications.forEach(n => n.unread = false); 
      toast('Notificaciones leídas'); 
      route(); 
      break;
    case 'delete-all-notifications': 
      deleteAllNotifications(); 
      break;
    case 'toggle-read': 
      toggleRead(id); 
      break;
    case 'delete-notification': 
      deleteNotification(id); 
      break;
    case 'change-password': 
      changePassword(); 
      break;
    case 'save-preferences': 
      savePreferences(); 
      break;
    case 'download-data': 
      downloadData(); 
      break;
    case 'close-sessions': 
      toast('Sesiones cerradas', 'Se cerraron las sesiones activas simuladas.'); 
      break;
    case 'delete-account': 
      deleteAccount(); 
      break;
    case 'help-tab': 
      state.ui.activeHelp = tab; 
      route(); 
      break;
    case 'grant-all-permissions': 
      grantAllPermissions(); 
      break;
    case 'clear-permissions': 
      clearPermissions(); 
      break;
    case 'retry-connection': 
      toast('Conexión restablecida', 'El servidor respondió correctamente.'); 
      navigate('/dashboard/chats'); 
      break;
    case 'copy-profile-id': 
      copyText(state.user.profileId, 'ID de perfil copiado'); 
      break;
    case 'copy-username': 
      copyText(`@${state.user.username}`, 'Usuario copiado'); 
      break;
    case 'copy-contact-profile': 
      copyContactProfile(id); 
      break;
    case 'open-chat-contact': 
      openChatContact(id); 
      break;
    case 'open-chat-monitor': 
      openChatFromMonitor(id); 
      break;
    case 'lookup-internal-user': {
      const input = $('#contact-form')?.elements.lookup?.value || '';
      state.ui.lastLookupInput = input;
      route();
      break;
    }
    case 'select-chat': 
      selectChat(id); 
      break;
    case 'send-quick-message': 
      sendChatMessage(message); 
      break;
    case 'simulate-reply': 
      simulateReply(); 
      break;
    case 'broadcast-accident': 
      broadcastAccident(); 
      break;
    case 'send-alert-message': 
      broadcastAccident(message); 
      break;
    case 'copy-app-invite': 
      copyAppInvite(id); 
      break;
    case 'open-app-invite': 
      openAppInvite(id); 
      break;
    case 'mark-app-invite-used': 
      markAppInviteUsed(id); 
      break;
    case 'cancel-app-invite': 
      cancelAppInvite(id); 
      break;
    case 'copy-latest-app-invite': 
      copyText(state.drafts.appInviteUrl || '', 'Último enlace de invitación copiado'); 
      break;
    case 'open-latest-app-invite': {
      const last = state.appInvites.find(x => appInviteUrl(x) === state.drafts.appInviteUrl) || state.appInvites[0];
      if (last) navigate(`/registro-invitado/${last.token}`);
      else toast('Sin invitación', 'Primero genera una invitación.');
      break;
    }
    case 'clear-route-filters':
      state.filters.routeSearch = '';
      state.filters.routeStatus = 'todos';
      route();
      break;
    case 'simulate-mobile-route':
      simulateMobileRoute();
      break;
    case 'copy-route-summary':
      copyRouteSummary(id);
      break;
    case 'send-route-context':
      sendRouteContext(id);
      break;
    case 'accept-contact-request':
      acceptContactRequest(id);
      break;
    case 'pause-contact-request':
      pauseContactRequest(id);
      break;
    default: 
      console.warn('Acción no controlada:', action);
  }
  
  saveState();
}

export function handleSubmit(event) {
  event.preventDefault();
  ensureState();
  const form = event.target;
  
  switch (form.id) {
    case 'register-form':
      submitRegister(form);
      break;
    case 'login-form':
      submitLogin(form);
      break;
    case 'recover-form':
      submitRecover(form);
      break;
    case 'onboarding-personal':
      submitOnboardingPersonal(form);
      break;
    case 'onboarding-medical':
      submitOnboardingMedical(form);
      break;
    case 'onboarding-vehicle':
      submitOnboardingVehicle(form);
      break;
    case 'onboarding-contact':
      submitOnboardingContact(form);
      break;
    case 'profile-form':
      submitProfile(form);
      break;
    case 'contact-form':
      saveContactFromForm();
      break;
    case 'invite-form':
      submitInvite(form);
      break;
    case 'accept-invite-form':
      submitAcceptInvite(form);
      break;
    case 'payment-form':
      submitPayment(form);
      break;
    case 'settings-form':
      submitSettings(form);
      break;
    case 'support-form':
      submitSupport(form);
      break;
    case 'app-invite-form':
      submitAppInvite(form);
      break;
    case 'app-account-form':
      submitAppAccount(form);
      break;
    case 'chat-form':
      submitChat(form);
      break;
    case 'permissions-form':
      submitPermissions(form);
      break;
    default:
      console.warn('Formulario no controlado:', form.id);
  }
  
  saveState();
}
