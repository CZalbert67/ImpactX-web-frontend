// js/state.js

export const PLAN_RULES = {
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

export const VEHICLE_TYPES = ['Sedán', 'Hatchback', 'SUV', 'Camioneta', 'Pick-up', 'Van / familiar'];
export const DEFAULT_VEHICLE_TYPE = 'Sedán';

export function normalizeVehicleType(value) {
  return VEHICLE_TYPES.includes(value) ? value : DEFAULT_VEHICLE_TYPE;
}

export const initialState = () => ({
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
    notifications: 'todas',
    chatSearch: '',
    routeStatus: 'todos',
    routeSearch: '',
    appInviteStatus: 'todos'
  },
  ui: {
    avatarMenu: false,
    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 880 : false,
    activeHelp: 'chat',
    activeChatId: null,
    lastLookupInput: ''
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
    notifyEmail: false,
    notifySms: false,
    notifyWhatsapp: false,
    notifyInternal: true,
    twoFactor: false,
    username: 'leo_demo',
    profileId: 'IX-LEO-8F3W'
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
      internalBridge: true
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
    acceptedAt: '2026-06-04 10:00',
    internalChat: true
  },
  contacts: [
    {
      id: 101,
      name: 'María Fernanda Tejeda',
      username: 'maria_segura',
      profileId: 'IX-MARIA-9Q2WA',
      relation: 'Madre',
      phone: '+52 773 111 2233',
      email: 'maria.demo@mail.com',
      priority: 'Principal',
      status: 'Activo',
      channel: 'Chat interno',
      requestType: 'Solicitud interna',
      requestStatus: 'Aceptada',
      connectionLabel: 'Familiar principal',
      originTag: 'Agregado desde web',
      destinationTag: 'Recibe alertas internas',
      createdAt: '2026-06-01',
      monitorId: 301,
      notes: 'Contacto principal para cualquier incidente.'
    },
    {
      id: 102,
      name: 'Carlos Barrera',
      username: 'carlos_barrera',
      profileId: 'IX-CARLOS-72KMD',
      relation: 'Hermano',
      phone: '+52 773 444 5566',
      email: 'carlos.demo@mail.com',
      priority: 'Secundario',
      status: 'Activo',
      channel: 'Chat interno',
      requestType: 'Solicitud interna',
      requestStatus: 'Aceptada',
      connectionLabel: 'Familiar secundario',
      originTag: 'Agregado desde web',
      destinationTag: 'Recibe alertas internas',
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
      username: 'maria_segura',
      profileId: 'IX-MARIA-9Q2WA',
      phone: '+52 773 111 2233',
      email: 'maria.demo@mail.com',
      status: 'Activo',
      invitedAt: '2026-06-01 14:20',
      acceptedAt: '2026-06-01 14:32',
      expiresAt: '2026-06-08 14:20',
      token: 'MON-MARIA-8X2K',
      channel: 'Chat interno',
      permissions: ['Recibir SOS interno', 'Ver ubicación en incidente', 'Responder por chat interno']
    },
    {
      id: 302,
      contactId: null,
      name: 'Andrea Monroy',
      username: 'andrea_monroy',
      profileId: 'IX-ANDREA-54FPL',
      phone: '+52 773 222 8899',
      email: 'andrea.monitor@mail.com',
      status: 'Pendiente',
      invitedAt: '2026-06-04 10:12',
      acceptedAt: '',
      expiresAt: '2026-06-11 10:12',
      token: 'MON-ANDREA-19QZ',
      channel: 'Chat interno',
      permissions: ['Recibir SOS interno', 'Ver ubicación en incidente', 'Responder por chat interno']
    },
    {
      id: 303,
      contactId: null,
      name: 'Omar Picazo',
      username: 'omar_picazo',
      profileId: 'IX-OMAR-88ZTR',
      phone: '+52 773 333 7711',
      email: 'omar.monitor@mail.com',
      status: 'Expirado',
      invitedAt: '2026-05-25 12:40',
      acceptedAt: '',
      expiresAt: '2026-05-26 12:40',
      token: 'MON-OMAR-X7P2',
      channel: 'Chat interno',
      permissions: ['Recibir SOS interno', 'Ver ubicación en incidente', 'Responder por chat interno']
    },
    {
      id: 304,
      contactId: null,
      name: 'Felicitas Diego',
      username: 'felicitas_diego',
      profileId: 'IX-FELI-16VRP',
      phone: '+52 773 555 4412',
      email: 'felicitas.monitor@mail.com',
      status: 'Revocado',
      invitedAt: '2026-05-29 16:05',
      acceptedAt: '2026-05-29 16:15',
      revokedAt: '2026-06-02 09:15',
      expiresAt: '2026-06-05 16:05',
      token: 'MON-FELI-R9A1',
      channel: 'Chat interno',
      permissions: ['Recibir SOS interno', 'Ver ubicación en incidente', 'Responder por chat interno']
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
    lastReportFormat: 'PDF',
    appInviteUrl: ''
  },
  chatThreads: [],
  routeHistory: [],
  appInvites: []
});

const STORAGE_KEY = 'impactx-web-prototype-v7-state';

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState();
  } catch (error) {
    console.warn('No se pudo cargar localStorage, usando estado inicial.', error);
    return initialState();
  }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('No se pudo guardar en localStorage.', error);
  }
}

export function migrateState() {
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
    if (!c.channel) c.channel = 'Chat interno';
  });
  state.monitors = Array.isArray(state.monitors) ? state.monitors : defaults.monitors;
  state.incidents = Array.isArray(state.incidents) ? state.incidents : defaults.incidents;
  state.notifications = Array.isArray(state.notifications) ? state.notifications : defaults.notifications;
  state.payments = Array.isArray(state.payments) ? state.payments : defaults.payments;
  state.drafts = { ...defaults.drafts, ...(state.drafts || {}) };
}

export function computeIdCounter(data) {
  const ids = [
    ...(data.contacts || []).map(x => x.id),
    ...(data.monitors || []).map(x => x.id),
    ...(data.incidents || []).map(x => x.id),
    ...(data.notifications || []).map(x => x.id),
    ...(data.payments || []).map(x => x.id),
    ...(data.appInvites || []).map(x => x.id),
    ...(data.routeHistory || []).map(x => x.id)
  ].map(Number).filter(Boolean);
  return Math.max(1000, ...ids);
}

export function v8Slug(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '')
    .slice(0, 24);
}

export function v8ProfileId(seed = '') {
  const base = v8Slug(seed).replace(/_/g, '').slice(0, 6).toUpperCase() || 'USER';
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `IX-${base}-${rnd}`;
}

export function threadIdForContact(contactId) {
  return 'contact-' + contactId;
}

export function ensureChatThreads() {
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

export function ensureState() {
  // Consolidating ensureV8State, ensureV9State, ensureV11State
  
  // Filters
  state.filters = {
    chatSearch: '',
    contactStatus: 'todos',
    monitorStatus: 'todos',
    routeStatus: 'todos',
    routeSearch: '',
    appInviteStatus: 'todos',
    ...(state.filters || {})
  };

  // UI
  state.ui = {
    activeChatId: null,
    avatarMenu: false,
    sidebarOpen: false,
    activeHelp: 'chat',
    lastLookupInput: '',
    ...(state.ui || {})
  };

  // User
  state.user = { ...(state.user || {}) };
  if (!state.user.username) state.user.username = v8Slug(state.user.name || state.driver?.fullName || 'leo_demo');
  if (!state.user.profileId) state.user.profileId = v8ProfileId(state.user.username);
  if (state.user.notifyInternal === undefined) state.user.notifyInternal = true;
  state.user.notifyEmail = false;
  state.user.notifySms = false;
  state.user.notifyWhatsapp = false;

  // Driver
  state.driver = { ...(state.driver || {}) };

  // Wearable
  state.wearable = state.wearable || {};
  state.wearable.permissions = state.wearable.permissions || {};
  state.wearable.permissions.internalBridge = true;
  delete state.wearable.permissions.smsBridge;

  // Web permissions
  state.webPermissions = {
    internalChat: true,
    ...(state.webPermissions || {})
  };

  // Contacts
  state.contacts = Array.isArray(state.contacts) ? state.contacts : [];
  state.contacts.forEach((c, index) => {
    if (!c.username) c.username = v8Slug(c.name || `contacto_${index + 1}`);
    if (!c.profileId) c.profileId = v8ProfileId(c.username);
    c.channel = 'Chat interno';
    if (!c.status) c.status = 'Activo';
    if (!c.priority) c.priority = 'Secundario';
    
    // v9 contacts fields
    c.requestType = c.requestType || 'Solicitud interna';
    c.requestStatus = c.requestStatus || (c.status === 'Activo' ? 'Aceptada' : c.status === 'Pendiente' ? 'Pendiente' : c.status === 'Revocado' ? 'Revocada' : 'Gestionada');
    c.connectionLabel = c.connectionLabel || c.label || c.relation || 'Red interna';
    c.originTag = c.originTag || 'Agregado desde web';
    c.destinationTag = c.destinationTag || 'Recibe alertas internas';
  });

  // Monitors
  state.monitors = Array.isArray(state.monitors) ? state.monitors : [];
  state.monitors.forEach((m, index) => {
    if (!m.username) m.username = v8Slug(m.name || `monitor_${index + 1}`);
    if (!m.profileId) m.profileId = v8ProfileId(m.username);
    if (!m.status) m.status = index === 0 ? 'Activo' : 'Pendiente';
    m.channel = 'Chat interno';
    m.permissions = m.permissions || ['Recibir SOS interno', 'Ver ubicación en incidente', 'Responder por chat interno'];
  });

  // Chat threads
  if (!Array.isArray(state.chatThreads)) state.chatThreads = [];
  ensureChatThreads();

  // Route history (v9)
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

  // App invites (v11)
  state.drafts = state.drafts || {};
  if (!Array.isArray(state.appInvites)) {
    state.appInvites = [
      {
        id: generateId(),
        token: 'APP-MARIA-8X2K',
        suggestedName: 'Yolanda Tejeda',
        suggestedUsername: 'yolanda_tejeda',
        relation: 'Tía',
        priority: 'Secundario',
        status: 'Cuenta creada',
        createdAt: '2026-06-03 10:20',
        acceptedAt: '2026-06-03 10:45',
        expiresAt: 'Expira en 7 días',
        connectionLabel: 'Familiar alterno',
        originTag: 'Invitada por el titular',
        destinationTag: 'Recibir avisos',
        personalMessage: 'Regístrate por favor.',
        autoAddToNetwork: true,
        inviteUrl: '',
        createdAccount: {
          name: 'Yolanda Tejeda',
          username: 'yolanda_tejeda',
          profileId: 'IX-YOLANDA-883PL',
          email: 'yolanda.tejeda@mail.com',
          phone: '+52 773 111 8899'
        }
      }
    ];
  }
}

// Global active instances
export let state = loadState();
migrateState();
export let idCounter = computeIdCounter(state);

export function generateId() {
  idCounter += 1;
  return idCounter;
}

export function plan() {
  return PLAN_RULES[state.user.plan] || PLAN_RULES.trial;
}

export function usableContacts() {
  return state.contacts.filter(c => c.status !== 'Suspendido por plan');
}

export function suspendedContacts() {
  return state.contacts.filter(c => c.status === 'Suspendido por plan');
}

export function activeAlertContacts() {
  return state.contacts.filter(c => c.status === 'Activo');
}

export function resetDemoState() {
  state = initialState();
  migrateState();
  ensureState();
  idCounter = computeIdCounter(state);
  saveState();
}

export function addNotification(title, body, type = 'system') {
  state.notifications.unshift({ id: generateId(), title, body, type, unread: true, date: new Date().toLocaleString('es-MX') });
}
