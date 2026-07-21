/* Impact.X Web Prototype v7
   Prototipo completo en HTML/CSS/JS puro.
   Simula rutas, estados, CRUD, modales, reglas de plan y persistencia con localStorage.
*/

const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const toastRoot = document.getElementById('toast-root');

const PLAN_RULES = {
  trial: {
    name: 'Trial',
    price: '$0',
    contactsLimit: 2,
    telemetry: true,
    maps: false,
    exportReports: false,
    bypass: false,
    sensors: ['Fuerza G', 'Micrófono', 'Frecuencia cardíaca', 'GPS'],
    description: 'Prueba de 30 días con funciones completas temporales y límite de 2 contactos.'
  },
  basico: {
    name: 'Básico',
    price: '$99/mes',
    contactsLimit: 3,
    telemetry: false,
    maps: false,
    exportReports: false,
    bypass: false,
    sensors: ['Fuerza G', 'GPS'],
    description: 'Protección esencial con fuerza G y temporizador de confirmación.'
  },
  premium: {
    name: 'Premium',
    price: '$199/mes',
    contactsLimit: 8,
    telemetry: true,
    maps: true,
    exportReports: true,
    bypass: true,
    sensors: ['Fuerza G', 'Micrófono', 'Frecuencia cardíaca', 'GPS', 'Bypass crítico'],
    description: 'Protección completa con telemetría avanzada, mapas, reportes y bypass crítico.'
  }
};

const VEHICLE_TYPES = ['Sedán', 'Hatchback', 'SUV', 'Camioneta', 'Pick-up', 'Van / familiar'];
const DEFAULT_VEHICLE_TYPE = 'Sedán';
const normalizeVehicleType = (value) => VEHICLE_TYPES.includes(value) ? value : DEFAULT_VEHICLE_TYPE;

const initialState = () => ({
  isLoggedIn: false,
  selectedPlan: 'trial',
  onboardingStep: 1,
  filters: {
    contacts: '',
    contactStatus: 'todos',
    monitorStatus: 'todos',
    incidents: '',
    severity: 'todos',
    incidentStatus: 'todos',
    notifications: 'todas'
  },
  ui: {
    avatarMenu: false,
    sidebarOpen: false,
    activeHelp: 'wearable'
  },
  user: {
    id: 1,
    name: 'Leonardo Isaac Barrera Tejeda',
    email: 'leo.demo@impactx.mx',
    phone: '+52 773 000 0000',
    city: 'Tula de Allende, Hidalgo',
    plan: 'trial',
    subscriptionStatus: 'Activa',
    trialDaysLeft: 24,
    subscriptionStart: '2026-06-01',
    subscriptionEnd: '2026-06-30',
    onboardingComplete: true,
    webPermissionsComplete: true,
    language: 'Español',
    timezone: 'America/Mexico_City',
    notifyEmail: true,
    notifySms: true,
    notifyWhatsapp: true,
    twoFactor: false
  },
  driver: {
    fullName: 'Leonardo Isaac Barrera Tejeda',
    bloodType: 'O+',
    hasMedicalCondition: 'No',
    medicalConditions: 'Ninguno registrado',
    allergies: 'Sin alergias registradas',
    medications: 'No toma medicamentos registrados',
    emergencyNotes: 'Sin indicaciones adicionales',
    shareMedicalInfo: true,
    vehicleType: DEFAULT_VEHICLE_TYPE,
    brand: 'Nissan',
    model: 'Versa Sense',
    year: '2022',
    avgSpeed: '65 km/h',
    usage: 'Mixto',
    allowLocation: true,
    allowAiLearning: true
  },
  wearable: {
    linked: true,
    model: 'Galaxy Watch 8',
    connection: 'connected',
    battery: 82,
    lastSync: 'Hace 4 minutos',
    appVersion: '1.0.3-beta',
    permissions: {
      accelerometer: true,
      microphone: true,
      heartRate: true,
      gps: true,
      background: true,
      smsBridge: true
    }
  },
  webPermissions: {
    browserNotifications: true,
    geolocation: true,
    localStorage: true,
    emergencySharing: true,
    mapLinks: true,
    callLinks: true,
    backgroundSyncNotice: true,
    acceptedAt: '2026-06-04 10:00'
  },
  contacts: [
    {
      id: 101,
      name: 'María Fernanda Tejeda',
      relation: 'Madre',
      phone: '+52 773 111 2233',
      email: 'maria.demo@mail.com',
      priority: 'Principal',
      status: 'Activo',
      channel: 'WhatsApp',
      createdAt: '2026-06-01',
      monitorId: 301,
      notes: 'Contacto principal para cualquier incidente.'
    },
    {
      id: 102,
      name: 'Carlos Barrera',
      relation: 'Hermano',
      phone: '+52 773 444 5566',
      email: 'carlos.demo@mail.com',
      priority: 'Secundario',
      status: 'Activo',
      channel: 'SMS',
      createdAt: '2026-06-02',
      monitorId: null,
      notes: ''
    }
  ],
  monitors: [
    {
      id: 301,
      contactId: 101,
      name: 'María Fernanda Tejeda',
      phone: '+52 773 111 2233',
      email: 'maria.demo@mail.com',
      status: 'Activo',
      invitedAt: '2026-06-01 14:20',
      acceptedAt: '2026-06-01 14:32',
      expiresAt: '2026-06-08 14:20',
      token: 'MON-MARIA-8X2K',
      permissions: ['Recibir SOS', 'Ver ubicación en incidente', 'Recibir actualizaciones']
    },
    {
      id: 302,
      contactId: null,
      name: 'Andrea Monroy',
      phone: '+52 773 222 8899',
      email: 'andrea.monitor@mail.com',
      status: 'Pendiente',
      invitedAt: '2026-06-04 10:12',
      acceptedAt: '',
      expiresAt: '2026-06-11 10:12',
      token: 'MON-ANDREA-19QZ',
      permissions: ['Recibir SOS', 'Ver ubicación en incidente']
    },
    {
      id: 303,
      contactId: null,
      name: 'Omar Picazo',
      phone: '+52 773 333 7711',
      email: 'omar.monitor@mail.com',
      status: 'Expirado',
      invitedAt: '2026-05-25 12:40',
      acceptedAt: '',
      expiresAt: '2026-05-26 12:40',
      token: 'MON-OMAR-X7P2',
      permissions: ['Recibir SOS', 'Ver ubicación en incidente']
    },
    {
      id: 304,
      contactId: null,
      name: 'Felicitas Diego',
      phone: '+52 773 555 4412',
      email: 'felicitas.monitor@mail.com',
      status: 'Revocado',
      invitedAt: '2026-05-29 16:05',
      acceptedAt: '2026-05-29 16:15',
      revokedAt: '2026-06-02 09:15',
      expiresAt: '2026-06-05 16:05',
      token: 'MON-FELI-R9A1',
      permissions: ['Recibir SOS', 'Ver ubicación en incidente', 'Recibir actualizaciones']
    }
  ],
  incidents: [
    {
      id: 501,
      date: '2026-06-03',
      time: '19:42',
      type: 'Movimiento brusco',
      severity: 'Media',
      status: 'Cancelado por usuario',
      location: 'Carretera Tula-Tepeji km 12',
      coords: '20.054901, -99.343201',
      gForce: '4.2G',
      decibels: '92dB',
      heartRate: '104 bpm',
      activation: 'Temporizador de confirmación',
      notified: ['María Fernanda Tejeda'],
      responseTime: '20 segundos',
      note: 'El usuario confirmó que fue un bache profundo.',
      timeline: [
        ['19:42:04', 'Pico de aceleración detectado'],
        ['19:42:06', 'Validación multisensorial iniciada'],
        ['19:42:24', 'Usuario canceló la alerta desde el reloj']
      ]
    },
    {
      id: 502,
      date: '2026-05-28',
      time: '07:16',
      type: 'Prueba manual',
      severity: 'Baja',
      status: 'Prueba completada',
      location: 'Universidad Tecnológica de Tula Tepeji',
      coords: '20.040101, -99.321030',
      gForce: '0.8G',
      decibels: '54dB',
      heartRate: '82 bpm',
      activation: 'Manual',
      notified: ['María Fernanda Tejeda', 'Carlos Barrera'],
      responseTime: '3 segundos',
      note: 'Prueba de envío de notificaciones.',
      timeline: [
        ['07:16:00', 'Prueba manual iniciada'],
        ['07:16:02', 'Contactos cargados desde la nube'],
        ['07:16:03', 'Alerta de prueba enviada']
      ]
    }
  ],
  notifications: [
    { id: 701, title: 'Wearable conectado', body: 'Galaxy Watch 8 sincronizado hace 4 minutos.', type: 'wearable', unread: true, date: '2026-06-04 10:30' },
    { id: 702, title: 'Invitación pendiente', body: 'Andrea Monroy todavía no acepta su invitación de monitoreo.', type: 'monitor', unread: true, date: '2026-06-04 10:13' },
    { id: 703, title: 'Trial activo', body: 'Tu prueba gratuita termina en 24 días.', type: 'plan', unread: false, date: '2026-06-04 09:00' },
    { id: 704, title: 'Incidente cancelado', body: 'El movimiento brusco del 03/06 fue cancelado por el usuario.', type: 'incident', unread: false, date: '2026-06-03 19:43' }
  ],
  payments: [
    { id: 801, date: '2026-06-01', concept: 'Alta Plan Trial', amount: '$0.00', status: 'Aprobado' }
  ],
  drafts: {
    inviteUrl: '',
    lastReportFormat: 'PDF'
  }
});

const STORAGE_KEY = 'impactx-web-prototype-v7-state';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState();
  } catch (error) {
    console.warn('No se pudo cargar localStorage, usando estado inicial.', error);
    return initialState();
  }
}

function migrateState() {
  const defaults = initialState();
  state.user = { ...defaults.user, ...(state.user || {}) };
  state.driver = { ...defaults.driver, ...(state.driver || {}) };
  if (!state.driver.hasMedicalCondition) state.driver.hasMedicalCondition = defaults.driver.hasMedicalCondition;
  if (!state.driver.medicalConditions) state.driver.medicalConditions = defaults.driver.medicalConditions;
  if (!state.driver.allergies) state.driver.allergies = defaults.driver.allergies;
  if (!state.driver.medications) state.driver.medications = defaults.driver.medications;
  if (state.driver.shareMedicalInfo === undefined) state.driver.shareMedicalInfo = defaults.driver.shareMedicalInfo;
  state.driver.vehicleType = normalizeVehicleType(state.driver.vehicleType);
  state.wearable = {
    ...defaults.wearable,
    ...(state.wearable || {}),
    permissions: { ...defaults.wearable.permissions, ...((state.wearable && state.wearable.permissions) || {}) }
  };
  state.webPermissions = { ...defaults.webPermissions, ...(state.webPermissions || {}) };
  state.filters = { ...defaults.filters, ...(state.filters || {}) };
  state.ui = { ...defaults.ui, ...(state.ui || {}) };
  state.contacts = Array.isArray(state.contacts) ? state.contacts : defaults.contacts;
  state.contacts.forEach(c => {
    if (!c.status) c.status = 'Activo';
    if (!c.priority) c.priority = 'Secundario';
    if (!c.channel) c.channel = 'WhatsApp';
  });
  state.monitors = Array.isArray(state.monitors) ? state.monitors : defaults.monitors;
  state.incidents = Array.isArray(state.incidents) ? state.incidents : defaults.incidents;
  state.notifications = Array.isArray(state.notifications) ? state.notifications : defaults.notifications;
  state.payments = Array.isArray(state.payments) ? state.payments : defaults.payments;
  state.drafts = { ...defaults.drafts, ...(state.drafts || {}) };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('No se pudo guardar en localStorage.', error);
  }
}

function computeIdCounter(data) {
  const ids = [
    ...(data.contacts || []).map(x => x.id),
    ...(data.monitors || []).map(x => x.id),
    ...(data.incidents || []).map(x => x.id),
    ...(data.notifications || []).map(x => x.id),
    ...(data.payments || []).map(x => x.id)
  ].map(Number).filter(Boolean);
  return Math.max(1000, ...ids);
}

let state = loadState();
migrateState();
let idCounter = computeIdCounter(state);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function navigate(path) {
  const nextHash = path.startsWith('#') ? path : `#${path}`;
  if (location.hash === nextHash) {
    route();
  } else {
    location.hash = nextHash;
  }
}

function currentPath() {
  return location.hash.replace(/^#/, '') || '/';
}

function plan() {
  return PLAN_RULES[state.user.plan] || PLAN_RULES.trial;
}

function usableContacts() {
  return state.contacts.filter(c => c.status !== 'Suspendido por plan');
}

function suspendedContacts() {
  return state.contacts.filter(c => c.status === 'Suspendido por plan');
}

function activeAlertContacts() {
  return state.contacts.filter(c => c.status === 'Activo');
}

function contactStatusClass(status) {
  if (status === 'Activo') return 'success';
  if (status === 'Pendiente') return 'warning';
  if (status === 'Suspendido por plan') return 'warning';
  return 'danger';
}

function monitorStatusClass(status) {
  if (status === 'Activo') return 'success';
  if (status === 'Pendiente') return 'warning';
  if (status === 'Revocado') return 'danger';
  if (status === 'Expirado') return 'info';
  return 'info';
}

function monitorStatusDescription(status) {
  if (status === 'Activo') return 'Puede recibir alertas y ubicación.';
  if (status === 'Pendiente') return 'Aún no acepta la invitación.';
  if (status === 'Expirado') return 'La URL anterior venció; puedes restaurar acceso generando una nueva invitación.';
  if (status === 'Revocado') return 'El acceso fue retirado; puedes devolverlo si el titular lo autoriza.';
  return 'Estado de monitoreo.';
}

function planUsageAlert() {
  const p = plan();
  const usable = usableContacts().length;
  const suspended = suspendedContacts().length;
  if (!suspended) {
    return `<div class="alert-box ${usable >= p.contactsLimit ? 'warning' : 'info'}"><div>☎️</div><div><strong>Uso del plan</strong><p>Contactos activos/configurados: ${usable}/${p.contactsLimit}. ${usable >= p.contactsLimit ? 'Límite alcanzado.' : 'Todavía puedes agregar contactos.'}</p></div></div>`;
  }
  return `<div class="alert-box warning"><div>⚠️</div><div><strong>${suspended} contacto(s) pausado(s) por plan</strong><p>Tu plan ${esc(p.name)} permite ${p.contactsLimit} contactos. Los contactos pausados se conservan en la demo, pero no reciben alertas hasta actualizar el plan o liberar espacio.</p></div></div>`;
}

function enforceContactPlanLimit(targetPlan = state.user.plan) {
  const limit = PLAN_RULES[targetPlan]?.contactsLimit || PLAN_RULES.trial.contactsLimit;
  const priorityRank = { Principal: 0, Secundario: 1, Alternativo: 2 };
  const ordered = [...state.contacts].sort((a, b) => {
    const pa = priorityRank[a.priority] ?? 9;
    const pb = priorityRank[b.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
  });
  ordered.forEach((contact, index) => {
    if (index < limit) {
      if (contact.status === 'Suspendido por plan') {
        contact.status = contact.previousStatus || 'Activo';
        delete contact.previousStatus;
      }
    } else {
      if (contact.status !== 'Suspendido por plan') contact.previousStatus = contact.status || 'Activo';
      contact.status = 'Suspendido por plan';
      if (contact.priority === 'Principal') contact.priority = 'Alternativo';
    }
  });
}

function downgradePlanWarning(targetPlan) {
  const next = PLAN_RULES[targetPlan];
  if (!next) return null;
  const overflow = Math.max(0, usableContacts().length - next.contactsLimit);
  if (!overflow) return null;
  return `<div class="alert-box warning"><div>⚠️</div><div><strong>Cambio con reducción de contactos</strong><p>Al cambiar a Plan ${esc(next.name)}, ${overflow} contacto(s) quedarán pausados por límite de plan. No se borran, pero no recibirán alertas hasta actualizar a un plan con más espacios o eliminar otros contactos.</p></div></div>`;
}

function generateId() {
  idCounter += 1;
  return idCounter;
}

function toast(title, body = '') {
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `<strong>${esc(title)}</strong>${body ? `<p>${esc(body)}</p>` : ''}`;
  toastRoot.appendChild(node);
  saveState();
  setTimeout(() => node.remove(), 3600);
}

function openModal({ title, body = '', content = '', actions = [], large = false }) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close-modal="true">
      <div class="modal ${large ? 'large' : ''}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>${esc(title)}</h3>
          <button class="close-x" data-action="close-modal" aria-label="Cerrar">×</button>
        </div>
        ${body ? `<p>${body}</p>` : ''}
        ${content}
        <div class="modal-actions">
          ${actions.map((a, i) => `<button class="btn ${a.className || ''}" data-modal-action="${i}">${esc(a.label)}</button>`).join('')}
        </div>
      </div>
    </div>
  `;
  actions.forEach((action, index) => {
    const button = modalRoot.querySelector(`[data-modal-action="${index}"]`);
    if (button) button.addEventListener('click', () => action.onClick?.());
  });
}

function closeModal() {
  modalRoot.innerHTML = '';
}

function confirmModal({ title, body, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false, onConfirm }) {
  openModal({
    title,
    body: `<span>${esc(body)}</span>`,
    actions: [
      { label: cancelText, onClick: closeModal },
      { label: confirmText, className: danger ? 'danger' : 'primary', onClick: () => { closeModal(); onConfirm?.(); } }
    ]
  });
}

function premiumBlocked(feature = 'Esta función') {
  openModal({
    title: 'Función Premium bloqueada',
    body: `${esc(feature)} está disponible únicamente en el Plan Premium. Actualiza tu plan para desbloquear mapas, telemetría avanzada, reportes y bypass crítico.`,
    actions: [
      { label: 'Cerrar', onClick: closeModal },
      { label: 'Actualizar a Premium', className: 'primary', onClick: () => { closeModal(); navigate('/dashboard/suscripcion/cambiar-plan/premium'); } }
    ]
  });
}

function limitBlocked() {
  openModal({
    title: 'Límite de contactos alcanzado',
    body: `Tu plan ${esc(plan().name)} permite ${plan().contactsLimit} contactos activos. Elimina uno, pausa alguno o actualiza tu plan para agregar más.`,
    actions: [
      { label: 'Cerrar', onClick: closeModal },
      { label: 'Actualizar plan', className: 'primary', onClick: () => { closeModal(); navigate('/dashboard/suscripcion'); } }
    ]
  });
}

function addNotification(title, body, type = 'system') {
  state.notifications.unshift({ id: generateId(), title, body, type, unread: true, date: new Date().toLocaleString('es-MX') });
}

function setSidebarOpen(open) {
  state.ui.sidebarOpen = open;
  document.body.classList.toggle('sidebar-open', open);
}

function publicHeader() {
  return `
    <header class="public-header">
      <div class="container public-nav">
        <a href="#/" class="brand"><span class="brand-mark">IX</span><span>Impact.X</span></a>
        <nav class="nav-links">
          <a href="#/" class="keep">Inicio</a>
          <a href="#/planes" class="keep">Planes</a>
          <button data-action="scroll-how">Cómo funciona</button>
          <a href="#/login" class="keep">Iniciar sesión</a>
          <a href="#/registro" class="btn primary keep">Prueba gratis</a>
        </nav>
      </div>
    </header>
  `;
}

function publicShell(content) {
  return `<div class="app-shell">${publicHeader()}${content}</div>`;
}

function dashboardShell(title, subtitle, content, actions = '') {
  const unread = state.notifications.filter(n => n.unread).length;
  const p = plan();
  const path = currentPath();
  const wearableClass = state.wearable.linked && state.wearable.connection === 'connected' ? 'success' : state.wearable.connection === 'syncing' ? 'warning' : 'danger';
  return `
    <div class="dashboard">
      <aside class="sidebar">
        <a href="#/dashboard/overview" class="brand"><span class="brand-mark">IX</span><span>Impact.X</span></a>
        <div class="side-group">
          <div class="side-label">Principal</div>
          ${sideLink('/dashboard/overview', '🏠', 'Overview', path)}
          ${sideLink('/dashboard/metricas', '📊', 'Dashboard analítico', path)}
          ${sideLink('/dashboard/perfil', '👤', 'Perfil del conductor', path)}
          ${sideLink('/dashboard/wearable', '⌚', 'Wearable', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Seguridad</div>
          ${sideLink('/dashboard/contactos', '☎️', 'Contactos', path)}
          ${sideLink('/dashboard/red-monitoreo', '🛡️', 'Red de monitoreo', path)}
          ${sideLink('/dashboard/incidentes', '📍', 'Incidentes', path)}
          ${sideLink('/dashboard/alerta/501', '🚨', 'Alerta activa demo', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Cuenta</div>
          ${sideLink('/dashboard/suscripcion', '💳', 'Suscripción', path)}
          ${sideLink('/dashboard/notificaciones', '🔔', `Notificaciones ${unread ? `(${unread})` : ''}`, path)}
          ${sideLink('/dashboard/configuracion', '⚙️', 'Configuración', path)}
          ${sideLink('/dashboard/permisos', '🔐', 'Permisos web', path)}
          ${sideLink('/dashboard/ayuda', '❔', 'Ayuda', path)}
        </div>
        <div class="side-group">
          <button class="side-link" data-action="reset-demo">♻️ Reiniciar demo</button>
          <button class="side-link" data-action="logout">🚪 Cerrar sesión</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="topbar-left">
            <button class="btn small mobile-menu" data-action="toggle-sidebar">☰</button>
            <button class="badge ${wearableClass}" data-route="/dashboard/wearable"><span class="status-dot ${wearableClass}"></span>${state.wearable.linked ? state.wearable.connection === 'connected' ? 'Wearable conectado' : 'Wearable desconectado' : 'Sin wearable'}</button>
            <span class="badge primary hide-sm">Plan ${p.name}</span>
          </div>
          <div class="topbar-actions">
            <button class="btn small hide-sm" data-route="/dashboard/contactos/nuevo">+ Contacto</button>
            <button class="btn small" data-route="/dashboard/notificaciones">🔔 ${unread}</button>
            <button class="avatar" data-action="toggle-avatar-menu">${esc(state.user.name.split(' ').map(x => x[0]).slice(0,2).join(''))}</button>
            ${state.ui.avatarMenu ? avatarMenu() : ''}
          </div>
        </header>
        <div class="content">
          <div class="page-title">
            <div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div>
            <div class="page-actions">${actions}</div>
          </div>
          ${content}
        </div>
      </main>
    </div>
  `;
}

function sideLink(path, icon, label, current) {
  const active = current === path || (path !== '/dashboard/overview' && current.startsWith(path));
  return `<a class="side-link ${active ? 'active' : ''}" href="#${path}"><span>${icon}</span><span>${label}</span></a>`;
}

function avatarMenu() {
  return `
    <div class="mini-menu">
      <button data-route="/dashboard/perfil">Ver perfil</button>
      <button data-route="/dashboard/configuracion">Configuración</button>
      <button data-action="logout">Cerrar sesión</button>
    </div>
  `;
}

function renderLanding() {
  return publicShell(`
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">🛡️ Burbuja de seguridad privada</span>
          <h1>Detección inteligente de accidentes desde tu smartwatch.</h1>
          <p class="lead">Impact.X conecta wearable, app móvil y dashboard web para detectar impactos, validar señales multisensoriales y avisar a tus contactos de emergencia con ubicación GPS.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#/registro?plan=trial">Iniciar prueba gratis</a>
            <a class="btn" href="#/planes">Ver planes</a>
            <a class="btn ghost" href="#/login">Ya tengo cuenta</a>
          </div>
          <div class="kpi-strip">
            <div class="kpi-card"><strong>30 días</strong><span>Trial funcional</span></div>
            <div class="kpi-card"><strong>GPS</strong><span>Ubicación de emergencia</span></div>
            <div class="kpi-card"><strong>SPA</strong><span>Dashboard web en React</span></div>
          </div>
        </div>
        <div class="device-mock">
          <div class="mock-top"><span class="mock-pill">SOS listo</span><span class="badge success"><span class="status-dot success"></span>Conectado</span></div>
          <div class="mock-card">
            <h3>Estado de protección</h3>
            <p>Wearable conectado · 2 contactos activos · Trial con 24 días restantes.</p>
          </div>
          <div class="mock-map"></div>
          <div class="mock-card"><strong>Último evento:</strong> Movimiento brusco cancelado por usuario.</div>
        </div>
      </div>
    </section>
    <section id="como-funciona" class="section">
      <div class="container">
        <div class="section-head"><div><h2>Cómo funciona</h2><p>Flujo básico desde detección hasta notificación a monitores.</p></div></div>
        <div class="grid grid-4">
          ${infoCard('1', 'Detección inicial', 'El smartwatch detecta anomalías de aceleración y movimientos bruscos.')}
          ${infoCard('2', 'Validación multisensorial', 'Se evalúa fuerza G, micrófono, frecuencia cardíaca y contexto del conductor.')}
          ${infoCard('3', 'Confirmación o bypass', 'Según el plan, espera confirmación o activa bypass crítico en impactos graves.')}
          ${infoCard('4', 'Alerta privada', 'Los contactos y monitores reciben ubicación y datos del incidente.')}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head"><div><h2>Módulos web incluidos</h2><p>Este prototipo incluye el flujo completo del apartado web para maquetado.</p></div></div>
        <div class="grid grid-3">
          ${infoCard('🧭', 'Dashboard Overview', 'Estado del wearable, plan, contactos, incidentes y accesos rápidos.')}
          ${infoCard('☎️', 'Gestor de contactos', 'CRUD completo con límite de plan, confirmaciones y prioridad principal.')}
          ${infoCard('🛡️', 'Red de monitoreo', 'Invitaciones por URL, copiar enlace, revocar, reenviar y aceptar invitación.')}
          ${infoCard('📍', 'Incidentes', 'Historial, detalle, mapa simulado, reportes y bloqueo Premium.')}
          ${infoCard('💳', 'Suscripción', 'Planes, cambio de plan, pago simulado e historial.')}
          ${infoCard('⚙️', 'Configuración', 'Cuenta, seguridad, preferencias y privacidad.')}
        </div>
      </div>
    </section>
    <footer class="section"><div class="container card"><strong>Impact.X</strong><p>Prototipo web para proyecto wearable de seguridad vial.</p></div></footer>
  `);
}

function infoCard(icon, title, text) {
  return `<div class="card"><div class="card-icon">${icon}</div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
}

function renderPlans(publicMode = true) {
  const cards = Object.entries(PLAN_RULES).map(([key, p]) => `
    <div class="card plan-card ${key === 'premium' ? 'featured' : ''}">
      <div class="stat-top"><h3>${p.name}</h3>${key === 'premium' ? '<span class="badge primary">Recomendado</span>' : ''}</div>
      <div class="price">${p.price}</div>
      <p>${p.description}</p>
      <ul class="features">
        <li>Límite de contactos: ${p.contactsLimit}</li>
        <li>Sensores: ${p.sensors.join(', ')}</li>
        <li>Mapas: ${p.maps ? 'Sí' : 'No'}</li>
        <li>Reportes: ${p.exportReports ? 'Sí' : 'No'}</li>
        <li>Bypass crítico: ${p.bypass ? 'Sí' : 'No'}</li>
      </ul>
      <button class="btn ${key === 'premium' ? 'primary' : ''} block" data-action="choose-plan" data-plan="${key}">${publicMode ? 'Elegir plan' : state.user.plan === key ? 'Plan actual' : 'Cambiar a este plan'}</button>
    </div>
  `).join('');

  const table = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Función</th><th>Trial</th><th>Básico</th><th>Premium</th></tr></thead>
        <tbody>
          <tr><td>Contactos</td><td>2</td><td>3</td><td>8</td></tr>
          <tr><td>Fuerza G</td><td>Sí</td><td>Sí</td><td>Sí</td></tr>
          <tr><td>Micrófono</td><td>Temporal</td><td>No</td><td>Sí</td></tr>
          <tr><td>Frecuencia cardíaca</td><td>Temporal</td><td>No</td><td>Sí</td></tr>
          <tr><td>Mapas de incidentes</td><td>Limitado</td><td>No</td><td>Sí</td></tr>
          <tr><td>Reportes descargables</td><td>No</td><td>No</td><td>Sí</td></tr>
          <tr><td>Bypass crítico</td><td>No</td><td>No</td><td>Sí</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const content = `
    <section class="section">
      <div class="container">
        <div class="section-head"><div><h2>Planes y suscripciones</h2><p>Selecciona el nivel de protección que tendrá el usuario titular.</p></div></div>
        <div class="grid grid-3">${cards}</div>
      </div>
    </section>
    <section class="section"><div class="container"><div class="section-head"><div><h2>Comparativa</h2><p>Reglas importantes para pantallas, bloqueos y límites del prototipo.</p></div></div>${table}</div></section>
  `;

  return publicMode ? publicShell(content) : content;
}

function renderRegister() {
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

function renderLogin() {
  return publicShell(`
    <section class="form-page">
      <div class="container">
        <div class="form-card">
          <span class="eyebrow">Acceso seguro</span>
          <h2>Iniciar sesión</h2>
          <p>Para la demo puedes usar cualquier correo y contraseña.</p>
          <form id="login-form" novalidate>
            <div class="field"><label>Correo electrónico</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div>
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

function renderRecover() {
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

function planOptions(selected) {
  return Object.entries(PLAN_RULES).map(([k, p]) => `<option value="${k}" ${selected === k ? 'selected' : ''}>${p.name} - ${p.price}</option>`).join('');
}

function renderOnboarding() {
  const step = state.onboardingStep;
  const stepContent = step === 1 ? onboardingPersonal() : step === 2 ? onboardingMedical() : step === 3 ? onboardingVehicle() : step === 4 ? onboardingContact() : onboardingConfirm();
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
      <div class="alert-box info"><div>☎️</div><div><strong>Primer contacto de emergencia</strong><p>Puedes agregarlo ahora o avanzar y configurarlo después desde el dashboard.</p></div></div>
      <div class="form-grid">
        <div class="field"><label>Nombre del contacto</label><input name="name" value="" /></div>
        <div class="field"><label>Parentesco</label><input name="relation" value="" /></div>
        <div class="field"><label>Teléfono</label><input name="phone" value="" /></div>
        <div class="field"><label>Medio de alerta</label><select name="channel">${options(['WhatsApp','SMS','Correo'], 'WhatsApp')}</select></div>
      </div>
      <div class="form-actions"><button class="btn" type="button" data-action="onboarding-prev">Atrás</button><button class="btn" type="button" data-action="onboarding-skip-contact">Omitir por ahora</button><button class="btn primary" type="submit">Agregar y continuar</button></div>
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

function options(items, selected) {
  return items.map(item => `<option value="${esc(item)}" ${item === selected ? 'selected' : ''}>${esc(item)}</option>`).join('');
}

function infoRows(obj) {
  return Object.entries(obj).map(([k, v]) => `<div class="info-row"><span>${esc(k)}</span><strong>${esc(v || 'No configurado')}</strong></div>`).join('');
}

function renderOverview() {
  const p = plan();
  const contactsUsed = usableContacts().length;
  const lastIncident = state.incidents[0];
  const protectionStatus = getProtectionStatus();
  const content = `
    ${protectionStatus.alert}
    <div class="grid grid-3">
      <div class="card stat-card">
        <div class="stat-top"><h3>Wearable</h3>${wearableBadge()}</div>
        <div class="stat-value">${state.wearable.linked ? state.wearable.battery + '%' : '--'}</div>
        <div class="stat-desc">${state.wearable.linked ? `${state.wearable.model} · ${state.wearable.lastSync}` : 'Sin dispositivo vinculado'}</div>
        <div class="card-actions"><button class="btn small" data-route="/dashboard/wearable">Ver dispositivo</button><button class="btn small" data-action="sync-wearable">Sincronizar</button></div>
      </div>
      <div class="card stat-card">
        <div class="stat-top"><h3>Suscripción</h3><span class="badge primary">${p.name}</span></div>
        <div class="stat-value">${state.user.plan === 'trial' ? state.user.trialDaysLeft : 'Activa'}</div>
        <div class="stat-desc">${state.user.plan === 'trial' ? 'días restantes de prueba' : `Vence el ${state.user.subscriptionEnd}`}</div>
        <div class="card-actions"><button class="btn small" data-route="/dashboard/suscripcion">Ver plan</button><button class="btn small primary" data-route="/dashboard/suscripcion/cambiar-plan/premium">Actualizar</button></div>
      </div>
      <div class="card stat-card">
        <div class="stat-top"><h3>Contactos</h3><span class="badge ${contactsUsed >= p.contactsLimit ? 'warning' : 'success'}">${contactsUsed}/${p.contactsLimit}</span></div>
        <div class="stat-value">${contactsUsed}</div>
        <div class="stat-desc">Contactos activos/configurados. ${suspendedContacts().length ? suspendedContacts().length + ' pausado(s) por plan.' : ''}</div>
        <div class="progress"><span style="width:${Math.min(100, contactsUsed / p.contactsLimit * 100)}%"></span></div>
        <div class="card-actions"><button class="btn small" data-action="go-add-contact">Agregar contacto</button><button class="btn small" data-route="/dashboard/contactos">Ver contactos</button></div>
      </div>
      <div class="card stat-card">
        <div class="stat-top"><h3>Último incidente</h3><span class="badge warning">${lastIncident.severity}</span></div>
        <div class="stat-value">${lastIncident.time}</div>
        <div class="stat-desc">${lastIncident.type} · ${lastIncident.status}<br>${lastIncident.location}</div>
        <div class="card-actions"><button class="btn small" data-route="/dashboard/incidentes/${lastIncident.id}">Ver detalle</button><button class="btn small" data-route="/dashboard/incidentes">Historial</button></div>
      </div>
      <div class="card stat-card">
        <div class="stat-top"><h3>Red de monitoreo</h3><span class="badge info">${state.monitors.filter(m => m.status === 'Activo').length} activos</span></div>
        <div class="stat-value">${state.monitors.length}</div>
        <div class="stat-desc">Monitores activos y pendientes para recibir alertas.</div>
        <div class="card-actions"><button class="btn small" data-route="/dashboard/red-monitoreo/nueva-invitacion">Generar invitación</button><button class="btn small" data-route="/dashboard/red-monitoreo">Ver red</button></div>
      </div>
      <div class="card stat-card">
        <div class="stat-top"><h3>Protección</h3>${protectionStatus.badge}</div>
        <div class="stat-value">${protectionStatus.value}</div>
        <div class="stat-desc">${protectionStatus.text}</div>
        <div class="card-actions"><button class="btn small" data-route="/dashboard/ayuda">Ver ayuda</button><button class="btn small" data-route="/dashboard/perfil">Revisar perfil</button></div>
      </div>
    </div>
    <div class="grid grid-3" style="margin-top:16px">
      <div class="card"><h3>Acciones rápidas</h3><div class="card-actions">
        <button class="btn" data-action="go-add-contact">+ Contacto</button>
        <button class="btn" data-route="/dashboard/red-monitoreo/nueva-invitacion">Generar invitación</button>
        <button class="btn" data-route="/dashboard/alerta/501">Ver alerta activa demo</button>
        <button class="btn" data-action="simulate-critical-incident">Simular incidente crítico</button>
      </div></div>
      <div class="card"><h3>Ficha médica rápida</h3>${infoRows({'Padecimiento': state.driver.hasMedicalCondition || 'No', Alergias: state.driver.allergies, Medicamentos: state.driver.medications})}<div class="card-actions"><button class="btn small" data-route="/dashboard/perfil">Editar ficha</button></div></div>
      <div class="card"><h3>Últimas notificaciones</h3><div class="list">${state.notifications.slice(0,3).map(notificationItem).join('')}</div></div>
    </div>
  `;
  return dashboardShell('Overview', 'Resumen general del estado de protección, suscripción, contactos y eventos.', content);
}

function getProtectionStatus() {
  const noContacts = activeAlertContacts().length === 0;
  const disconnected = !state.wearable.linked || state.wearable.connection !== 'connected';
  const expired = state.user.subscriptionStatus === 'Vencida';
  if (expired) return { value: 'Bloqueada', text: 'La suscripción está vencida.', badge: '<span class="badge danger">Crítico</span>', alert: '<div class="alert-box danger"><div>⚠️</div><div><strong>Suscripción vencida</strong><p>Renueva el plan para mantener activa la protección.</p></div></div>' };
  if (noContacts) return { value: 'Incompleta', text: 'Agrega al menos un contacto de emergencia.', badge: '<span class="badge warning">Atención</span>', alert: '<div class="alert-box warning"><div>☎️</div><div><strong>Sin contactos de emergencia</strong><p>La alerta no podrá enviarse si no agregas contactos.</p></div></div>' };
  if (disconnected) return { value: 'Limitada', text: 'El wearable no está conectado.', badge: '<span class="badge warning">Limitada</span>', alert: '<div class="alert-box warning"><div>⌚</div><div><strong>Wearable desconectado</strong><p>La protección puede estar limitada hasta sincronizar el dispositivo.</p></div></div>' };
  if (state.user.plan === 'basico') return { value: 'Básica', text: 'El plan básico no tiene telemetría avanzada ni bypass crítico.', badge: '<span class="badge info">Básica</span>', alert: '<div class="alert-box info"><div>ℹ️</div><div><strong>Protección básica activa</strong><p>Para mapas, reportes y bypass crítico actualiza a Premium.</p></div></div>' };
  return { value: 'Completa', text: 'Wearable conectado, contactos activos y plan funcional.', badge: '<span class="badge success">Activa</span>', alert: '<div class="alert-box success"><div>✅</div><div><strong>Protección activa</strong><p>El sistema está listo para detectar y notificar incidentes.</p></div></div>' };
}

function wearableBadge() {
  if (!state.wearable.linked) return '<span class="badge danger"><span class="status-dot danger"></span>No vinculado</span>';
  if (state.wearable.connection === 'connected') return '<span class="badge success"><span class="status-dot success"></span>Conectado</span>';
  return '<span class="badge danger"><span class="status-dot danger"></span>Desconectado</span>';
}

function notificationItem(n) {
  const route = notificationRoute(n);
  return `<div class="list-item"><div class="list-item-main"><h4>${n.unread ? '● ' : ''}${esc(n.title)}</h4><p>${esc(n.body)} · ${esc(n.date)}</p></div><button class="btn small" data-route="${route}">Ver</button></div>`;
}

function notificationRoute(n) {
  if (n.type === 'wearable') return '/dashboard/wearable';
  if (n.type === 'monitor') return '/dashboard/red-monitoreo';
  if (n.type === 'plan') return '/dashboard/suscripcion';
  if (n.type === 'incident') return '/dashboard/incidentes/501';
  return '/dashboard/overview';
}


function parseSeconds(value = '') {
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function severityWeight(severity = '') {
  const map = { Baja: 1, Media: 2, Alta: 3, Crítica: 4, Critica: 4 };
  return map[severity] || 1;
}

function incidentSeverityCounts() {
  const counts = { Baja: 0, Media: 0, Alta: 0, Crítica: 0 };
  state.incidents.forEach(i => {
    const key = i.severity === 'Critica' ? 'Crítica' : i.severity;
    if (counts[key] === undefined) counts[key] = 0;
    counts[key] += 1;
  });
  return counts;
}

function monitorCounts() {
  const counts = { Activo: 0, Pendiente: 0, Expirado: 0, Revocado: 0 };
  state.monitors.forEach(m => {
    if (counts[m.status] === undefined) counts[m.status] = 0;
    counts[m.status] += 1;
  });
  return counts;
}

function contactCounts() {
  const counts = { Activo: 0, Pendiente: 0, Inactivo: 0, 'Suspendido por plan': 0 };
  state.contacts.forEach(c => {
    if (counts[c.status] === undefined) counts[c.status] = 0;
    counts[c.status] += 1;
  });
  return counts;
}

function avgResponseSeconds() {
  const values = state.incidents.map(i => parseSeconds(i.responseTime)).filter(v => v > 0);
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function riskIndex() {
  let score = 18;
  score += state.incidents.reduce((sum, i) => sum + severityWeight(i.severity) * 7, 0);
  score += suspendedContacts().length * 8;
  score += state.monitors.filter(m => m.status !== 'Activo').length * 3;
  if (state.wearable.connection !== 'connected' || !state.wearable.linked) score += 20;
  if (state.wearable.battery < 25) score += 12;
  if (state.user.subscriptionStatus === 'Vencida') score += 25;
  if (state.user.plan === 'basico') score += 8;
  if (state.user.plan === 'premium') score -= 10;
  if (activeAlertContacts().length === 0) score += 25;
  return Math.max(0, Math.min(100, score));
}

function protectionScore() {
  let score = 0;
  if (state.user.subscriptionStatus !== 'Vencida') score += 20;
  if (state.wearable.linked && state.wearable.connection === 'connected') score += 20;
  if (state.wearable.battery >= 25) score += 10;
  score += Math.min(20, activeAlertContacts().length * 8);
  score += Math.min(15, state.monitors.filter(m => m.status === 'Activo').length * 8);
  if (state.driver.allowLocation) score += 5;
  if (state.webPermissions.emergencySharing) score += 5;
  if (plan().bypass) score += 5;
  return Math.max(0, Math.min(100, score));
}

function operationalStatus() {
  const protection = protectionScore();
  const risk = riskIndex();
  if (state.user.subscriptionStatus === 'Vencida') return { label: 'Bloqueado', cls: 'danger', text: 'La suscripción vencida impide operar la protección.' };
  if (protection >= 85 && risk < 45) return { label: 'Óptimo', cls: 'success', text: 'El sistema tiene cobertura suficiente para operar ante un incidente.' };
  if (protection >= 60) return { label: 'Aceptable', cls: 'warning', text: 'La protección funciona, pero existen puntos por reforzar.' };
  return { label: 'Riesgo alto', cls: 'danger', text: 'Faltan elementos críticos como contactos, wearable o permisos.' };
}

function barChart(counts, totalLabel = 'eventos') {
  const values = Object.values(counts);
  const max = Math.max(1, ...values);
  return `<div class="bar-chart">${Object.entries(counts).map(([label, value]) => `
    <div class="bar-row">
      <span>${esc(label)}</span>
      <div class="bar-track"><i style="width:${Math.max(4, Math.round((value / max) * 100))}%"></i></div>
      <strong>${value}</strong>
    </div>`).join('')}
    <p class="mini-note">Total: ${values.reduce((a,b)=>a+b,0)} ${esc(totalLabel)}.</p>
  </div>`;
}

function horizontalMeter(label, value, cls = 'primary') {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return `<div class="meter-block"><div class="meter-label"><span>${esc(label)}</span><strong>${safe}%</strong></div><div class="progress tall"><span class="${cls}" style="width:${safe}%"></span></div></div>`;
}

function donutLegend(counts) {
  const total = Math.max(1, Object.values(counts).reduce((a,b)=>a+b,0));
  return `<div class="legend-list">${Object.entries(counts).map(([label, value]) => `<div><span class="legend-dot"></span><strong>${esc(label)}</strong><em>${value} · ${Math.round(value/total*100)}%</em></div>`).join('')}</div>`;
}

function donutChart(counts, title) {
  const total = Math.max(1, Object.values(counts).reduce((a,b)=>a+b,0));
  let cursor = 0;
  const colors = ['#22c55e', '#f59e0b', '#38bdf8', '#ef4444', '#a855f7'];
  const stops = Object.values(counts).map((value, index) => {
    const start = cursor;
    const end = cursor + (value / total) * 100;
    cursor = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  }).join(', ');
  return `<div class="donut-wrap"><div class="donut" style="background:conic-gradient(${stops || '#1f2937 0 100%'})"><span>${total}</span></div><div><h4>${esc(title)}</h4>${donutLegend(counts)}</div></div>`;
}

function incidentTrendData() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const buckets = Object.fromEntries(days.map(d => [d, 0]));
  state.incidents.forEach((incident, index) => {
    const date = new Date(`${incident.date}T12:00:00`);
    if (Number.isNaN(date.getTime())) {
      buckets[days[index % days.length]] += 1;
    } else {
      const day = days[(date.getDay() + 6) % 7];
      buckets[day] += 1;
    }
  });
  return buckets;
}

function svgLineChart(data) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([,v]) => v));
  const width = 360;
  const height = 150;
  const points = entries.map(([_, value], index) => {
    const x = 20 + index * ((width - 40) / Math.max(1, entries.length - 1));
    const y = height - 25 - (value / max) * 95;
    return [x, y, value];
  });
  const poly = points.map(p => `${p[0]},${p[1]}`).join(' ');
  return `<div class="line-card"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Tendencia de incidentes">
    <polyline points="${poly}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
    ${points.map(([x,y,value]) => `<circle cx="${x}" cy="${y}" r="5"></circle><text x="${x}" y="${height-6}" text-anchor="middle">${value}</text>`).join('')}
  </svg><div class="trend-labels">${entries.map(([label]) => `<span>${esc(label)}</span>`).join('')}</div></div>`;
}

function featurePill(enabled, label) {
  return `<div class="feature-pill ${enabled ? 'ok' : 'locked'}"><span>${enabled ? '✓' : '×'}</span>${esc(label)}</div>`;
}

function dashboardInsightList() {
  const insights = [];
  if (state.wearable.connection !== 'connected') insights.push(['⌚', 'Conectar wearable', 'El panel indica que el reloj no está conectado; esto reduce la cobertura de detección.']);
  if (state.wearable.battery < 25) insights.push(['🔋', 'Cargar dispositivo', `La batería está en ${state.wearable.battery}%, se recomienda cargarlo antes de conducir.`]);
  if (activeAlertContacts().length < Math.min(2, plan().contactsLimit)) insights.push(['☎️', 'Agregar contactos', 'Se recomienda tener al menos dos contactos activos para mejorar la respuesta.']);
  if (state.monitors.filter(m => m.status === 'Activo').length === 0) insights.push(['🛡️', 'Activar monitores', 'La red de monitoreo no tiene monitores activos para recibir ubicación en emergencia.']);
  if (suspendedContacts().length) insights.push(['⚠️', 'Contactos suspendidos', `${suspendedContacts().length} contacto(s) no recibirán alertas por el límite del plan actual.`]);
  if (!plan().maps || !plan().bypass) insights.push(['💳', 'Funciones bloqueadas', 'El plan actual no tiene todas las funciones avanzadas de telemetría, mapas o bypass crítico.']);
  if (!insights.length) insights.push(['✅', 'Sistema estable', 'La configuración actual tiene buena cobertura para el escenario del prototipo.']);
  return `<div class="list insight-list">${insights.map(([icon,title,text]) => `<div class="list-item"><div class="icon-bubble">${icon}</div><div class="list-item-main"><h4>${esc(title)}</h4><p>${esc(text)}</p></div></div>`).join('')}</div>`;
}

function renderAnalyticsDashboard() {
  const p = plan();
  const status = operationalStatus();
  const protection = protectionScore();
  const risk = riskIndex();
  const avgResponse = avgResponseSeconds();
  const activeContacts = activeAlertContacts().length;
  const activeMonitors = state.monitors.filter(m => m.status === 'Activo').length;
  const contactLimitPct = Math.round((usableContacts().length / Math.max(1, p.contactsLimit)) * 100);
  const criticalIncidents = state.incidents.filter(i => severityWeight(i.severity) >= 3).length;
  const lastIncident = state.incidents[0];
  const content = `
    <div class="alert-box ${status.cls}"><div>📊</div><div><strong>Dashboard analítico: ${esc(status.label)}</strong><p>${esc(status.text)} Los indicadores se recalculan con la simulación: contactos agregados/editados/eliminados, plan activo, monitores y nuevos incidentes.</p></div></div>
    <div class="grid grid-4">
      <div class="card stat-card"><div class="stat-top"><h3>Protección</h3><span class="badge ${protection >= 80 ? 'success' : protection >= 55 ? 'warning' : 'danger'}">${protection >= 80 ? 'Alta' : protection >= 55 ? 'Media' : 'Baja'}</span></div><div class="stat-value">${protection}%</div><div class="stat-desc">Cobertura general de seguridad privada.</div>${horizontalMeter('Cobertura', protection, protection >= 80 ? 'success' : protection >= 55 ? 'warning' : 'danger')}</div>
      <div class="card stat-card"><div class="stat-top"><h3>Riesgo operativo</h3><span class="badge ${risk < 45 ? 'success' : risk < 70 ? 'warning' : 'danger'}">${risk < 45 ? 'Controlado' : risk < 70 ? 'Medio' : 'Alto'}</span></div><div class="stat-value">${risk}%</div><div class="stat-desc">Sube con incidentes, desconexión, batería baja o plan limitado.</div>${horizontalMeter('Riesgo', risk, risk < 45 ? 'success' : risk < 70 ? 'warning' : 'danger')}</div>
      <div class="card stat-card"><div class="stat-top"><h3>Respuesta promedio</h3><span class="badge info">Hora dorada</span></div><div class="stat-value">${avgResponse}s</div><div class="stat-desc">Promedio simulado desde detección hasta acción registrada.</div>${horizontalMeter('Ventana 60 min', Math.max(2, 100 - Math.round((avgResponse / 3600) * 100)), 'success')}</div>
      <div class="card stat-card"><div class="stat-top"><h3>Contactos útiles</h3><span class="badge ${contactLimitPct >= 100 ? 'warning' : 'success'}">${activeContacts}/${p.contactsLimit}</span></div><div class="stat-value">${activeContacts}</div><div class="stat-desc">Contactos activos que sí recibirían SOS.</div>${horizontalMeter('Uso del plan', Math.min(100, contactLimitPct), contactLimitPct >= 100 ? 'warning' : 'primary')}</div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><div class="stat-top"><h3>Tendencia semanal de incidentes</h3><span class="badge info">${state.incidents.length} eventos</span></div>${svgLineChart(incidentTrendData())}<p class="mini-note">Al simular un incidente crítico se agrega un evento nuevo y esta gráfica cambia automáticamente.</p></div>
      <div class="card"><div class="stat-top"><h3>Incidentes por severidad</h3><span class="badge ${criticalIncidents ? 'warning' : 'success'}">${criticalIncidents} relevantes</span></div>${barChart(incidentSeverityCounts(), 'incidentes')}<div class="card-actions"><button class="btn small" data-action="simulate-critical-incident">Simular incidente crítico</button><button class="btn small" data-route="/dashboard/incidentes">Ver historial</button></div></div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><div class="stat-top"><h3>Estado de contactos</h3><span class="badge primary">Plan ${esc(p.name)}</span></div>${donutChart(contactCounts(), 'Distribución de contactos')}<div class="card-actions"><button class="btn small" data-route="/dashboard/contactos">Gestionar contactos</button><button class="btn small" data-action="go-add-contact">Agregar contacto</button></div></div>
      <div class="card"><div class="stat-top"><h3>Red de monitoreo</h3><span class="badge ${activeMonitors ? 'success' : 'warning'}">${activeMonitors} activos</span></div>${donutChart(monitorCounts(), 'Distribución de monitores')}<div class="card-actions"><button class="btn small" data-route="/dashboard/red-monitoreo">Gestionar red</button><button class="btn small" data-route="/dashboard/red-monitoreo/nueva-invitacion">Nueva invitación</button></div></div>
    </div>

    <div class="grid grid-3" style="margin-top:16px">
      <div class="card"><h3>Capacidades del plan actual</h3><div class="feature-grid">
        ${featurePill(true, 'Fuerza G')}
        ${featurePill(p.sensors.includes('Micrófono'), 'Micrófono')}
        ${featurePill(p.sensors.includes('Frecuencia cardíaca'), 'Frecuencia cardíaca')}
        ${featurePill(p.maps, 'Mapas')}
        ${featurePill(p.exportReports, 'Reportes')}
        ${featurePill(p.bypass, 'Bypass crítico')}
      </div><div class="card-actions"><button class="btn small" data-route="/dashboard/suscripcion">Ver suscripción</button></div></div>
      <div class="card"><h3>Último evento registrado</h3>${lastIncident ? `<div class="incident-summary"><strong>${esc(lastIncident.type)}</strong><p>${esc(lastIncident.date)} ${esc(lastIncident.time)} · ${esc(lastIncident.location)}</p><span class="badge ${lastIncident.severity === 'Crítica' ? 'danger' : lastIncident.severity === 'Alta' ? 'warning' : 'info'}">${esc(lastIncident.severity)}</span><span class="badge info">${esc(lastIncident.status)}</span></div><div class="card-actions"><button class="btn small" data-route="/dashboard/incidentes/${lastIncident.id}">Ver detalle</button><button class="btn small" data-route="/dashboard/alerta/${lastIncident.id}">Ver alerta</button></div>` : '<p>No hay incidentes registrados.</p>'}</div>
      <div class="card"><h3>Lectura rápida del sistema</h3><div class="mini-metrics">
        <div><span>Wearable</span><strong>${state.wearable.connection === 'connected' ? 'Conectado' : 'Desconectado'}</strong></div>
        <div><span>Batería</span><strong>${state.wearable.battery}%</strong></div>
        <div><span>Permisos web</span><strong>${state.webPermissions.emergencySharing ? 'Listos' : 'Pendientes'}</strong></div>
        <div><span>Contactos pausados</span><strong>${suspendedContacts().length}</strong></div>
      </div></div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>Recomendaciones automáticas</h3>${dashboardInsightList()}</div>
      <div class="card"><h3>Acciones de demostración</h3><p>Usa estos botones para demostrar que el dashboard cambia con la simulación.</p><div class="card-actions"><button class="btn" data-action="simulate-dashboard-day">Simular día de operación</button><button class="btn" data-action="simulate-critical-incident">Simular incidente crítico</button><button class="btn" data-route="/dashboard/suscripcion">Cambiar plan</button><button class="btn" data-action="export-dashboard">Exportar resumen</button></div></div>
    </div>
  `;
  return dashboardShell('Dashboard analítico', 'Gráficas, KPIs y lectura operativa del problema de seguridad vial.', content, '<button class="btn" data-action="simulate-dashboard-day">Simular día</button><button class="btn primary" data-action="simulate-critical-incident">Simular incidente crítico</button>');
}

function simulateDashboardDay() {
  const eventTypes = ['Movimiento brusco', 'Prueba manual', 'Frenado de emergencia', 'Bache severo'];
  const severities = ['Baja', 'Media', 'Media', 'Alta'];
  const index = Math.floor(Math.random() * eventTypes.length);
  const now = new Date();
  const id = generateId();
  state.incidents.unshift({
    id,
    date: now.toISOString().slice(0,10),
    time: now.toTimeString().slice(0,5),
    type: eventTypes[index],
    severity: severities[index],
    status: eventTypes[index] === 'Prueba manual' ? 'Prueba completada' : 'Registrado para análisis',
    location: 'Ruta habitual del conductor',
    coords: '20.054901, -99.343201',
    gForce: `${(Math.random()*4 + 1.2).toFixed(1)}G`,
    decibels: `${Math.round(Math.random()*45 + 65)}dB`,
    heartRate: `${Math.round(Math.random()*35 + 78)} bpm`,
    activation: 'Simulación dashboard',
    notified: activeAlertContacts().map(c => c.name),
    responseTime: `${Math.round(Math.random()*18 + 3)} segundos`,
    note: 'Evento generado desde el dashboard analítico para validar actualización de gráficas.',
    timeline: [[now.toTimeString().slice(0,8), 'Evento simulado registrado'], [now.toTimeString().slice(0,8), 'Dashboard actualizado']]
  });
  state.wearable.lastSync = 'Hace unos segundos';
  state.wearable.battery = Math.max(5, state.wearable.battery - 2);
  addNotification('Día de operación simulado', `Se registró ${eventTypes[index]} y las métricas se actualizaron.`, 'incident');
  toast('Dashboard actualizado', 'Se agregó un evento operativo y cambiaron las gráficas.');
  route();
}

function exportDashboardSummary() {
  const summary = {
    fecha: new Date().toLocaleString('es-MX'),
    plan: plan().name,
    proteccion: `${protectionScore()}%`,
    riesgo: `${riskIndex()}%`,
    contactosActivos: activeAlertContacts().length,
    contactosSuspendidos: suspendedContacts().length,
    monitoresActivos: state.monitors.filter(m => m.status === 'Activo').length,
    incidentesRegistrados: state.incidents.length,
    respuestaPromedio: `${avgResponseSeconds()} segundos`
  };
  console.table(summary);
  addNotification('Resumen exportado', 'Se generó un resumen simulado del dashboard en consola.', 'system');
  toast('Resumen exportado', 'En una app real se descargaría un PDF/CSV. En la demo se muestra en consola.');
  route();
}

function renderProfile() {
  const content = `
    <form id="profile-form" novalidate>
      <div class="grid grid-3">
        <div class="card"><h3>Datos personales</h3>
          <div class="field"><label>Nombre completo</label><input name="fullName" value="${esc(state.driver.fullName)}" required /></div>
          <div class="field"><label>Teléfono</label><input name="phone" value="${esc(state.user.phone)}" required /></div>
          <div class="field"><label>Correo</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div>
          <div class="field"><label>Ciudad</label><input name="city" value="${esc(state.user.city)}" required /></div>
        </div>
        <div class="card"><h3>Datos médicos de emergencia</h3>
          <div class="alert-box info mini"><div>🩺</div><div><strong>Ficha capturada desde el alta</strong><p>Estos datos se ingresan en el onboarding y aquí pueden editarse cuando cambien.</p></div></div>
          <div class="field"><label>Tipo de sangre</label><input name="bloodType" value="${esc(state.driver.bloodType)}" placeholder="Ej. O+" /></div>
          <div class="field"><label>¿Tiene algún padecimiento?</label><select name="hasMedicalCondition">${options(['No','Sí'], state.driver.hasMedicalCondition || 'No')}</select></div>
          <div class="field"><label>Padecimientos o condiciones médicas</label><textarea name="medicalConditions">${esc(state.driver.medicalConditions)}</textarea></div>
          <div class="field"><label>Alergias</label><textarea name="allergies">${esc(state.driver.allergies)}</textarea></div>
          <div class="field"><label>Medicamentos actuales</label><textarea name="medications">${esc(state.driver.medications)}</textarea></div>
          <div class="field"><label>Notas médicas/emergencia</label><textarea name="emergencyNotes">${esc(state.driver.emergencyNotes)}</textarea></div>
          <label class="checkbox-row"><input name="shareMedicalInfo" type="checkbox" ${state.driver.shareMedicalInfo ? 'checked' : ''}/>Mostrar ficha médica en alertas activas y reportes de emergencia.</label>
        </div>
        <div class="card"><h3>Datos del vehículo</h3>
          <div class="alert-box info mini"><div>🚘</div><div><strong>Perfil vial</strong><p>El sistema se configura para unidades de 4 ruedas: autos, SUV, camionetas, pick-up y vanes familiares.</p></div></div>
          <div class="field"><label>Tipo de vehículo de 4 ruedas</label><select name="vehicleType">${options(VEHICLE_TYPES, normalizeVehicleType(state.driver.vehicleType))}</select><small class="field-hint">Categoría usada por el sistema para ajustar el contexto del análisis vial.</small></div>
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
        <div class="form-actions"><button class="btn primary" type="submit">Guardar cambios</button><button class="btn" type="button" data-route="/dashboard/contactos">Cambiar contacto principal</button><button class="btn" type="button" data-route="/dashboard/wearable">Ver wearable</button></div>
      </div>
    </form>
  `;
  return dashboardShell('Perfil del conductor', 'Datos personales, vehículo y permisos utilizados para contextualizar los incidentes.', content);
}

function renderWearable() {
  const w = state.wearable;
  const permissions = Object.entries(w.permissions).map(([k, v]) => {
    const label = {
      accelerometer: 'Acelerómetro', microphone: 'Micrófono', heartRate: 'Frecuencia cardíaca', gps: 'GPS', background: 'Servicio en segundo plano', smsBridge: 'Puente SMS móvil'
    }[k];
    return `<div class="list-item"><div><h4>${label}</h4><p>${v ? 'Permiso activo y funcional.' : 'Permiso pendiente o bloqueado.'}</p></div><span class="badge ${v ? 'success' : 'danger'}">${v ? 'Activo' : 'Pendiente'}</span></div>`;
  }).join('');

  const content = !w.linked ? `
    <div class="empty-state"><h3>Sin wearable vinculado</h3><p>Vincula un smartwatch desde la app móvil para activar la protección.</p><button class="btn primary" data-action="show-pairing-guide">Ver instrucciones</button></div>
  ` : `
    <div class="grid grid-3">
      <div class="card stat-card"><div class="stat-top"><h3>Dispositivo</h3>${wearableBadge()}</div><div class="stat-value">${esc(w.model)}</div><div class="stat-desc">Versión ${esc(w.appVersion)} · ${esc(w.lastSync)}</div><div class="card-actions"><button class="btn small" data-action="sync-wearable">Sincronizar ahora</button><button class="btn small" data-action="show-pairing-guide">Instrucciones</button></div></div>
      <div class="card stat-card"><div class="stat-top"><h3>Batería</h3><span class="badge ${w.battery > 25 ? 'success' : 'warning'}">${w.battery > 25 ? 'Correcta' : 'Baja'}</span></div><div class="stat-value">${w.battery}%</div><div class="progress"><span style="width:${w.battery}%"></span></div><div class="card-actions"><button class="btn small" data-action="simulate-low-battery">Simular batería baja</button></div></div>
      <div class="card stat-card"><div class="stat-top"><h3>Conexión</h3><span class="badge ${w.connection === 'connected' ? 'success' : 'danger'}">${w.connection === 'connected' ? 'Online' : 'Offline'}</span></div><div class="stat-value">${w.connection === 'connected' ? 'OK' : 'OFF'}</div><div class="stat-desc">La protección depende de esta conexión y del puente móvil.</div><div class="card-actions"><button class="btn small" data-action="toggle-wearable-connection">Cambiar estado</button></div></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>Permisos y sensores</h3><div class="list">${permissions}</div></div>
      <div class="card"><h3>Acciones de dispositivo</h3><p>Opciones simuladas para maqueta.</p><div class="card-actions"><button class="btn" data-action="show-pairing-guide">Ver guía de vinculación</button><button class="btn warning" data-action="toggle-wearable-connection">Simular desconexión/conexión</button><button class="btn danger" data-action="unlink-wearable">Desvincular dispositivo</button><button class="btn" data-route="/dashboard/ayuda?tema=wearable">Ir a ayuda</button></div></div>
    </div>
  `;
  return dashboardShell('Estado del wearable', 'Estado de conexión, batería, sensores, permisos y acciones de sincronización.', content);
}

function renderContacts() {
  const p = plan();
  const q = state.filters.contacts.toLowerCase();
  const status = state.filters.contactStatus;
  const filtered = state.contacts.filter(c => {
    const text = `${c.name} ${c.relation} ${c.phone} ${c.email}`.toLowerCase();
    return text.includes(q) && (status === 'todos' || c.status === status);
  });
  const body = state.contacts.length === 0 ? `
    <div class="empty-state"><h3>Aún no tienes contactos</h3><p>Agrega al menos un contacto de emergencia para activar tu red de seguridad.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Agregar contacto</button></div>
  ` : `
    <div class="searchbar">
      <input value="${esc(state.filters.contacts)}" data-filter="contacts" placeholder="Buscar por nombre, teléfono o correo" />
      <select data-filter="contactStatus"><option value="todos">Todos</option>${options(['Activo','Pendiente','Inactivo','Suspendido por plan'], status)}</select>
      <button class="btn" data-action="clear-contact-filters">Limpiar filtros</button>
    </div>
    ${planUsageAlert()}
    <div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Relación</th><th>Teléfono</th><th>Prioridad</th><th>Estado</th><th>Canal</th><th>Acciones</th></tr></thead><tbody>${filtered.map(contactRow).join('') || `<tr><td colspan="7">No hay resultados con esos filtros.</td></tr>`}</tbody></table></div>
  `;
  return dashboardShell('Contactos de emergencia', 'CRUD completo de beneficiarios que recibirán alertas privadas. Los contactos pausados se conservan, pero no reciben SOS.', body, `<button class="btn primary" data-action="go-add-contact">+ Agregar contacto</button><button class="btn" data-route="/dashboard/red-monitoreo">Red de monitoreo</button>`);
}

function contactRow(c) {
  return `<tr>
    <td><strong>${esc(c.name)}</strong><br><span class="muted">${esc(c.email || 'Sin correo')}</span></td>
    <td>${esc(c.relation)}</td><td>${esc(c.phone)}</td>
    <td><span class="badge ${c.priority === 'Principal' ? 'primary' : 'info'}">${esc(c.priority)}</span></td>
    <td><span class="badge ${contactStatusClass(c.status)}">${esc(c.status)}</span>${c.status === 'Suspendido por plan' ? '<br><span class="muted">No recibe alertas</span>' : ''}</td>
    <td>${esc(c.channel)}</td>
    <td><div class="actions"><button class="btn small" data-route="/dashboard/contactos/${c.id}">Ver</button><button class="btn small" data-route="/dashboard/contactos/${c.id}/editar">Editar</button><button class="btn small" data-action="invite-contact" data-id="${c.id}">Invitar</button><button class="btn small warning" data-action="make-primary" data-id="${c.id}">Principal</button><button class="btn small danger" data-action="delete-contact" data-id="${c.id}">Eliminar</button></div></td>
  </tr>`;
}

function renderContactForm(mode, id = null) {
  const isEdit = mode === 'edit';
  const c = isEdit ? state.contacts.find(x => String(x.id) === String(id)) : { name: '', relation: '', phone: '', email: '', priority: 'Secundario', status: 'Activo', channel: 'WhatsApp', notes: '' };
  if (!c) return renderNotFound();
  const content = `
    <form id="contact-form" data-mode="${mode}" data-id="${id || ''}" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>${isEdit ? 'Editar información' : 'Información del contacto'}</h3>
          <div class="field"><label>Nombre completo</label><input name="name" value="${esc(c.name)}" required /></div>
          <div class="field"><label>Parentesco</label><input name="relation" value="${esc(c.relation)}" required /></div>
          <div class="field"><label>Teléfono</label><input name="phone" value="${esc(c.phone)}" required /></div>
          <div class="field"><label>Correo electrónico</label><input name="email" type="email" value="${esc(c.email)}" /></div>
        </div>
        <div class="card"><h3>Alertas y prioridad</h3>
          <div class="field"><label>Prioridad</label><select name="priority">${options(['Principal','Secundario','Alternativo'], c.priority)}</select></div>
          <div class="field"><label>Estado</label><select name="status">${options(isEdit ? ['Activo','Pendiente','Inactivo','Suspendido por plan'] : ['Activo','Pendiente','Inactivo'], c.status)}</select></div>
          <div class="field"><label>Medio de alerta</label><select name="channel">${options(['WhatsApp','SMS','Correo'], c.channel)}</select></div>
          <div class="field"><label>Notas</label><textarea name="notes">${esc(c.notes || '')}</textarea></div>
          ${!isEdit ? '<label class="checkbox-row"><input name="sendInvite" type="checkbox" />Guardar y enviar invitación como monitor.</label>' : ''}
        </div>
      </div>
      <div class="form-actions"><button class="btn primary" type="submit">${isEdit ? 'Guardar cambios' : 'Guardar contacto'}</button>${!isEdit ? '<button class="btn" type="button" data-action="save-contact-invite">Guardar y enviar invitación</button>' : ''}<button class="btn" type="button" data-action="cancel-contact-form">Cancelar</button>${isEdit ? '<button class="btn danger" type="button" data-action="delete-contact" data-id="' + c.id + '">Eliminar contacto</button>' : ''}</div>
    </form>
  `;
  return dashboardShell(isEdit ? 'Editar contacto' : 'Agregar contacto', isEdit ? 'Modifica datos, prioridad, estado y canal de alerta.' : 'Registra un nuevo beneficiario para las alertas.', content);
}

function renderContactDetail(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return renderNotFound();
  const monitor = c.monitorId ? state.monitors.find(m => m.id === c.monitorId) : null;
  const notifiedIn = state.incidents.filter(i => i.notified.includes(c.name));
  const content = `
    <div class="detail-grid">
      <div class="card"><h3>${esc(c.name)}</h3><p>${esc(c.relation)} · ${esc(c.phone)}</p><div class="divider"></div>${infoRows({Correo: c.email || 'Sin correo', Prioridad: c.priority, Estado: c.status, 'Medio de alerta': c.channel, Creado: c.createdAt, Monitor: monitor ? monitor.status : 'No asociado'})}<div class="card-actions"><button class="btn primary" data-route="/dashboard/contactos/${c.id}/editar">Editar</button><button class="btn" data-action="invite-contact" data-id="${c.id}">Enviar invitación</button><button class="btn danger" data-action="delete-contact" data-id="${c.id}">Eliminar</button><button class="btn" data-route="/dashboard/contactos">Volver</button></div></div>
      <div class="card"><h3>Historial de alertas a este contacto</h3>${notifiedIn.length ? `<div class="list">${notifiedIn.map(i => `<div class="list-item"><div><h4>${esc(i.type)}</h4><p>${esc(i.date)} ${esc(i.time)} · ${esc(i.status)}</p></div><button class="btn small" data-route="/dashboard/incidentes/${i.id}">Ver</button></div>`).join('')}</div>` : '<div class="empty-state"><h3>Sin alertas</h3><p>Este contacto todavía no ha recibido alertas.</p></div>'}</div>
    </div>
  `;
  return dashboardShell('Detalle de contacto', 'Información completa, monitor asociado e historial de notificaciones.', content);
}

function renderMonitorNetwork() {
  const status = state.filters.monitorStatus || 'todos';
  const filtered = state.monitors.filter(m => status === 'todos' || m.status === status);
  const rows = filtered.map(monitorRow).join('');
  const counts = ['Activo', 'Pendiente', 'Expirado', 'Revocado'].reduce((acc, key) => {
    acc[key] = state.monitors.filter(m => m.status === key).length;
    return acc;
  }, {});
  const content = `
    <div class="grid grid-4">
      <div class="card stat-card"><h3>Activos</h3><div class="stat-value">${counts.Activo || 0}</div><p class="stat-desc">Reciben SOS y ubicación.</p></div>
      <div class="card stat-card"><h3>Pendientes</h3><div class="stat-value">${counts.Pendiente || 0}</div><p class="stat-desc">Invitaciones aún no aceptadas.</p></div>
      <div class="card stat-card"><h3>Expirados</h3><div class="stat-value">${counts.Expirado || 0}</div><p class="stat-desc">Requieren restaurar o reenviar token.</p></div>
      <div class="card stat-card"><h3>Revocados</h3><div class="stat-value">${counts.Revocado || 0}</div><p class="stat-desc">Acceso retirado por el titular.</p></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-head compact"><div><h3>Monitores e invitaciones</h3><p>La demo permite revocar, devolver acceso, activar invitaciones y expirar tokens para explicar el flujo completo.</p></div></div>
      <div class="searchbar">
        <select data-filter="monitorStatus"><option value="todos">Todos los estados</option>${options(['Activo','Pendiente','Expirado','Revocado'], status)}</select>
        <button class="btn" data-action="clear-monitor-filters">Limpiar filtro</button>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Estado</th><th>Invitado</th><th>Expira</th><th>Acciones</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Sin monitores para este filtro.</td></tr>'}</tbody></table></div>
    </div>
  `;
  return dashboardShell('Red de monitoreo', 'Gestiona familiares o monitores asociados mediante URLs cifradas.', content, `<button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Nueva invitación</button><button class="btn" data-route="/dashboard/contactos">Ver contactos</button>`);
}

function monitorActionButtons(m) {
  const common = `<button class="btn small" data-route="/dashboard/red-monitoreo/${m.id}">Ver</button><button class="btn small" data-action="copy-invite" data-id="${m.id}">Copiar</button><button class="btn small" data-action="send-whatsapp" data-id="${m.id}">WhatsApp</button>`;
  if (m.status === 'Activo') {
    return `${common}<button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>`;
  }
  if (m.status === 'Pendiente') {
    return `${common}<button class="btn small success" data-action="activate-monitor" data-id="${m.id}">Aceptar demo</button><button class="btn small" data-action="resend-invite" data-id="${m.id}">Reenviar</button><button class="btn small warning" data-action="expire-monitor" data-id="${m.id}">Expirar</button><button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>`;
  }
  if (m.status === 'Expirado') {
    return `${common}<button class="btn small success" data-action="restore-monitor" data-id="${m.id}">Restaurar</button><button class="btn small" data-action="resend-invite" data-id="${m.id}">Reenviar</button><button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>`;
  }
  if (m.status === 'Revocado') {
    return `${common}<button class="btn small success" data-action="restore-monitor" data-id="${m.id}">Devolver acceso</button>`;
  }
  return common;
}

function monitorRow(m) {
  return `<tr><td><strong>${esc(m.name)}</strong><br><span class="muted">${esc(m.email || 'Sin correo')}</span><br><span class="muted">${esc(monitorStatusDescription(m.status))}</span></td><td>${esc(m.phone)}</td><td><span class="badge ${monitorStatusClass(m.status)}">${esc(m.status)}</span></td><td>${esc(m.invitedAt)}</td><td>${esc(m.expiresAt)}</td><td><div class="actions">${monitorActionButtons(m)}</div></td></tr>`;
}

function renderNewInvitation() {
  const query = currentPath().split('?')[1] || '';
  const contactId = new URLSearchParams(query).get('contacto');
  const selectedContact = state.contacts.find(c => String(c.id) === String(contactId));
  const content = `
    <form id="invite-form" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>Datos del monitor</h3>
          <div class="field"><label>Seleccionar contacto existente</label><select name="contactId"><option value="">Capturar nuevo monitor</option>${state.contacts.map(c => `<option value="${c.id}" ${selectedContact?.id === c.id ? 'selected' : ''}>${esc(c.name)} · ${esc(c.phone)}</option>`).join('')}</select></div>
          <div class="field"><label>Nombre</label><input name="name" value="${esc(selectedContact?.name || '')}" required /></div>
          <div class="field"><label>Teléfono</label><input name="phone" value="${esc(selectedContact?.phone || '')}" required /></div>
          <div class="field"><label>Correo opcional</label><input name="email" value="${esc(selectedContact?.email || '')}" /></div>
        </div>
        <div class="card"><h3>Configuración de invitación</h3>
          <div class="field"><label>Canal de envío</label><select name="channel">${options(['Copiar enlace','WhatsApp','SMS'], 'Copiar enlace')}</select></div>
          <div class="field"><label>Expiración</label><select name="expires">${options(['24 horas','48 horas','7 días'], '7 días')}</select></div>
          <label class="checkbox-row"><input name="canViewLocation" type="checkbox" checked />Permitir ver ubicación del incidente.</label>
          <label class="checkbox-row"><input name="canReceiveUpdates" type="checkbox" checked />Permitir recibir actualizaciones de alerta.</label>
          <div class="alert-box info"><div>🔗</div><div><strong>URL segura</strong><p>Al generar la invitación se creará un token único para la ruta pública /invitacion/:token.</p></div></div>
        </div>
      </div>
      ${state.drafts.inviteUrl ? `<div class="card" style="margin-top:16px"><h3>Invitación generada</h3><div class="code-box">${esc(state.drafts.inviteUrl)}</div><div class="card-actions"><button class="btn" type="button" data-action="copy-last-invite">Copiar enlace</button><button class="btn" type="button" data-action="open-last-invite">Abrir vista pública</button><button class="btn primary" type="button" data-route="/dashboard/red-monitoreo">Finalizar</button></div></div>` : ''}
      <div class="form-actions"><button class="btn primary" type="submit">Generar enlace</button><button class="btn" type="button" data-route="/dashboard/red-monitoreo">Cancelar</button></div>
    </form>
  `;
  return dashboardShell('Nueva invitación', 'Genera una URL cifrada para asociar un familiar como monitor.', content);
}

function renderMonitorDetail(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return renderNotFound();
  const url = `${location.origin}${location.pathname}#/invitacion/${m.token}`;
  const content = `
    <div class="detail-grid">
      <div class="card"><h3>${esc(m.name)}</h3><p>${esc(m.phone)} · ${esc(m.email || 'Sin correo')}</p><div class="divider"></div>${infoRows({Estado: m.status, Descripción: monitorStatusDescription(m.status), Invitado: m.invitedAt, Aceptado: m.acceptedAt || 'Pendiente', Expira: m.expiresAt, Token: m.token})}<div class="card-actions">${monitorActionButtons(m)}<button class="btn" data-route="/dashboard/red-monitoreo">Volver</button></div></div>
      <div class="card"><h3>URL pública</h3><div class="code-box">${esc(url)}</div><div class="divider"></div><h3>Permisos</h3><ul class="features">${m.permissions.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
    </div>
  `;
  return dashboardShell('Detalle de monitor', 'Información completa de invitación, permisos y estado.', content);
}

function renderAcceptInvite(token) {
  const m = state.monitors.find(x => x.token === token);
  if (!m) {
    return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Invitación inválida</span><h2>La invitación no es válida</h2><p>Solicita al titular una nueva invitación.</p><button class="btn" data-route="/">Volver al inicio</button></div></div></section>`);
  }
  if (m.status === 'Activo') {
    return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Ya aceptada</span><h2>Esta invitación ya fue aceptada</h2><p>${esc(m.name)} ya forma parte de la red de monitoreo.</p><button class="btn primary" data-route="/">Entendido</button></div></div></section>`);
  }
  if (['Expirado', 'Revocado'].includes(m.status)) {
    return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Invitación no disponible</span><h2>La invitación está ${esc(m.status.toLowerCase())}</h2><p>Solicita una nueva invitación al titular.</p><button class="btn" data-route="/">Volver</button></div></div></section>`);
  }
  return publicShell(`
    <section class="form-page">
      <div class="container"><div class="form-card">
        <span class="eyebrow">Invitación de monitoreo</span>
        <h2>Únete a la red de ${esc(state.user.name)}</h2>
        <p>Recibirás alertas privadas y ubicación únicamente si se detecta un incidente.</p>
        <form id="accept-invite-form" data-token="${esc(token)}" novalidate>
          <div class="field"><label>Nombre completo</label><input name="name" value="${esc(m.name)}" required /></div>
          <div class="field"><label>Teléfono</label><input name="phone" value="${esc(m.phone)}" required /></div>
          <div class="field"><label>Correo opcional</label><input name="email" value="${esc(m.email)}" /></div>
          <label class="checkbox-row"><input name="accept" type="checkbox" checked />Acepto recibir alertas de emergencia y ubicación en caso de siniestro.</label>
          <div class="form-actions"><button class="btn primary" type="submit">Aceptar invitación</button><button class="btn danger" type="button" data-action="reject-invite" data-token="${esc(token)}">Rechazar</button></div>
        </form>
      </div></div>
    </section>
  `);
}

function renderSubscription() {
  const p = plan();
  const content = `
    <div class="grid grid-3">
      <div class="card stat-card"><h3>Plan actual</h3><div class="stat-value">${p.name}</div><p class="stat-desc">${p.description}</p><div class="card-actions"><button class="btn small primary" data-route="/dashboard/suscripcion/cambiar-plan/premium">Actualizar a Premium</button></div></div>
      <div class="card stat-card"><h3>Contactos</h3><div class="stat-value">${usableContacts().length}/${p.contactsLimit}</div><p class="stat-desc">${state.contacts.length} totales · ${suspendedContacts().length} pausados por plan.</p></div>
      <div class="card stat-card"><h3>Vencimiento</h3><div class="stat-value">${state.user.plan === 'trial' ? state.user.trialDaysLeft + 'd' : 'OK'}</div><p class="stat-desc">Fecha final: ${esc(state.user.subscriptionEnd)}</p><div class="card-actions"><button class="btn small" data-route="/dashboard/suscripcion/pago">Renovar</button></div></div>
    </div>
    ${suspendedContacts().length ? planUsageAlert() : ''}
    <div class="card" style="margin-top:16px"><h3>Funciones activas</h3><ul class="features">${p.sensors.map(s => `<li>${esc(s)}</li>`).join('')}<li>Mapas: ${p.maps ? 'Activo' : 'Bloqueado'}</li><li>Reportes: ${p.exportReports ? 'Activo' : 'Bloqueado'}</li><li>Bypass crítico: ${p.bypass ? 'Activo' : 'Bloqueado'}</li></ul></div>
    <div style="margin-top:16px">${renderPlans(false)}</div>
    <div class="card" style="margin-top:16px"><h3>Acciones de suscripción</h3><div class="card-actions"><button class="btn" data-route="/dashboard/suscripcion/pago">Renovar / pagar</button><button class="btn" data-route="/dashboard/suscripcion/pagos">Historial de pagos</button><button class="btn warning" data-action="expire-subscription">Simular vencimiento</button><button class="btn danger" data-action="cancel-subscription">Cancelar suscripción</button></div></div>
  `;
  return dashboardShell('Suscripción', 'Plan actual, límites, funciones bloqueadas y cambio de plan.', content);
}

function renderChangePlan(target = 'premium') {
  const current = plan();
  const next = PLAN_RULES[target] || PLAN_RULES.premium;
  const content = `
    <div class="detail-grid">
      <div class="card"><h3>Plan actual: ${esc(current.name)}</h3><p>${esc(current.description)}</p><div class="divider"></div>${infoRows({'Precio': current.price, 'Contactos': current.contactsLimit, 'Mapas': current.maps ? 'Sí' : 'No', 'Reportes': current.exportReports ? 'Sí' : 'No', 'Bypass': current.bypass ? 'Sí' : 'No'})}</div>
      <div class="card"><h3>Nuevo plan: ${esc(next.name)}</h3><p>${esc(next.description)}</p><div class="divider"></div>${infoRows({'Precio': next.price, 'Contactos': next.contactsLimit, 'Mapas': next.maps ? 'Sí' : 'No', 'Reportes': next.exportReports ? 'Sí' : 'No', 'Bypass': next.bypass ? 'Sí' : 'No'})}</div>
    </div>
    ${downgradePlanWarning(target) || ''}
    <div class="card" style="margin-top:16px"><h3>Confirmación</h3><p>En un sistema real esta pantalla se conectaría a pasarela de pago y validaría fechas en Azure SQL. En esta demo puedes confirmar directamente o pasar a pago simulado. Si el nuevo plan reduce espacios, los contactos excedentes se pausan, no se borran.</p><div class="card-actions"><button class="btn primary" data-action="confirm-plan-change" data-plan="${target}">Confirmar cambio</button><button class="btn" data-route="/dashboard/suscripcion/pago?plan=${target}">Ir a pago</button><button class="btn" data-route="/dashboard/suscripcion">Cancelar</button></div></div>
  `;
  return dashboardShell('Cambiar plan', 'Confirma cambio de plan y nuevas funciones desbloqueadas.', content);
}

function renderPayment() {
  const target = new URLSearchParams(currentPath().split('?')[1] || '').get('plan') || state.user.plan;
  const content = `
    <form id="payment-form" data-plan="${esc(target)}" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>Datos de pago</h3>
          <div class="field"><label>Nombre del titular</label><input name="holder" value="${esc(state.user.name)}" required /></div>
          <div class="field"><label>Número de tarjeta</label><input name="card" value="4242 4242 4242 4242" required /></div>
          <div class="form-grid"><div class="field"><label>Expiración</label><input name="exp" value="12/29" required /></div><div class="field"><label>CVV</label><input name="cvv" value="123" required /></div></div>
          <div class="field"><label>Código postal</label><input name="zip" value="42800" required /></div>
          <label class="checkbox-row"><input name="save" type="checkbox" checked />Guardar método de pago para renovaciones.</label>
        </div>
        <div class="card"><h3>Resumen</h3>${infoRows({'Plan a pagar': PLAN_RULES[target]?.name || plan().name, 'Total': PLAN_RULES[target]?.price || plan().price, 'Estado': 'Pago simulado', 'Renovación': 'Mensual'})}<div class="alert-box info"><div>💳</div><div><strong>Demo</strong><p>No se procesa dinero real. Solo actualiza estado visual.</p></div></div></div>
      </div>
      <div class="form-actions"><button class="btn primary" type="submit">Pagar</button><button class="btn" type="button" data-route="/dashboard/suscripcion">Cancelar</button></div>
    </form>
  `;
  return dashboardShell('Pago simulado', 'Formulario visual de pago para renovación o cambio de plan.', content);
}

function renderPayments() {
  const rows = state.payments.map(p => `<tr><td>${esc(p.date)}</td><td>${esc(p.concept)}</td><td>${esc(p.amount)}</td><td><span class="badge success">${esc(p.status)}</span></td><td><button class="btn small" data-action="download-payment" data-id="${p.id}">Descargar</button></td></tr>`).join('');
  const content = `<div class="card"><h3>Historial de pagos</h3><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  return dashboardShell('Historial de pagos', 'Pagos, renovaciones y comprobantes simulados.', content, '<button class="btn" data-route="/dashboard/suscripcion">Volver</button>');
}

function renderIncidents() {
  const q = state.filters.incidents.toLowerCase();
  const severity = state.filters.severity;
  const status = state.filters.incidentStatus;
  const filtered = state.incidents.filter(i => {
    const text = `${i.type} ${i.status} ${i.location} ${i.severity}`.toLowerCase();
    return text.includes(q) && (severity === 'todos' || i.severity === severity) && (status === 'todos' || i.status === status);
  });
  const content = `
    ${!plan().telemetry ? '<div class="alert-box warning"><div>🔒</div><div><strong>Historial limitado</strong><p>Tu plan actual no tiene telemetría avanzada. Puedes ver eventos básicos, pero mapas, exportación y señales completas requieren Premium.</p></div></div>' : ''}
    <div class="searchbar"><input value="${esc(state.filters.incidents)}" data-filter="incidents" placeholder="Buscar por tipo, ubicación o estado" /><select data-filter="severity"><option value="todos">Todas las severidades</option>${options(['Baja','Media','Alta','Crítica'], severity)}</select><select data-filter="incidentStatus"><option value="todos">Todos los estados</option>${options(['Cancelado por usuario','Prueba completada','Alerta enviada','Falsa alarma','Atendido'], status)}</select><button class="btn" data-action="clear-incident-filters">Limpiar</button><button class="btn" data-action="export-incidents">Exportar</button></div>
    ${filtered.length ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Severidad</th><th>Estado</th><th>Ubicación</th><th>Notificados</th><th>Acciones</th></tr></thead><tbody>${filtered.map(incidentRow).join('')}</tbody></table></div>` : '<div class="empty-state"><h3>Sin incidentes</h3><p>No se encontraron incidentes con los filtros actuales.</p></div>'}
  `;
  return dashboardShell('Historial de incidentes', 'Eventos detectados, filtros, exportación y detalle de telemetría.', content, '<button class="btn warning" data-action="simulate-critical-incident">Simular incidente crítico</button>');
}

function incidentRow(i) {
  return `<tr><td><strong>${esc(i.date)}</strong><br>${esc(i.time)}</td><td>${esc(i.type)}</td><td><span class="badge ${i.severity === 'Crítica' ? 'danger' : i.severity === 'Alta' ? 'warning' : 'info'}">${esc(i.severity)}</span></td><td>${esc(i.status)}</td><td>${esc(i.location)}</td><td>${i.notified.length}</td><td><div class="actions"><button class="btn small" data-route="/dashboard/incidentes/${i.id}">Ver detalle</button><button class="btn small" data-action="view-incident-map" data-id="${i.id}">Mapa</button><button class="btn small" data-action="download-report" data-id="${i.id}">Reporte</button></div></td></tr>`;
}

function renderIncidentDetail(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return renderNotFound();
  const premium = plan().maps;
  const content = `
    <div class="detail-grid">
      <div class="card"><h3>${esc(i.type)}</h3><p>${esc(i.date)} ${esc(i.time)} · ${esc(i.location)}</p><div class="divider"></div>${infoRows({'Severidad': i.severity, Estado: i.status, Coordenadas: i.coords, 'Fuerza G': i.gForce, 'Decibeles': plan().telemetry ? i.decibels : 'Bloqueado por plan', 'Frecuencia cardíaca': plan().telemetry ? i.heartRate : 'Bloqueado por plan', Activación: i.activation, 'Tiempo de respuesta': i.responseTime})}<div class="card-actions"><button class="btn" data-route="/dashboard/incidentes">Volver</button><button class="btn" data-action="open-external-map" data-id="${i.id}">Abrir en Maps</button><button class="btn" data-action="download-report" data-id="${i.id}">Descargar reporte</button><button class="btn warning" data-action="mark-false-alarm" data-id="${i.id}">Marcar falsa alarma</button><button class="btn" data-action="add-incident-note" data-id="${i.id}">Agregar nota</button></div></div>
      <div class="card"><h3>Mapa del incidente</h3>${premium ? '<div class="map"></div>' : '<div class="empty-state"><h3>Mapa bloqueado</h3><p>Los mapas de incidentes requieren Plan Premium.</p><button class="btn primary" data-route="/dashboard/suscripcion/cambiar-plan/premium">Actualizar</button></div>'}</div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>Contactos notificados</h3><div class="list">${i.notified.map(name => `<div class="list-item"><div><h4>${esc(name)}</h4><p>Notificación enviada durante este evento.</p></div><span class="badge success">Enviado</span></div>`).join('')}</div></div>
      <div class="card"><h3>Línea de tiempo</h3><div class="timeline">${i.timeline.map(([time, text]) => `<div class="timeline-item"><h4>${esc(time)}</h4><p>${esc(text)}</p></div>`).join('')}</div></div>
    </div>
    <div class="card" style="margin-top:16px"><h3>Notas</h3><p>${esc(i.note || 'Sin notas.')}</p></div>
  `;
  return dashboardShell('Detalle de incidente', 'Ubicación, señales, contactos notificados y acciones de reporte.', content);
}

function renderActiveAlert(id) {
  const i = state.incidents.find(x => String(x.id) === String(id)) || state.incidents[0];
  const content = `
    <div class="alert-box danger"><div>🚨</div><div><strong>Alerta de emergencia activa demo</strong><p>Esta pantalla simula lo que vería un monitor o titular durante un incidente en curso.</p></div></div>
    <div class="detail-grid">
      <div class="card"><h3>${esc(state.driver.fullName)}</h3><p>Incidente: ${esc(i.type)} · Severidad ${esc(i.severity)}</p><div class="divider"></div>${infoRows({'Hora': `${i.date} ${i.time}`, Ubicación: i.location, Coordenadas: i.coords, Estado: 'Actualizando ubicación', 'Última actualización': 'Hace 12 segundos', 'Contactos notificados': i.notified.join(', ')})}${state.driver.shareMedicalInfo ? `<div class="divider"></div><h3>Ficha médica de emergencia</h3>${infoRows({'Tipo de sangre': state.driver.bloodType, Padecimiento: state.driver.hasMedicalCondition, Condiciones: state.driver.medicalConditions, Alergias: state.driver.allergies, Medicamentos: state.driver.medications, 'Notas médicas': state.driver.emergencyNotes})}` : `<div class="alert-box warning mini"><div>🔒</div><div><strong>Ficha médica oculta</strong><p>El titular desactivó compartir datos médicos en alertas.</p></div></div>`}<div class="card-actions"><button class="btn primary" data-action="open-external-map" data-id="${i.id}">Abrir ubicación en Maps</button><a class="btn" href="tel:${esc(state.user.phone)}">Llamar conductor</a><button class="btn" data-action="call-primary-contact">Llamar contacto principal</button><button class="btn success" data-action="mark-alert-attended" data-id="${i.id}">Marcar atendido</button><button class="btn" data-route="/dashboard/incidentes/${i.id}">Ver detalle</button></div></div>
      <div class="card"><h3>Mapa en tiempo real</h3><div class="map"></div></div>
    </div>
    <div class="grid grid-3" style="margin-top:16px"><div class="card"><h3>GPS</h3><p>Señal actualizada correctamente.</p></div><div class="card"><h3>Severidad</h3><p>${esc(i.severity)} · Validación multisensorial.</p></div><div class="card"><h3>Estado</h3><p>Alerta enviada a red de monitoreo.</p></div></div>
  `;
  return dashboardShell('Alerta activa', 'Vista en tiempo real para emergencia en curso.', content);
}

function renderNotifications() {
  const filter = state.filters.notifications;
  const list = state.notifications.filter(n => filter === 'todas' || (filter === 'no-leidas' ? n.unread : !n.unread));
  const content = `
    <div class="searchbar"><select data-filter="notifications"><option value="todas">Todas</option><option value="no-leidas" ${filter === 'no-leidas' ? 'selected' : ''}>No leídas</option><option value="leidas" ${filter === 'leidas' ? 'selected' : ''}>Leídas</option></select><button class="btn" data-action="mark-all-read">Marcar todo como leído</button><button class="btn danger" data-action="delete-all-notifications">Eliminar todas</button></div>
    <div class="list">${list.map(n => `<div class="list-item"><div class="list-item-main"><h4>${n.unread ? '● ' : ''}${esc(n.title)}</h4><p>${esc(n.body)} · ${esc(n.date)}</p></div><div class="actions"><button class="btn small" data-route="${notificationRoute(n)}">Ver</button><button class="btn small" data-action="toggle-read" data-id="${n.id}">${n.unread ? 'Leída' : 'No leída'}</button><button class="btn small danger" data-action="delete-notification" data-id="${n.id}">Eliminar</button></div></div>`).join('') || '<div class="empty-state"><h3>Sin notificaciones</h3><p>No hay elementos para este filtro.</p></div>'}</div>
  `;
  return dashboardShell('Notificaciones', 'Avisos de wearable, plan, contactos, monitores e incidentes.', content);
}

function renderSettings() {
  const content = `
    <form id="settings-form" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>Cuenta</h3><div class="field"><label>Nombre</label><input name="name" value="${esc(state.user.name)}" required /></div><div class="field"><label>Correo</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div><div class="field"><label>Teléfono</label><input name="phone" value="${esc(state.user.phone)}" required /></div><button class="btn primary" type="submit">Guardar datos</button></div>
        <div class="card"><h3>Seguridad</h3><div class="field"><label>Contraseña actual</label><input name="currentPassword" type="password" /></div><div class="field"><label>Nueva contraseña</label><input name="newPassword" type="password" /></div><div class="field"><label>Confirmar nueva contraseña</label><input name="confirmPassword" type="password" /></div><label class="checkbox-row"><input name="twoFactor" type="checkbox" ${state.user.twoFactor ? 'checked' : ''}/>Activar verificación en dos pasos.</label><button class="btn" type="button" data-action="change-password">Cambiar contraseña</button></div>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><h3>Preferencias</h3><div class="field"><label>Idioma</label><select name="language">${options(['Español','English'], state.user.language)}</select></div><div class="field"><label>Zona horaria</label><select name="timezone">${options(['America/Mexico_City','America/Monterrey','America/Cancun'], state.user.timezone)}</select></div><label class="checkbox-row"><input name="notifyEmail" type="checkbox" ${state.user.notifyEmail ? 'checked' : ''}/>Notificaciones por correo.</label><label class="checkbox-row"><input name="notifySms" type="checkbox" ${state.user.notifySms ? 'checked' : ''}/>Notificaciones por SMS.</label><label class="checkbox-row"><input name="notifyWhatsapp" type="checkbox" ${state.user.notifyWhatsapp ? 'checked' : ''}/>Notificaciones por WhatsApp.</label><button class="btn" type="button" data-action="save-preferences">Guardar preferencias</button></div>
        <div class="card"><h3>Privacidad</h3><p>Acciones de datos personales del prototipo.</p><div class="card-actions"><button class="btn" type="button" data-action="download-data">Descargar mis datos</button><button class="btn warning" type="button" data-action="close-sessions">Cerrar sesiones activas</button><button class="btn" type="button" data-route="/dashboard/permisos">Gestionar permisos web</button><button class="btn danger" type="button" data-action="delete-account">Eliminar cuenta</button></div></div>
      </div>
    </form>
  `;
  return dashboardShell('Configuración', 'Cuenta, seguridad, preferencias de notificación y privacidad.', content);
}

function renderHelp() {
  const tabs = ['wearable','contactos','monitores','planes','incidentes','soporte'];
  const labels = { wearable:'Wearable', contactos:'Contactos', monitores:'Monitores', planes:'Planes', incidentes:'Incidentes', soporte:'Soporte' };
  const active = new URLSearchParams(currentPath().split('?')[1] || '').get('tema') || state.ui.activeHelp;
  state.ui.activeHelp = tabs.includes(active) ? active : 'wearable';
  const content = `
    <div class="tabs">${tabs.map(t => `<button class="tab ${state.ui.activeHelp === t ? 'active' : ''}" data-action="help-tab" data-tab="${t}">${labels[t]}</button>`).join('')}</div>
    <div class="card">${helpContent(state.ui.activeHelp)}</div>
  `;
  return dashboardShell('Ayuda y soporte', 'Guías, preguntas frecuentes y formulario de contacto.', content);
}

function helpContent(tab) {
  if (tab === 'wearable') return `<h3>Guía de vinculación del wearable</h3><div class="timeline"><div class="timeline-item"><h4>1. Abre la app móvil</h4><p>La app móvil funciona como puente entre smartwatch, SQLite local y backend.</p></div><div class="timeline-item"><h4>2. Activa Bluetooth y permisos</h4><p>Permite sensores, GPS, micrófono y servicio en segundo plano.</p></div><div class="timeline-item"><h4>3. Confirma sincronización</h4><p>Después revisa el semáforo de conexión en el dashboard.</p></div></div><button class="btn" data-action="show-pairing-guide">Abrir guía rápida</button>`;
  if (tab === 'contactos') return `<h3>Contactos de emergencia</h3><p>Agrega contactos desde el módulo Contactos. Cada plan tiene un límite y el sistema bloquea visualmente el alta cuando se alcanza.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Agregar contacto</button>`;
  if (tab === 'monitores') return `<h3>Red de monitoreo</h3><p>Genera URLs únicas para que familiares acepten ser monitores y reciban alertas privadas.</p><button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Generar invitación</button>`;
  if (tab === 'planes') return `<h3>Planes</h3><p>Trial tiene 2 contactos, Básico 3 y Premium 8 con mapas, reportes y bypass crítico.</p><button class="btn primary" data-route="/dashboard/suscripcion">Ver suscripción</button>`;
  if (tab === 'incidentes') return `<h3>Incidentes</h3><p>El historial muestra eventos, mapa y telemetría. Algunas funciones avanzadas se bloquean si no hay Premium.</p><button class="btn primary" data-route="/dashboard/incidentes">Ver incidentes</button>`;
  return `<h3>Contactar soporte</h3><form id="support-form"><div class="field"><label>Asunto</label><input name="subject" required /></div><div class="field"><label>Tipo de problema</label><select name="type">${options(['Wearable','Contactos','Pago','Incidente','Otro'], 'Wearable')}</select></div><div class="field"><label>Descripción</label><textarea name="description" required></textarea></div><div class="form-actions"><button class="btn primary" type="submit">Enviar solicitud</button><button class="btn" type="button" data-route="/dashboard/overview">Cancelar</button></div></form>`;
}


function renderPermissions(privateMode = false) {
  const p = state.webPermissions;
  const content = `
    <form id="permissions-form" novalidate>
      <div class="alert-box info"><div>🔐</div><div><strong>Permisos lógicos del portal web</strong><p>La web no lee sensores directamente; eso lo hace el wearable/móvil. Esta pantalla documenta los permisos razonables para dashboard, monitores, mapas, alertas y persistencia local de la demo.</p></div></div>
      <div class="grid grid-2">
        <div class="card permission-card"><div class="permission-icon">🔔</div><h3>Notificaciones del navegador</h3><p>Permitir avisos visuales de incidentes, wearable desconectado, plan vencido e invitaciones aceptadas.</p><label class="switch-row"><input name="browserNotifications" type="checkbox" ${p.browserNotifications ? 'checked' : ''}/><span>Permitir notificaciones web</span></label></div>
        <div class="card permission-card"><div class="permission-icon">📍</div><h3>Ubicación para mapas</h3><p>Mostrar rutas, ubicación de incidentes y enlaces a Google Maps/Mapbox dentro del historial y alertas.</p><label class="switch-row"><input name="geolocation" type="checkbox" ${p.geolocation ? 'checked' : ''}/><span>Permitir mapas y ubicación</span></label></div>
        <div class="card permission-card"><div class="permission-icon">💾</div><h3>Persistencia local demo</h3><p>Guardar contactos, plan, monitores, preferencias y cambios en el navegador usando localStorage.</p><label class="switch-row"><input name="localStorage" type="checkbox" ${p.localStorage ? 'checked' : ''}/><span>Usar almacenamiento local</span></label></div>
        <div class="card permission-card"><div class="permission-icon">🛡️</div><h3>Compartir emergencia</h3><p>Autorizar que monitores reciban ubicación, estado de alerta y datos mínimos cuando exista un siniestro.</p><label class="switch-row"><input name="emergencySharing" type="checkbox" ${p.emergencySharing ? 'checked' : ''}/><span>Compartir datos en emergencia</span></label></div>
        <div class="card permission-card"><div class="permission-icon">🗺️</div><h3>Enlaces externos de mapa</h3><p>Abrir coordenadas en apps externas como Google Maps cuando el usuario o monitor lo solicite.</p><label class="switch-row"><input name="mapLinks" type="checkbox" ${p.mapLinks ? 'checked' : ''}/><span>Permitir enlaces de mapa</span></label></div>
        <div class="card permission-card"><div class="permission-icon">☎️</div><h3>Acciones de llamada</h3><p>Habilitar botones tipo tel: para llamar al conductor o contacto principal desde una alerta activa.</p><label class="switch-row"><input name="callLinks" type="checkbox" ${p.callLinks ? 'checked' : ''}/><span>Permitir botones de llamada</span></label></div>
      </div>
      <div class="card" style="margin-top:16px"><h3>Resumen de privacidad</h3><p class="muted">Estos permisos son de maqueta y sirven para que el prototipo sea realista. En producción se deberían mostrar políticas de privacidad, consentimiento explícito y revocación de permisos.</p><div class="form-actions"><button class="btn primary" type="submit">Guardar permisos</button><button class="btn" type="button" data-action="grant-all-permissions">Permitir todo</button><button class="btn warning" type="button" data-action="clear-permissions">Desactivar permisos</button>${privateMode ? '<button class="btn" type="button" data-route="/dashboard/configuracion">Volver</button>' : '<button class="btn" type="button" data-route="/onboarding">Omitir por ahora</button>'}</div></div>
    </form>
  `;
  if (privateMode) return dashboardShell('Permisos web', 'Permisos lógicos para alertas, mapas, llamadas, monitores y persistencia local.', content);
  return publicShell(`<section class="form-page"><div class="container"><div class="form-card wide"><span class="eyebrow">🔐 Paso previo recomendado</span><h2>Permisos y privacidad del portal</h2><p>Configura qué funciones web estarán disponibles en la demo antes de completar el onboarding.</p>${content}</div></div></section>`);
}

function renderSubscriptionExpired() {
  const content = `<div class="empty-state"><h3>Tu suscripción ha vencido</h3><p>Renueva tu plan para mantener activa la protección y el envío de alertas.</p><button class="btn primary" data-route="/dashboard/suscripcion/pago">Renovar ahora</button><button class="btn" data-route="/dashboard/suscripcion">Ver planes</button><button class="btn danger" data-action="logout">Cerrar sesión</button></div>`;
  return dashboardShell('Suscripción vencida', 'Estado especial de bloqueo o acceso limitado.', content);
}

function renderNotFound() {
  const isPrivate = state.isLoggedIn;
  const content = `<div class="empty-state"><h3>Página no encontrada</h3><p>La ruta solicitada no existe dentro del prototipo.</p><button class="btn primary" data-route="${isPrivate ? '/dashboard/overview' : '/'}">${isPrivate ? 'Ir al dashboard' : 'Volver al inicio'}</button></div>`;
  return isPrivate ? dashboardShell('Error 404', 'Ruta inexistente.', content) : publicShell(`<section class="form-page"><div class="container">${content}</div></section>`);
}

function renderConnectionError() {
  const content = `<div class="empty-state"><h3>Error de conexión</h3><p>No pudimos conectar con el servidor. Este prototipo simula el error y permite reintentar.</p><button class="btn primary" data-action="retry-connection">Reintentar</button><button class="btn" data-route="/dashboard/overview">Ir al inicio</button></div>`;
  return dashboardShell('Error de conexión', 'Estado visual para fallas de backend o red.', content);
}

function route() {
  saveState();
  const path = currentPath();
  document.body.classList.toggle('sidebar-open', state.ui.sidebarOpen);

  if (path === '/') app.innerHTML = renderLanding();
  else if (path.startsWith('/planes')) app.innerHTML = renderPlans(true);
  else if (path.startsWith('/registro')) app.innerHTML = renderRegister();
  else if (path === '/login') app.innerHTML = renderLogin();
  else if (path === '/recuperar-password') app.innerHTML = renderRecover();
  else if (path.startsWith('/invitacion/')) app.innerHTML = renderAcceptInvite(path.split('/')[2]);
  else if (path === '/permisos') app.innerHTML = renderPermissions(false);
  else if (path === '/onboarding') app.innerHTML = renderOnboarding();
  else if (path === '/dashboard' || path === '/dashboard/overview') app.innerHTML = renderOverview();
  else if (path === '/dashboard/metricas') app.innerHTML = renderAnalyticsDashboard();
  else if (path === '/dashboard/perfil') app.innerHTML = renderProfile();
  else if (path === '/dashboard/wearable') app.innerHTML = renderWearable();
  else if (path === '/dashboard/contactos') app.innerHTML = renderContacts();
  else if (path === '/dashboard/contactos/nuevo') app.innerHTML = renderContactForm('new');
  else if (/^\/dashboard\/contactos\/\d+\/editar$/.test(path)) app.innerHTML = renderContactForm('edit', path.split('/')[3]);
  else if (/^\/dashboard\/contactos\/\d+$/.test(path)) app.innerHTML = renderContactDetail(path.split('/')[3]);
  else if (path === '/dashboard/red-monitoreo') app.innerHTML = renderMonitorNetwork();
  else if (path.startsWith('/dashboard/red-monitoreo/nueva-invitacion')) app.innerHTML = renderNewInvitation();
  else if (/^\/dashboard\/red-monitoreo\/\d+$/.test(path)) app.innerHTML = renderMonitorDetail(path.split('/')[3]);
  else if (path === '/dashboard/suscripcion') app.innerHTML = renderSubscription();
  else if (path.startsWith('/dashboard/suscripcion/cambiar-plan/')) app.innerHTML = renderChangePlan(path.split('/')[4]);
  else if (path === '/dashboard/suscripcion/pagos') app.innerHTML = renderPayments();
  else if (path.startsWith('/dashboard/suscripcion/pago')) app.innerHTML = renderPayment();
  else if (path === '/dashboard/incidentes') app.innerHTML = renderIncidents();
  else if (/^\/dashboard\/incidentes\/\d+$/.test(path)) app.innerHTML = renderIncidentDetail(path.split('/')[3]);
  else if (/^\/dashboard\/alerta\/\d+$/.test(path)) app.innerHTML = renderActiveAlert(path.split('/')[3]);
  else if (path === '/dashboard/notificaciones') app.innerHTML = renderNotifications();
  else if (path === '/dashboard/configuracion') app.innerHTML = renderSettings();
  else if (path === '/dashboard/permisos') app.innerHTML = renderPermissions(true);
  else if (path.startsWith('/dashboard/ayuda')) app.innerHTML = renderHelp();
  else if (path === '/dashboard/suscripcion-vencida') app.innerHTML = renderSubscriptionExpired();
  else if (path === '/dashboard/error-conexion') app.innerHTML = renderConnectionError();
  else app.innerHTML = renderNotFound();

  attachHandlers();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function attachHandlers() {
  $$('[data-route]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.route)));
  $$('[data-action]').forEach(el => el.addEventListener('click', (event) => handleAction(event, el.dataset.action, el)));
  $$('[data-filter]').forEach(el => el.addEventListener('input', () => handleFilter(el)));
  $$('form').forEach(form => form.addEventListener('submit', handleSubmit));
  modalRoot.querySelectorAll('[data-action="close-modal"]').forEach(el => el.addEventListener('click', closeModal));
  modalRoot.querySelector('.modal-backdrop')?.addEventListener('click', (e) => { if (e.target.dataset.closeModal) closeModal(); });
}

function handleFilter(el) {
  const key = el.dataset.filter;
  state.filters[key] = el.value;
  route();
}

function handleAction(event, action, el) {
  event.preventDefault();
  const id = el.dataset.id;
  const planKey = el.dataset.plan;
  const token = el.dataset.token;
  const tab = el.dataset.tab;
  switch (action) {
    case 'scroll-how': document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' }); break;
    case 'choose-plan': choosePlan(planKey); break;
    case 'toggle-avatar-menu': state.ui.avatarMenu = !state.ui.avatarMenu; renderSame(); break;
    case 'toggle-sidebar': setSidebarOpen(!state.ui.sidebarOpen); break;
    case 'logout': logout(); break;
    case 'reset-demo': resetDemo(); break;
    case 'cancel-onboarding': cancelOnboarding(); break;
    case 'onboarding-prev': state.onboardingStep = Math.max(1, state.onboardingStep - 1); route(); break;
    case 'onboarding-skip-contact': state.onboardingStep = 5; toast('Contacto omitido', 'Puedes agregarlo después desde el dashboard.'); route(); break;
    case 'onboarding-edit': state.onboardingStep = 1; route(); break;
    case 'finish-onboarding': state.user.onboardingComplete = true; state.isLoggedIn = true; toast('Configuración completa', 'Bienvenido al dashboard.'); navigate('/dashboard/overview'); break;
    case 'sync-wearable': syncWearable(); break;
    case 'show-pairing-guide': pairingGuide(); break;
    case 'simulate-low-battery': state.wearable.battery = 12; addNotification('Batería baja', 'Tu wearable tiene 12% de batería.', 'wearable'); toast('Batería baja simulada'); route(); break;
    case 'toggle-wearable-connection': state.wearable.connection = state.wearable.connection === 'connected' ? 'disconnected' : 'connected'; toast('Estado cambiado', `Wearable ${state.wearable.connection === 'connected' ? 'conectado' : 'desconectado'}.`); route(); break;
    case 'unlink-wearable': unlinkWearable(); break;
    case 'go-add-contact': goAddContact(); break;
    case 'clear-contact-filters': state.filters.contacts = ''; state.filters.contactStatus = 'todos'; route(); break;
    case 'clear-incident-filters': state.filters.incidents = ''; state.filters.severity = 'todos'; state.filters.incidentStatus = 'todos'; route(); break;
    case 'save-contact-invite': saveContactFromForm(true); break;
    case 'cancel-contact-form': cancelContactForm(); break;
    case 'delete-contact': deleteContact(id); break;
    case 'make-primary': makePrimary(id); break;
    case 'invite-contact': navigate(`/dashboard/red-monitoreo/nueva-invitacion?contacto=${id}`); break;
    case 'copy-invite': copyInvite(id); break;
    case 'copy-last-invite': copyText(state.drafts.inviteUrl, 'Enlace copiado'); break;
    case 'open-last-invite': navigate(new URL(state.drafts.inviteUrl).hash.replace('#', '')); break;
    case 'send-whatsapp': sendWhatsapp(id); break;
    case 'resend-invite': resendInvite(id); break;
    case 'revoke-monitor': revokeMonitor(id); break;
    case 'restore-monitor': restoreMonitor(id); break;
    case 'activate-monitor': activateMonitor(id); break;
    case 'expire-monitor': expireMonitor(id); break;
    case 'clear-monitor-filters': state.filters.monitorStatus = 'todos'; route(); break;
    case 'reject-invite': rejectInvite(token); break;
    case 'confirm-plan-change': confirmPlanChange(planKey); break;
    case 'expire-subscription': expireSubscription(); break;
    case 'cancel-subscription': cancelSubscription(); break;
    case 'download-payment': toast('Comprobante simulado', 'Se generaría un PDF de pago.'); break;
    case 'export-incidents': exportIncidents(); break;
    case 'view-incident-map': if (plan().maps) navigate(`/dashboard/incidentes/${id}`); else premiumBlocked('El mapa de incidentes'); break;
    case 'download-report': downloadReport(id); break;
    case 'open-external-map': openExternalMap(id); break;
    case 'mark-false-alarm': markFalseAlarm(id); break;
    case 'add-incident-note': addIncidentNote(id); break;
    case 'simulate-critical-incident': simulateCriticalIncident(); break;
    case 'simulate-dashboard-day': simulateDashboardDay(); break;
    case 'export-dashboard': exportDashboardSummary(); break;
    case 'call-primary-contact': callPrimaryContact(); break;
    case 'mark-alert-attended': markAlertAttended(id); break;
    case 'mark-all-read': state.notifications.forEach(n => n.unread = false); toast('Notificaciones leídas'); route(); break;
    case 'delete-all-notifications': deleteAllNotifications(); break;
    case 'toggle-read': toggleRead(id); break;
    case 'delete-notification': deleteNotification(id); break;
    case 'change-password': changePassword(); break;
    case 'save-preferences': savePreferences(); break;
    case 'download-data': downloadData(); break;
    case 'close-sessions': toast('Sesiones cerradas', 'Se cerraron las sesiones activas simuladas.'); break;
    case 'delete-account': deleteAccount(); break;
    case 'help-tab': state.ui.activeHelp = tab; route(); break;
    case 'grant-all-permissions': grantAllPermissions(); break;
    case 'clear-permissions': clearPermissions(); break;
    case 'retry-connection': toast('Conexión restablecida', 'El servidor respondió correctamente.'); navigate('/dashboard/overview'); break;
    default: console.warn('Acción no controlada:', action);
  }
}

function renderSame() {
  const path = currentPath();
  // evita resetear hash, solo renderiza la pantalla actual
  if (path) route();
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'register-form') submitRegister(form);
  if (form.id === 'login-form') submitLogin(form);
  if (form.id === 'recover-form') submitRecover(form);
  if (form.id === 'permissions-form') submitPermissions(form);
  if (form.id === 'onboarding-personal') submitOnboardingPersonal(form);
  if (form.id === 'onboarding-medical') submitOnboardingMedical(form);
  if (form.id === 'onboarding-vehicle') submitOnboardingVehicle(form);
  if (form.id === 'onboarding-contact') submitOnboardingContact(form);
  if (form.id === 'profile-form') submitProfile(form);
  if (form.id === 'contact-form') saveContactFromForm(false);
  if (form.id === 'invite-form') submitInvite(form);
  if (form.id === 'accept-invite-form') submitAcceptInvite(form);
  if (form.id === 'payment-form') submitPayment(form);
  if (form.id === 'settings-form') submitSettings(form);
  if (form.id === 'support-form') submitSupport(form);
}

function validateRequired(form, fields) {
  let ok = true;
  fields.forEach(name => {
    const field = form.elements[name];
    const wrapper = field?.closest('.field');
    wrapper?.classList.remove('error');
    wrapper?.querySelector('.error-text')?.remove();
    if (!field || !String(field.value).trim()) {
      ok = false;
      wrapper?.classList.add('error');
      wrapper?.insertAdjacentHTML('beforeend', '<span class="error-text">Este campo es obligatorio.</span>');
    }
  });
  return ok;
}


function submitPermissions(form) {
  state.webPermissions.browserNotifications = form.elements.browserNotifications.checked;
  state.webPermissions.geolocation = form.elements.geolocation.checked;
  state.webPermissions.localStorage = form.elements.localStorage.checked;
  state.webPermissions.emergencySharing = form.elements.emergencySharing.checked;
  state.webPermissions.mapLinks = form.elements.mapLinks.checked;
  state.webPermissions.callLinks = form.elements.callLinks.checked;
  state.webPermissions.acceptedAt = new Date().toLocaleString('es-MX');
  state.user.webPermissionsComplete = true;
  toast('Permisos guardados', 'La demo usará esta configuración para mostrar funciones habilitadas o bloqueadas.');
  if (currentPath().startsWith('/dashboard')) navigate('/dashboard/configuracion');
  else if (!state.user.onboardingComplete) navigate('/onboarding');
  else navigate('/dashboard/overview');
}

function grantAllPermissions() {
  Object.assign(state.webPermissions, {
    browserNotifications: true,
    geolocation: true,
    localStorage: true,
    emergencySharing: true,
    mapLinks: true,
    callLinks: true,
    backgroundSyncNotice: true,
    acceptedAt: new Date().toLocaleString('es-MX')
  });
  state.user.webPermissionsComplete = true;
  toast('Permisos activados', 'Todas las funciones web quedaron habilitadas en la demo.');
  route();
}

function clearPermissions() {
  Object.assign(state.webPermissions, {
    browserNotifications: false,
    geolocation: false,
    localStorage: true,
    emergencySharing: false,
    mapLinks: false,
    callLinks: false,
    backgroundSyncNotice: false,
    acceptedAt: new Date().toLocaleString('es-MX')
  });
  state.user.webPermissionsComplete = true;
  toast('Permisos desactivados', 'Se conservará localStorage para que la demo pueda persistir cambios.');
  route();
}

function submitRegister(form) {
  if (!validateRequired(form, ['name','email','phone','password','confirm'])) return;
  if (form.elements.password.value !== form.elements.confirm.value) return toast('Contraseñas no coinciden', 'Revisa los campos de contraseña.');
  if (!form.elements.terms.checked || !form.elements.privacy.checked) return toast('Acepta términos', 'Debes aceptar términos y privacidad.');
  state.user.name = form.elements.name.value.trim();
  state.user.email = form.elements.email.value.trim();
  state.user.phone = form.elements.phone.value.trim();
  state.user.plan = form.elements.plan.value;
  state.driver.fullName = state.user.name;
  state.user.onboardingComplete = false;
  state.user.webPermissionsComplete = false;
  state.isLoggedIn = true;
  state.onboardingStep = 1;
  toast('Cuenta creada', 'Primero revisa los permisos web lógicos de la plataforma.');
  navigate('/permisos');
}

function submitLogin(form) {
  if (!validateRequired(form, ['email','password'])) return;
  state.isLoggedIn = true;
  toast('Sesión iniciada', 'Entraste al dashboard de Impact.X.');
  if (!state.user.webPermissionsComplete) navigate('/permisos');
  else if (!state.user.onboardingComplete) navigate('/onboarding');
  else if (state.user.subscriptionStatus === 'Vencida') navigate('/dashboard/suscripcion-vencida');
  else navigate('/dashboard/overview');
}

function submitRecover(form) {
  if (!validateRequired(form, ['email'])) return;
  openModal({ title: 'Enlace enviado', body: 'Te enviamos un enlace simulado para restablecer tu contraseña.', actions: [{ label: 'Volver al login', className: 'primary', onClick: () => { closeModal(); navigate('/login'); } }] });
}

function submitOnboardingPersonal(form) {
  if (!validateRequired(form, ['fullName','phone','city'])) return;
  state.driver.fullName = form.elements.fullName.value.trim();
  state.user.name = state.driver.fullName;
  state.user.phone = form.elements.phone.value.trim();
  state.user.city = form.elements.city.value.trim();
  state.onboardingStep = 2;
  route();
}


function submitOnboardingMedical(form) {
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

function submitOnboardingVehicle(form) {
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

function submitOnboardingContact(form) {
  if (!validateRequired(form, ['name','relation','phone'])) return;
  addContact({
    name: form.elements.name.value.trim(),
    relation: form.elements.relation.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: '',
    priority: state.contacts.length ? 'Secundario' : 'Principal',
    status: 'Activo',
    channel: form.elements.channel.value,
    notes: 'Agregado desde onboarding.'
  });
  state.onboardingStep = 5;
  route();
}

function submitProfile(form) {
  if (!validateRequired(form, ['fullName','phone','email','city','brand','model','year','avgSpeed'])) return;
  state.driver.fullName = form.elements.fullName.value.trim();
  state.user.name = state.driver.fullName;
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
  toast('Perfil actualizado', 'Los datos del conductor fueron guardados.');
  route();
}

function saveContactFromForm(forceInvite) {
  const form = $('#contact-form');
  if (!form) return;
  const mode = form.dataset.mode;
  const id = form.dataset.id;
  if (!validateRequired(form, ['name','relation','phone'])) return;
  const data = {
    name: form.elements.name.value.trim(),
    relation: form.elements.relation.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    priority: form.elements.priority.value,
    status: form.elements.status.value,
    channel: form.elements.channel.value,
    notes: form.elements.notes.value.trim()
  };
  const duplicate = state.contacts.find(c => c.phone === data.phone && String(c.id) !== String(id));
  if (duplicate) return toast('Teléfono duplicado', 'Ya existe un contacto con ese teléfono.');
  if (data.status !== 'Suspendido por plan' && mode === 'edit') {
    const current = state.contacts.find(c => String(c.id) === String(id));
    const wouldConsumeNewSlot = current?.status === 'Suspendido por plan';
    if (wouldConsumeNewSlot && usableContacts().length >= plan().contactsLimit) return limitBlocked();
  }
  if (data.priority === 'Principal') state.contacts.forEach(c => c.priority = 'Secundario');
  if (mode === 'edit') {
    const index = state.contacts.findIndex(c => String(c.id) === String(id));
    if (index >= 0) state.contacts[index] = { ...state.contacts[index], ...data };
    toast('Contacto actualizado');
    navigate('/dashboard/contactos');
  } else {
    if (usableContacts().length >= plan().contactsLimit) return limitBlocked();
    const created = addContact(data);
    const shouldInvite = forceInvite || form.elements.sendInvite?.checked;
    if (shouldInvite) navigate(`/dashboard/red-monitoreo/nueva-invitacion?contacto=${created.id}`);
    else navigate('/dashboard/contactos');
  }
}

function addContact(data) {
  const contact = {
    id: generateId(),
    createdAt: new Date().toISOString().slice(0,10),
    monitorId: null,
    email: '', notes: '',
    ...data
  };
  state.contacts.push(contact);
  enforceContactPlanLimit();
  addNotification('Contacto agregado', `${contact.name} fue agregado como contacto de emergencia.`, 'contact');
  toast('Contacto agregado', `${contact.name} fue agregado correctamente.`);
  return contact;
}

function submitInvite(form) {
  if (!validateRequired(form, ['name','phone'])) return;
  const contactId = form.elements.contactId.value || null;
  const token = `MON-${form.elements.name.value.trim().split(' ')[0].toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const expires = form.elements.expires.value;
  const monitor = {
    id: generateId(),
    contactId: contactId ? Number(contactId) : null,
    name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    status: 'Pendiente',
    invitedAt: new Date().toLocaleString('es-MX'),
    acceptedAt: '',
    expiresAt: expires === '24 horas' ? 'Expira en 24 horas' : expires === '48 horas' ? 'Expira en 48 horas' : 'Expira en 7 días',
    token,
    permissions: ['Recibir SOS', 'Ver ubicación en incidente'].concat(form.elements.canReceiveUpdates.checked ? ['Recibir actualizaciones'] : [])
  };
  state.monitors.push(monitor);
  if (contactId) {
    const c = state.contacts.find(x => String(x.id) === String(contactId));
    if (c) c.monitorId = monitor.id;
  }
  state.drafts.inviteUrl = `${location.origin}${location.pathname}#/invitacion/${token}`;
  addNotification('Nueva invitación', `${monitor.name} recibió una invitación de monitoreo.`, 'monitor');
  toast('Invitación generada', 'Copia o abre el enlace público.');
  route();
}

function submitAcceptInvite(form) {
  const token = form.dataset.token;
  const m = state.monitors.find(x => x.token === token);
  if (!m) return;
  if (!validateRequired(form, ['name','phone'])) return;
  if (!form.elements.accept.checked) return toast('Aceptación requerida', 'Debes aceptar los permisos de monitoreo.');
  m.name = form.elements.name.value.trim();
  m.phone = form.elements.phone.value.trim();
  m.email = form.elements.email.value.trim();
  m.status = 'Activo';
  m.acceptedAt = new Date().toLocaleString('es-MX');
  addNotification('Monitor aceptado', `${m.name} aceptó formar parte de tu red.`, 'monitor');
  saveState();
  openModal({ title: 'Invitación aceptada', body: 'Ahora formas parte de la red de monitoreo. Recibirás alertas si ocurre un incidente.', actions: [{ label: 'Entendido', className: 'primary', onClick: () => { closeModal(); navigate('/'); } }] });
}

function submitPayment(form) {
  if (!validateRequired(form, ['holder','card','exp','cvv','zip'])) return;
  const target = form.dataset.plan;
  if (PLAN_RULES[target]) state.user.plan = target;
  enforceContactPlanLimit(target);
  state.user.subscriptionStatus = 'Activa';
  state.user.subscriptionEnd = '2026-07-30';
  state.payments.unshift({ id: generateId(), date: new Date().toISOString().slice(0,10), concept: `Pago Plan ${plan().name}`, amount: plan().price, status: 'Aprobado' });
  addNotification('Pago aprobado', `Tu plan ${plan().name} quedó activo.`, 'plan');
  toast('Pago aprobado', `Tu plan ${plan().name} está activo.`);
  navigate('/dashboard/suscripcion');
}

function submitSettings(form) {
  if (!validateRequired(form, ['name','email','phone'])) return;
  state.user.name = form.elements.name.value.trim();
  state.user.email = form.elements.email.value.trim();
  state.user.phone = form.elements.phone.value.trim();
  state.user.twoFactor = form.elements.twoFactor.checked;
  toast('Cuenta actualizada', 'Datos principales guardados.');
  route();
}

function submitSupport(form) {
  if (!validateRequired(form, ['subject','description'])) return;
  openModal({ title: 'Solicitud enviada', body: 'Tu ticket de soporte fue creado de forma simulada. Un agente revisaría el caso.', actions: [{ label: 'Aceptar', className: 'primary', onClick: closeModal }] });
  form.reset();
}

function choosePlan(key) {
  if (!PLAN_RULES[key]) return;
  state.selectedPlan = key;
  if (currentPath().startsWith('/dashboard')) {
    if (state.user.plan === key) return toast('Plan actual', 'Ya tienes seleccionado este plan.');
    navigate(`/dashboard/suscripcion/cambiar-plan/${key}`);
  } else {
    navigate(`/registro?plan=${key}`);
  }
}

function logout() {
  confirmModal({ title: 'Cerrar sesión', body: '¿Seguro que deseas cerrar sesión?', confirmText: 'Cerrar sesión', danger: true, onConfirm: () => { state.isLoggedIn = false; navigate('/login'); toast('Sesión cerrada'); } });
}

function resetDemo() {
  confirmModal({ title: 'Reiniciar demo', body: 'Se restaurarán datos mock, contactos, monitores, incidentes y plan.', confirmText: 'Reiniciar', danger: true, onConfirm: () => { state = initialState(); toast('Demo reiniciada'); navigate('/dashboard/overview'); } });
}

function cancelOnboarding() {
  confirmModal({ title: 'Salir del onboarding', body: 'Tu configuración inicial no se ha completado. ¿Deseas salir?', confirmText: 'Salir', danger: true, onConfirm: () => navigate('/login') });
}

function syncWearable() {
  if (!state.wearable.linked) return pairingGuide();
  toast('Sincronizando', 'Intentando conectar con el wearable...');
  state.wearable.connection = 'syncing';
  route();
  setTimeout(() => {
    state.wearable.connection = 'connected';
    state.wearable.lastSync = 'Ahora mismo';
    state.wearable.battery = Math.min(100, state.wearable.battery + 1);
    addNotification('Wearable sincronizado', `${state.wearable.model} se sincronizó correctamente.`, 'wearable');
    toast('Sincronización completa', 'Wearable conectado correctamente.');
    route();
  }, 700);
}

function pairingGuide() {
  openModal({
    title: 'Guía de vinculación',
    content: `<div class="timeline"><div class="timeline-item"><h4>1. Abre la app móvil</h4><p>La app móvil actúa como puente de comunicación.</p></div><div class="timeline-item"><h4>2. Activa Bluetooth y permisos</h4><p>GPS, sensores, micrófono, actividad en segundo plano y SMS.</p></div><div class="timeline-item"><h4>3. Selecciona tu smartwatch</h4><p>Confirma el código de sincronización.</p></div><div class="timeline-item"><h4>4. Revisa dashboard</h4><p>El semáforo debe mostrarse en verde.</p></div></div>`,
    actions: [{ label: 'Entendido', className: 'primary', onClick: closeModal }],
    large: true
  });
}

function unlinkWearable() {
  confirmModal({ title: 'Desvincular dispositivo', body: 'El wearable dejará de enviar datos y el sistema quedará limitado.', confirmText: 'Desvincular', danger: true, onConfirm: () => { state.wearable.linked = false; state.wearable.connection = 'disconnected'; addNotification('Wearable desvinculado', 'El smartwatch fue desvinculado de la cuenta.', 'wearable'); toast('Dispositivo desvinculado'); route(); } });
}

function goAddContact() {
  if (usableContacts().length >= plan().contactsLimit) limitBlocked();
  else navigate('/dashboard/contactos/nuevo');
}

function cancelContactForm() {
  confirmModal({ title: 'Salir sin guardar', body: 'Los cambios capturados se perderán.', confirmText: 'Salir sin guardar', danger: true, onConfirm: () => navigate('/dashboard/contactos') });
}

function deleteContact(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  confirmModal({
    title: 'Eliminar contacto',
    body: `${c.name} dejará de recibir alertas de emergencia. Esta acción no se puede deshacer en la maqueta.`,
    confirmText: 'Eliminar contacto',
    danger: true,
    onConfirm: () => {
      state.contacts = state.contacts.filter(x => String(x.id) !== String(id));
      state.monitors.forEach(m => { if (m.contactId && String(m.contactId) === String(id)) m.contactId = null; });
      enforceContactPlanLimit();
      addNotification('Contacto eliminado', `${c.name} fue eliminado de tus contactos.`, 'contact');
      toast('Contacto eliminado');
      navigate('/dashboard/contactos');
    }
  });
}

function makePrimary(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  if (c.priority === 'Principal') return toast('Ya es principal', `${c.name} ya está marcado como principal.`);
  confirmModal({ title: 'Cambiar contacto principal', body: `¿Deseas marcar a ${c.name} como contacto principal? El anterior pasará a secundario.`, confirmText: 'Reemplazar', onConfirm: () => { state.contacts.forEach(x => x.priority = x.id === c.id ? 'Principal' : x.priority === 'Principal' ? 'Secundario' : x.priority); toast('Contacto principal actualizado'); route(); } });
}

function monitorUrl(m) {
  return `${location.origin}${location.pathname}#/invitacion/${m.token}`;
}

function copyText(text, title = 'Copiado') {
  navigator.clipboard?.writeText(text).catch(() => {});
  toast(title, text);
}

function copyInvite(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  copyText(monitorUrl(m), 'Enlace de invitación copiado');
}

function sendWhatsapp(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  const msg = encodeURIComponent(`Has sido invitado a formar parte de mi red de monitoreo Impact.X. Acepta aquí: ${monitorUrl(m)}`);
  openModal({ title: 'Enviar por WhatsApp', body: `Se abriría WhatsApp con el mensaje para ${esc(m.name)}.`, content: `<div class="code-box">https://wa.me/${esc(m.phone.replace(/\D/g,''))}?text=${msg}</div>`, actions: [{ label: 'Cerrar', onClick: closeModal }] });
}

function nextExpiration(label = '7 días') {
  const d = new Date();
  const days = label === '24 horas' ? 1 : label === '48 horas' ? 2 : 7;
  d.setDate(d.getDate() + days);
  return d.toLocaleString('es-MX');
}

function refreshMonitorToken(m) {
  const base = (m.name || 'MONITOR').split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '') || 'MONITOR';
  m.token = `MON-${base}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  m.invitedAt = new Date().toLocaleString('es-MX');
  m.expiresAt = nextExpiration('7 días');
}

function resendInvite(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  refreshMonitorToken(m);
  m.status = 'Pendiente';
  m.acceptedAt = '';
  delete m.revokedAt;
  state.drafts.inviteUrl = monitorUrl(m);
  addNotification('Invitación reenviada', `Se reenvió la invitación a ${m.name}.`, 'monitor');
  toast('Invitación reenviada', 'El monitor quedó pendiente con un token nuevo.');
  route();
}

function revokeMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  if (m.status === 'Revocado') return toast('Ya estaba revocado', `${m.name} no tiene acceso activo.`);
  confirmModal({ title: 'Revocar monitor', body: `${m.name} dejará de recibir alertas y ubicación de emergencia. Luego puedes devolver el acceso desde esta misma pantalla.`, confirmText: 'Revocar acceso', danger: true, onConfirm: () => { m.previousStatus = m.status; m.status = 'Revocado'; m.revokedAt = new Date().toLocaleString('es-MX'); addNotification('Monitor revocado', `${m.name} fue revocado de la red.`, 'monitor'); toast('Acceso revocado'); route(); } });
}

function restoreMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  const wasAccepted = Boolean(m.acceptedAt) && m.previousStatus === 'Activo';
  confirmModal({ title: 'Devolver acceso', body: `Se restaurará el acceso de ${m.name}. ${wasAccepted ? 'Quedará activo porque ya había aceptado previamente.' : 'Quedará pendiente con una invitación nueva para que acepte otra vez.'}`, confirmText: 'Devolver acceso', onConfirm: () => {
    delete m.revokedAt;
    if (wasAccepted) {
      m.status = 'Activo';
    } else {
      refreshMonitorToken(m);
      m.status = 'Pendiente';
      m.acceptedAt = '';
      state.drafts.inviteUrl = monitorUrl(m);
    }
    delete m.previousStatus;
    addNotification('Acceso restaurado', `${m.name} volvió a la red de monitoreo.`, 'monitor');
    toast('Acceso restaurado', `${m.name} quedó ${m.status.toLowerCase()}.`);
    route();
  } });
}

function activateMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  if (m.status === 'Activo') return toast('Monitor activo', `${m.name} ya puede recibir alertas.`);
  confirmModal({ title: 'Aceptar invitación en demo', body: `Esto simula que ${m.name} abrió la URL y aceptó permisos de monitoreo.`, confirmText: 'Activar monitor', onConfirm: () => {
    m.status = 'Activo';
    m.acceptedAt = new Date().toLocaleString('es-MX');
    delete m.revokedAt;
    delete m.previousStatus;
    addNotification('Monitor activo', `${m.name} aceptó la invitación en la demo.`, 'monitor');
    toast('Monitor activado', `${m.name} ya recibe alertas.`);
    route();
  } });
}

function expireMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  if (m.status === 'Activo') return toast('No se puede expirar', 'Un monitor activo primero debe revocarse si quieres quitar acceso.');
  confirmModal({ title: 'Expirar invitación', body: `La URL de ${m.name} quedará vencida. Después podrás restaurarla o reenviarla.`, confirmText: 'Expirar', danger: true, onConfirm: () => {
    m.previousStatus = m.status;
    m.status = 'Expirado';
    m.expiresAt = new Date().toLocaleString('es-MX');
    addNotification('Invitación expirada', `La invitación de ${m.name} venció en la demo.`, 'monitor');
    toast('Invitación expirada');
    route();
  } });
}

function rejectInvite(token) {
  const m = state.monitors.find(x => x.token === token);
  if (!m) return;
  confirmModal({ title: 'Rechazar invitación', body: '¿Seguro que deseas rechazar esta invitación?', confirmText: 'Rechazar', danger: true, onConfirm: () => { m.status = 'Revocado'; openModal({ title: 'Invitación rechazada', body: 'Has rechazado la invitación de monitoreo.', actions: [{ label: 'Aceptar', className: 'primary', onClick: () => { closeModal(); navigate('/'); } }] }); } });
}

function confirmPlanChange(key) {
  if (!PLAN_RULES[key]) return;
  const overflow = Math.max(0, usableContacts().length - PLAN_RULES[key].contactsLimit);
  const apply = () => {
    state.user.plan = key;
    state.user.subscriptionStatus = 'Activa';
    state.user.subscriptionEnd = '2026-07-30';
    enforceContactPlanLimit(key);
    state.payments.unshift({ id: generateId(), date: new Date().toISOString().slice(0,10), concept: `Cambio a Plan ${PLAN_RULES[key].name}`, amount: PLAN_RULES[key].price, status: 'Aprobado' });
    addNotification('Plan actualizado', `Tu plan cambió a ${PLAN_RULES[key].name}.`, 'plan');
    if (overflow > 0) addNotification('Contactos pausados por plan', `${overflow} contacto(s) quedaron pausados por el límite del nuevo plan.`, 'contact');
    toast('Plan actualizado', `Ahora tienes Plan ${PLAN_RULES[key].name}.${overflow > 0 ? ' Contactos excedentes pausados.' : ''}`);
    navigate('/dashboard/suscripcion');
  };
  if (overflow > 0) {
    return confirmModal({
      title: 'Reducir plan y pausar contactos',
      body: `El Plan ${PLAN_RULES[key].name} solo permite ${PLAN_RULES[key].contactsLimit} contactos. ${overflow} contacto(s) quedarán pausados y no recibirán alertas. No se borran de la demo.`,
      confirmText: 'Cambiar plan',
      onConfirm: apply
    });
  }
  apply();
}

function expireSubscription() {
  confirmModal({ title: 'Simular vencimiento', body: 'El dashboard mostrará el estado de suscripción vencida.', confirmText: 'Simular', danger: true, onConfirm: () => { state.user.subscriptionStatus = 'Vencida'; addNotification('Suscripción vencida', 'Tu plan venció y requiere renovación.', 'plan'); navigate('/dashboard/suscripcion-vencida'); } });
}

function cancelSubscription() {
  confirmModal({ title: 'Cancelar suscripción', body: 'La protección quedará limitada al finalizar el periodo actual.', confirmText: 'Cancelar suscripción', danger: true, onConfirm: () => { state.user.subscriptionStatus = 'Cancelada'; addNotification('Suscripción cancelada', 'Tu suscripción fue cancelada de forma simulada.', 'plan'); toast('Suscripción cancelada'); route(); } });
}

function exportIncidents() {
  if (!plan().exportReports) return premiumBlocked('La exportación de reportes');
  openModal({ title: 'Exportar incidentes', body: 'Selecciona un formato de exportación.', content: `<div class="form-grid"><button class="btn" data-action="export-pdf">PDF</button><button class="btn" data-action="export-csv">CSV</button></div>`, actions: [{ label: 'Cerrar', onClick: closeModal }] });
  setTimeout(() => {
    $('[data-action="export-pdf"]')?.addEventListener('click', () => { closeModal(); toast('PDF generado', 'Se generaría el reporte PDF.'); });
    $('[data-action="export-csv"]')?.addEventListener('click', () => { closeModal(); toast('CSV generado', 'Se generaría el archivo CSV.'); });
  });
}

function downloadReport(id) {
  if (!plan().exportReports) return premiumBlocked('La descarga de reportes');
  const i = state.incidents.find(x => String(x.id) === String(id));
  toast('Reporte generado', `Reporte ${i?.type || 'incidente'} en ${state.drafts.lastReportFormat}.`);
}

function openExternalMap(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return;
  if (!state.webPermissions.mapLinks && !state.webPermissions.geolocation) return toast('Permiso de mapas desactivado', 'Actívalo en Permisos web para abrir ubicaciones.');
  if (!plan().maps && currentPath().includes('/incidentes')) return premiumBlocked('Abrir ubicación en mapa');
  openModal({ title: 'Abrir mapa externo', body: `Se abriría Google Maps/Mapbox con las coordenadas ${esc(i.coords)}.`, content: `<div class="code-box">https://maps.google.com/?q=${esc(i.coords)}</div>`, actions: [{ label: 'Cerrar', onClick: closeModal }] });
}

function markFalseAlarm(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return;
  confirmModal({ title: 'Marcar falsa alarma', body: 'El incidente quedará marcado para mejorar el historial y el entrenamiento del sistema.', confirmText: 'Confirmar', onConfirm: () => { i.status = 'Falsa alarma'; i.note = `${i.note || ''} Marcado como falsa alarma por el usuario.`.trim(); addNotification('Falsa alarma registrada', `El incidente ${i.id} se marcó como falsa alarma.`, 'incident'); toast('Incidente actualizado'); route(); } });
}

function addIncidentNote(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return;
  openModal({ title: 'Agregar nota', content: `<div class="field"><label>Nota del incidente</label><textarea id="incident-note-input">${esc(i.note || '')}</textarea></div>`, actions: [{ label: 'Cancelar', onClick: closeModal }, { label: 'Guardar nota', className: 'primary', onClick: () => { i.note = $('#incident-note-input').value.trim(); closeModal(); toast('Nota guardada'); route(); } }] });
}

function simulateCriticalIncident() {
  const incident = {
    id: generateId(),
    date: new Date().toISOString().slice(0,10),
    time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    type: 'Colisión detectada',
    severity: 'Crítica',
    status: 'Alerta enviada',
    location: 'Ubicación simulada de emergencia',
    coords: '20.054901, -99.343201',
    gForce: '11.6G',
    decibels: plan().telemetry ? '136dB' : 'Bloqueado',
    heartRate: plan().telemetry ? '128 bpm' : 'Bloqueado',
    activation: plan().bypass ? 'Bypass crítico' : 'Temporizador de 20 segundos',
    notified: state.contacts.filter(c => c.status === 'Activo').map(c => c.name),
    responseTime: plan().bypass ? 'Milisegundos' : '20 segundos',
    note: 'Incidente crítico simulado desde el dashboard.',
    timeline: [['Ahora', 'Impacto crítico detectado'], ['Ahora', 'Contactos cargados'], ['Ahora', 'Alerta enviada a red de monitoreo']]
  };
  state.incidents.unshift(incident);
  addNotification('Incidente crítico', 'Se simuló una alerta crítica y se notificó a la red.', 'incident');
  toast('Incidente crítico simulado', 'Se agregó al historial.');
  navigate(`/dashboard/alerta/${incident.id}`);
}

function callPrimaryContact() {
  const c = state.contacts.find(x => x.priority === 'Principal') || state.contacts[0];
  if (!c) return toast('Sin contacto principal', 'Agrega un contacto primero.');
  if (!state.webPermissions.callLinks) return toast('Permiso de llamadas desactivado', 'Activa llamadas en Permisos web.');
  openModal({ title: 'Llamar contacto principal', body: `Se iniciaría llamada a ${esc(c.name)}: ${esc(c.phone)}.`, actions: [{ label: 'Cerrar', onClick: closeModal }] });
}

function markAlertAttended(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return;
  confirmModal({ title: 'Marcar alerta como atendida', body: '¿Confirmas que esta emergencia ya fue atendida?', confirmText: 'Confirmar atención', onConfirm: () => { i.status = 'Atendido'; addNotification('Alerta atendida', `El incidente ${i.id} fue marcado como atendido.`, 'incident'); toast('Alerta atendida'); navigate(`/dashboard/incidentes/${i.id}`); } });
}

function toggleRead(id) {
  const n = state.notifications.find(x => String(x.id) === String(id));
  if (n) n.unread = !n.unread;
  route();
}

function deleteNotification(id) {
  state.notifications = state.notifications.filter(x => String(x.id) !== String(id));
  toast('Notificación eliminada');
  route();
}

function deleteAllNotifications() {
  confirmModal({ title: 'Eliminar notificaciones', body: 'Se eliminarán todas las notificaciones del prototipo.', confirmText: 'Eliminar todas', danger: true, onConfirm: () => { state.notifications = []; toast('Notificaciones eliminadas'); route(); } });
}

function changePassword() {
  const form = $('#settings-form');
  if (!form) return;
  const pass = form.elements.newPassword.value;
  const confirm = form.elements.confirmPassword.value;
  if (!pass || !confirm) return toast('Campos incompletos', 'Captura nueva contraseña y confirmación.');
  if (pass !== confirm) return toast('No coincide', 'La confirmación no coincide.');
  toast('Contraseña actualizada', 'Cambio simulado correctamente.');
}

function savePreferences() {
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

function downloadData() {
  const data = JSON.stringify({ user: state.user, driver: state.driver, contacts: state.contacts, monitors: state.monitors, incidents: state.incidents }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'impactx-datos-demo.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Datos descargados', 'Archivo JSON generado.');
}

function deleteAccount() {
  confirmModal({ title: 'Eliminar cuenta', body: 'Esta acción eliminará todos los datos simulados y cerrará sesión.', confirmText: 'Eliminar definitivamente', danger: true, onConfirm: () => { state = initialState(); state.isLoggedIn = false; toast('Cuenta eliminada', 'Datos restaurados en la demo.'); navigate('/login'); } });
}

window.addEventListener('hashchange', () => {
  setSidebarOpen(false);
  route();
});
window.addEventListener('DOMContentLoaded', route);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* =========================================================
   Impact.X Web Prototype v8 overrides
   - Chat interno como canal único
   - Username único + ID de perfil
   - Sin Overview/Dashboard activos; archivados en archivo aparte
   ========================================================= */

const V8_QUICK_MESSAGES = [
  'Ocurrió un accidente',
  'Necesito ayuda urgente',
  'Comparto mi ubicación',
  'Estoy bien, fue falsa alarma',
  'No puedo contestar llamadas',
  'Voy en camino',
  'Revisa la alerta activa',
  'Mi wearable se desconectó',
  'Llama a emergencias si no respondo',
  'Llegué a salvo'
];

const V8_AUTO_RESPONSES = [
  'Recibido. Estoy revisando tu ubicación dentro de Impact.X.',
  'Voy a mantenerme pendiente del chat interno.',
  'Avísame si necesitas que contacte a alguien más.',
  'Confirmo recepción de la alerta. Estoy atento.',
  'Ya abrí la información del incidente en el panel.'
];

function v8Slug(value = '') {
  return String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 22) || 'usuario_impactx';
}

function v8ProfileId(seed = '') {
  const base = v8Slug(seed).replace(/_/g, '').slice(0, 6).toUpperCase() || 'USER';
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `IX-${base}-${rnd}`;
}

function ensureV8State() {
  state.filters = { ...(state.filters || {}), chatSearch: state.filters?.chatSearch || '', contactStatus: state.filters?.contactStatus || 'todos', monitorStatus: state.filters?.monitorStatus || 'todos' };
  state.ui = { ...(state.ui || {}), activeChatId: state.ui?.activeChatId || null, avatarMenu: Boolean(state.ui?.avatarMenu), sidebarOpen: Boolean(state.ui?.sidebarOpen), activeHelp: state.ui?.activeHelp || 'chat' };
  state.user = { ...(state.user || {}) };
  if (!state.user.username) state.user.username = v8Slug(state.user.name || state.driver?.fullName || 'leo_demo');
  if (!state.user.profileId) state.user.profileId = v8ProfileId(state.user.username);
  if (state.user.notifyInternal === undefined) state.user.notifyInternal = true;
  state.user.notifyEmail = false;
  state.user.notifySms = false;
  state.user.notifyWhatsapp = false;
  state.driver = { ...(state.driver || {}) };
  state.wearable = state.wearable || {};
  state.wearable.permissions = state.wearable.permissions || {};
  state.wearable.permissions.internalBridge = true;
  delete state.wearable.permissions.smsBridge;
  state.webPermissions = { ...(state.webPermissions || {}), internalChat: state.webPermissions?.internalChat ?? true };
  state.contacts = Array.isArray(state.contacts) ? state.contacts : [];
  state.contacts.forEach((c, index) => {
    if (!c.username) c.username = v8Slug(c.name || `contacto_${index + 1}`);
    if (!c.profileId) c.profileId = v8ProfileId(c.username);
    c.channel = 'Chat interno';
    if (!c.status) c.status = 'Activo';
    if (!c.priority) c.priority = 'Secundario';
  });
  state.monitors = Array.isArray(state.monitors) ? state.monitors : [];
  state.monitors.forEach((m, index) => {
    if (!m.username) m.username = v8Slug(m.name || `monitor_${index + 1}`);
    if (!m.profileId) m.profileId = v8ProfileId(m.username);
    if (!m.status) m.status = index === 0 ? 'Activo' : 'Pendiente';
    m.channel = 'Chat interno';
    m.permissions = m.permissions || ['Recibir SOS interno', 'Ver ubicación en incidente', 'Responder por chat interno'];
  });
  if (!Array.isArray(state.chatThreads)) state.chatThreads = [];
  ensureChatThreads();
}

function knownUsernames(ignoreContactId = null) {
  const values = [state.user.username];
  state.contacts.forEach(c => { if (String(c.id) !== String(ignoreContactId)) values.push(c.username); });
  state.monitors.forEach(m => values.push(m.username));
  return values.filter(Boolean).map(x => String(x).toLowerCase());
}

function usernameAvailable(username, ignoreContactId = null) {
  const normalized = v8Slug(username);
  if (String(state.user.username).toLowerCase() === normalized.toLowerCase()) return false;
  return !state.contacts.some(c => String(c.id) !== String(ignoreContactId) && String(c.username).toLowerCase() === normalized.toLowerCase());
}

function profileIdAvailable(profileId, ignoreContactId = null) {
  const normalized = String(profileId || '').trim().toUpperCase();
  if (!normalized) return true;
  if (String(state.user.profileId).toUpperCase() === normalized) return false;
  return !state.contacts.some(c => String(c.id) !== String(ignoreContactId) && String(c.profileId).toUpperCase() === normalized);
}

function threadIdForContact(contactId) {
  return `contact-${contactId}`;
}

function ensureChatThreads() {
  state.contacts.forEach(c => {
    const threadId = threadIdForContact(c.id);
    let thread = state.chatThreads.find(t => t.id === threadId);
    if (!thread) {
      thread = {
        id: threadId,
        contactId: c.id,
        title: c.name,
        username: c.username,
        profileId: c.profileId,
        unread: c.status === 'Activo' ? 1 : 0,
        updatedAt: new Date().toLocaleString('es-MX'),
        messages: [
          { from: 'system', text: `${c.name} fue agregado a tu red interna Impact.X.`, time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) },
          { from: 'them', text: c.status === 'Activo' ? 'Listo, quedo pendiente por chat interno ante cualquier alerta.' : 'Invitación recibida. Pendiente de activación en la demo.', time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }
        ]
      };
      state.chatThreads.push(thread);
    } else {
      thread.title = c.name;
      thread.username = c.username;
      thread.profileId = c.profileId;
    }
  });
  state.chatThreads = state.chatThreads.filter(t => state.contacts.some(c => String(c.id) === String(t.contactId)) || t.systemThread);
  if (!state.ui.activeChatId && state.chatThreads.length) state.ui.activeChatId = state.chatThreads[0].id;
}

function getActiveThread() {
  ensureV8State();
  return state.chatThreads.find(t => t.id === state.ui.activeChatId) || state.chatThreads[0] || null;
}

function contactByThread(thread) {
  if (!thread) return null;
  return state.contacts.find(c => String(c.id) === String(thread.contactId));
}

function internalNetworkActive() {
  return state.contacts.filter(c => c.status === 'Activo');
}

function dashboardShell(title, subtitle, content, actions = '') {
  ensureV8State();
  const unread = state.notifications.filter(n => n.unread).length;
  const chatUnread = state.chatThreads.reduce((sum, t) => sum + (Number(t.unread) || 0), 0);
  const p = plan();
  const path = currentPath();
  const initials = esc((state.user.name || 'IX').split(' ').map(x => x[0]).slice(0,2).join(''));
  const wearableClass = state.wearable.linked && state.wearable.connection === 'connected' ? 'success' : state.wearable.connection === 'syncing' ? 'warning' : 'danger';
  return `
    <div class="dashboard">
      <aside class="sidebar">
        <a href="#/dashboard/chats" class="brand"><span class="brand-mark">IX</span><span>Impact.X</span></a>
        <div class="side-group">
          <div class="side-label">Principal</div>
          ${sideLink('/dashboard/chats', '💬', `Chats internos ${chatUnread ? `(${chatUnread})` : ''}`, path)}
          ${sideLink('/dashboard/perfil', '👤', 'Perfil del conductor', path)}
          ${sideLink('/dashboard/wearable', '⌚', 'Wearable', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Seguridad</div>
          ${sideLink('/dashboard/contactos', '🧑‍🤝‍🧑', 'Personas de emergencia', path)}
          ${sideLink('/dashboard/red-monitoreo', '🛡️', 'Invitaciones internas', path)}
          ${sideLink('/dashboard/incidentes', '📍', 'Incidentes', path)}
          ${sideLink('/dashboard/alerta/501', '🚨', 'Alerta activa demo', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Cuenta</div>
          ${sideLink('/dashboard/suscripcion', '💳', 'Suscripción', path)}
          ${sideLink('/dashboard/notificaciones', '🔔', `Notificaciones ${unread ? `(${unread})` : ''}`, path)}
          ${sideLink('/dashboard/configuracion', '⚙️', 'Configuración', path)}
          ${sideLink('/dashboard/permisos', '🔐', 'Permisos web', path)}
          ${sideLink('/dashboard/ayuda', '❔', 'Ayuda', path)}
        </div>
        <div class="side-group">
          <button class="side-link" data-action="reset-demo">♻️ Reiniciar demo</button>
          <button class="side-link" data-action="logout">🚪 Cerrar sesión</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="topbar-left">
            <button class="btn small mobile-menu" data-action="toggle-sidebar">☰</button>
            <button class="badge ${wearableClass}" data-route="/dashboard/wearable"><span class="status-dot ${wearableClass}"></span>${state.wearable.linked ? state.wearable.connection === 'connected' ? 'Wearable conectado' : 'Wearable desconectado' : 'Sin wearable'}</button>
            <span class="badge primary hide-sm">Plan ${p.name}</span>
            <span class="badge info hide-sm">@${esc(state.user.username)}</span>
          </div>
          <div class="topbar-actions">
            <button class="btn small hide-sm" data-route="/dashboard/contactos/nuevo">+ Persona</button>
            <button class="btn small" data-route="/dashboard/chats">💬 ${chatUnread}</button>
            <button class="btn small" data-route="/dashboard/notificaciones">🔔 ${unread}</button>
            <button class="avatar" data-action="toggle-avatar-menu">${initials}</button>
            ${state.ui.avatarMenu ? avatarMenu() : ''}
          </div>
        </header>
        <div class="content">
          <div class="page-title">
            <div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div>
            <div class="page-actions">${actions}</div>
          </div>
          ${content}
        </div>
      </main>
    </div>
  `;
}

function avatarMenu() {
  return `<div class="avatar-menu"><button data-route="/dashboard/perfil">Ver perfil</button><button data-route="/dashboard/chats">Chats internos</button><button data-route="/dashboard/configuracion">Configuración</button><button data-action="logout">Cerrar sesión</button></div>`;
}

function renderRegister() {
  const query = currentPath().split('?')[1] || '';
  const planParam = new URLSearchParams(query).get('plan');
  const selected = PLAN_RULES[planParam] ? planParam : state.selectedPlan;
  const suggested = v8Slug(state.user.name || 'leonardo_impactx');
  return publicShell(`
    <section class="form-page">
      <div class="container">
        <div class="form-card wide">
          <span class="eyebrow">Cuenta titular</span>
          <h2>Crear cuenta Impact.X</h2>
          <p>Además de tus datos generales, ahora se crea un <strong>usuario único</strong> y un ID interno para chats e invitaciones dentro del aplicativo.</p>
          <form id="register-form" novalidate>
            <div class="form-grid">
              <div class="field"><label>Nombre completo</label><input name="name" value="${esc(state.user.name)}" required /></div>
              <div class="field"><label>Nombre de usuario único</label><input name="username" value="${esc(suggested)}" required /><small class="field-hint">Se usará para iniciar sesión, agregar personas e iniciar chats internos. Ejemplo: @leo_impactx</small></div>
              <div class="field"><label>Correo electrónico</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div>
              <div class="field"><label>Teléfono de referencia</label><input name="phone" value="${esc(state.user.phone)}" required /><small class="field-hint">Solo referencia del perfil; los mensajes del sistema son internos.</small></div>
              <div class="field"><label>Contraseña</label><input name="password" type="password" value="Impactx123" required /></div>
              <div class="field"><label>Confirmar contraseña</label><input name="confirm" type="password" value="Impactx123" required /></div>
              <div class="field field-full"><label>Plan inicial</label><select name="plan">${planOptions(selected)}</select></div>
            </div>
            <label class="checkbox-row"><input name="terms" type="checkbox" checked />Acepto términos y condiciones.</label>
            <label class="checkbox-row"><input name="privacy" type="checkbox" checked />Acepto aviso de privacidad y uso de chat interno para emergencias.</label>
            <div class="form-actions"><button class="btn primary" type="submit">Crear cuenta</button><button class="btn" type="button" data-route="/login">Ya tengo cuenta</button><button class="btn ghost" type="button" data-route="/planes">Ver planes</button></div>
          </form>
        </div>
      </div>
    </section>
  `);
}

function renderLogin() {
  ensureV8State();
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

function onboardingPersonal() {
  ensureV8State();
  return `
    <form id="onboarding-personal" novalidate>
      <div class="form-grid">
        <div class="field"><label>Nombre completo</label><input name="fullName" value="${esc(state.driver.fullName)}" required /></div>
        <div class="field"><label>Usuario Impact.X</label><input value="@${esc(state.user.username)}" disabled /><small class="field-hint">Se configuró al crear la cuenta. Puedes cambiarlo después desde Perfil si está disponible.</small></div>
        <div class="field"><label>ID único de perfil</label><div class="copy-field"><input value="${esc(state.user.profileId)}" disabled /><button class="btn small" type="button" data-action="copy-profile-id">Copiar</button></div></div>
        <div class="field"><label>Teléfono principal</label><input name="phone" value="${esc(state.user.phone)}" required /></div>
        <div class="field"><label>Correo electrónico</label><input value="${esc(state.user.email)}" disabled /></div>
        <div class="field"><label>Ciudad o zona habitual</label><input name="city" value="${esc(state.user.city)}" required /></div>
      </div>
      <div class="form-actions"><button class="btn warning" type="button" data-action="cancel-onboarding">Cancelar</button><button class="btn primary" type="submit">Siguiente</button></div>
    </form>
  `;
}

function onboardingContact() {
  return `
    <form id="onboarding-contact" novalidate>
      <div class="alert-box info"><div>💬</div><div><strong>Primera persona de emergencia interna</strong><p>Ya no se elige SMS, correo o WhatsApp. Todas las alertas y mensajes se envían por chat interno Impact.X.</p></div></div>
      <div class="form-grid">
        <div class="field"><label>Nombre de la persona</label><input name="name" value="" required /></div>
        <div class="field"><label>Parentesco o relación</label><input name="relation" value="" required /></div>
        <div class="field"><label>Usuario Impact.X de la persona</label><input name="username" value="" placeholder="ej. maria_segura" required /></div>
        <div class="field"><label>ID de perfil de la persona</label><input name="profileId" value="" placeholder="ej. IX-MARIA-8X2K" /></div>
        <div class="field"><label>Teléfono de referencia</label><input name="phone" value="" placeholder="Solo referencia, no se enviará SMS" /></div>
      </div>
      <div class="form-actions"><button class="btn" type="button" data-action="onboarding-prev">Atrás</button><button class="btn" type="button" data-action="onboarding-skip-contact">Omitir por ahora</button><button class="btn primary" type="submit">Agregar y continuar</button></div>
    </form>
  `;
}

function renderProfile() {
  ensureV8State();
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

function renderContacts() {
  ensureV8State();
  const p = plan();
  const q = (state.filters.contacts || '').toLowerCase();
  const status = state.filters.contactStatus;
  const filtered = state.contacts.filter(c => {
    const text = `${c.name} ${c.relation} ${c.phone} ${c.email} ${c.username} ${c.profileId}`.toLowerCase();
    return text.includes(q) && (status === 'todos' || c.status === status);
  });
  const body = state.contacts.length === 0 ? `
    <div class="empty-state"><h3>Aún no tienes personas agregadas</h3><p>Agrega una persona por usuario o ID de perfil para habilitar chat interno y alertas privadas.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Agregar persona</button></div>
  ` : `
    <div class="alert-box info"><div>💬</div><div><strong>Comunicación interna</strong><p>Se retiraron SMS, correo y WhatsApp como canales de alerta. Todas las personas se comunican mediante chat interno Impact.X.</p></div></div>
    <div class="searchbar">
      <input value="${esc(state.filters.contacts || '')}" data-filter="contacts" placeholder="Buscar por nombre, usuario, ID o teléfono" />
      <select data-filter="contactStatus"><option value="todos">Todos</option>${options(['Activo','Pendiente','Inactivo','Suspendido por plan'], status)}</select>
      <button class="btn" data-action="clear-contact-filters">Limpiar filtros</button>
    </div>
    ${planUsageAlert()}
    <div class="table-wrap"><table><thead><tr><th>Persona</th><th>Usuario / ID</th><th>Relación</th><th>Prioridad</th><th>Estado</th><th>Chat</th><th>Acciones</th></tr></thead><tbody>${filtered.map(contactRow).join('') || `<tr><td colspan="7">No hay resultados con esos filtros.</td></tr>`}</tbody></table></div>
  `;
  return dashboardShell('Personas de emergencia', `Plan ${p.name}: ${usableContacts().length}/${p.contactsLimit} personas activas permitidas.`, body, `<button class="btn primary" data-action="go-add-contact">+ Agregar persona</button><button class="btn" data-route="/dashboard/red-monitoreo">Invitaciones internas</button><button class="btn" data-route="/dashboard/chats">Abrir chats</button>`);
}

function contactRow(c) {
  const disabled = c.status === 'Suspendido por plan' || c.status === 'Inactivo';
  return `<tr>
    <td><strong>${esc(c.name)}</strong><br><span class="muted">${esc(c.phone || 'Sin teléfono de referencia')}</span></td>
    <td><span class="badge info">@${esc(c.username)}</span><br><button class="linklike" data-action="copy-contact-profile" data-id="${c.id}">${esc(c.profileId)}</button></td>
    <td>${esc(c.relation)}</td>
    <td><span class="badge ${c.priority === 'Principal' ? 'primary' : 'info'}">${esc(c.priority)}</span></td>
    <td><span class="badge ${contactStatusClass(c.status)}">${esc(c.status)}</span>${c.status === 'Suspendido por plan' ? '<br><span class="muted">No recibe mensajes ni alertas</span>' : ''}</td>
    <td><span class="badge ${disabled ? 'danger' : 'success'}">${disabled ? 'Pausado' : 'Chat interno'}</span></td>
    <td><div class="actions"><button class="btn small" data-route="/dashboard/contactos/${c.id}">Ver</button><button class="btn small" data-route="/dashboard/contactos/${c.id}/editar">Editar</button><button class="btn small" data-action="open-chat-contact" data-id="${c.id}">Chat</button><button class="btn small" data-action="invite-contact" data-id="${c.id}">Invitar</button><button class="btn small warning" data-action="make-primary" data-id="${c.id}">Principal</button><button class="btn small danger" data-action="delete-contact" data-id="${c.id}">Eliminar</button></div></td>
  </tr>`;
}

function renderContactForm(mode, id = null) {
  ensureV8State();
  const isEdit = mode === 'edit';
  const c = isEdit ? state.contacts.find(x => String(x.id) === String(id)) : { name: '', relation: '', phone: '', email: '', username: '', profileId: '', priority: 'Secundario', status: 'Activo', channel: 'Chat interno', notes: '' };
  if (!c) return renderNotFound();
  const content = `
    <form id="contact-form" data-mode="${mode}" data-id="${id || ''}" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>${isEdit ? 'Editar persona' : 'Agregar persona interna'}</h3>
          <div class="field"><label>Nombre completo</label><input name="name" value="${esc(c.name)}" required /></div>
          <div class="field"><label>Parentesco o relación</label><input name="relation" value="${esc(c.relation)}" required /></div>
          <div class="field"><label>Teléfono de referencia</label><input name="phone" value="${esc(c.phone)}" placeholder="No se usará para SMS" /></div>
          <div class="field"><label>Correo de referencia opcional</label><input name="email" type="email" value="${esc(c.email)}" placeholder="No se usará para alertas" /></div>
        </div>
        <div class="card"><h3>Identidad y acceso interno</h3>
          <div class="field"><label>Usuario Impact.X</label><input name="username" value="${esc(c.username)}" placeholder="ej. maria_segura" required /><small class="field-hint">Único para abrir chat interno e invitaciones.</small></div>
          <div class="field"><label>ID de perfil</label><input name="profileId" value="${esc(c.profileId)}" placeholder="Se genera si lo dejas vacío" /></div>
          <div class="field"><label>Prioridad</label><select name="priority">${options(['Principal','Secundario','Alternativo'], c.priority)}</select></div>
          <div class="field"><label>Estado</label><select name="status">${options(isEdit ? ['Activo','Pendiente','Inactivo','Suspendido por plan'] : ['Activo','Pendiente','Inactivo'], c.status)}</select></div>
          <div class="field"><label>Canal de comunicación</label><input value="Chat interno Impact.X" disabled /></div>
          <div class="field"><label>Notas</label><textarea name="notes">${esc(c.notes || '')}</textarea></div>
          ${!isEdit ? '<label class="checkbox-row"><input name="sendInvite" type="checkbox" />Guardar y generar invitación interna.</label>' : ''}
        </div>
      </div>
      <div class="form-actions"><button class="btn primary" type="submit">${isEdit ? 'Guardar cambios' : 'Guardar persona'}</button>${!isEdit ? '<button class="btn" type="button" data-action="save-contact-invite">Guardar e invitar</button>' : ''}<button class="btn" type="button" data-action="cancel-contact-form">Cancelar</button>${isEdit ? '<button class="btn danger" type="button" data-action="delete-contact" data-id="' + c.id + '">Eliminar persona</button>' : ''}</div>
    </form>
  `;
  return dashboardShell(isEdit ? 'Editar persona' : 'Agregar persona', isEdit ? 'Modifica identidad interna, prioridad y estado.' : 'Agrega una persona por usuario/ID para chat interno y alertas.', content);
}

function renderContactDetail(id) {
  ensureV8State();
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return renderNotFound();
  const monitor = c.monitorId ? state.monitors.find(m => m.id === c.monitorId) : null;
  const notifiedIn = state.incidents.filter(i => i.notified.includes(c.name));
  const content = `
    <div class="detail-grid">
      <div class="card"><h3>${esc(c.name)}</h3><p>@${esc(c.username)} · ${esc(c.profileId)}</p><div class="divider"></div>${infoRows({'Teléfono ref.': c.phone || 'Sin teléfono', 'Correo ref.': c.email || 'Sin correo', Prioridad: c.priority, Estado: c.status, Canal: 'Chat interno Impact.X', Creado: c.createdAt, Invitación: monitor ? monitor.status : 'No asociada'})}<div class="card-actions"><button class="btn primary" data-action="open-chat-contact" data-id="${c.id}">Abrir chat</button><button class="btn" data-route="/dashboard/contactos/${c.id}/editar">Editar</button><button class="btn" data-action="invite-contact" data-id="${c.id}">Generar invitación</button><button class="btn danger" data-action="delete-contact" data-id="${c.id}">Eliminar</button><button class="btn" data-route="/dashboard/contactos">Volver</button></div></div>
      <div class="card"><h3>Historial de alertas internas</h3>${notifiedIn.length ? `<div class="list">${notifiedIn.map(i => `<div class="list-item"><div><h4>${esc(i.type)}</h4><p>${esc(i.date)} ${esc(i.time)} · ${esc(i.status)}</p></div><button class="btn small" data-route="/dashboard/incidentes/${i.id}">Ver</button></div>`).join('')}</div>` : '<div class="empty-state"><h3>Sin alertas</h3><p>Esta persona todavía no ha recibido alertas internas.</p></div>'}</div>
    </div>
  `;
  return dashboardShell('Detalle de persona', 'Información completa, identidad interna e historial de mensajes/alertas.', content);
}

function renderMonitorNetwork() {
  ensureV8State();
  const status = state.filters.monitorStatus || 'todos';
  const filtered = state.monitors.filter(m => status === 'todos' || m.status === status);
  const rows = filtered.map(monitorRow).join('');
  const counts = ['Activo', 'Pendiente', 'Expirado', 'Revocado'].reduce((acc, key) => {
    acc[key] = state.monitors.filter(m => m.status === key).length;
    return acc;
  }, {});
  const content = `
    <div class="alert-box info"><div>🛡️</div><div><strong>Invitaciones internas</strong><p>Las personas se agregan por usuario o ID de perfil. Ya no se envían enlaces por WhatsApp, SMS o correo; la simulación usa tokens e invitaciones dentro del aplicativo.</p></div></div>
    <div class="grid grid-4">
      <div class="card stat-card"><h3>Activos</h3><div class="stat-value">${counts.Activo || 0}</div><p class="stat-desc">Reciben chat, SOS y ubicación.</p></div>
      <div class="card stat-card"><h3>Pendientes</h3><div class="stat-value">${counts.Pendiente || 0}</div><p class="stat-desc">Invitaciones no aceptadas.</p></div>
      <div class="card stat-card"><h3>Expirados</h3><div class="stat-value">${counts.Expirado || 0}</div><p class="stat-desc">Requieren restaurar token.</p></div>
      <div class="card stat-card"><h3>Revocados</h3><div class="stat-value">${counts.Revocado || 0}</div><p class="stat-desc">Acceso retirado.</p></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-head compact"><div><h3>Personas invitadas</h3><p>Revoca, devuelve acceso, activa en modo demo y abre chats internos.</p></div></div>
      <div class="searchbar"><select data-filter="monitorStatus"><option value="todos">Todos los estados</option>${options(['Activo','Pendiente','Expirado','Revocado'], status)}</select><button class="btn" data-action="clear-monitor-filters">Limpiar filtro</button></div>
      <div class="table-wrap"><table><thead><tr><th>Persona</th><th>Usuario / ID</th><th>Estado</th><th>Invitado</th><th>Expira</th><th>Acciones</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Sin invitaciones para este filtro.</td></tr>'}</tbody></table></div>
    </div>
  `;
  return dashboardShell('Invitaciones internas', 'Gestión de personas asociadas por usuario/ID y chat interno.', content, `<button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Nueva invitación</button><button class="btn" data-route="/dashboard/contactos">Personas</button><button class="btn" data-route="/dashboard/chats">Chats</button>`);
}

function monitorActionButtons(m) {
  const relatedContact = state.contacts.find(c => String(c.monitorId) === String(m.id) || String(c.id) === String(m.contactId));
  const chatButton = relatedContact ? `<button class="btn small" data-action="open-chat-contact" data-id="${relatedContact.id}">Chat</button>` : '';
  const common = `<button class="btn small" data-route="/dashboard/red-monitoreo/${m.id}">Ver</button><button class="btn small" data-action="copy-invite" data-id="${m.id}">Copiar token</button>${chatButton}`;
  if (m.status === 'Activo') return `${common}<button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>`;
  if (m.status === 'Pendiente') return `${common}<button class="btn small success" data-action="activate-monitor" data-id="${m.id}">Aceptar demo</button><button class="btn small" data-action="resend-invite" data-id="${m.id}">Reenviar interno</button><button class="btn small warning" data-action="expire-monitor" data-id="${m.id}">Expirar</button><button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>`;
  if (m.status === 'Expirado') return `${common}<button class="btn small success" data-action="restore-monitor" data-id="${m.id}">Restaurar</button><button class="btn small" data-action="resend-invite" data-id="${m.id}">Nuevo token</button><button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>`;
  if (m.status === 'Revocado') return `${common}<button class="btn small success" data-action="restore-monitor" data-id="${m.id}">Devolver acceso</button>`;
  return common;
}

function monitorRow(m) {
  return `<tr><td><strong>${esc(m.name)}</strong><br><span class="muted">${esc(m.phone || 'Sin teléfono ref.')}</span><br><span class="muted">${esc(monitorStatusDescription(m.status))}</span></td><td><span class="badge info">@${esc(m.username)}</span><br><span class="muted">${esc(m.profileId)}</span></td><td><span class="badge ${monitorStatusClass(m.status)}">${esc(m.status)}</span></td><td>${esc(m.invitedAt)}</td><td>${esc(m.expiresAt)}</td><td><div class="actions">${monitorActionButtons(m)}</div></td></tr>`;
}

function renderNewInvitation() {
  ensureV8State();
  const query = currentPath().split('?')[1] || '';
  const contactId = new URLSearchParams(query).get('contacto');
  const selectedContact = state.contacts.find(c => String(c.id) === String(contactId));
  const content = `
    <form id="invite-form" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>Persona a invitar</h3>
          <div class="field"><label>Seleccionar persona existente</label><select name="contactId"><option value="">Capturar nueva persona</option>${state.contacts.map(c => `<option value="${c.id}" ${selectedContact?.id === c.id ? 'selected' : ''}>${esc(c.name)} · @${esc(c.username)}</option>`).join('')}</select></div>
          <div class="field"><label>Nombre</label><input name="name" value="${esc(selectedContact?.name || '')}" required /></div>
          <div class="field"><label>Usuario Impact.X</label><input name="username" value="${esc(selectedContact?.username || '')}" placeholder="ej. andrea_monitor" required /></div>
          <div class="field"><label>ID de perfil</label><input name="profileId" value="${esc(selectedContact?.profileId || '')}" placeholder="Se genera si se deja vacío" /></div>
          <div class="field"><label>Teléfono de referencia</label><input name="phone" value="${esc(selectedContact?.phone || '')}" /></div>
        </div>
        <div class="card"><h3>Permisos internos</h3>
          <div class="field"><label>Expiración del token interno</label><select name="expires">${options(['24 horas','48 horas','7 días'], '7 días')}</select></div>
          <label class="checkbox-row"><input name="canViewLocation" type="checkbox" checked />Permitir ver ubicación del incidente.</label>
          <label class="checkbox-row"><input name="canReceiveUpdates" type="checkbox" checked />Permitir recibir actualizaciones por chat interno.</label>
          <label class="checkbox-row"><input name="canReply" type="checkbox" checked />Permitir responder en chats internos.</label>
          <div class="alert-box info"><div>💬</div><div><strong>Sin canales externos</strong><p>La invitación queda registrada dentro de la red Impact.X. Puedes copiar el token o abrir la vista pública simulada.</p></div></div>
        </div>
      </div>
      ${state.drafts.inviteUrl ? `<div class="card" style="margin-top:16px"><h3>Invitación interna generada</h3><div class="code-box">${esc(state.drafts.inviteUrl)}</div><div class="card-actions"><button class="btn" type="button" data-action="copy-last-invite">Copiar token/ruta</button><button class="btn" type="button" data-action="open-last-invite">Abrir vista pública</button><button class="btn primary" type="button" data-route="/dashboard/red-monitoreo">Finalizar</button></div></div>` : ''}
      <div class="form-actions"><button class="btn primary" type="submit">Generar invitación interna</button><button class="btn" type="button" data-route="/dashboard/red-monitoreo">Cancelar</button></div>
    </form>
  `;
  return dashboardShell('Nueva invitación interna', 'Asocia personas por usuario/ID para chat, SOS y ubicación dentro del aplicativo.', content);
}

function renderMonitorDetail(id) {
  ensureV8State();
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return renderNotFound();
  const url = `${location.origin}${location.pathname}#/invitacion/${m.token}`;
  const relatedContact = state.contacts.find(c => String(c.monitorId) === String(m.id) || String(c.id) === String(m.contactId));
  const content = `
    <div class="detail-grid">
      <div class="card"><h3>${esc(m.name)}</h3><p>@${esc(m.username)} · ${esc(m.profileId)}</p><div class="divider"></div>${infoRows({Estado: m.status, Descripción: monitorStatusDescription(m.status), Invitado: m.invitedAt, Aceptado: m.acceptedAt || 'Pendiente', Expira: m.expiresAt, Token: m.token, Canal: 'Chat interno'})}<div class="card-actions">${monitorActionButtons(m)}${relatedContact ? `<button class="btn primary" data-action="open-chat-contact" data-id="${relatedContact.id}">Abrir chat</button>` : ''}<button class="btn" data-route="/dashboard/red-monitoreo">Volver</button></div></div>
      <div class="card"><h3>Ruta pública simulada</h3><div class="code-box">${esc(url)}</div><div class="divider"></div><h3>Permisos</h3><ul class="features">${m.permissions.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
    </div>
  `;
  return dashboardShell('Detalle de invitación', 'Estado, permisos y token interno de la persona asociada.', content);
}

function renderAcceptInvite(token) {
  ensureV8State();
  const m = state.monitors.find(x => x.token === token);
  if (!m) return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Invitación inválida</span><h2>La invitación no es válida</h2><p>Solicita al titular una nueva invitación interna.</p><button class="btn" data-route="/">Volver al inicio</button></div></div></section>`);
  if (m.status === 'Activo') return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Ya aceptada</span><h2>Esta invitación ya fue aceptada</h2><p>${esc(m.name)} ya forma parte de la red interna.</p><button class="btn primary" data-route="/">Entendido</button></div></div></section>`);
  if (['Expirado', 'Revocado'].includes(m.status)) return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Invitación no disponible</span><h2>La invitación está ${esc(m.status.toLowerCase())}</h2><p>Solicita una nueva invitación al titular.</p><button class="btn" data-route="/">Volver</button></div></div></section>`);
  return publicShell(`
    <section class="form-page"><div class="container"><div class="form-card">
      <span class="eyebrow">Invitación interna</span>
      <h2>Únete a la red de ${esc(state.user.name)}</h2>
      <p>Recibirás alertas privadas y podrás responder por chat interno si se detecta un incidente.</p>
      <form id="accept-invite-form" data-token="${esc(token)}" novalidate>
        <div class="field"><label>Nombre completo</label><input name="name" value="${esc(m.name)}" required /></div>
        <div class="field"><label>Usuario Impact.X</label><input name="username" value="${esc(m.username)}" required /></div>
        <div class="field"><label>ID de perfil</label><input name="profileId" value="${esc(m.profileId)}" /></div>
        <div class="field"><label>Teléfono de referencia</label><input name="phone" value="${esc(m.phone || '')}" /></div>
        <label class="checkbox-row"><input name="accept" type="checkbox" checked />Acepto recibir mensajes internos, SOS y ubicación solo durante incidentes.</label>
        <div class="form-actions"><button class="btn primary" type="submit">Aceptar invitación</button><button class="btn" type="button" data-action="reject-invite" data-token="${esc(token)}">Rechazar</button></div>
      </form>
    </div></div></section>
  `);
}

function renderChats() {
  ensureV8State();
  const q = (state.filters.chatSearch || '').toLowerCase();
  const threads = state.chatThreads.filter(t => `${t.title} ${t.username} ${t.profileId}`.toLowerCase().includes(q));
  const active = getActiveThread();
  const contact = contactByThread(active);
  const canSend = contact && contact.status === 'Activo';
  const sidebar = `
    <div class="chat-sidebar card">
      <div class="section-head compact"><div><h3>Conversaciones</h3><p>${state.chatThreads.length} chats internos</p></div><button class="btn small" data-route="/dashboard/contactos/nuevo">+ Persona</button></div>
      <input class="chat-search" value="${esc(state.filters.chatSearch || '')}" data-filter="chatSearch" placeholder="Buscar chat, usuario o ID" />
      <div class="chat-list">${threads.map(t => {
        const c = contactByThread(t);
        return `<button class="chat-thread ${active?.id === t.id ? 'active' : ''}" data-action="select-chat" data-id="${t.id}"><strong>${esc(t.title)}</strong><span>@${esc(t.username)} · ${esc(c?.status || 'Sin estado')}</span>${t.unread ? `<em>${t.unread}</em>` : ''}</button>`;
      }).join('') || '<div class="empty-state compact"><h3>Sin chats</h3><p>Agrega personas para crear conversaciones internas.</p></div>'}</div>
    </div>`;
  const panel = active ? `
    <div class="chat-panel card">
      <div class="chat-header">
        <div><h3>${esc(active.title)}</h3><p>@${esc(active.username)} · ${esc(active.profileId)} · ${esc(contact?.status || 'Sin persona')}</p></div>
        <div class="actions"><button class="btn small" data-route="/dashboard/contactos/${contact?.id || ''}">Ver persona</button><button class="btn small" data-action="simulate-reply">Simular respuesta</button></div>
      </div>
      ${!canSend ? `<div class="alert-box warning"><div>⚠️</div><div><strong>Chat limitado</strong><p>Esta persona está ${esc(contact?.status || 'no disponible')}. Para enviar mensajes debe estar activa y dentro del límite del plan.</p></div></div>` : ''}
      <div class="quick-messages">${V8_QUICK_MESSAGES.map(msg => `<button class="chip" data-action="send-quick-message" data-message="${esc(msg)}" ${canSend ? '' : 'disabled'}>${esc(msg)}</button>`).join('')}</div>
      <div class="messages">${active.messages.map(m => `<div class="message ${esc(m.from)}"><span>${esc(m.text)}</span><small>${esc(m.time || '')}</small></div>`).join('')}</div>
      <form id="chat-form" class="chat-compose" novalidate>
        <input name="message" placeholder="Escribe un mensaje interno..." ${canSend ? '' : 'disabled'} required />
        <button class="btn primary" type="submit" ${canSend ? '' : 'disabled'}>Enviar</button>
      </form>
    </div>` : `
    <div class="chat-panel card"><div class="empty-state"><h3>Sin conversaciones</h3><p>Agrega personas de emergencia para iniciar chats internos.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Agregar persona</button></div></div>`;
  const content = `
    <div class="alert-box info"><div>💬</div><div><strong>Chat interno Impact.X</strong><p>Este es el canal único para mensajes, alertas, ubicación y respuestas simuladas. No se usa SMS, correo ni WhatsApp.</p></div></div>
    <div class="chat-layout">${sidebar}${panel}</div>
  `;
  return dashboardShell('Chats internos', 'Centro de comunicación privada para emergencias, contactos y monitores.', content, `<button class="btn primary" data-action="broadcast-accident">Enviar alerta a red activa</button><button class="btn" data-route="/dashboard/contactos">Gestionar personas</button>`);
}

function renderActiveAlert(id) {
  ensureV8State();
  const incident = state.incidents.find(i => String(i.id) === String(id)) || state.incidents[0];
  if (!incident) return renderNotFound();
  const medical = state.driver.shareMedicalInfo ? `<div class="card"><h3>Ficha médica visible</h3>${infoRows({'Tipo de sangre': state.driver.bloodType, Padecimiento: state.driver.hasMedicalCondition, Condiciones: state.driver.medicalConditions, Alergias: state.driver.allergies, Medicamentos: state.driver.medications, Notas: state.driver.emergencyNotes})}</div>` : `<div class="card"><h3>Ficha médica</h3><p>El usuario no autorizó compartir ficha médica en alertas.</p></div>`;
  const activePeople = internalNetworkActive();
  const content = `
    <div class="alert-banner danger"><div><strong>🚨 Alerta de emergencia activa</strong><p>La ubicación, datos médicos autorizados y mensajes se comparten por chat interno Impact.X.</p></div><button class="btn light" data-action="mark-alert-attended" data-id="${incident.id}">Marcar atendida</button></div>
    <div class="grid grid-3">
      <div class="card stat-card"><h3>Conductor</h3><div class="stat-value small-text">${esc(state.driver.fullName)}</div><p>@${esc(state.user.username)} · ${esc(state.user.profileId)}</p></div>
      <div class="card stat-card"><h3>Severidad</h3><div class="stat-value">${esc(incident.severity)}</div><p>${esc(incident.type)} · ${esc(incident.time)}</p></div>
      <div class="card stat-card"><h3>Red interna notificada</h3><div class="stat-value">${activePeople.length}</div><p>Personas activas dentro del límite del plan.</p></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>Ubicación del incidente</h3><div class="map-mock"><div>📍 ${esc(incident.location)}</div><small>${esc(incident.coords)}</small></div><div class="card-actions"><button class="btn" data-action="send-alert-message" data-message="Comparto mi ubicación">Enviar ubicación por chat</button><button class="btn" data-route="/dashboard/chats">Abrir chats</button><button class="btn" data-action="open-external-map" data-id="${incident.id}">Abrir mapa externo</button></div></div>
      ${medical}
    </div>
    <div class="card" style="margin-top:16px"><h3>Mensajes rápidos para emergencia</h3><div class="quick-messages">${V8_QUICK_MESSAGES.slice(0,7).map(msg => `<button class="chip" data-action="send-alert-message" data-message="${esc(msg)}">${esc(msg)}</button>`).join('')}</div></div>
  `;
  return dashboardShell('Alerta activa', 'Vista operativa de emergencia con chat interno, ubicación y ficha médica.', content);
}

function renderSettings() {
  ensureV8State();
  const content = `
    <form id="settings-form" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>Cuenta</h3><div class="field"><label>Nombre</label><input name="name" value="${esc(state.user.name)}" required /></div><div class="field"><label>Usuario</label><input name="username" value="${esc(state.user.username)}" required /></div><div class="field"><label>Correo</label><input name="email" type="email" value="${esc(state.user.email)}" required /></div><div class="field"><label>Teléfono de referencia</label><input name="phone" value="${esc(state.user.phone)}" required /></div><label class="checkbox-row"><input name="twoFactor" type="checkbox" ${state.user.twoFactor ? 'checked' : ''}/>Activar verificación en dos pasos.</label><button class="btn primary" type="submit">Guardar cuenta</button></div>
        <div class="card"><h3>Seguridad</h3><div class="field"><label>Contraseña actual</label><input type="password" value="Impactx123" /></div><div class="field"><label>Nueva contraseña</label><input name="newPassword" type="password" /></div><div class="field"><label>Confirmar nueva contraseña</label><input name="confirmPassword" type="password" /></div><div class="card-actions"><button class="btn" type="button" data-action="change-password">Cambiar contraseña</button><button class="btn" type="button" data-action="close-sessions">Cerrar sesiones activas</button></div></div>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><h3>Preferencias internas</h3><div class="field"><label>Idioma</label><select name="language">${options(['Español','English'], state.user.language)}</select></div><div class="field"><label>Zona horaria</label><input name="timezone" value="${esc(state.user.timezone)}" /></div><label class="checkbox-row"><input name="notifyInternal" type="checkbox" checked />Recibir notificaciones dentro del aplicativo.</label><label class="checkbox-row muted"><input type="checkbox" disabled />SMS desactivado por diseño.</label><label class="checkbox-row muted"><input type="checkbox" disabled />WhatsApp desactivado por diseño.</label><label class="checkbox-row muted"><input type="checkbox" disabled />Correo como canal de emergencia desactivado.</label><button class="btn" type="button" data-action="save-preferences">Guardar preferencias</button></div>
        <div class="card"><h3>Privacidad</h3><p>Administra descarga y eliminación de datos simulados.</p><div class="card-actions"><button class="btn" type="button" data-action="download-data">Descargar mis datos</button><button class="btn danger" type="button" data-action="delete-account">Eliminar cuenta</button></div></div>
      </div>
    </form>
  `;
  return dashboardShell('Configuración', 'Cuenta, seguridad, preferencias internas y privacidad.', content);
}

function renderPermissions(privateMode = true) {
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
  return privateMode ? dashboardShell('Permisos web', 'Permisos para mapas, alertas, chat interno y persistencia local.', content) : publicShell(`<section class="form-page"><div class="container"><div class="form-card wide"><span class="eyebrow">Permisos</span><h2>Configurar permisos web</h2>${content}</div></div></section>`);
}

function renderWearable() {
  const w = state.wearable;
  const labels = { accelerometer: 'Acelerómetro', microphone: 'Micrófono', heartRate: 'Frecuencia cardíaca', gps: 'GPS', background: 'Servicio en segundo plano', internalBridge: 'Puente de chat interno móvil' };
  const permissions = Object.entries(w.permissions).filter(([k]) => k !== 'smsBridge').map(([k, v]) => `<div class="list-item"><div><h4>${labels[k] || k}</h4><p>${v ? 'Permiso activo y funcional.' : 'Permiso pendiente o bloqueado.'}</p></div><span class="badge ${v ? 'success' : 'danger'}">${v ? 'Activo' : 'Pendiente'}</span></div>`).join('');
  const content = !w.linked ? `<div class="empty-state"><h3>Sin wearable vinculado</h3><p>Vincula un smartwatch desde la app móvil para activar la protección.</p><button class="btn primary" data-action="show-pairing-guide">Ver instrucciones</button></div>` : `
    <div class="grid grid-3">
      <div class="card stat-card"><div class="stat-top"><h3>Dispositivo</h3>${wearableBadge()}</div><div class="stat-value">${esc(w.model)}</div><div class="stat-desc">Versión ${esc(w.appVersion)} · ${esc(w.lastSync)}</div><div class="card-actions"><button class="btn small" data-action="sync-wearable">Sincronizar ahora</button><button class="btn small" data-action="show-pairing-guide">Instrucciones</button></div></div>
      <div class="card stat-card"><div class="stat-top"><h3>Batería</h3><span class="badge ${w.battery > 25 ? 'success' : 'warning'}">${w.battery > 25 ? 'Correcta' : 'Baja'}</span></div><div class="stat-value">${w.battery}%</div><div class="progress"><span style="width:${w.battery}%"></span></div><div class="card-actions"><button class="btn small" data-action="simulate-low-battery">Simular batería baja</button></div></div>
      <div class="card stat-card"><div class="stat-top"><h3>Conexión</h3><span class="badge ${w.connection === 'connected' ? 'success' : 'danger'}">${w.connection === 'connected' ? 'Online' : 'Offline'}</span></div><div class="stat-value">${w.connection === 'connected' ? 'OK' : 'OFF'}</div><div class="stat-desc">La protección depende del reloj, app móvil y chat interno.</div><div class="card-actions"><button class="btn small" data-action="toggle-wearable-connection">Cambiar estado</button></div></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px"><div class="card"><h3>Permisos y sensores</h3><div class="list">${permissions}</div></div><div class="card"><h3>Acciones de dispositivo</h3><p>Opciones simuladas para maqueta.</p><div class="card-actions"><button class="btn" data-action="show-pairing-guide">Ver guía de vinculación</button><button class="btn warning" data-action="toggle-wearable-connection">Simular desconexión/conexión</button><button class="btn danger" data-action="unlink-wearable">Desvincular dispositivo</button><button class="btn" data-route="/dashboard/ayuda?tema=wearable">Ir a ayuda</button></div></div></div>`;
  return dashboardShell('Estado del wearable', 'Estado de conexión, batería, sensores, permisos y chat interno.', content);
}

function renderHelpContent(tab) {
  if (tab === 'chat') return `<h3>Chat interno</h3><p>El sistema usa mensajes dentro del aplicativo para alertas, ubicación y respuestas rápidas. SMS, correo y WhatsApp ya no aparecen como canales de emergencia.</p><button class="btn primary" data-route="/dashboard/chats">Abrir chats</button>`;
  if (tab === 'wearable') return `<h3>Vincular wearable</h3><p>Abre la app móvil, activa Bluetooth, concede sensores y confirma que el chat interno móvil quede activo.</p><button class="btn primary" data-action="show-pairing-guide">Ver guía</button>`;
  if (tab === 'contactos') return `<h3>Personas de emergencia</h3><p>Agrega personas por usuario Impact.X o ID de perfil. El límite depende del plan contratado.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Agregar persona</button>`;
  if (tab === 'monitores') return `<h3>Invitaciones internas</h3><p>Genera tokens internos para que familiares acepten ser parte de tu red. Puedes revocar y devolver acceso.</p><button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Generar invitación</button>`;
  if (tab === 'planes') return `<h3>Planes</h3><p>Trial tiene 2 personas, Básico 3 y Premium 8 con mapas, reportes y bypass crítico.</p><button class="btn primary" data-route="/dashboard/suscripcion">Ver suscripción</button>`;
  if (tab === 'incidentes') return `<h3>Incidentes</h3><p>El historial muestra eventos, mapa y telemetría. Algunas funciones avanzadas se bloquean si no hay Premium.</p><button class="btn primary" data-route="/dashboard/incidentes">Ver incidentes</button>`;
  return `<h3>Contactar soporte</h3><form id="support-form"><div class="field"><label>Asunto</label><input name="subject" required /></div><div class="field"><label>Tipo de problema</label><select name="type">${options(['Wearable','Personas','Chat interno','Pago','Incidente','Otro'], 'Chat interno')}</select></div><div class="field"><label>Descripción</label><textarea name="description" required></textarea></div><div class="form-actions"><button class="btn primary" type="submit">Enviar solicitud</button><button class="btn" type="button" data-route="/dashboard/chats">Cancelar</button></div></form>`;
}

function route() {
  ensureV8State();
  saveState();
  const path = currentPath();
  document.body.classList.toggle('sidebar-open', state.ui.sidebarOpen);
  if (path === '/') app.innerHTML = renderLanding();
  else if (path.startsWith('/planes')) app.innerHTML = renderPlans(true);
  else if (path.startsWith('/registro')) app.innerHTML = renderRegister();
  else if (path === '/login') app.innerHTML = renderLogin();
  else if (path === '/recuperar-password') app.innerHTML = renderRecover();
  else if (path.startsWith('/invitacion/')) app.innerHTML = renderAcceptInvite(path.split('/')[2]);
  else if (path === '/permisos') app.innerHTML = renderPermissions(false);
  else if (path === '/onboarding') app.innerHTML = renderOnboarding();
  else if (path === '/dashboard' || path === '/dashboard/overview' || path === '/dashboard/metricas' || path === '/dashboard/chats') app.innerHTML = renderChats();
  else if (/^\/dashboard\/chats\/contact-\d+$/.test(path)) { state.ui.activeChatId = path.split('/')[3]; app.innerHTML = renderChats(); }
  else if (path === '/dashboard/perfil') app.innerHTML = renderProfile();
  else if (path === '/dashboard/wearable') app.innerHTML = renderWearable();
  else if (path === '/dashboard/contactos') app.innerHTML = renderContacts();
  else if (path === '/dashboard/contactos/nuevo') app.innerHTML = renderContactForm('new');
  else if (/^\/dashboard\/contactos\/\d+\/editar$/.test(path)) app.innerHTML = renderContactForm('edit', path.split('/')[3]);
  else if (/^\/dashboard\/contactos\/\d+$/.test(path)) app.innerHTML = renderContactDetail(path.split('/')[3]);
  else if (path === '/dashboard/red-monitoreo') app.innerHTML = renderMonitorNetwork();
  else if (path.startsWith('/dashboard/red-monitoreo/nueva-invitacion')) app.innerHTML = renderNewInvitation();
  else if (/^\/dashboard\/red-monitoreo\/\d+$/.test(path)) app.innerHTML = renderMonitorDetail(path.split('/')[3]);
  else if (path === '/dashboard/suscripcion') app.innerHTML = renderSubscription();
  else if (path.startsWith('/dashboard/suscripcion/cambiar-plan/')) app.innerHTML = renderChangePlan(path.split('/')[4]);
  else if (path === '/dashboard/suscripcion/pagos') app.innerHTML = renderPayments();
  else if (path.startsWith('/dashboard/suscripcion/pago')) app.innerHTML = renderPayment();
  else if (path === '/dashboard/incidentes') app.innerHTML = renderIncidents();
  else if (/^\/dashboard\/incidentes\/\d+$/.test(path)) app.innerHTML = renderIncidentDetail(path.split('/')[3]);
  else if (/^\/dashboard\/alerta\/\d+$/.test(path)) app.innerHTML = renderActiveAlert(path.split('/')[3]);
  else if (path === '/dashboard/notificaciones') app.innerHTML = renderNotifications();
  else if (path === '/dashboard/configuracion') app.innerHTML = renderSettings();
  else if (path === '/dashboard/permisos') app.innerHTML = renderPermissions(true);
  else if (path.startsWith('/dashboard/ayuda')) app.innerHTML = renderHelp();
  else if (path === '/dashboard/suscripcion-vencida') app.innerHTML = renderSubscriptionExpired();
  else if (path === '/dashboard/error-conexion') app.innerHTML = renderConnectionError();
  else app.innerHTML = renderNotFound();
  attachHandlers();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderNotFound() {
  const isPrivate = currentPath().startsWith('/dashboard');
  const content = `<div class="empty-state"><h3>Página no encontrada</h3><p>La ruta solicitada no existe dentro del prototipo.</p><button class="btn primary" data-route="${isPrivate ? '/dashboard/chats' : '/'}">${isPrivate ? 'Ir a chats internos' : 'Volver al inicio'}</button></div>`;
  return isPrivate ? dashboardShell('Error 404', 'Ruta inexistente.', content) : publicShell(`<section class="form-page"><div class="container">${content}</div></section>`);
}

function renderConnectionError() {
  const content = `<div class="empty-state"><h3>Error de conexión</h3><p>No pudimos conectar con el servidor. Este prototipo simula el error y permite reintentar.</p><button class="btn primary" data-action="retry-connection">Reintentar</button><button class="btn" data-route="/dashboard/chats">Ir a chats</button></div>`;
  return dashboardShell('Error de conexión', 'Estado visual para fallas de backend o red.', content);
}

function handleAction(event, action, el) {
  event.preventDefault();
  ensureV8State();
  const id = el.dataset.id;
  const planKey = el.dataset.plan;
  const token = el.dataset.token;
  const tab = el.dataset.tab;
  const message = el.dataset.message;
  switch (action) {
    case 'scroll-how': document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' }); break;
    case 'choose-plan': choosePlan(planKey); break;
    case 'toggle-avatar-menu': state.ui.avatarMenu = !state.ui.avatarMenu; renderSame(); break;
    case 'toggle-sidebar': setSidebarOpen(!state.ui.sidebarOpen); break;
    case 'logout': logout(); break;
    case 'reset-demo': resetDemo(); break;
    case 'cancel-onboarding': cancelOnboarding(); break;
    case 'onboarding-prev': state.onboardingStep = Math.max(1, state.onboardingStep - 1); route(); break;
    case 'onboarding-skip-contact': state.onboardingStep = 5; toast('Persona omitida', 'Puedes agregarla después desde Personas de emergencia.'); route(); break;
    case 'onboarding-edit': state.onboardingStep = 1; route(); break;
    case 'finish-onboarding': state.user.onboardingComplete = true; state.isLoggedIn = true; toast('Configuración completa', 'Bienvenido a chats internos.'); navigate('/dashboard/chats'); break;
    case 'sync-wearable': syncWearable(); break;
    case 'show-pairing-guide': pairingGuide(); break;
    case 'simulate-low-battery': state.wearable.battery = 12; addNotification('Batería baja', 'Tu wearable tiene 12% de batería.', 'wearable'); toast('Batería baja simulada'); route(); break;
    case 'toggle-wearable-connection': state.wearable.connection = state.wearable.connection === 'connected' ? 'disconnected' : 'connected'; toast('Estado cambiado', `Wearable ${state.wearable.connection === 'connected' ? 'conectado' : 'desconectado'}.`); route(); break;
    case 'unlink-wearable': unlinkWearable(); break;
    case 'go-add-contact': goAddContact(); break;
    case 'clear-contact-filters': state.filters.contacts = ''; state.filters.contactStatus = 'todos'; route(); break;
    case 'clear-incident-filters': state.filters.incidents = ''; state.filters.severity = 'todos'; state.filters.incidentStatus = 'todos'; route(); break;
    case 'save-contact-invite': saveContactFromForm(true); break;
    case 'cancel-contact-form': cancelContactForm(); break;
    case 'delete-contact': deleteContact(id); break;
    case 'make-primary': makePrimary(id); break;
    case 'invite-contact': navigate(`/dashboard/red-monitoreo/nueva-invitacion?contacto=${id}`); break;
    case 'copy-invite': copyInvite(id); break;
    case 'copy-last-invite': copyText(state.drafts.inviteUrl, 'Token/ruta copiado'); break;
    case 'open-last-invite': navigate(new URL(state.drafts.inviteUrl).hash.replace('#', '')); break;
    case 'send-whatsapp': openChatFromMonitor(id); break;
    case 'resend-invite': resendInvite(id); break;
    case 'revoke-monitor': revokeMonitor(id); break;
    case 'restore-monitor': restoreMonitor(id); break;
    case 'activate-monitor': activateMonitor(id); break;
    case 'expire-monitor': expireMonitor(id); break;
    case 'clear-monitor-filters': state.filters.monitorStatus = 'todos'; route(); break;
    case 'reject-invite': rejectInvite(token); break;
    case 'confirm-plan-change': confirmPlanChange(planKey); break;
    case 'expire-subscription': expireSubscription(); break;
    case 'cancel-subscription': cancelSubscription(); break;
    case 'download-payment': toast('Comprobante simulado', 'Se generaría un PDF de pago.'); break;
    case 'export-incidents': exportIncidents(); break;
    case 'view-incident-map': if (plan().maps) navigate(`/dashboard/incidentes/${id}`); else premiumBlocked('El mapa de incidentes'); break;
    case 'download-report': downloadReport(id); break;
    case 'open-external-map': openExternalMap(id); break;
    case 'mark-false-alarm': markFalseAlarm(id); break;
    case 'add-incident-note': addIncidentNote(id); break;
    case 'simulate-critical-incident': simulateCriticalIncident(); break;
    case 'simulate-dashboard-day': simulateDashboardDay(); break;
    case 'export-dashboard': exportDashboardSummary(); break;
    case 'call-primary-contact': openPrimaryChat(); break;
    case 'mark-alert-attended': markAlertAttended(id); break;
    case 'mark-all-read': state.notifications.forEach(n => n.unread = false); toast('Notificaciones leídas'); route(); break;
    case 'delete-all-notifications': deleteAllNotifications(); break;
    case 'toggle-read': toggleRead(id); break;
    case 'delete-notification': deleteNotification(id); break;
    case 'change-password': changePassword(); break;
    case 'save-preferences': savePreferences(); break;
    case 'download-data': downloadData(); break;
    case 'close-sessions': toast('Sesiones cerradas', 'Se cerraron las sesiones activas simuladas.'); break;
    case 'delete-account': deleteAccount(); break;
    case 'help-tab': state.ui.activeHelp = tab; route(); break;
    case 'grant-all-permissions': grantAllPermissions(); break;
    case 'clear-permissions': clearPermissions(); break;
    case 'retry-connection': toast('Conexión restablecida', 'El servidor respondió correctamente.'); navigate('/dashboard/chats'); break;
    case 'copy-profile-id': copyText(state.user.profileId, 'ID de perfil copiado'); break;
    case 'copy-username': copyText(`@${state.user.username}`, 'Usuario copiado'); break;
    case 'copy-contact-profile': copyContactProfile(id); break;
    case 'open-chat-contact': openChatContact(id); break;
    case 'open-chat-monitor': openChatFromMonitor(id); break;
    case 'select-chat': selectChat(id); break;
    case 'send-quick-message': sendChatMessage(message); break;
    case 'simulate-reply': simulateReply(); break;
    case 'broadcast-accident': broadcastAccident(); break;
    case 'send-alert-message': broadcastAccident(message); break;
    default: console.warn('Acción no controlada:', action);
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  ensureV8State();
  if (form.id === 'register-form') submitRegister(form);
  if (form.id === 'login-form') submitLogin(form);
  if (form.id === 'recover-form') submitRecover(form);
  if (form.id === 'permissions-form') submitPermissions(form);
  if (form.id === 'onboarding-personal') submitOnboardingPersonal(form);
  if (form.id === 'onboarding-medical') submitOnboardingMedical(form);
  if (form.id === 'onboarding-vehicle') submitOnboardingVehicle(form);
  if (form.id === 'onboarding-contact') submitOnboardingContact(form);
  if (form.id === 'profile-form') submitProfile(form);
  if (form.id === 'contact-form') saveContactFromForm(false);
  if (form.id === 'invite-form') submitInvite(form);
  if (form.id === 'accept-invite-form') submitAcceptInvite(form);
  if (form.id === 'payment-form') submitPayment(form);
  if (form.id === 'settings-form') submitSettings(form);
  if (form.id === 'support-form') submitSupport(form);
  if (form.id === 'chat-form') submitChat(form);
  saveState();
}

function submitRegister(form) {
  if (!validateRequired(form, ['name','username','email','phone','password','confirm'])) return;
  if (form.elements.password.value !== form.elements.confirm.value) return toast('Contraseñas no coinciden', 'Revisa los campos de contraseña.');
  if (!form.elements.terms.checked || !form.elements.privacy.checked) return toast('Acepta términos', 'Debes aceptar términos y privacidad.');
  const username = v8Slug(form.elements.username.value);
  if (username.length < 4) return toast('Usuario muy corto', 'Usa al menos 4 caracteres.');
  if (!usernameAvailable(username)) return toast('Usuario no disponible', 'Ese nombre de usuario ya existe en la simulación.');
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
  navigate('/permisos');
}

function submitLogin(form) {
  if (!validateRequired(form, ['login','password'])) return;
  const login = form.elements.login.value.trim().toLowerCase().replace(/^@/, '');
  const valid = [state.user.email?.toLowerCase(), state.user.username?.toLowerCase(), state.user.profileId?.toLowerCase()].includes(login);
  if (!valid) return toast('Usuario no encontrado', 'En la demo usa el correo, usuario o ID guardado en este perfil.');
  state.isLoggedIn = true;
  toast('Sesión iniciada', `Entraste como @${state.user.username}.`);
  if (!state.user.webPermissionsComplete) navigate('/permisos');
  else if (!state.user.onboardingComplete) navigate('/onboarding');
  else if (state.user.subscriptionStatus === 'Vencida') navigate('/dashboard/suscripcion-vencida');
  else navigate('/dashboard/chats');
}

function submitOnboardingPersonal(form) {
  if (!validateRequired(form, ['fullName','phone','city'])) return;
  state.driver.fullName = form.elements.fullName.value.trim();
  state.user.name = state.driver.fullName;
  state.user.phone = form.elements.phone.value.trim();
  state.user.city = form.elements.city.value.trim();
  state.onboardingStep = 2;
  route();
}

function submitOnboardingContact(form) {
  if (!validateRequired(form, ['name','relation','username'])) return;
  const username = v8Slug(form.elements.username.value);
  if (!usernameAvailable(username)) return toast('Usuario duplicado', 'Esa persona ya está en tu red interna o corresponde a tu propio usuario.');
  const profileId = form.elements.profileId.value.trim().toUpperCase() || v8ProfileId(username);
  if (!profileIdAvailable(profileId)) return toast('ID duplicado', 'Ese ID de perfil ya está registrado en tu red.');
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

function submitProfile(form) {
  if (!validateRequired(form, ['fullName','username','phone','email','city','brand','model','year','avgSpeed'])) return;
  const username = v8Slug(form.elements.username.value);
  if (username.length < 4) return toast('Usuario muy corto', 'Usa al menos 4 caracteres.');
  if (username !== state.user.username && knownUsernames().includes(username)) return toast('Usuario no disponible', 'Ese usuario ya existe en tu red interna.');
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

function saveContactFromForm(forceInvite) {
  const form = $('#contact-form');
  if (!form) return;
  const mode = form.dataset.mode;
  const id = form.dataset.id;
  if (!validateRequired(form, ['name','relation','username'])) return;
  const username = v8Slug(form.elements.username.value);
  const profileId = form.elements.profileId.value.trim().toUpperCase() || v8ProfileId(username);
  if (!usernameAvailable(username, id)) return toast('Usuario duplicado', 'Ese usuario ya existe en tu red o corresponde a tu propio perfil.');
  if (!profileIdAvailable(profileId, id)) return toast('ID duplicado', 'Ese ID de perfil ya existe en tu red o corresponde a tu propio perfil.');
  const data = {
    name: form.elements.name.value.trim(),
    relation: form.elements.relation.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    username,
    profileId,
    priority: form.elements.priority.value,
    status: form.elements.status.value,
    channel: 'Chat interno',
    notes: form.elements.notes.value.trim()
  };
  const duplicatePhone = data.phone ? state.contacts.find(c => c.phone === data.phone && String(c.id) !== String(id)) : null;
  if (duplicatePhone) return toast('Teléfono duplicado', 'Ya existe una persona con ese teléfono de referencia.');
  if (data.status !== 'Suspendido por plan' && mode === 'edit') {
    const current = state.contacts.find(c => String(c.id) === String(id));
    const wouldConsumeNewSlot = current?.status === 'Suspendido por plan';
    if (wouldConsumeNewSlot && usableContacts().length >= plan().contactsLimit) return limitBlocked();
  }
  if (data.priority === 'Principal') state.contacts.forEach(c => c.priority = 'Secundario');
  if (mode === 'edit') {
    const index = state.contacts.findIndex(c => String(c.id) === String(id));
    if (index >= 0) state.contacts[index] = { ...state.contacts[index], ...data };
    ensureChatThreads();
    toast('Persona actualizada');
    navigate('/dashboard/contactos');
  } else {
    if (usableContacts().length >= plan().contactsLimit) return limitBlocked();
    const created = addContact(data);
    const shouldInvite = forceInvite || form.elements.sendInvite?.checked;
    if (shouldInvite) navigate(`/dashboard/red-monitoreo/nueva-invitacion?contacto=${created.id}`);
    else navigate('/dashboard/contactos');
  }
}

function addContact(data) {
  const contact = {
    id: generateId(),
    createdAt: new Date().toISOString().slice(0,10),
    monitorId: null,
    email: '', notes: '', channel: 'Chat interno',
    username: data.username ? v8Slug(data.username) : v8Slug(data.name),
    profileId: data.profileId || v8ProfileId(data.name),
    ...data
  };
  contact.channel = 'Chat interno';
  state.contacts.push(contact);
  enforceContactPlanLimit();
  ensureChatThreads();
  addNotification('Persona agregada', `${contact.name} fue agregado a tu red interna Impact.X.`, 'contact');
  toast('Persona agregada', `${contact.name} fue agregado correctamente.`);
  return contact;
}

function submitInvite(form) {
  if (!validateRequired(form, ['name','username'])) return;
  const contactId = form.elements.contactId.value || null;
  const username = v8Slug(form.elements.username.value);
  const profileId = form.elements.profileId.value.trim().toUpperCase() || v8ProfileId(username);
  const token = `INT-${username.toUpperCase().replace(/_/g,'').slice(0,8)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const expires = form.elements.expires.value;
  let contact = contactId ? state.contacts.find(x => String(x.id) === String(contactId)) : null;
  if (!contact) {
    if (usableContacts().length >= plan().contactsLimit) return limitBlocked();
    contact = addContact({ name: form.elements.name.value.trim(), relation: 'Monitor interno', phone: form.elements.phone.value.trim(), email: '', username, profileId, priority: 'Alternativo', status: 'Pendiente', channel: 'Chat interno', notes: 'Agregado desde invitación interna.' });
  }
  const monitor = {
    id: generateId(),
    contactId: contact.id,
    name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: '',
    username,
    profileId,
    status: 'Pendiente',
    invitedAt: new Date().toLocaleString('es-MX'),
    acceptedAt: '',
    expiresAt: expires === '24 horas' ? 'Expira en 24 horas' : expires === '48 horas' ? 'Expira en 48 horas' : 'Expira en 7 días',
    token,
    channel: 'Chat interno',
    permissions: ['Recibir SOS interno', 'Ver ubicación en incidente'].concat(form.elements.canReceiveUpdates.checked ? ['Recibir actualizaciones por chat'] : []).concat(form.elements.canReply.checked ? ['Responder por chat interno'] : [])
  };
  state.monitors.push(monitor);
  contact.monitorId = monitor.id;
  contact.status = contact.status === 'Inactivo' ? 'Pendiente' : contact.status;
  state.drafts.inviteUrl = `${location.origin}${location.pathname}#/invitacion/${token}`;
  addNotification('Invitación interna generada', `${monitor.name} recibió una invitación interna.`, 'monitor');
  toast('Invitación interna generada', 'Copia el token o abre la vista pública simulada.');
  route();
}

function submitAcceptInvite(form) {
  const token = form.dataset.token;
  const m = state.monitors.find(x => x.token === token);
  if (!m) return;
  if (!validateRequired(form, ['name','username'])) return;
  if (!form.elements.accept.checked) return toast('Aceptación requerida', 'Debes aceptar los permisos de monitoreo interno.');
  const username = v8Slug(form.elements.username.value);
  m.name = form.elements.name.value.trim();
  m.username = username;
  m.profileId = form.elements.profileId.value.trim().toUpperCase() || m.profileId || v8ProfileId(username);
  m.phone = form.elements.phone.value.trim();
  m.status = 'Activo';
  m.acceptedAt = new Date().toLocaleString('es-MX');
  const c = state.contacts.find(x => String(x.id) === String(m.contactId));
  if (c) { c.name = m.name; c.username = m.username; c.profileId = m.profileId; c.phone = m.phone; c.status = 'Activo'; c.channel = 'Chat interno'; }
  ensureChatThreads();
  addNotification('Invitación aceptada', `${m.name} aceptó formar parte de tu red interna.`, 'monitor');
  saveState();
  openModal({ title: 'Invitación aceptada', body: 'Ahora formas parte de la red interna de Impact.X. Podrás recibir alertas y responder por chat interno.', actions: [{ label: 'Entendido', className: 'primary', onClick: () => { closeModal(); navigate('/'); } }] });
}

function submitSettings(form) {
  if (!validateRequired(form, ['name','username','email','phone'])) return;
  const username = v8Slug(form.elements.username.value);
  if (username !== state.user.username && knownUsernames().includes(username)) return toast('Usuario no disponible', 'Ese usuario ya existe en tu red interna.');
  state.user.name = form.elements.name.value.trim();
  state.user.username = username;
  state.user.email = form.elements.email.value.trim();
  state.user.phone = form.elements.phone.value.trim();
  state.user.twoFactor = form.elements.twoFactor.checked;
  toast('Cuenta actualizada', 'Datos principales guardados.');
  route();
}

function savePreferences() {
  const form = $('#settings-form');
  if (!form) return;
  state.user.language = form.elements.language.value;
  state.user.timezone = form.elements.timezone.value;
  state.user.notifyInternal = form.elements.notifyInternal.checked;
  state.user.notifyEmail = false;
  state.user.notifySms = false;
  state.user.notifyWhatsapp = false;
  toast('Preferencias internas guardadas');
  route();
}

function resetDemo() {
  confirmModal({ title: 'Reiniciar demo', body: 'Se restaurarán datos mock, personas, chats, invitaciones, incidentes y plan.', confirmText: 'Reiniciar', danger: true, onConfirm: () => { state = initialState(); ensureV8State(); toast('Demo reiniciada'); navigate('/dashboard/chats'); } });
}

function deleteAccount() {
  confirmModal({ title: 'Eliminar cuenta', body: 'Esta acción eliminará todos los datos simulados y cerrará sesión.', confirmText: 'Eliminar definitivamente', danger: true, onConfirm: () => { state = initialState(); ensureV8State(); state.isLoggedIn = false; toast('Cuenta eliminada', 'Datos restaurados en la demo.'); navigate('/login'); } });
}

function pairingGuide() {
  openModal({
    title: 'Guía de vinculación',
    content: `<div class="timeline"><div class="timeline-item"><h4>1. Abre la app móvil</h4><p>La app móvil actúa como puente de comunicación.</p></div><div class="timeline-item"><h4>2. Activa Bluetooth y permisos</h4><p>GPS, sensores, micrófono, actividad en segundo plano y chat interno móvil.</p></div><div class="timeline-item"><h4>3. Selecciona tu smartwatch</h4><p>Confirma el código de sincronización.</p></div><div class="timeline-item"><h4>4. Revisa Impact.X</h4><p>El estado del wearable y el chat interno deben aparecer activos.</p></div></div>`,
    actions: [{ label: 'Entendido', className: 'primary', onClick: closeModal }],
    large: true
  });
}

function copyContactProfile(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  copyText(`${c.profileId} · @${c.username}`, 'Perfil de persona copiado');
}

function copyInvite(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  copyText(`${monitorUrl(m)}\nUsuario: @${m.username}\nID: ${m.profileId}`, 'Invitación interna copiada');
}

function openChatContact(id) {
  ensureChatThreads();
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return toast('Persona no encontrada');
  state.ui.activeChatId = threadIdForContact(c.id);
  const t = state.chatThreads.find(x => x.id === state.ui.activeChatId);
  if (t) t.unread = 0;
  navigate('/dashboard/chats');
}

function openChatFromMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  const c = state.contacts.find(x => String(x.monitorId) === String(m.id) || String(x.id) === String(m.contactId));
  if (c) openChatContact(c.id); else toast('Sin chat asociado', 'Primero agrega esta persona a tu red interna.');
}

function openPrimaryChat() {
  const c = state.contacts.find(x => x.priority === 'Principal' && x.status === 'Activo') || state.contacts.find(x => x.status === 'Activo');
  if (c) openChatContact(c.id); else toast('Sin persona activa', 'Agrega una persona activa para abrir chat.');
}

function selectChat(id) {
  state.ui.activeChatId = id;
  const t = state.chatThreads.find(x => x.id === id);
  if (t) t.unread = 0;
  route();
}

function pushMessage(thread, from, text) {
  thread.messages.push({ from, text, time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) });
  thread.updatedAt = new Date().toLocaleString('es-MX');
}

function sendChatMessage(text) {
  ensureV8State();
  const thread = getActiveThread();
  const c = contactByThread(thread);
  if (!thread || !c) return toast('Sin chat activo', 'Selecciona una conversación.');
  if (c.status !== 'Activo') return toast('Chat pausado', 'La persona debe estar activa y dentro del límite del plan.');
  pushMessage(thread, 'me', text || 'Mensaje interno');
  setTimeout(() => { ensureV8State(); const activeThread = state.chatThreads.find(t => t.id === thread.id); if (activeThread) { pushMessage(activeThread, 'them', V8_AUTO_RESPONSES[Math.floor(Math.random() * V8_AUTO_RESPONSES.length)]); activeThread.unread = (activeThread.unread || 0) + 1; saveState(); route(); } }, 500);
  toast('Mensaje enviado', 'Se envió por chat interno.');
  route();
}

function submitChat(form) {
  const text = form.elements.message.value.trim();
  if (!text) return;
  sendChatMessage(text);
  form.reset();
}

function simulateReply() {
  const thread = getActiveThread();
  if (!thread) return;
  pushMessage(thread, 'them', V8_AUTO_RESPONSES[Math.floor(Math.random() * V8_AUTO_RESPONSES.length)]);
  toast('Respuesta simulada', `${thread.title} respondió por chat interno.`);
  route();
}

function broadcastAccident(customMessage) {
  ensureV8State();
  const active = internalNetworkActive();
  if (!active.length) return toast('Sin red activa', 'No hay personas activas para recibir el mensaje.');
  const text = customMessage || 'Ocurrió un accidente. Revisa mi ubicación y la alerta activa en Impact.X.';
  active.forEach(c => {
    const t = state.chatThreads.find(x => x.id === threadIdForContact(c.id));
    if (t) { pushMessage(t, 'me', text); t.unread = (t.unread || 0) + 1; }
  });
  addNotification('Mensaje interno enviado', `Se notificó a ${active.length} persona(s) activas por chat interno.`, 'incident');
  toast('Red interna notificada', `${active.length} persona(s) recibieron el mensaje.`);
  route();
}

function simulateCriticalIncident() {
  const id = generateId();
  const activeNames = internalNetworkActive().map(c => c.name);
  state.incidents.unshift({ id, date: new Date().toISOString().slice(0,10), time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), type: 'Colisión crítica simulada', severity: 'Crítica', status: 'Alerta interna enviada', location: 'Carretera Tula-Tepeji km 14', coords: '20.054901, -99.343201', gForce: '11.4G', decibels: '134dB', heartRate: '128 bpm', activation: 'Bypass crítico + chat interno', notified: activeNames, responseTime: '1 segundo', note: 'Evento generado para validar chat interno y alerta activa.', timeline: [['Ahora', 'Impacto crítico detectado'], ['Ahora', 'Bypass crítico activado'], ['Ahora', 'Red interna notificada por chat']] });
  broadcastAccident('Ocurrió un accidente crítico. Revisa mi ubicación en la alerta activa.');
  navigate(`/dashboard/alerta/${id}`);
}

function usernameTakenInNetwork(username) {
  const normalized = v8Slug(username);
  return state.contacts.some(c => String(c.username).toLowerCase() === normalized.toLowerCase()) || state.monitors.some(m => String(m.username).toLowerCase() === normalized.toLowerCase());
}

function submitRegister(form) {
  if (!validateRequired(form, ['name','username','email','phone','password','confirm'])) return;
  if (form.elements.password.value !== form.elements.confirm.value) return toast('Contraseñas no coinciden', 'Revisa los campos de contraseña.');
  if (!form.elements.terms.checked || !form.elements.privacy.checked) return toast('Acepta términos', 'Debes aceptar términos y privacidad.');
  const username = v8Slug(form.elements.username.value);
  if (username.length < 4) return toast('Usuario muy corto', 'Usa al menos 4 caracteres.');
  if (usernameTakenInNetwork(username)) return toast('Usuario no disponible', 'Ese nombre de usuario ya existe en la simulación.');
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
  navigate('/permisos');
}

function submitPermissions(form) {
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
  if (currentPath().startsWith('/dashboard')) navigate('/dashboard/configuracion');
  else if (!state.user.onboardingComplete) navigate('/onboarding');
  else navigate('/dashboard/chats');
}

function grantAllPermissions() {
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

function clearPermissions() {
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

/* =========================================================
   Impact.X Web Prototype v9 overrides
   - Agregar persona como solicitud interna por usuario/ID.
   - No se capturan datos personales de terceros en la web.
   - Etiquetas simples de contexto/origen/destino.
   - Historial de rutas para consulta web; no hay iniciar viaje en web.
   ========================================================= */

var __v9BaseEnsure = typeof ensureV8State === 'function' ? ensureV8State : function(){};
var __v9BaseHandleAction = typeof handleAction === 'function' ? handleAction : function(){};
var __v9BaseHandleSubmit = typeof handleSubmit === 'function' ? handleSubmit : function(){};
var __v9BaseResetDemo = typeof resetDemo === 'function' ? resetDemo : function(){};

const V9_MOCK_USERS = [
  { name: 'María Fernanda Tejeda', username: 'maria_segura', profileId: 'IX-MARIA-9Q2WA', relation: 'Madre', label: 'Familia principal' },
  { name: 'Carlos Barrera', username: 'carlos_barrera', profileId: 'IX-CARLOS-72KMD', relation: 'Hermano', label: 'Familia secundaria' },
  { name: 'Andrea Monroy', username: 'andrea_monroy', profileId: 'IX-ANDREA-54FPL', relation: 'Pareja', label: 'Monitor frecuente' },
  { name: 'Omar Picazo', username: 'omar_picazo', profileId: 'IX-OMAR-88ZTR', relation: 'Amigo', label: 'Apoyo cercano' },
  { name: 'Felicitas Diego', username: 'felicitas_diego', profileId: 'IX-FELI-16VRP', relation: 'Familiar', label: 'Contacto familiar' },
  { name: 'Yael Monroy', username: 'yael_monroy', profileId: 'IX-YAEL-43QXA', relation: 'Amigo', label: 'Monitor eventual' }
];

const V9_QUICK_MESSAGES = [
  'Ocurrió un accidente',
  'Necesito ayuda urgente',
  'Comparto mi ubicación actual',
  'Estoy bien, fue falsa alarma',
  'Revisa la alerta activa',
  'No puedo responder por ahora',
  'Confirma si recibiste mi ubicación',
  'La ruta quedó registrada desde móvil',
  'Voy hacia el punto marcado',
  'Llegué al destino registrado',
  'Contacta a otra persona de la red si no respondo'
];

function v9Now() {
  return new Date().toLocaleString('es-MX');
}

function v9FindMockUser(input = '') {
  const raw = String(input).trim().replace(/^@/, '');
  const normalized = v8Slug(raw);
  const upper = raw.toUpperCase();
  return V9_MOCK_USERS.find(u => u.username.toLowerCase() === normalized.toLowerCase() || u.profileId.toUpperCase() === upper) || null;
}

function v9BuildExternalProfile(input = '') {
  const mock = v9FindMockUser(input);
  if (mock) return { ...mock, found: true };
  const username = v8Slug(input || `persona_${Math.random().toString(36).slice(2,5)}`);
  return {
    name: username.split('_').map(x => x ? x[0].toUpperCase() + x.slice(1) : '').join(' ') || 'Usuario Impact.X',
    username,
    profileId: String(input).toUpperCase().startsWith('IX-') ? String(input).trim().toUpperCase() : v8ProfileId(username),
    relation: 'Por definir',
    label: 'Solicitud manual',
    found: false
  };
}

function ensureV9State() {
  __v9BaseEnsure();
  state.filters = {
    ...(state.filters || {}),
    routeStatus: state.filters?.routeStatus || 'todos',
    routeSearch: state.filters?.routeSearch || '',
    contactStatus: state.filters?.contactStatus || 'todos',
    chatSearch: state.filters?.chatSearch || ''
  };
  state.ui = { ...(state.ui || {}), lastLookupInput: state.ui?.lastLookupInput || '' };
  state.user = { ...(state.user || {}) };
  if (!state.user.username) state.user.username = v8Slug(state.user.name || 'usuario_impactx');
  if (!state.user.profileId) state.user.profileId = v8ProfileId(state.user.username);
  if (!Array.isArray(state.routeHistory)) {
    state.routeHistory = [
      {
        id: 901,
        date: '2026-06-04',
        startTime: '07:20',
        endTime: '08:05',
        origin: 'Casa',
        destination: 'Universidad Tecnológica de Tula-Tepeji',
        originLabel: 'Sale de casa',
        destinationLabel: 'Llega a universidad',
        sourceTag: 'Registrado desde móvil',
        status: 'Finalizada',
        distance: '18.6 km',
        avgSpeed: '54 km/h',
        incidents: 0,
        vehicle: `${state.driver.brand || 'Nissan'} ${state.driver.model || 'Versa Sense'}`,
        notes: 'Ruta de ejemplo sincronizada desde la app móvil. La web solo consulta y gestiona.'
      },
      {
        id: 902,
        date: '2026-06-03',
        startTime: '19:10',
        endTime: '19:42',
        origin: 'Centro de Tula',
        destination: 'Tepeji del Río',
        originLabel: 'Punto de salida',
        destinationLabel: 'Punto de destino',
        sourceTag: 'Con incidente registrado',
        status: 'Incidente',
        distance: '14.2 km',
        avgSpeed: '61 km/h',
        incidents: 1,
        vehicle: `${state.driver.brand || 'Nissan'} ${state.driver.model || 'Versa Sense'}`,
        notes: 'Esta ruta se relaciona con el incidente de movimiento brusco de la demo.'
      }
    ];
  }
  state.contacts = Array.isArray(state.contacts) ? state.contacts : [];
  state.contacts.forEach((c, index) => {
    c.username = c.username || v8Slug(c.name || `persona_${index + 1}`);
    c.profileId = c.profileId || v8ProfileId(c.username);
    c.channel = 'Chat interno';
    c.requestType = c.requestType || 'Solicitud interna';
    c.requestStatus = c.requestStatus || (c.status === 'Activo' ? 'Aceptada' : c.status === 'Pendiente' ? 'Pendiente' : c.status === 'Revocado' ? 'Revocada' : 'Gestionada');
    c.connectionLabel = c.connectionLabel || c.label || c.relation || 'Red interna';
    c.originTag = c.originTag || 'Agregado desde web';
    c.destinationTag = c.destinationTag || 'Recibe alertas internas';
    c.sourceModule = c.sourceModule || 'Gestión web';
    delete c.preferredExternalChannel;
  });
  state.monitors = Array.isArray(state.monitors) ? state.monitors : [];
  state.monitors.forEach((m, index) => {
    m.username = m.username || v8Slug(m.name || `monitor_${index + 1}`);
    m.profileId = m.profileId || v8ProfileId(m.username);
    m.channel = 'Chat interno';
    m.requestType = m.requestType || 'Invitación interna';
    m.connectionLabel = m.connectionLabel || 'Red interna';
  });
  ensureChatThreads();
}

function contactStatusClass(status) {
  if (status === 'Activo') return 'success';
  if (status === 'Pendiente' || status === 'Solicitud enviada') return 'warning';
  if (status === 'Suspendido por plan') return 'warning';
  if (status === 'Rechazado' || status === 'Revocado' || status === 'Inactivo') return 'danger';
  return 'info';
}

function dashboardShell(title, subtitle, content, actions = '') {
  ensureV9State();
  const unread = state.notifications.filter(n => n.unread).length;
  const chatUnread = state.chatThreads.reduce((sum, t) => sum + (Number(t.unread) || 0), 0);
  const path = currentPath();
  const initials = esc((state.user.name || 'IX').split(' ').map(x => x[0]).slice(0,2).join(''));
  const wearableClass = state.wearable.linked && state.wearable.connection === 'connected' ? 'success' : state.wearable.connection === 'syncing' ? 'warning' : 'danger';
  return `
    <div class="dashboard">
      <aside class="sidebar">
        <a href="#/dashboard/chats" class="brand"><span class="brand-mark">IX</span><span>Impact.X</span></a>
        <div class="side-group">
          <div class="side-label">Gestión web</div>
          ${sideLink('/dashboard/chats', '💬', `Chats internos ${chatUnread ? `(${chatUnread})` : ''}`, path)}
          ${sideLink('/dashboard/contactos', '🧑‍🤝‍🧑', 'Red interna', path)}
          ${sideLink('/dashboard/red-monitoreo', '🛡️', 'Solicitudes e invitaciones', path)}
          ${sideLink('/dashboard/rutas', '🗺️', 'Historial de rutas', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Seguridad</div>
          ${sideLink('/dashboard/incidentes', '📍', 'Incidentes', path)}
          ${sideLink('/dashboard/alerta/501', '🚨', 'Alerta activa demo', path)}
          ${sideLink('/dashboard/wearable', '⌚', 'Wearable', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Cuenta</div>
          ${sideLink('/dashboard/perfil', '👤', 'Perfil del conductor', path)}
          ${sideLink('/dashboard/suscripcion', '💳', 'Suscripción', path)}
          ${sideLink('/dashboard/notificaciones', '🔔', `Notificaciones ${unread ? `(${unread})` : ''}`, path)}
          ${sideLink('/dashboard/configuracion', '⚙️', 'Configuración', path)}
          ${sideLink('/dashboard/permisos', '🔐', 'Permisos web', path)}
          ${sideLink('/dashboard/ayuda', '❔', 'Ayuda', path)}
        </div>
        <div class="side-group">
          <button class="side-link" data-action="reset-demo">♻️ Reiniciar demo</button>
          <button class="side-link danger-text" data-action="logout">↩ Cerrar sesión</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <button class="icon-btn menu-btn" data-action="toggle-sidebar">☰</button>
          <div class="top-status">
            <span class="badge ${wearableClass}">Wearable ${state.wearable.connection === 'connected' ? 'online' : 'offline'}</span>
            <span class="badge primary">Plan ${esc(plan().name)}</span>
            <span class="badge success">@${esc(state.user.username)}</span>
          </div>
          <div class="top-actions">
            <button class="btn small hide-sm" data-route="/dashboard/contactos/nuevo">+ Solicitud</button>
            <button class="btn small hide-sm" data-route="/dashboard/rutas">Rutas</button>
            <button class="btn small" data-route="/dashboard/chats">💬 ${chatUnread}</button>
            <button class="icon-btn" data-route="/dashboard/notificaciones">🔔${unread ? `<span>${unread}</span>` : ''}</button>
            <div class="avatar-wrap"><button class="avatar" data-action="toggle-avatar-menu">${initials}</button>${state.ui.avatarMenu ? avatarMenu() : ''}</div>
          </div>
        </header>
        <section class="page-head"><div><p class="eyebrow">Impact.X Web · Panel de gestión</p><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="page-actions">${actions}</div></section>
        ${content}
      </main>
    </div>
  `;
}

function avatarMenu() {
  return `<div class="avatar-menu"><button data-route="/dashboard/perfil">Ver perfil</button><button data-route="/dashboard/chats">Chats internos</button><button data-route="/dashboard/rutas">Historial de rutas</button><button data-route="/dashboard/configuracion">Configuración</button><button data-action="logout">Cerrar sesión</button></div>`;
}

function renderContacts() {
  ensureV9State();
  const p = plan();
  const q = (state.filters.contacts || '').toLowerCase();
  const status = state.filters.contactStatus || 'todos';
  const filtered = state.contacts.filter(c => {
    const text = `${c.name} ${c.username} ${c.profileId} ${c.relation} ${c.connectionLabel} ${c.originTag} ${c.destinationTag}`.toLowerCase();
    const matchesQ = !q || text.includes(q);
    const matchesStatus = status === 'todos' || c.status === status;
    return matchesQ && matchesStatus;
  });
  const empty = state.contacts.length === 0 ? `
    <div class="empty-state"><h3>Aún no tienes personas agregadas</h3><p>Agrega a una persona por usuario Impact.X o ID de perfil. Es una solicitud interna: la otra persona ya debe tener cuenta propia.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Enviar solicitud</button></div>
  ` : '';
  const content = `
    <div class="alert-box info"><div>🤝</div><div><strong>Red interna tipo solicitud</strong><p>Ya no se capturan teléfono, correo ni datos personales de terceros. Solo se busca por <strong>usuario</strong> o <strong>ID de perfil</strong>, como una solicitud de amistad o invitación familiar. Las etiquetas solo son textos de referencia para entender origen, destino y contexto.</p></div></div>
    ${planUsageAlert()}
    <div class="grid grid-3">
      <div class="card stat-card"><h3>Personas activas</h3><div class="stat-value">${state.contacts.filter(c => c.status === 'Activo').length}</div><p class="stat-desc">Pueden recibir chats y alertas internas.</p></div>
      <div class="card stat-card"><h3>Límite del plan</h3><div class="stat-value">${usableContacts().length}/${p.contactsLimit}</div><p class="stat-desc">Pendientes y activas ocupan espacio. Las excedentes se pausan por plan.</p></div>
      <div class="card stat-card"><h3>Solicitudes pendientes</h3><div class="stat-value">${state.contacts.filter(c => c.status === 'Pendiente' || c.status === 'Solicitud enviada').length}</div><p class="stat-desc">Esperando aceptación o activación demo.</p></div>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <input value="${esc(state.filters.contacts || '')}" data-filter="contacts" placeholder="Buscar por usuario, ID, relación o etiqueta" />
      <select data-filter="contactStatus"><option value="todos">Todos</option>${options(['Activo','Pendiente','Solicitud enviada','Suspendido por plan','Rechazado','Inactivo'], status)}</select>
      <button class="btn" data-action="clear-contact-filters">Limpiar filtros</button>
    </div>
    ${empty || `<div class="table-wrap"><table><thead><tr><th>Persona</th><th>Usuario / ID</th><th>Relación</th><th>Etiquetas</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${filtered.map(contactRow).join('') || `<tr><td colspan="6">No hay resultados con esos filtros.</td></tr>`}</tbody></table></div>`}
  `;
  return dashboardShell('Red interna', `Plan ${p.name}: ${usableContacts().length}/${p.contactsLimit} espacios ocupados.`, content, `<button class="btn primary" data-action="go-add-contact">+ Enviar solicitud</button><button class="btn" data-route="/dashboard/red-monitoreo">Solicitudes</button><button class="btn" data-route="/dashboard/chats">Chats</button>`);
}

function contactRow(c) {
  const disabled = c.status === 'Suspendido por plan' || c.status === 'Rechazado' || c.status === 'Inactivo';
  const canActivate = c.status === 'Pendiente' || c.status === 'Solicitud enviada' || c.status === 'Rechazado' || c.status === 'Inactivo';
  return `<tr>
    <td><strong>${esc(c.name)}</strong><br><span class="muted">${esc(c.requestType || 'Solicitud interna')}</span></td>
    <td><span class="v9-id-pill">@${esc(c.username)}</span><br><button class="link-btn" data-action="copy-contact-profile" data-id="${c.id}">${esc(c.profileId)}</button></td>
    <td>${esc(c.relation || 'Sin relación')}<br><span class="muted">${esc(c.priority || 'Secundario')}</span></td>
    <td><div class="route-tags"><span class="string-tag">${esc(c.connectionLabel || 'Red interna')}</span><span class="string-tag alt">${esc(c.originTag || 'Origen web')}</span><span class="string-tag muted">${esc(c.destinationTag || 'Destino alertas')}</span></div></td>
    <td><span class="badge ${contactStatusClass(c.status)}">${esc(c.status)}</span>${disabled ? '<br><span class="muted">Chat limitado</span>' : ''}</td>
    <td><div class="actions"><button class="btn small" data-route="/dashboard/contactos/${c.id}">Ver</button><button class="btn small" data-route="/dashboard/contactos/${c.id}/editar">Editar vínculo</button><button class="btn small" data-action="open-chat-contact" data-id="${c.id}">Chat</button>${canActivate ? `<button class="btn small success" data-action="accept-contact-request" data-id="${c.id}">Aceptar demo</button>` : `<button class="btn small warning" data-action="pause-contact-request" data-id="${c.id}">Pausar</button>`}<button class="btn small danger" data-action="delete-contact" data-id="${c.id}">Eliminar</button></div></td>
  </tr>`;
}

function renderContactForm(mode = 'new', id = null) {
  ensureV9State();
  const isEdit = mode === 'edit';
  const c = isEdit ? state.contacts.find(x => String(x.id) === String(id)) : null;
  if (isEdit && !c) return renderNotFound();
  const searched = state.ui.lastLookupInput ? v9BuildExternalProfile(state.ui.lastLookupInput) : null;
  const content = isEdit ? `
    <form id="contact-form" data-mode="edit" data-id="${c.id}" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>Identidad de la persona</h3>
          <div class="alert-box info mini"><div>🪪</div><div><strong>Datos propios de otra cuenta</strong><p>En la web no editas nombre, usuario ni ID de la otra persona; solo administras tu vínculo con ella.</p></div></div>
          ${infoRows({'Nombre visible': c.name, Usuario: `@${c.username}`, 'ID de perfil': c.profileId, Canal: 'Chat interno Impact.X'})}
          <div class="card-actions"><button class="btn" type="button" data-action="copy-contact-profile" data-id="${c.id}">Copiar usuario/ID</button><button class="btn" type="button" data-action="open-chat-contact" data-id="${c.id}">Abrir chat</button></div>
        </div>
        <div class="card"><h3>Editar vínculo y etiquetas</h3>
          <div class="field"><label>Relación con el titular</label><input name="relation" value="${esc(c.relation || '')}" placeholder="Ej. Madre, hermano, amigo, pareja" required /></div>
          <div class="field"><label>Etiqueta de contexto</label><input name="connectionLabel" value="${esc(c.connectionLabel || '')}" placeholder="Ej. Familia principal, apoyo cercano" /></div>
          <div class="field"><label>Etiqueta de origen</label><input name="originTag" value="${esc(c.originTag || '')}" placeholder="Ej. Agregado desde web" /></div>
          <div class="field"><label>Etiqueta de destino</label><input name="destinationTag" value="${esc(c.destinationTag || '')}" placeholder="Ej. Recibe alertas del vehículo" /></div>
          <div class="field"><label>Prioridad</label><select name="priority">${options(['Principal','Secundario','Alternativo'], c.priority)}</select></div>
          <div class="field"><label>Estado</label><select name="status">${options(['Activo','Pendiente','Solicitud enviada','Inactivo','Rechazado','Suspendido por plan'], c.status)}</select></div>
          <div class="field field-full"><label>Notas internas</label><textarea name="notes">${esc(c.notes || '')}</textarea></div>
        </div>
      </div>
      <div class="form-actions"><button class="btn primary" type="submit">Guardar vínculo</button><button class="btn" type="button" data-route="/dashboard/contactos/${c.id}">Cancelar</button><button class="btn danger" type="button" data-action="delete-contact" data-id="${c.id}">Eliminar de mi red</button></div>
    </form>
  ` : `
    <form id="contact-form" data-mode="new" novalidate>
      <div class="alert-box info"><div>🤝</div><div><strong>Enviar solicitud interna</strong><p>La persona ya debe tener una cuenta Impact.X. Solo ingresa su <strong>usuario</strong> o <strong>ID de perfil</strong>. No captures teléfono, correo ni datos personales porque pertenecen a su propia cuenta.</p></div></div>
      <div class="grid grid-2">
        <div class="card"><h3>Buscar persona</h3>
          <div class="field"><label>Usuario Impact.X o ID de perfil</label><input name="lookup" value="${esc(state.ui.lastLookupInput || '')}" placeholder="ej. @maria_segura o IX-MARIA-9Q2WA" required /><small class="field-hint">Simula una búsqueda interna, similar a solicitud de amistad o invitación familiar.</small></div>
          <div class="field"><label>Relación con el titular</label><input name="relation" value="${esc(searched?.relation || '')}" placeholder="Ej. Madre, hermano, pareja, amigo" required /></div>
          <div class="field"><label>Prioridad dentro de tu red</label><select name="priority">${options(['Principal','Secundario','Alternativo'], 'Secundario')}</select></div>
          <div class="field"><label>Estado inicial de la solicitud</label><select name="status">${options(['Solicitud enviada','Pendiente','Activo'], 'Solicitud enviada')}</select><small class="field-hint">En producción quedaría pendiente hasta que la otra persona acepte desde su cuenta.</small></div>
        </div>
        <div class="card"><h3>Etiquetas de referencia</h3>
          <p class="compact-note">Estas etiquetas no ejecutan funciones. Solo sirven para que en la maqueta se entienda desde dónde se agregó la persona, hacia qué punto lógico va la alerta y cuál es su contexto.</p>
          <div class="field"><label>Etiqueta de contexto</label><input name="connectionLabel" value="${esc(searched?.label || '')}" placeholder="Ej. Familia principal, apoyo cercano" /></div>
          <div class="field"><label>Etiqueta de origen</label><input name="originTag" value="Agregado desde web" placeholder="Ej. Agregado desde web" /></div>
          <div class="field"><label>Etiqueta de destino</label><input name="destinationTag" value="Recibe alertas internas" placeholder="Ej. Recibe alertas internas" /></div>
          <div class="field field-full"><label>Notas internas</label><textarea name="notes" placeholder="Notas solo visibles para el titular."></textarea></div>
        </div>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="lookup-card"><h4>${searched ? `Vista previa: ${esc(searched.name)}` : 'Vista previa de búsqueda'}</h4><p>${searched ? `@${esc(searched.username)} · ${esc(searched.profileId)} · ${searched.found ? 'Usuario encontrado en demo' : 'Perfil simulado generado'}` : 'Escribe un usuario o ID para generar la solicitud.'}</p></div>
        <div class="card"><h3>Flujo esperado</h3><div class="request-flow"><div class="request-step"><strong>1. Buscar</strong><span>Usuario o ID.</span></div><div class="request-step"><strong>2. Solicitar</strong><span>Se crea solicitud.</span></div><div class="request-step"><strong>3. Aceptar</strong><span>La otra cuenta confirma.</span></div><div class="request-step"><strong>4. Chat</strong><span>Se habilita chat interno.</span></div></div></div>
      </div>
      <div class="form-actions"><button class="btn primary" type="submit">Enviar solicitud</button><button class="btn" type="button" data-action="lookup-internal-user">Buscar vista previa</button><button class="btn" type="button" data-action="cancel-contact-form">Cancelar</button></div>
    </form>
  `;
  return dashboardShell(isEdit ? 'Editar vínculo interno' : 'Agregar persona', isEdit ? 'Edita únicamente la relación, etiquetas y estado dentro de tu red.' : 'Envía una solicitud interna por usuario o ID. La otra persona ya tiene su propia cuenta.', content);
}

function renderContactDetail(id) {
  ensureV9State();
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return renderNotFound();
  const thread = state.chatThreads.find(t => String(t.contactId) === String(c.id));
  const relatedRoutes = state.routeHistory.slice(0, 2);
  const content = `
    <div class="grid grid-2">
      <div class="card"><h3>${esc(c.name)}</h3><p><span class="v9-id-pill">@${esc(c.username)}</span> <span class="v9-id-pill">${esc(c.profileId)}</span></p><div class="divider"></div>${infoRows({'Relación': c.relation || 'No definida', Prioridad: c.priority, Estado: c.status, Solicitud: c.requestStatus || c.status, Canal: 'Chat interno Impact.X', 'Fecha de alta': c.createdAt})}<div class="route-tags"><span class="string-tag">${esc(c.connectionLabel || 'Red interna')}</span><span class="string-tag alt">${esc(c.originTag || 'Origen web')}</span><span class="string-tag muted">${esc(c.destinationTag || 'Destino alertas')}</span></div><div class="card-actions"><button class="btn primary" data-action="open-chat-contact" data-id="${c.id}">Abrir chat</button><button class="btn" data-route="/dashboard/contactos/${c.id}/editar">Editar vínculo</button><button class="btn" data-action="copy-contact-profile" data-id="${c.id}">Copiar usuario/ID</button><button class="btn danger" data-action="delete-contact" data-id="${c.id}">Eliminar</button></div></div>
      <div class="card"><h3>Estado de solicitud</h3><p class="compact-note">Esta pantalla representa la relación entre cuentas. No administra datos privados de la otra persona; solo tu vínculo, etiquetas, prioridad y permisos internos.</p><div class="request-flow"><div class="request-step"><strong>Usuario</strong><span>Cuenta externa.</span></div><div class="request-step"><strong>Solicitud</strong><span>${esc(c.requestStatus || c.status)}</span></div><div class="request-step"><strong>Plan</strong><span>${esc(plan().name)}</span></div><div class="request-step"><strong>Chat</strong><span>${c.status === 'Activo' ? 'Habilitado' : 'Limitado'}</span></div></div><div class="card-actions"><button class="btn success" data-action="accept-contact-request" data-id="${c.id}">Aceptar demo</button><button class="btn warning" data-action="pause-contact-request" data-id="${c.id}">Pausar</button><button class="btn" data-route="/dashboard/contactos">Volver</button></div></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>Conversación asociada</h3>${thread ? `<p>${thread.messages.length} mensajes · Última actividad: ${esc(thread.updatedAt)}</p><button class="btn primary" data-action="open-chat-contact" data-id="${c.id}">Abrir conversación</button>` : '<p>No hay conversación asociada.</p>'}</div>
      <div class="card"><h3>Rutas recientes relacionadas</h3><div class="list">${relatedRoutes.map(routeMiniRow).join('')}</div><button class="btn" data-route="/dashboard/rutas">Ver historial de rutas</button></div>
    </div>
  `;
  return dashboardShell('Detalle de persona', 'Relación interna, etiquetas y accesos de chat.', content);
}

function saveContactFromForm(forceInvite) {
  const form = $('#contact-form');
  if (!form) return;
  const mode = form.dataset.mode;
  const id = form.dataset.id;
  if (mode === 'edit') {
    if (!validateRequired(form, ['relation'])) return;
    const current = state.contacts.find(c => String(c.id) === String(id));
    if (!current) return;
    const nextStatus = form.elements.status.value;
    if (nextStatus !== 'Suspendido por plan' && current.status === 'Suspendido por plan' && usableContacts().length >= plan().contactsLimit) return limitBlocked();
    if (form.elements.priority.value === 'Principal') state.contacts.forEach(c => c.priority = 'Secundario');
    current.relation = form.elements.relation.value.trim();
    current.connectionLabel = form.elements.connectionLabel.value.trim() || current.connectionLabel || 'Red interna';
    current.originTag = form.elements.originTag.value.trim() || 'Agregado desde web';
    current.destinationTag = form.elements.destinationTag.value.trim() || 'Recibe alertas internas';
    current.priority = form.elements.priority.value;
    current.status = nextStatus;
    current.requestStatus = nextStatus === 'Activo' ? 'Aceptada' : nextStatus;
    current.notes = form.elements.notes.value.trim();
    current.channel = 'Chat interno';
    ensureChatThreads();
    toast('Vínculo actualizado', 'Se actualizaron relación, etiquetas y estado.');
    navigate('/dashboard/contactos');
    return;
  }
  if (!validateRequired(form, ['lookup','relation'])) return;
  const profile = v9BuildExternalProfile(form.elements.lookup.value);
  if (!usernameAvailable(profile.username)) return toast('Persona duplicada', 'Ese usuario ya existe en tu red o corresponde a tu propio perfil.');
  if (!profileIdAvailable(profile.profileId)) return toast('ID duplicado', 'Ese ID ya existe en tu red o corresponde a tu propio perfil.');
  const requestedStatus = form.elements.status.value;
  const data = {
    name: profile.name,
    relation: form.elements.relation.value.trim(),
    phone: '',
    email: '',
    username: profile.username,
    profileId: profile.profileId,
    priority: form.elements.priority.value,
    status: requestedStatus,
    requestStatus: requestedStatus === 'Activo' ? 'Aceptada en demo' : requestedStatus,
    requestType: 'Solicitud interna por usuario/ID',
    connectionLabel: form.elements.connectionLabel.value.trim() || profile.label || 'Red interna',
    originTag: form.elements.originTag.value.trim() || 'Agregado desde web',
    destinationTag: form.elements.destinationTag.value.trim() || 'Recibe alertas internas',
    sourceModule: 'Personas de emergencia web',
    channel: 'Chat interno',
    notes: form.elements.notes.value.trim()
  };
  const created = addContact(data);
  if (created.status === 'Suspendido por plan') toast('Solicitud creada fuera del límite', 'La persona se conserva pausada. Actualiza el plan o libera espacio para activarla.');
  else toast('Solicitud interna enviada', `Se creó la solicitud para @${created.username}.`);
  navigate('/dashboard/contactos');
}

function addContact(data) {
  const contact = {
    id: generateId(),
    createdAt: new Date().toISOString().slice(0,10),
    monitorId: null,
    phone: '',
    email: '',
    notes: '',
    channel: 'Chat interno',
    username: data.username ? v8Slug(data.username) : v8Slug(data.name),
    profileId: data.profileId || v8ProfileId(data.name),
    requestType: 'Solicitud interna',
    requestStatus: data.status === 'Activo' ? 'Aceptada' : (data.status || 'Solicitud enviada'),
    connectionLabel: 'Red interna',
    originTag: 'Agregado desde web',
    destinationTag: 'Recibe alertas internas',
    ...data
  };
  contact.channel = 'Chat interno';
  state.contacts.push(contact);
  enforceContactPlanLimit();
  ensureChatThreads();
  addNotification('Solicitud interna creada', `${contact.name} fue agregado por usuario/ID.`, 'contact');
  return contact;
}

function goAddContact() {
  state.ui.lastLookupInput = '';
  if (usableContacts().length >= plan().contactsLimit) {
    openModal({
      title: 'Límite del plan alcanzado',
      content: `<div class="alert-box warning"><div>⚠️</div><div><strong>Tu plan ${esc(plan().name)} permite ${plan().contactsLimit} persona(s).</strong><p>Puedes crear una solicitud, pero si supera el límite quedará pausada y no recibirá chat ni alertas hasta actualizar el plan o liberar espacio.</p></div></div>`,
      actions: [
        { label: 'Actualizar plan', className: 'primary', onClick: () => { closeModal(); navigate('/dashboard/suscripcion'); } },
        { label: 'Crear solicitud pausada', className: 'warning', onClick: () => { closeModal(); navigate('/dashboard/contactos/nuevo'); } },
        { label: 'Cancelar', onClick: closeModal }
      ],
      large: true
    });
    return;
  }
  navigate('/dashboard/contactos/nuevo');
}

function renderMonitorNetwork() {
  ensureV9State();
  const status = state.filters.monitorStatus || 'todos';
  const monitors = state.monitors.filter(m => status === 'todos' || m.status === status);
  const counts = state.monitors.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});
  const content = `
    <div class="alert-box info"><div>🛡️</div><div><strong>Solicitudes e invitaciones internas</strong><p>Esta sección simula el flujo de invitación entre cuentas. La persona se busca por usuario o ID, acepta desde su propia cuenta y después queda disponible para chat, alertas e historial compartido.</p></div></div>
    <div class="grid grid-4">
      <div class="card stat-card"><h3>Activas</h3><div class="stat-value">${counts.Activo || 0}</div><p class="stat-desc">Ya aceptaron.</p></div>
      <div class="card stat-card"><h3>Pendientes</h3><div class="stat-value">${counts.Pendiente || 0}</div><p class="stat-desc">Esperan respuesta.</p></div>
      <div class="card stat-card"><h3>Revocadas</h3><div class="stat-value">${counts.Revocado || 0}</div><p class="stat-desc">Acceso retirado.</p></div>
      <div class="card stat-card"><h3>Expiradas</h3><div class="stat-value">${counts.Expirado || 0}</div><p class="stat-desc">Token vencido.</p></div>
    </div>
    <div class="toolbar" style="margin-top:16px"><select data-filter="monitorStatus"><option value="todos">Todos</option>${options(['Activo','Pendiente','Expirado','Revocado'], status)}</select><button class="btn" data-action="clear-monitor-filters">Limpiar filtros</button></div>
    <div class="table-wrap"><table><thead><tr><th>Persona</th><th>Usuario / ID</th><th>Etiqueta</th><th>Estado</th><th>Token</th><th>Acciones</th></tr></thead><tbody>${monitors.map(monitorRow).join('') || `<tr><td colspan="6">No hay solicitudes con ese filtro.</td></tr>`}</tbody></table></div>
  `;
  return dashboardShell('Solicitudes e invitaciones', 'Control de acceso interno tipo red/familia.', content, `<button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Nueva solicitud</button><button class="btn" data-route="/dashboard/contactos/nuevo">Agregar por usuario/ID</button><button class="btn" data-route="/dashboard/chats">Chats</button>`);
}

function monitorRow(m) {
  const relatedContact = state.contacts.find(c => String(c.monitorId) === String(m.id) || String(c.id) === String(m.contactId));
  const chatButton = relatedContact ? `<button class="btn small" data-action="open-chat-contact" data-id="${relatedContact.id}">Chat</button>` : '';
  const restore = m.status === 'Revocado' ? `<button class="btn small success" data-action="restore-monitor" data-id="${m.id}">Devolver acceso</button>` : '';
  const activate = m.status !== 'Activo' ? `<button class="btn small success" data-action="activate-monitor" data-id="${m.id}">Aceptar demo</button>` : '';
  const revoke = m.status !== 'Revocado' ? `<button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>` : '';
  return `<tr><td><strong>${esc(m.name)}</strong><br><span class="muted">${esc(m.requestType || 'Invitación interna')}</span></td><td>@${esc(m.username)}<br><button class="link-btn" data-action="copy-invite" data-id="${m.id}">${esc(m.profileId)}</button></td><td><span class="string-tag">${esc(m.connectionLabel || 'Red interna')}</span></td><td><span class="badge ${monitorStatusClass(m.status)}">${esc(m.status)}</span></td><td><code>${esc(m.token)}</code></td><td><div class="actions"><button class="btn small" data-route="/dashboard/red-monitoreo/${m.id}">Ver</button><button class="btn small" data-action="copy-invite" data-id="${m.id}">Copiar</button>${chatButton}${activate}${restore}${revoke}</div></td></tr>`;
}

function renderNewInvitation() {
  ensureV9State();
  const params = new URLSearchParams(currentPath().split('?')[1] || '');
  const contactId = params.get('contacto');
  const selectedContact = state.contacts.find(c => String(c.id) === String(contactId));
  const content = `
    <form id="invite-form" novalidate>
      <div class="alert-box info"><div>🪪</div><div><strong>Nueva solicitud interna</strong><p>Solo usa usuario Impact.X o ID de perfil. La aceptación real sería desde la cuenta de la otra persona; en esta demo puedes activarla manualmente.</p></div></div>
      <div class="grid grid-2">
        <div class="card"><h3>Cuenta destino</h3>
          <div class="field"><label>Usar persona ya agregada</label><select name="contactId"><option value="">Nueva persona por usuario/ID</option>${state.contacts.map(c => `<option value="${c.id}" ${selectedContact?.id === c.id ? 'selected' : ''}>@${esc(c.username)} · ${esc(c.profileId)}</option>`).join('')}</select></div>
          <div class="field"><label>Usuario o ID de perfil</label><input name="lookup" value="${selectedContact ? '@' + esc(selectedContact.username) : ''}" placeholder="@maria_segura o IX-MARIA-9Q2WA" /></div>
          <div class="field"><label>Relación</label><input name="relation" value="${esc(selectedContact?.relation || '')}" placeholder="Ej. Familia, amigo, pareja" /></div>
          <div class="field"><label>Tiempo de expiración del token</label><select name="expires">${options(['24 horas','48 horas','7 días'], '7 días')}</select></div>
        </div>
        <div class="card"><h3>Etiquetas simples</h3>
          <div class="field"><label>Etiqueta de contexto</label><input name="connectionLabel" value="${esc(selectedContact?.connectionLabel || 'Invitación familiar')}"></div>
          <div class="field"><label>Etiqueta de origen</label><input name="originTag" value="Solicitado desde web"></div>
          <div class="field"><label>Etiqueta de destino</label><input name="destinationTag" value="Chat y alertas internas"></div>
          <label class="checkbox-row"><input name="canReceiveUpdates" type="checkbox" checked />Permitir recibir actualizaciones por chat interno.</label>
          <label class="checkbox-row"><input name="canReply" type="checkbox" checked />Permitir responder en chats internos.</label>
        </div>
      </div>
      <div class="form-actions"><button class="btn primary" type="submit">Generar solicitud</button><button class="btn" type="button" data-route="/dashboard/red-monitoreo">Cancelar</button></div>
    </form>
  `;
  return dashboardShell('Nueva solicitud interna', 'Invita cuentas existentes por usuario/ID, sin capturar datos personales externos.', content);
}

function submitInvite(form) {
  const contactId = form.elements.contactId.value || null;
  let contact = contactId ? state.contacts.find(x => String(x.id) === String(contactId)) : null;
  let profile = null;
  if (!contact) {
    if (!validateRequired(form, ['lookup','relation'])) return;
    profile = v9BuildExternalProfile(form.elements.lookup.value);
    if (!usernameAvailable(profile.username)) return toast('Persona duplicada', 'Ese usuario ya existe en tu red interna.');
    if (!profileIdAvailable(profile.profileId)) return toast('ID duplicado', 'Ese ID ya existe en tu red interna.');
    contact = addContact({
      name: profile.name,
      relation: form.elements.relation.value.trim(),
      username: profile.username,
      profileId: profile.profileId,
      priority: 'Alternativo',
      status: 'Pendiente',
      requestStatus: 'Pendiente',
      requestType: 'Invitación interna',
      connectionLabel: form.elements.connectionLabel.value.trim() || profile.label || 'Invitación interna',
      originTag: form.elements.originTag.value.trim() || 'Solicitado desde web',
      destinationTag: form.elements.destinationTag.value.trim() || 'Chat y alertas internas',
      notes: 'Solicitud creada desde invitaciones internas.'
    });
  }
  const token = `INT-${contact.username.toUpperCase().replace(/_/g,'').slice(0,8)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const expires = form.elements.expires.value;
  const monitor = {
    id: generateId(),
    contactId: contact.id,
    name: contact.name,
    phone: '',
    email: '',
    username: contact.username,
    profileId: contact.profileId,
    status: 'Pendiente',
    requestType: 'Solicitud interna',
    connectionLabel: form.elements.connectionLabel.value.trim() || contact.connectionLabel || 'Invitación interna',
    invitedAt: v9Now(),
    acceptedAt: '',
    expiresAt: expires === '24 horas' ? 'Expira en 24 horas' : expires === '48 horas' ? 'Expira en 48 horas' : 'Expira en 7 días',
    token,
    channel: 'Chat interno',
    permissions: ['Recibir SOS interno', 'Ver ubicación en incidente'].concat(form.elements.canReceiveUpdates.checked ? ['Recibir actualizaciones por chat'] : []).concat(form.elements.canReply.checked ? ['Responder por chat interno'] : [])
  };
  state.monitors.push(monitor);
  contact.monitorId = monitor.id;
  if (contact.status !== 'Suspendido por plan') contact.status = 'Pendiente';
  contact.requestStatus = 'Pendiente';
  state.drafts.inviteUrl = `${location.origin}${location.pathname}#/invitacion/${token}`;
  addNotification('Solicitud interna generada', `Se generó solicitud para @${monitor.username}.`, 'monitor');
  toast('Solicitud interna generada', 'Copia el token o actívala en modo demo.');
  route();
}

function renderMonitorDetail(id) {
  ensureV9State();
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return renderNotFound();
  const relatedContact = state.contacts.find(c => String(c.monitorId) === String(m.id) || String(c.id) === String(m.contactId));
  const content = `<div class="grid grid-2"><div class="card"><h3>${esc(m.name)}</h3><p>@${esc(m.username)} · ${esc(m.profileId)}</p><div class="divider"></div>${infoRows({Estado: m.status, Solicitud: m.requestType || 'Interna', Etiqueta: m.connectionLabel || 'Red interna', Invitado: m.invitedAt, Aceptado: m.acceptedAt || 'Pendiente', Expira: m.expiresAt, Token: m.token, Canal: 'Chat interno'})}<div class="card-actions">${monitorActionButtons(m)}${relatedContact ? `<button class="btn primary" data-action="open-chat-contact" data-id="${relatedContact.id}">Abrir chat</button>` : ''}<button class="btn" data-route="/dashboard/red-monitoreo">Volver</button></div></div><div class="card"><h3>Sentido del flujo</h3><div class="request-flow"><div class="request-step"><strong>Viene de</strong><span>Perfil web del titular.</span></div><div class="request-step"><strong>Va hacia</strong><span>Cuenta @${esc(m.username)}.</span></div><div class="request-step"><strong>Canal</strong><span>Chat interno.</span></div><div class="request-step"><strong>Estado</strong><span>${esc(m.status)}</span></div></div></div></div>`;
  return dashboardShell('Detalle de solicitud', 'Token, estado y flujo interno de invitación.', content);
}

function monitorActionButtons(m) {
  const buttons = [`<button class="btn small" data-action="copy-invite" data-id="${m.id}">Copiar token</button>`];
  if (m.status !== 'Activo') buttons.push(`<button class="btn small success" data-action="activate-monitor" data-id="${m.id}">Aceptar demo</button>`);
  if (m.status === 'Revocado') buttons.push(`<button class="btn small success" data-action="restore-monitor" data-id="${m.id}">Devolver acceso</button>`);
  if (m.status !== 'Revocado') buttons.push(`<button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>`);
  if (m.status !== 'Expirado') buttons.push(`<button class="btn small warning" data-action="expire-monitor" data-id="${m.id}">Expirar</button>`);
  return buttons.join('');
}

function renderChats() {
  ensureV9State();
  const q = (state.filters.chatSearch || '').toLowerCase();
  const threads = state.chatThreads.filter(t => `${t.title} ${t.username} ${t.profileId}`.toLowerCase().includes(q));
  const active = getActiveThread();
  const contact = contactByThread(active);
  const canSend = contact && contact.status === 'Activo';
  const routeContext = state.routeHistory?.[0];
  const sidebar = `
    <div class="chat-sidebar card">
      <div class="section-head compact"><div><h3>Conversaciones</h3><p>${state.chatThreads.length} chats internos</p></div><button class="btn small" data-route="/dashboard/contactos/nuevo">+ Solicitud</button></div>
      <input class="chat-search" value="${esc(state.filters.chatSearch || '')}" data-filter="chatSearch" placeholder="Buscar chat, usuario o ID" />
      <div class="chat-list">${threads.map(t => {
        const c = contactByThread(t);
        return `<button class="chat-thread ${active?.id === t.id ? 'active' : ''}" data-action="select-chat" data-id="${t.id}"><strong>${esc(t.title)}</strong><span>@${esc(t.username)} · ${esc(c?.status || 'Sin estado')}</span>${t.unread ? `<em>${t.unread}</em>` : ''}</button>`;
      }).join('') || '<div class="empty-state compact"><h3>Sin chats</h3><p>Envía una solicitud interna para crear conversaciones.</p></div>'}</div>
    </div>`;
  const panel = active ? `
    <div class="chat-panel card">
      <div class="chat-header">
        <div><h3>${esc(active.title)}</h3><p>@${esc(active.username)} · ${esc(active.profileId)} · ${esc(contact?.status || 'Sin persona')}</p></div>
        <div class="actions"><button class="btn small" data-route="/dashboard/contactos/${contact?.id || ''}">Ver vínculo</button><button class="btn small" data-action="simulate-reply">Simular respuesta</button></div>
      </div>
      ${routeContext ? `<div class="chat-route-context"><span class="string-tag">Ruta: ${esc(routeContext.origin)} → ${esc(routeContext.destination)}</span><span class="string-tag alt">${esc(routeContext.sourceTag)}</span><button class="chip" data-action="send-route-context" data-id="${routeContext.id}" ${canSend ? '' : 'disabled'}>Enviar contexto de ruta</button></div>` : ''}
      ${!canSend ? `<div class="alert-box warning"><div>⚠️</div><div><strong>Chat limitado</strong><p>Esta persona está ${esc(contact?.status || 'no disponible')}. Debe aceptar la solicitud, estar activa y quedar dentro del límite del plan.</p></div></div>` : ''}
      <div class="quick-messages">${V9_QUICK_MESSAGES.map(msg => `<button class="chip" data-action="send-quick-message" data-message="${esc(msg)}" ${canSend ? '' : 'disabled'}>${esc(msg)}</button>`).join('')}</div>
      <div class="messages">${active.messages.map(m => `<div class="message ${esc(m.from)}"><span>${esc(m.text)}</span><small>${esc(m.time || '')}</small></div>`).join('')}</div>
      <form id="chat-form" class="chat-compose" novalidate>
        <input name="message" placeholder="Escribe un mensaje interno..." ${canSend ? '' : 'disabled'} required />
        <button class="btn primary" type="submit" ${canSend ? '' : 'disabled'}>Enviar</button>
      </form>
    </div>` : `
    <div class="chat-panel card"><div class="empty-state"><h3>Sin conversaciones</h3><p>Primero envía una solicitud interna por usuario o ID.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Agregar persona</button></div></div>`;
  const content = `
    <div class="alert-box info"><div>💬</div><div><strong>Chat interno Impact.X</strong><p>La web es para gestionar red, solicitudes, rutas e incidentes. Los viajes se inician desde móvil; aquí solo puedes consultar historial y comunicarte internamente.</p></div></div>
    <div class="chat-layout">${sidebar}${panel}</div>
  `;
  return dashboardShell('Chats internos', 'Comunicación privada con mensajes rápidos, respuestas simuladas y contexto de rutas.', content, `<button class="btn primary" data-action="broadcast-accident">Enviar alerta a red activa</button><button class="btn" data-route="/dashboard/contactos/nuevo">Nueva solicitud</button><button class="btn" data-route="/dashboard/rutas">Ver rutas</button>`);
}

function renderRoutes() {
  ensureV9State();
  const q = (state.filters.routeSearch || '').toLowerCase();
  const status = state.filters.routeStatus || 'todos';
  const routes = state.routeHistory.filter(r => {
    const text = `${r.origin} ${r.destination} ${r.originLabel} ${r.destinationLabel} ${r.sourceTag} ${r.status}`.toLowerCase();
    return (!q || text.includes(q)) && (status === 'todos' || r.status === status);
  });
  const content = `
    <div class="alert-box info"><div>🗺️</div><div><strong>Historial de rutas sincronizadas</strong><p>La web no tiene botón de iniciar viaje porque esa acción pertenece a la app móvil. Este módulo solo consulta, filtra y analiza rutas que supuestamente llegaron desde el móvil.</p></div></div>
    <div class="grid grid-4">
      <div class="card stat-card"><h3>Total rutas</h3><div class="stat-value">${state.routeHistory.length}</div><p class="stat-desc">Registros disponibles.</p></div>
      <div class="card stat-card"><h3>Con incidente</h3><div class="stat-value">${state.routeHistory.filter(r => r.status === 'Incidente').length}</div><p class="stat-desc">Rutas vinculadas a eventos.</p></div>
      <div class="card stat-card"><h3>Finalizadas</h3><div class="stat-value">${state.routeHistory.filter(r => r.status === 'Finalizada').length}</div><p class="stat-desc">Sin alerta crítica.</p></div>
      <div class="card stat-card"><h3>Fuente</h3><div class="stat-value small-text">Móvil</div><p class="stat-desc">La web solo gestiona.</p></div>
    </div>
    <div class="toolbar" style="margin-top:16px"><input value="${esc(state.filters.routeSearch || '')}" data-filter="routeSearch" placeholder="Buscar origen, destino o etiqueta" /><select data-filter="routeStatus"><option value="todos">Todos</option>${options(['Finalizada','Incidente','Cancelada','Sincronizada'], status)}</select><button class="btn" data-action="clear-route-filters">Limpiar filtros</button></div>
    <div class="grid grid-2" style="margin-top:16px">${routes.map(routeCard).join('') || '<div class="empty-state"><h3>Sin rutas</h3><p>No hay rutas que coincidan con el filtro.</p></div>'}</div>
  `;
  return dashboardShell('Historial de rutas', 'Consulta de rutas creadas desde móvil y sincronizadas a la web.', content, `<button class="btn primary" data-action="simulate-mobile-route">Simular ruta recibida desde móvil</button><button class="btn" data-route="/dashboard/incidentes">Ver incidentes</button>`);
}

function routeCard(r) {
  const cls = r.status === 'Incidente' ? 'danger' : r.status === 'Finalizada' ? 'success' : 'info';
  return `<div class="card route-summary-card"><div class="stat-top"><h3>${esc(r.origin)} → ${esc(r.destination)}</h3><span class="badge ${cls}">${esc(r.status)}</span></div><div class="route-line"><div class="route-dot-stack"><span class="route-dot"></span><span class="route-stick"></span><span class="route-dot end"></span></div><div><p><strong>Origen:</strong> ${esc(r.originLabel || r.origin)}</p><p><strong>Destino:</strong> ${esc(r.destinationLabel || r.destination)}</p><p class="muted">${esc(r.date)} · ${esc(r.startTime)} - ${esc(r.endTime)}</p></div></div><div class="route-tags"><span class="string-tag">${esc(r.sourceTag)}</span><span class="string-tag alt">${esc(r.distance)}</span><span class="string-tag muted">${esc(r.avgSpeed)}</span></div><div class="divider"></div>${infoRows({'Vehículo': r.vehicle, Incidentes: r.incidents, Notas: r.notes})}<div class="card-actions"><button class="btn small" data-action="copy-route-summary" data-id="${r.id}">Copiar resumen</button><button class="btn small" data-action="send-route-context" data-id="${r.id}">Enviar a chat activo</button>${r.status === 'Incidente' ? '<button class="btn small" data-route="/dashboard/incidentes">Ver incidentes</button>' : ''}</div></div>`;
}

function routeMiniRow(r) {
  return `<div class="list-item"><div><h4>${esc(r.origin)} → ${esc(r.destination)}</h4><p>${esc(r.date)} · ${esc(r.status)} · ${esc(r.sourceTag)}</p></div><button class="btn small" data-route="/dashboard/rutas">Ver</button></div>`;
}

function route() {
  ensureV9State();
  saveState();
  const path = currentPath();
  document.body.classList.toggle('sidebar-open', state.ui.sidebarOpen);
  if (path === '/') app.innerHTML = renderLanding();
  else if (path.startsWith('/planes')) app.innerHTML = renderPlans(true);
  else if (path.startsWith('/registro')) app.innerHTML = renderRegister();
  else if (path === '/login') app.innerHTML = renderLogin();
  else if (path === '/recuperar-password') app.innerHTML = renderRecover();
  else if (path.startsWith('/invitacion/')) app.innerHTML = renderAcceptInvite(path.split('/')[2]);
  else if (path === '/permisos') app.innerHTML = renderPermissions(false);
  else if (path === '/onboarding') app.innerHTML = renderOnboarding();
  else if (path === '/dashboard' || path === '/dashboard/overview' || path === '/dashboard/metricas' || path === '/dashboard/chats') app.innerHTML = renderChats();
  else if (/^\/dashboard\/chats\/contact-\d+$/.test(path)) { state.ui.activeChatId = path.split('/')[3]; app.innerHTML = renderChats(); }
  else if (path === '/dashboard/rutas') app.innerHTML = renderRoutes();
  else if (path === '/dashboard/perfil') app.innerHTML = renderProfile();
  else if (path === '/dashboard/wearable') app.innerHTML = renderWearable();
  else if (path === '/dashboard/contactos') app.innerHTML = renderContacts();
  else if (path === '/dashboard/contactos/nuevo') app.innerHTML = renderContactForm('new');
  else if (/^\/dashboard\/contactos\/\d+\/editar$/.test(path)) app.innerHTML = renderContactForm('edit', path.split('/')[3]);
  else if (/^\/dashboard\/contactos\/\d+$/.test(path)) app.innerHTML = renderContactDetail(path.split('/')[3]);
  else if (path === '/dashboard/red-monitoreo') app.innerHTML = renderMonitorNetwork();
  else if (path.startsWith('/dashboard/red-monitoreo/nueva-invitacion')) app.innerHTML = renderNewInvitation();
  else if (/^\/dashboard\/red-monitoreo\/\d+$/.test(path)) app.innerHTML = renderMonitorDetail(path.split('/')[3]);
  else if (path === '/dashboard/suscripcion') app.innerHTML = renderSubscription();
  else if (path.startsWith('/dashboard/suscripcion/cambiar-plan/')) app.innerHTML = renderChangePlan(path.split('/')[4]);
  else if (path === '/dashboard/suscripcion/pagos') app.innerHTML = renderPayments();
  else if (path.startsWith('/dashboard/suscripcion/pago')) app.innerHTML = renderPayment();
  else if (path === '/dashboard/incidentes') app.innerHTML = renderIncidents();
  else if (/^\/dashboard\/incidentes\/\d+$/.test(path)) app.innerHTML = renderIncidentDetail(path.split('/')[3]);
  else if (/^\/dashboard\/alerta\/\d+$/.test(path)) app.innerHTML = renderActiveAlert(path.split('/')[3]);
  else if (path === '/dashboard/notificaciones') app.innerHTML = renderNotifications();
  else if (path === '/dashboard/configuracion') app.innerHTML = renderSettings();
  else if (path === '/dashboard/permisos') app.innerHTML = renderPermissions(true);
  else if (path.startsWith('/dashboard/ayuda')) app.innerHTML = renderHelp();
  else if (path === '/dashboard/suscripcion-vencida') app.innerHTML = renderSubscriptionExpired();
  else if (path === '/dashboard/error-conexion') app.innerHTML = renderConnectionError();
  else app.innerHTML = renderNotFound();
  attachHandlers();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function handleAction(event, action, el) {
  event.preventDefault();
  ensureV9State();
  const id = el.dataset.id;
  const planKey = el.dataset.plan;
  const token = el.dataset.token;
  const tab = el.dataset.tab;
  const message = el.dataset.message;
  switch (action) {
    case 'scroll-how': document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' }); break;
    case 'choose-plan': choosePlan(planKey); break;
    case 'toggle-avatar-menu': state.ui.avatarMenu = !state.ui.avatarMenu; renderSame(); break;
    case 'toggle-sidebar': setSidebarOpen(!state.ui.sidebarOpen); break;
    case 'logout': logout(); break;
    case 'reset-demo': resetDemo(); break;
    case 'cancel-onboarding': cancelOnboarding(); break;
    case 'onboarding-prev': state.onboardingStep = Math.max(1, state.onboardingStep - 1); route(); break;
    case 'onboarding-skip-contact': state.onboardingStep = 5; toast('Persona omitida', 'Puedes agregarla después desde Personas de emergencia.'); route(); break;
    case 'onboarding-edit': state.onboardingStep = 1; route(); break;
    case 'finish-onboarding': state.user.onboardingComplete = true; state.isLoggedIn = true; toast('Configuración completa', 'Bienvenido a chats internos.'); navigate('/dashboard/chats'); break;
    case 'sync-wearable': syncWearable(); break;
    case 'show-pairing-guide': pairingGuide(); break;
    case 'simulate-low-battery': state.wearable.battery = 12; addNotification('Batería baja', 'Tu wearable tiene 12% de batería.', 'wearable'); toast('Batería baja simulada'); route(); break;
    case 'toggle-wearable-connection': state.wearable.connection = state.wearable.connection === 'connected' ? 'disconnected' : 'connected'; toast('Estado cambiado', `Wearable ${state.wearable.connection === 'connected' ? 'conectado' : 'desconectado'}.`); route(); break;
    case 'unlink-wearable': unlinkWearable(); break;
    case 'go-add-contact': goAddContact(); break;
    case 'clear-contact-filters': state.filters.contacts = ''; state.filters.contactStatus = 'todos'; route(); break;
    case 'clear-incident-filters': state.filters.incidents = ''; state.filters.severity = 'todos'; state.filters.incidentStatus = 'todos'; route(); break;
    case 'save-contact-invite': saveContactFromForm(true); break;
    case 'cancel-contact-form': cancelContactForm(); break;
    case 'delete-contact': deleteContact(id); break;
    case 'make-primary': makePrimary(id); break;
    case 'invite-contact': navigate(`/dashboard/red-monitoreo/nueva-invitacion?contacto=${id}`); break;
    case 'copy-invite': copyInvite(id); break;
    case 'copy-last-invite': copyText(state.drafts.inviteUrl, 'Token/ruta copiado'); break;
    case 'open-last-invite': navigate(new URL(state.drafts.inviteUrl).hash.replace('#', '')); break;
    case 'send-whatsapp': openChatFromMonitor(id); break;
    case 'resend-invite': resendInvite(id); break;
    case 'revoke-monitor': revokeMonitor(id); break;
    case 'restore-monitor': restoreMonitor(id); break;
    case 'activate-monitor': activateMonitor(id); break;
    case 'expire-monitor': expireMonitor(id); break;
    case 'clear-monitor-filters': state.filters.monitorStatus = 'todos'; route(); break;
    case 'reject-invite': rejectInvite(token); break;
    case 'confirm-plan-change': confirmPlanChange(planKey); break;
    case 'expire-subscription': expireSubscription(); break;
    case 'cancel-subscription': cancelSubscription(); break;
    case 'download-payment': toast('Comprobante simulado', 'Se generaría un PDF de pago.'); break;
    case 'export-incidents': exportIncidents(); break;
    case 'view-incident-map': if (plan().maps) navigate(`/dashboard/incidentes/${id}`); else premiumBlocked('El mapa de incidentes'); break;
    case 'download-report': downloadReport(id); break;
    case 'open-external-map': openExternalMap(id); break;
    case 'mark-false-alarm': markFalseAlarm(id); break;
    case 'add-incident-note': addIncidentNote(id); break;
    case 'simulate-critical-incident': simulateCriticalIncident(); break;
    case 'simulate-dashboard-day': simulateDashboardDay(); break;
    case 'export-dashboard': exportDashboardSummary(); break;
    case 'call-primary-contact': openPrimaryChat(); break;
    case 'mark-alert-attended': markAlertAttended(id); break;
    case 'mark-all-read': state.notifications.forEach(n => n.unread = false); toast('Notificaciones leídas'); route(); break;
    case 'delete-all-notifications': deleteAllNotifications(); break;
    case 'toggle-read': toggleRead(id); break;
    case 'delete-notification': deleteNotification(id); break;
    case 'change-password': changePassword(); break;
    case 'save-preferences': savePreferences(); break;
    case 'download-data': downloadData(); break;
    case 'close-sessions': toast('Sesiones cerradas', 'Se cerraron las sesiones activas simuladas.'); break;
    case 'delete-account': deleteAccount(); break;
    case 'help-tab': state.ui.activeHelp = tab; route(); break;
    case 'grant-all-permissions': grantAllPermissions(); break;
    case 'clear-permissions': clearPermissions(); break;
    case 'retry-connection': toast('Conexión restablecida', 'El servidor respondió correctamente.'); navigate('/dashboard/chats'); break;
    case 'copy-profile-id': copyText(state.user.profileId, 'ID de perfil copiado'); break;
    case 'copy-username': copyText(`@${state.user.username}`, 'Usuario copiado'); break;
    case 'copy-contact-profile': copyContactProfile(id); break;
    case 'open-chat-contact': openChatContact(id); break;
    case 'open-chat-monitor': openChatFromMonitor(id); break;
    case 'select-chat': selectChat(id); break;
    case 'send-quick-message': sendChatMessage(message); break;
    case 'simulate-reply': simulateReply(); break;
    case 'broadcast-accident': broadcastAccident(); break;
    case 'send-alert-message': broadcastAccident(message); break;
    case 'lookup-internal-user': {
      const input = $('#contact-form')?.elements.lookup?.value || '';
      state.ui.lastLookupInput = input;
      route();
      break;
    }
    case 'accept-contact-request': acceptContactRequest(id); break;
    case 'pause-contact-request': pauseContactRequest(id); break;
    case 'simulate-mobile-route': simulateMobileRoute(); break;
    case 'clear-route-filters': state.filters.routeStatus = 'todos'; state.filters.routeSearch = ''; route(); break;
    case 'copy-route-summary': copyRouteSummary(id); break;
    case 'send-route-context': sendRouteContext(id); break;
    default: console.warn('Acción no controlada:', action);
  }
  saveState();
}

function handleSubmit(event) {
  event.preventDefault();
  ensureV9State();
  const form = event.target;
  switch (form.id) {
    case 'register-form': submitRegister(form); break;
    case 'login-form': submitLogin(form); break;
    case 'recover-form': submitRecover(form); break;
    case 'permissions-form': submitPermissions(form); break;
    case 'onboarding-personal': submitOnboardingPersonal(form); break;
    case 'onboarding-medical': submitOnboardingMedical(form); break;
    case 'onboarding-vehicle': submitOnboardingVehicle(form); break;
    case 'onboarding-contact': submitOnboardingContact(form); break;
    case 'profile-form': submitProfile(form); break;
    case 'contact-form': saveContactFromForm(false); break;
    case 'invite-form': submitInvite(form); break;
    case 'accept-invite-form': submitAcceptInvite(form); break;
    case 'payment-form': submitPayment(form); break;
    case 'settings-form': submitSettings(form); break;
    case 'support-form': submitSupport(form); break;
    case 'chat-form': submitChat(form); break;
    default: console.warn('Formulario no controlado:', form.id);
  }
  saveState();
}

function acceptContactRequest(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  if (c.status === 'Suspendido por plan' || usableContacts().length > plan().contactsLimit) return limitBlocked();
  c.status = 'Activo';
  c.requestStatus = 'Aceptada en demo';
  c.acceptedAt = v9Now();
  ensureChatThreads();
  const t = state.chatThreads.find(x => x.id === threadIdForContact(c.id));
  if (t) pushMessage(t, 'system', `${c.name} aceptó la solicitud interna en modo demo.`);
  addNotification('Solicitud aceptada', `${c.name} ahora forma parte de tu red activa.`, 'contact');
  toast('Solicitud aceptada', 'El chat interno quedó habilitado.');
  route();
}

function pauseContactRequest(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  if (c.status !== 'Suspendido por plan') c.previousStatus = c.status;
  c.status = 'Inactivo';
  c.requestStatus = 'Pausada';
  toast('Vínculo pausado', 'La persona queda guardada, pero no recibe chats ni alertas.');
  route();
}

function simulateMobileRoute() {
  const samples = [
    ['Casa', 'Trabajo', 'Sale de casa', 'Llega al trabajo'],
    ['Universidad', 'Casa', 'Sale de universidad', 'Regresa a casa'],
    ['Centro de Tula', 'Hospital regional', 'Punto urbano', 'Destino preventivo'],
    ['Gasolinera', 'Domicilio familiar', 'Parada intermedia', 'Punto familiar']
  ];
  const sample = samples[Math.floor(Math.random() * samples.length)];
  const statuses = ['Finalizada', 'Sincronizada', 'Finalizada'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const id = generateId();
  state.routeHistory.unshift({
    id,
    date: new Date().toISOString().slice(0,10),
    startTime: new Date(Date.now() - 45 * 60000).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    endTime: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    origin: sample[0],
    destination: sample[1],
    originLabel: sample[2],
    destinationLabel: sample[3],
    sourceTag: 'Sincronizada desde móvil',
    status,
    distance: `${(Math.random() * 16 + 5).toFixed(1)} km`,
    avgSpeed: `${Math.floor(Math.random() * 30 + 40)} km/h`,
    incidents: 0,
    vehicle: `${state.driver.brand || 'Vehículo'} ${state.driver.model || 'registrado'}`,
    notes: 'Ruta generada automáticamente para simular datos enviados por la app móvil.'
  });
  addNotification('Ruta sincronizada', `Se recibió una ruta desde móvil: ${sample[0]} → ${sample[1]}.`, 'route');
  toast('Ruta recibida desde móvil', 'La web la muestra en historial, pero no inicia viajes.');
  route();
}

function copyRouteSummary(id) {
  const r = state.routeHistory.find(x => String(x.id) === String(id));
  if (!r) return;
  copyText(`Ruta ${r.origin} → ${r.destination}\nFecha: ${r.date}\nEstado: ${r.status}\nEtiqueta origen: ${r.originLabel}\nEtiqueta destino: ${r.destinationLabel}\nFuente: ${r.sourceTag}`, 'Resumen de ruta copiado');
}

function sendRouteContext(id) {
  const r = state.routeHistory.find(x => String(x.id) === String(id));
  if (!r) return;
  sendChatMessage(`Contexto de ruta: ${r.origin} → ${r.destination}. Estado: ${r.status}. Etiquetas: ${r.originLabel} / ${r.destinationLabel}.`);
}

function broadcastAccident(customMessage) {
  ensureV9State();
  const active = internalNetworkActive();
  if (!active.length) return toast('Sin red activa', 'No hay personas activas para recibir el mensaje.');
  const text = customMessage || 'Ocurrió un accidente. Revisa mi ubicación y la alerta activa dentro de Impact.X.';
  active.forEach(c => {
    const t = state.chatThreads.find(x => x.id === threadIdForContact(c.id));
    if (t) { pushMessage(t, 'me', text); t.unread = (t.unread || 0) + 1; }
  });
  addNotification('Mensaje interno enviado', `Se notificó a ${active.length} persona(s) activas por chat interno.`, 'incident');
  toast('Red interna notificada', `${active.length} persona(s) recibieron el mensaje.`);
  route();
}

function renderHelpContent(tab) {
  if (tab === 'chat') return `<h3>Chat interno</h3><p>El sistema usa mensajes dentro del aplicativo para alertas, ubicación y respuestas rápidas. Es un canal interno entre cuentas Impact.X.</p><button class="btn primary" data-route="/dashboard/chats">Abrir chats</button>`;
  if (tab === 'contactos') return `<h3>Red interna</h3><p>Agrega personas por usuario Impact.X o ID de perfil. No captures teléfono/correo de terceros; la persona ya tiene su propia cuenta.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Enviar solicitud</button>`;
  if (tab === 'monitores') return `<h3>Solicitudes internas</h3><p>Funcionan como una solicitud de amistad o invitación familiar. Puedes revocar, devolver acceso o activar en modo demo.</p><button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Generar solicitud</button>`;
  if (tab === 'incidentes') return `<h3>Incidentes y rutas</h3><p>La web permite consultar historial de incidentes y rutas sincronizadas desde móvil. No inicia viajes.</p><button class="btn primary" data-route="/dashboard/rutas">Ver rutas</button>`;
  if (tab === 'wearable') return `<h3>Vincular wearable</h3><p>La vinculación real se realiza con app móvil y smartwatch. La web solo muestra estado de sincronización.</p><button class="btn primary" data-action="show-pairing-guide">Ver guía</button>`;
  if (tab === 'planes') return `<h3>Planes</h3><p>Trial tiene 2 personas, Básico 3 y Premium 8. Si superas el límite, las personas excedentes se conservan pausadas.</p><button class="btn primary" data-route="/dashboard/suscripcion">Ver suscripción</button>`;
  return `<h3>Contactar soporte</h3><form id="support-form"><div class="field"><label>Asunto</label><input name="subject" required /></div><div class="field"><label>Tipo de problema</label><select name="type">${options(['Wearable','Red interna','Chat interno','Rutas','Pago','Incidente','Otro'], 'Chat interno')}</select></div><div class="field"><label>Descripción</label><textarea name="description" required></textarea></div><div class="form-actions"><button class="btn primary" type="submit">Enviar solicitud</button><button class="btn" type="button" data-route="/dashboard/chats">Cancelar</button></div></form>`;
}

function resetDemo() {
  confirmModal({ title: 'Reiniciar demo', body: 'Se restaurarán datos mock, personas, solicitudes, chats, rutas, incidentes y plan.', confirmText: 'Reiniciar', danger: true, onConfirm: () => { state = initialState(); ensureV9State(); toast('Demo reiniciada'); navigate('/dashboard/chats'); } });
}

// Ejecuta migración v9 sobre el estado cargado y vuelve a renderizar si el DOM ya está listo.
ensureV9State();
saveState();
if (document.readyState !== 'loading') route();

function renderHelp() {
  ensureV9State();
  const tabs = ['chat','contactos','monitores','incidentes','rutas','wearable','planes','soporte'];
  const labels = { chat:'Chat', contactos:'Red interna', monitores:'Solicitudes', incidentes:'Incidentes', rutas:'Rutas', wearable:'Wearable', planes:'Planes', soporte:'Soporte' };
  const active = new URLSearchParams(currentPath().split('?')[1] || '').get('tema') || state.ui.activeHelp;
  state.ui.activeHelp = tabs.includes(active) ? active : 'chat';
  const content = `
    <div class="tabs">${tabs.map(t => `<button class="tab ${state.ui.activeHelp === t ? 'active' : ''}" data-action="help-tab" data-tab="${t}">${labels[t]}</button>`).join('')}</div>
    <div class="card">${renderHelpContent(state.ui.activeHelp)}</div>
  `;
  return dashboardShell('Ayuda y soporte', 'Guías para usar la web como panel de gestión.', content);
}

function renderHelpContent(tab) {
  if (tab === 'chat') return `<h3>Chat interno</h3><p>El sistema usa mensajes dentro del aplicativo para alertas, ubicación, contexto de rutas y respuestas rápidas. Es un canal interno entre cuentas Impact.X.</p><button class="btn primary" data-route="/dashboard/chats">Abrir chats</button>`;
  if (tab === 'contactos') return `<h3>Red interna</h3><p>Agrega personas por usuario Impact.X o ID de perfil. No captures teléfono/correo de terceros; la persona ya tiene su propia cuenta.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Enviar solicitud</button>`;
  if (tab === 'monitores') return `<h3>Solicitudes internas</h3><p>Funcionan como una solicitud de amistad o invitación familiar. Puedes revocar, devolver acceso o activar en modo demo.</p><button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Generar solicitud</button>`;
  if (tab === 'incidentes') return `<h3>Incidentes</h3><p>El historial muestra eventos, ubicación y telemetría. Algunas funciones avanzadas se bloquean si no hay Premium.</p><button class="btn primary" data-route="/dashboard/incidentes">Ver incidentes</button>`;
  if (tab === 'rutas') return `<h3>Historial de rutas</h3><p>La web no inicia viajes. Solo muestra rutas que se simulan como registradas desde la app móvil, con etiquetas de origen, destino y contexto.</p><button class="btn primary" data-route="/dashboard/rutas">Ver rutas</button>`;
  if (tab === 'wearable') return `<h3>Vincular wearable</h3><p>La vinculación real se realiza con app móvil y smartwatch. La web solo muestra estado de sincronización.</p><button class="btn primary" data-action="show-pairing-guide">Ver guía</button>`;
  if (tab === 'planes') return `<h3>Planes</h3><p>Trial tiene 2 personas, Básico 3 y Premium 8. Si superas el límite, las personas excedentes se conservan pausadas.</p><button class="btn primary" data-route="/dashboard/suscripcion">Ver suscripción</button>`;
  return `<h3>Contactar soporte</h3><form id="support-form"><div class="field"><label>Asunto</label><input name="subject" required /></div><div class="field"><label>Tipo de problema</label><select name="type">${options(['Wearable','Red interna','Chat interno','Rutas','Pago','Incidente','Otro'], 'Chat interno')}</select></div><div class="field"><label>Descripción</label><textarea name="description" required></textarea></div><div class="form-actions"><button class="btn primary" type="submit">Enviar solicitud</button><button class="btn" type="button" data-route="/dashboard/chats">Cancelar</button></div></form>`;
}

/* =========================================================
   Impact.X v11
   - Invitación a la aplicación para personas sin cuenta.
   - Paleta empresarial aplicada desde CSS.
   - Se conserva la lógica previa y se agregan rutas/acciones.
   ========================================================= */

function v11Now() {
  return new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

function v11Token(prefix = 'APP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function ensureV11State() {
  ensureV9State();
  state.filters = {
    ...(state.filters || {}),
    appInviteStatus: state.filters?.appInviteStatus || 'todos'
  };
  state.drafts = { ...(state.drafts || {}) };
  if (!Array.isArray(state.appInvites)) {
    state.appInvites = [
      {
        id: generateId(),
        token: 'APP-FAMILIA-DEMO',
        suggestedName: 'Carlos Hernández',
        suggestedUsername: 'carlos_hernandez',
        relation: 'Hermano',
        priority: 'Secundario',
        status: 'Pendiente de registro',
        createdAt: '2026-06-05 13:20',
        acceptedAt: '',
        expiresAt: 'Expira en 7 días',
        connectionLabel: 'Familia principal',
        originTag: 'Invitación a la app desde web',
        destinationTag: 'Crear cuenta y unirse a red interna',
        personalMessage: 'Crea tu cuenta en Impact.X para poder agregarte a mi red de seguridad.',
        autoAddToNetwork: true,
        inviteUrl: `${location.origin}${location.pathname}#/registro-invitado/APP-FAMILIA-DEMO`
      }
    ];
  }
  state.appInvites.forEach(inv => {
    inv.inviteUrl = inv.inviteUrl || `${location.origin}${location.pathname}#/registro-invitado/${inv.token}`;
    inv.status = inv.status || 'Pendiente de registro';
    inv.connectionLabel = inv.connectionLabel || 'Invitación a Impact.X';
    inv.originTag = inv.originTag || 'Invitado desde web';
    inv.destinationTag = inv.destinationTag || 'Crear cuenta propia';
    inv.autoAddToNetwork = inv.autoAddToNetwork !== false;
  });
}

function appInviteStatusClass(status) {
  if (status === 'Cuenta creada' || status === 'Agregada a red') return 'success';
  if (status === 'Pendiente de registro') return 'warning';
  if (status === 'Cancelada' || status === 'Expirada') return 'danger';
  return 'info';
}

function appInviteUrl(inv) {
  return `${location.origin}${location.pathname}#/registro-invitado/${inv.token}`;
}

const __v11PrevDashboardShell = dashboardShell;
dashboardShell = function v11DashboardShell(title, subtitle, content, actions = '') {
  ensureV11State();
  const unread = state.notifications.filter(n => n.unread).length;
  const chatUnread = state.chatThreads.reduce((sum, t) => sum + (Number(t.unread) || 0), 0);
  const path = currentPath();
  const initials = esc((state.user.name || 'IX').split(' ').map(x => x[0]).slice(0,2).join(''));
  const wearableClass = state.wearable.linked && state.wearable.connection === 'connected' ? 'success' : state.wearable.connection === 'syncing' ? 'warning' : 'danger';
  return `
    <div class="dashboard">
      <aside class="sidebar">
        <a href="#/dashboard/chats" class="brand"><span class="brand-mark">IX</span><span>Impact.X</span></a>
        <div class="side-group">
          <div class="side-label">Gestión web</div>
          ${sideLink('/dashboard/chats', '💬', `Chats internos ${chatUnread ? `(${chatUnread})` : ''}`, path)}
          ${sideLink('/dashboard/contactos', '🧑‍🤝‍🧑', 'Red interna', path)}
          ${sideLink('/dashboard/red-monitoreo', '🛡️', 'Solicitudes e invitaciones', path)}
          ${sideLink('/dashboard/invitar-app', '➕', 'Invitar a la app', path)}
          ${sideLink('/dashboard/rutas', '🗺️', 'Historial de rutas', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Seguridad</div>
          ${sideLink('/dashboard/incidentes', '📍', 'Incidentes', path)}
          ${sideLink('/dashboard/alerta/501', '🚨', 'Alerta activa demo', path)}
          ${sideLink('/dashboard/wearable', '⌚', 'Wearable', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Cuenta</div>
          ${sideLink('/dashboard/perfil', '👤', 'Perfil del conductor', path)}
          ${sideLink('/dashboard/suscripcion', '💳', 'Suscripción', path)}
          ${sideLink('/dashboard/notificaciones', '🔔', `Notificaciones ${unread ? `(${unread})` : ''}`, path)}
          ${sideLink('/dashboard/configuracion', '⚙️', 'Configuración', path)}
          ${sideLink('/dashboard/permisos', '🔐', 'Permisos web', path)}
          ${sideLink('/dashboard/ayuda', '❔', 'Ayuda', path)}
        </div>
        <div class="side-group">
          <button class="side-link" data-action="reset-demo">♻️ Reiniciar demo</button>
          <button class="side-link danger-text" data-action="logout">↩ Cerrar sesión</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <button class="icon-btn menu-btn" data-action="toggle-sidebar">☰</button>
          <div class="top-status">
            <span class="badge ${wearableClass}">Wearable ${state.wearable.connection === 'connected' ? 'online' : 'offline'}</span>
            <span class="badge primary">Plan ${esc(plan().name)}</span>
            <span class="badge success">@${esc(state.user.username)}</span>
          </div>
          <div class="top-actions">
            <button class="btn small hide-sm" data-route="/dashboard/contactos/nuevo">+ Solicitud</button>
            <button class="btn small hide-sm" data-route="/dashboard/invitar-app">Invitar app</button>
            <button class="btn small" data-route="/dashboard/chats">💬 ${chatUnread}</button>
            <button class="icon-btn" data-route="/dashboard/notificaciones">🔔${unread ? `<span>${unread}</span>` : ''}</button>
            <div class="avatar-wrap"><button class="avatar" data-action="toggle-avatar-menu">${initials}</button>${state.ui.avatarMenu ? avatarMenu() : ''}</div>
          </div>
        </header>
        <section class="page-head"><div><p class="eyebrow">Impact.X Web · Panel de gestión empresarial</p><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="page-actions">${actions}</div></section>
        ${content}
      </main>
    </div>
  `;
};

function renderAppInviteList(limit = null) {
  ensureV11State();
  const status = state.filters.appInviteStatus || 'todos';
  let invites = state.appInvites.filter(inv => status === 'todos' || inv.status === status);
  if (limit) invites = invites.slice(0, limit);
  if (!invites.length) {
    return `<div class="empty-state compact"><h3>Sin invitaciones a la app</h3><p>Aún no hay invitaciones para personas que no tienen cuenta.</p></div>`;
  }
  return `<div class="table-wrap"><table><thead><tr><th>Persona invitada</th><th>Estado</th><th>Etiquetas</th><th>Token / enlace</th><th>Acciones</th></tr></thead><tbody>${invites.map(inv => `
    <tr>
      <td><strong>${esc(inv.suggestedName)}</strong><br><span class="muted">@${esc(inv.suggestedUsername || v8Slug(inv.suggestedName))} · ${esc(inv.relation || 'Sin relación')}</span></td>
      <td><span class="badge ${appInviteStatusClass(inv.status)}">${esc(inv.status)}</span><br><span class="muted">${esc(inv.createdAt || '')}</span></td>
      <td><div class="route-tags"><span class="string-tag">${esc(inv.connectionLabel)}</span><span class="string-tag alt">${esc(inv.originTag)}</span><span class="string-tag muted">${esc(inv.destinationTag)}</span></div></td>
      <td><code>${esc(inv.token)}</code><br><button class="link-btn" data-action="copy-app-invite" data-id="${inv.id}">Copiar enlace</button></td>
      <td><div class="actions"><button class="btn small" data-action="open-app-invite" data-id="${inv.id}">Abrir registro</button><button class="btn small success" data-action="mark-app-invite-used" data-id="${inv.id}">Marcar creado</button><button class="btn small danger" data-action="cancel-app-invite" data-id="${inv.id}">Cancelar</button></div></td>
    </tr>`).join('')}</tbody></table></div>`;
}

function renderInviteApp() {
  ensureV11State();
  const pending = state.appInvites.filter(i => i.status === 'Pendiente de registro').length;
  const created = state.appInvites.filter(i => i.status === 'Cuenta creada' || i.status === 'Agregada a red').length;
  const content = `
    <div class="alert-box info"><div>➕</div><div><strong>Invitar a Impact.X</strong><p>Esta opción es para una persona que todavía no tiene cuenta. Primero se le genera un enlace de registro; cuando crea su cuenta, ya puede agregarse a tu red interna por usuario/ID. No se usan SMS, WhatsApp ni correo como canales de alerta: solo se copia el enlace o se abre la vista de registro en la demo.</p></div></div>
    <div class="grid grid-3">
      <div class="card stat-card"><h3>Pendientes</h3><div class="stat-value">${pending}</div><p class="stat-desc">Aún no crean cuenta.</p></div>
      <div class="card stat-card"><h3>Cuentas creadas</h3><div class="stat-value">${created}</div><p class="stat-desc">Ya pueden recibir solicitud interna.</p></div>
      <div class="card stat-card"><h3>Canal</h3><div class="stat-value small-text">Interno</div><p class="stat-desc">Registro + chat Impact.X.</p></div>
    </div>
    <form id="app-invite-form" class="grid grid-2" style="margin-top:16px" novalidate>
      <div class="card app-invite-card"><h3>Datos mínimos de invitación</h3>
        <div class="field"><label>Nombre sugerido de la persona</label><input name="suggestedName" placeholder="Ej. Ana López" required /></div>
        <div class="field"><label>Usuario sugerido</label><input name="suggestedUsername" placeholder="Ej. ana_lopez" /><small class="field-hint">La persona podrá cambiarlo al crear su cuenta si está disponible.</small></div>
        <div class="field"><label>Relación con el titular</label><input name="relation" placeholder="Ej. Hermana, pareja, amigo" required /></div>
        <div class="field"><label>Prioridad cuando se agregue a tu red</label><select name="priority">${options(['Principal','Secundario','Alternativo'], 'Secundario')}</select></div>
      </div>
      <div class="card"><h3>Etiquetas y flujo</h3>
        <div class="field"><label>Etiqueta de contexto</label><input name="connectionLabel" value="Invitación a la app" /></div>
        <div class="field"><label>Etiqueta de origen</label><input name="originTag" value="Invitado desde panel web" /></div>
        <div class="field"><label>Etiqueta de destino</label><input name="destinationTag" value="Crear cuenta y solicitar red interna" /></div>
        <div class="field"><label>Expiración visual</label><select name="expires">${options(['24 horas','48 horas','7 días'], '7 días')}</select></div>
        <label class="checkbox-row"><input name="autoAddToNetwork" type="checkbox" checked />Al crear cuenta, generar solicitud interna automáticamente.</label>
      </div>
      <div class="card field-full"><h3>Mensaje visible en el registro invitado</h3><div class="field"><textarea name="personalMessage" placeholder="Ej. Crea tu cuenta para que pueda agregarte a mi red de seguridad Impact.X.">Crea tu cuenta en Impact.X para poder agregarte a mi red de seguridad y chat interno.</textarea></div></div>
      <div class="form-actions field-full"><button class="btn primary" type="submit">Generar invitación a la app</button><button class="btn" type="button" data-route="/dashboard/contactos/nuevo">Agregar cuenta existente</button><button class="btn" type="button" data-route="/dashboard/red-monitoreo">Ver solicitudes</button></div>
    </form>
    ${state.drafts.appInviteUrl ? `<div class="card app-invite-card" style="margin-top:16px"><h3>Última invitación generada</h3><p class="muted">Copia este enlace o ábrelo para simular que la otra persona crea su cuenta.</p><div class="invite-url-box">${esc(state.drafts.appInviteUrl)}</div><div class="card-actions"><button class="btn" data-action="copy-latest-app-invite">Copiar enlace</button><button class="btn primary" data-action="open-latest-app-invite">Abrir registro invitado</button></div></div>` : ''}
    <div class="card" style="margin-top:16px"><div class="section-head compact"><div><h3>Invitaciones creadas</h3><p>Control de personas que todavía no tenían cuenta.</p></div><select data-filter="appInviteStatus"><option value="todos">Todas</option>${options(['Pendiente de registro','Cuenta creada','Agregada a red','Cancelada','Expirada'], state.filters.appInviteStatus)}</select></div>${renderAppInviteList()}</div>
  `;
  return dashboardShell('Invitar a la aplicación', 'Genera un registro para personas nuevas antes de agregarlas a la red interna.', content, `<button class="btn" data-route="/dashboard/contactos/nuevo">Cuenta existente</button><button class="btn" data-route="/dashboard/red-monitoreo">Solicitudes</button>`);
}

const __v11PrevRenderContacts = renderContacts;
renderContacts = function v11RenderContacts() {
  ensureV11State();
  const html = __v11PrevRenderContacts();
  return html
    .replace('Aún no tienes personas agregadas</h3><p>Agrega a una persona por usuario Impact.X o ID de perfil. Es una solicitud interna: la otra persona ya debe tener cuenta propia.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Enviar solicitud</button>', 'Aún no tienes personas agregadas</h3><p>Agrega una cuenta existente por usuario/ID o invita primero a alguien que todavía no tenga cuenta.</p><button class="btn primary" data-route="/dashboard/contactos/nuevo">Enviar solicitud</button><button class="btn" data-route="/dashboard/invitar-app">Invitar a la app</button>')
    .replace('<div class="alert-box info"><div>🤝</div><div><strong>Red interna tipo solicitud</strong><p>Ya no se capturan teléfono, correo ni datos personales de terceros. Solo se busca por <strong>usuario</strong> o <strong>ID de perfil</strong>, como una solicitud de amistad o invitación familiar. Las etiquetas solo son textos de referencia para entender origen, destino y contexto.</p></div></div>', '<div class="alert-box info"><div>🤝</div><div><strong>Red interna tipo solicitud</strong><p>Si la persona ya tiene cuenta, agrégala por <strong>usuario</strong> o <strong>ID de perfil</strong>. Si no tiene cuenta, usa <strong>Invitar a la aplicación</strong> para generar su registro. Las etiquetas siguen siendo solo texto de referencia.</p></div></div><div class="card app-invite-card"><div class="stat-top"><div><h3>¿La persona no tiene cuenta?</h3><p class="muted">Genera una invitación de registro. Después la persona podrá aparecer en tu red interna y chats.</p></div><button class="btn primary" data-route="/dashboard/invitar-app">Invitar a la app</button></div></div>')
    .replace('<button class="btn" data-route="/dashboard/chats">Chats</button>', '<button class="btn" data-route="/dashboard/chats">Chats</button><button class="btn" data-route="/dashboard/invitar-app">Invitar app</button>');
};

const __v11PrevRenderContactForm = renderContactForm;
renderContactForm = function v11RenderContactForm(mode = 'new', id = null) {
  let html = __v11PrevRenderContactForm(mode, id);
  if (mode === 'new') {
    html = html.replace('<div class="alert-box info"><div>🤝</div><div><strong>Enviar solicitud interna</strong><p>La persona ya debe tener una cuenta Impact.X. Solo ingresa su <strong>usuario</strong> o <strong>ID de perfil</strong>. No captures teléfono, correo ni datos personales porque pertenecen a su propia cuenta.</p></div></div>', '<div class="alert-box info"><div>🤝</div><div><strong>Enviar solicitud interna</strong><p>La persona ya debe tener una cuenta Impact.X. Solo ingresa su <strong>usuario</strong> o <strong>ID de perfil</strong>. Si no tiene cuenta, primero invítala a la aplicación.</p></div></div><div class="card app-invite-card"><div class="stat-top"><div><h3>Persona sin cuenta Impact.X</h3><p class="muted">Genera un enlace para que cree usuario único e ID de perfil. Luego podrá integrarse a tu red interna.</p></div><button class="btn primary" type="button" data-route="/dashboard/invitar-app">Invitar a la aplicación</button></div></div>');
  }
  return html;
};

const __v11PrevRenderMonitorNetwork = renderMonitorNetwork;
renderMonitorNetwork = function v11RenderMonitorNetwork() {
  ensureV11State();
  let html = __v11PrevRenderMonitorNetwork();
  html = html
    .replace('<div class="alert-box info"><div>🛡️</div><div><strong>Solicitudes e invitaciones internas</strong><p>Esta sección simula el flujo de invitación entre cuentas. La persona se busca por usuario o ID, acepta desde su propia cuenta y después queda disponible para chat, alertas e historial compartido.</p></div></div>', '<div class="alert-box info"><div>🛡️</div><div><strong>Solicitudes e invitaciones internas</strong><p>Esta sección simula el flujo entre cuentas existentes. Para personas nuevas, primero genera una <strong>invitación a la app</strong>; al registrarse obtienen usuario único e ID de perfil.</p></div></div><div class="card app-invite-card"><div class="stat-top"><div><h3>Invitar persona nueva a Impact.X</h3><p class="muted">Útil cuando todavía no existe usuario/ID para buscarla.</p></div><button class="btn primary" data-route="/dashboard/invitar-app">Invitar a la app</button></div></div>')
    .replace('<button class="btn" data-route="/dashboard/chats">Chats</button>', '<button class="btn" data-route="/dashboard/chats">Chats</button><button class="btn" data-route="/dashboard/invitar-app">Invitar app</button>');
  return html;
};

function submitAppInvite(form) {
  ensureV11State();
  if (!validateRequired(form, ['suggestedName','relation'])) return;
  const suggestedName = form.elements.suggestedName.value.trim();
  const suggestedUsername = v8Slug(form.elements.suggestedUsername.value.trim() || suggestedName);
  const token = v11Token('APP');
  const expires = form.elements.expires.value;
  const inv = {
    id: generateId(),
    token,
    suggestedName,
    suggestedUsername,
    relation: form.elements.relation.value.trim(),
    priority: form.elements.priority.value,
    status: 'Pendiente de registro',
    createdAt: v11Now(),
    acceptedAt: '',
    expiresAt: expires === '24 horas' ? 'Expira en 24 horas' : expires === '48 horas' ? 'Expira en 48 horas' : 'Expira en 7 días',
    connectionLabel: form.elements.connectionLabel.value.trim() || 'Invitación a la app',
    originTag: form.elements.originTag.value.trim() || 'Invitado desde panel web',
    destinationTag: form.elements.destinationTag.value.trim() || 'Crear cuenta y solicitar red interna',
    personalMessage: form.elements.personalMessage.value.trim() || 'Crea tu cuenta en Impact.X para poder agregarte a mi red de seguridad.',
    autoAddToNetwork: form.elements.autoAddToNetwork.checked,
    inviteUrl: `${location.origin}${location.pathname}#/registro-invitado/${token}`
  };
  state.appInvites.unshift(inv);
  state.drafts.appInviteUrl = inv.inviteUrl;
  addNotification('Invitación a la app creada', `${suggestedName} podrá crear una cuenta Impact.X.`, 'contact');
  toast('Invitación a la app generada', 'Copia el enlace o abre la vista de registro invitado.');
  route();
}

function renderAppInviteAccept(token) {
  ensureV11State();
  const inv = state.appInvites.find(x => String(x.token) === String(token));
  if (!inv) {
    return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Invitación Impact.X</span><h2>Invitación no válida</h2><p>El token no existe o ya no está disponible en esta demo.</p><div class="form-actions"><button class="btn primary" data-route="/registro">Crear cuenta manualmente</button><button class="btn" data-route="/login">Iniciar sesión</button></div></div></div></section>`);
  }
  const username = v8Slug(inv.suggestedUsername || inv.suggestedName);
  const disabled = inv.status === 'Cancelada' || inv.status === 'Expirada';
  const content = `
    <section class="form-page">
      <div class="container">
        <div class="form-card wide">
          <span class="eyebrow">Invitación a Impact.X</span>
          <h2>Crear cuenta invitada</h2>
          <p>${esc(inv.personalMessage || 'Crea tu cuenta para integrarte a la red interna Impact.X.')}</p>
          <div class="grid grid-2">
            <div class="card app-invite-card"><h3>Invitado por ${esc(state.user.name)}</h3>${infoRows({'Relación sugerida': inv.relation, Estado: inv.status, Token: inv.token, 'Destino': inv.destinationTag})}</div>
            <div class="card"><h3>Flujo</h3><div class="app-invite-flow"><div class="app-invite-step"><strong>1</strong><span>Crear cuenta</span></div><div class="app-invite-step"><strong>2</strong><span>Generar usuario e ID</span></div><div class="app-invite-step"><strong>3</strong><span>Solicitud interna</span></div><div class="app-invite-step"><strong>4</strong><span>Chat y alertas</span></div></div></div>
          </div>
          ${disabled ? `<div class="alert-box danger" style="margin-top:16px"><div>⚠️</div><div><strong>Invitación ${esc(inv.status)}</strong><p>Solicita al titular una nueva invitación.</p></div></div>` : `
          <form id="app-account-form" data-token="${esc(inv.token)}" style="margin-top:16px" novalidate>
            <div class="form-grid">
              <div class="field"><label>Nombre completo</label><input name="name" value="${esc(inv.suggestedName)}" required /></div>
              <div class="field"><label>Usuario Impact.X</label><input name="username" value="${esc(username)}" required /></div>
              <div class="field"><label>Correo electrónico</label><input name="email" type="email" placeholder="correo@ejemplo.com" required /></div>
              <div class="field"><label>Teléfono de referencia</label><input name="phone" placeholder="Solo referencia del perfil" /></div>
              <div class="field"><label>Contraseña</label><input name="password" type="password" value="Impactx123" required /></div>
              <div class="field"><label>Confirmar contraseña</label><input name="confirm" type="password" value="Impactx123" required /></div>
            </div>
            <label class="checkbox-row"><input name="terms" type="checkbox" checked />Acepto crear una cuenta propia Impact.X.</label>
            <label class="checkbox-row"><input name="network" type="checkbox" ${inv.autoAddToNetwork ? 'checked' : ''} />Permitir que se genere solicitud interna con el titular.</label>
            <div class="form-actions"><button class="btn primary" type="submit">Crear cuenta y continuar</button><button class="btn" type="button" data-route="/login">Ya tengo cuenta</button></div>
          </form>`}
        </div>
      </div>
    </section>`;
  return publicShell(content);
}

function submitAppAccount(form) {
  ensureV11State();
  const token = form.dataset.token;
  const inv = state.appInvites.find(x => String(x.token) === String(token));
  if (!inv) return toast('Invitación no válida', 'No se encontró la invitación.');
  if (!validateRequired(form, ['name','username','email','password','confirm'])) return;
  if (form.elements.password.value !== form.elements.confirm.value) return toast('Contraseña inválida', 'Las contraseñas no coinciden.');
  if (!form.elements.terms.checked) return toast('Acepta términos', 'Debes aceptar crear la cuenta.');
  const username = v8Slug(form.elements.username.value);
  if (!usernameAvailable(username)) return toast('Usuario no disponible', 'Ese usuario ya existe en esta demo. Prueba con otro.');
  const profileId = v8ProfileId(username);
  inv.status = form.elements.network.checked ? 'Agregada a red' : 'Cuenta creada';
  inv.acceptedAt = v11Now();
  inv.createdAccount = {
    name: form.elements.name.value.trim(),
    username,
    profileId,
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim()
  };
  if (form.elements.network.checked) {
    const contact = addContact({
      name: inv.createdAccount.name,
      relation: inv.relation,
      username,
      profileId,
      priority: inv.priority || 'Secundario',
      status: 'Pendiente',
      requestStatus: 'Cuenta creada · pendiente de aceptación interna',
      requestType: 'Invitación a app + solicitud interna',
      connectionLabel: inv.connectionLabel,
      originTag: inv.originTag,
      destinationTag: inv.destinationTag,
      sourceModule: 'Invitación a aplicación',
      notes: 'Persona creó cuenta desde invitación a la aplicación.'
    });
    const monitorToken = v11Token('INT');
    const monitor = {
      id: generateId(),
      contactId: contact.id,
      name: contact.name,
      phone: '',
      email: '',
      username: contact.username,
      profileId: contact.profileId,
      status: 'Pendiente',
      requestType: 'Solicitud generada tras registro en app',
      connectionLabel: contact.connectionLabel,
      invitedAt: v11Now(),
      acceptedAt: '',
      expiresAt: 'Expira en 7 días',
      token: monitorToken,
      channel: 'Chat interno',
      permissions: ['Recibir SOS interno', 'Ver ubicación en incidente', 'Responder por chat interno']
    };
    state.monitors.push(monitor);
    contact.monitorId = monitor.id;
    ensureChatThreads();
    state.ui.activeChatId = threadIdForContact(contact.id);
  }
  addNotification('Cuenta invitada creada', `${inv.createdAccount.name} creó cuenta Impact.X desde invitación.`, 'contact');
  toast('Cuenta creada en demo', 'La persona ya tiene usuario e ID. Se generó solicitud interna si estaba marcada.');
  saveState();
  navigate('/dashboard/contactos');
}

function copyAppInvite(id) {
  ensureV11State();
  const inv = state.appInvites.find(x => String(x.id) === String(id));
  if (!inv) return;
  inv.inviteUrl = appInviteUrl(inv);
  copyText(inv.inviteUrl, 'Enlace de invitación a la app copiado');
}

function openAppInvite(id) {
  const inv = state.appInvites.find(x => String(x.id) === String(id));
  if (!inv) return;
  navigate(`/registro-invitado/${inv.token}`);
}

function markAppInviteUsed(id) {
  ensureV11State();
  const inv = state.appInvites.find(x => String(x.id) === String(id));
  if (!inv) return;
  inv.status = 'Cuenta creada';
  inv.acceptedAt = v11Now();
  toast('Invitación marcada', 'Se marcó como cuenta creada en modo demo.');
  route();
}

function cancelAppInvite(id) {
  const inv = state.appInvites.find(x => String(x.id) === String(id));
  if (!inv) return;
  confirmModal({ title: 'Cancelar invitación a la app', body: `La invitación para ${esc(inv.suggestedName)} dejará de estar disponible en la demo.`, confirmText: 'Cancelar invitación', danger: true, onConfirm: () => { inv.status = 'Cancelada'; toast('Invitación cancelada'); route(); } });
}

const __v11PrevRoute = route;
route = function v11Route() {
  ensureV11State();
  saveState();
  const path = currentPath();
  if (path === '/dashboard/invitar-app') {
    document.body.classList.toggle('sidebar-open', state.ui.sidebarOpen);
    app.innerHTML = renderInviteApp();
    attachHandlers();
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  if (path.startsWith('/registro-invitado/')) {
    document.body.classList.toggle('sidebar-open', state.ui.sidebarOpen);
    app.innerHTML = renderAppInviteAccept(path.split('/')[2]);
    attachHandlers();
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  return __v11PrevRoute();
};

const __v11PrevHandleAction = handleAction;
handleAction = function v11HandleAction(event, action, el) {
  event.preventDefault();
  ensureV11State();
  const id = el.dataset.id;
  switch (action) {
    case 'copy-app-invite': copyAppInvite(id); break;
    case 'open-app-invite': openAppInvite(id); break;
    case 'mark-app-invite-used': markAppInviteUsed(id); break;
    case 'cancel-app-invite': cancelAppInvite(id); break;
    case 'copy-latest-app-invite': copyText(state.drafts.appInviteUrl || '', 'Último enlace de invitación copiado'); break;
    case 'open-latest-app-invite': {
      const last = state.appInvites.find(x => appInviteUrl(x) === state.drafts.appInviteUrl) || state.appInvites[0];
      if (last) navigate(`/registro-invitado/${last.token}`);
      else toast('Sin invitación', 'Primero genera una invitación.');
      break;
    }
    default: return __v11PrevHandleAction(event, action, el);
  }
  saveState();
};

const __v11PrevHandleSubmit = handleSubmit;
handleSubmit = function v11HandleSubmit(event) {
  const form = event.target;
  if (form.id === 'app-invite-form') {
    event.preventDefault();
    submitAppInvite(form);
    saveState();
    return;
  }
  if (form.id === 'app-account-form') {
    event.preventDefault();
    submitAppAccount(form);
    saveState();
    return;
  }
  return __v11PrevHandleSubmit(event);
};

const __v11PrevRenderHelpContent = renderHelpContent;
renderHelpContent = function v11RenderHelpContent(tab) {
  if (tab === 'monitores') return `<h3>Solicitudes internas e invitación a app</h3><p>Cuando la persona ya tiene cuenta, se usa usuario/ID. Cuando no la tiene, primero se genera una invitación a la aplicación para que cree cuenta propia y después pueda integrarse a la red interna.</p><div class="card-actions"><button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Solicitud a cuenta existente</button><button class="btn" data-route="/dashboard/invitar-app">Invitar a la app</button></div>`;
  if (tab === 'contactos') return `<h3>Red interna</h3><p>Agrega personas existentes por usuario Impact.X o ID de perfil. No se capturan teléfonos, correos ni canales externos. Si la persona no tiene cuenta, invítala primero a la aplicación.</p><div class="card-actions"><button class="btn primary" data-route="/dashboard/contactos/nuevo">Enviar solicitud</button><button class="btn" data-route="/dashboard/invitar-app">Invitar a la app</button></div>`;
  return __v11PrevRenderHelpContent(tab);
};

ensureV11State();
saveState();
if (document.readyState !== 'loading') route();
