// js/views/monitors.js
import { state, saveState, ensureState, generateId, addNotification, ensureChatThreads } from '../state.js';
import { route, navigate, renderNotFound } from '../router.js';
import { esc, toast, confirmModal, openModal, closeModal, validateRequired } from '../utils.js';
import { dashboardShell, publicShell } from '../components/shell.js';
import { options, infoRows } from './onboarding.js';
import { usernameAvailable, profileIdAvailable, pushMessage } from './chats.js';
import { addContact, v9BuildExternalProfile } from './contacts.js';
import { v8Slug, v8ProfileId } from '../state.js';

export function monitorStatusClass(status) {
  if (status === 'Activo') return 'success';
  if (status === 'Pendiente') return 'warning';
  if (status === 'Revocado') return 'danger';
  if (status === 'Expirado') return 'info';
  return 'info';
}

export function monitorStatusDescription(status) {
  if (status === 'Activo') return 'Puede recibir alertas y ubicación.';
  if (status === 'Pendiente') return 'Aún no acepta la invitación.';
  if (status === 'Expirado') return 'La URL anterior venció; puedes restaurar acceso generando una nueva invitación.';
  if (status === 'Revocado') return 'El acceso fue retirado; puedes devolverlo si el titular lo autoriza.';
  return 'Estado de monitoreo.';
}

export function monitorUrl(m) {
  return `${location.origin}${location.pathname}#/invitacion/${m.token}`;
}

export function refreshMonitorToken(m) {
  const base = (m.name || 'MONITOR').split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '') || 'MONITOR';
  m.token = `INT-${base}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  m.invitedAt = new Date().toLocaleString('es-MX');
  m.expiresAt = 'Expira en 7 días';
}

export function resendInvite(id) {
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

export function revokeMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  if (m.status === 'Revocado') return toast('Ya estaba revocado', `${m.name} no tiene acceso activo.`);
  confirmModal({ 
    title: 'Revocar monitor', 
    body: `${m.name} dejará de recibir alertas y ubicación de emergencia. Luego puedes devolver el acceso desde esta misma pantalla.`, 
    confirmText: 'Revocar acceso', 
    danger: true, 
    onConfirm: () => { 
      m.previousStatus = m.status; 
      m.status = 'Revocado'; 
      m.revokedAt = new Date().toLocaleString('es-MX'); 
      addNotification('Monitor revocado', `${m.name} fue revocado de la red.`, 'monitor'); 
      toast('Acceso revocado'); 
      route(); 
    } 
  });
}

export function restoreMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  const wasAccepted = Boolean(m.acceptedAt) && m.previousStatus === 'Activo';
  confirmModal({ 
    title: 'Devolver acceso', 
    body: `Se restaurará el acceso de ${m.name}. ${wasAccepted ? 'Quedará activo porque ya había aceptado previamente.' : 'Quedará pendiente con una invitación nueva para que acepte otra vez.'}`, 
    confirmText: 'Devolver acceso', 
    onConfirm: () => {
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
    } 
  });
}

export function activateMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  if (m.status === 'Activo') return toast('Monitor activo', `${m.name} ya puede recibir alertas.`);
  confirmModal({ 
    title: 'Aceptar invitación en demo', 
    body: `Esto simula que ${m.name} abrió la URL y aceptó permisos de monitoreo.`, 
    confirmText: 'Activar monitor', 
    onConfirm: () => {
      m.status = 'Activo';
      m.acceptedAt = new Date().toLocaleString('es-MX');
      delete m.revokedAt;
      delete m.previousStatus;
      
      const c = state.contacts.find(x => String(x.monitorId) === String(m.id) || String(x.id) === String(m.contactId));
      if (c) {
        c.status = 'Activo';
        c.requestStatus = 'Aceptada';
      }
      
      addNotification('Monitor activo', `${m.name} aceptó la invitación en la demo.`, 'monitor');
      toast('Monitor activado', `${m.name} ya recibe alertas.`);
      route();
    } 
  });
}

export function expireMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  if (m.status === 'Activo') return toast('No se puede expirar', 'Un monitor activo primero debe revocarse si quieres quitar acceso.');
  confirmModal({ 
    title: 'Expirar invitación', 
    body: `La URL de ${m.name} quedará vencida. Después podrás restaurarla o reenviarla.`, 
    confirmText: 'Expirar', 
    danger: true, 
    onConfirm: () => {
      m.previousStatus = m.status;
      m.status = 'Expirado';
      m.expiresAt = new Date().toLocaleString('es-MX');
      addNotification('Invitación expirada', `La invitación de ${m.name} venció en la demo.`, 'monitor');
      toast('Invitación expirada');
      route();
    } 
  });
}

export function rejectInvite(token) {
  const m = state.monitors.find(x => x.token === token);
  if (!m) return;
  confirmModal({ 
    title: 'Rechazar invitación', 
    body: '¿Seguro que deseas rechazar esta invitación?', 
    confirmText: 'Rechazar', 
    danger: true, 
    onConfirm: () => { 
      m.status = 'Revocado'; 
      openModal({ 
        title: 'Invitación rechazada', 
        body: 'Has rechazado la invitación de monitoreo.', 
        actions: [{ label: 'Aceptar', className: 'primary', onClick: () => { closeModal(); navigate('/'); } }] 
      }); 
    } 
  });
}

export function copyInvite(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  copyText(`${monitorUrl(m)}\nUsuario: @${m.username}\nID: ${m.profileId}`, 'Invitación interna copiada');
}

export function sendWhatsapp(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  toast('Simulación WhatsApp', `Enviando invitación a ${m.name} por WhatsApp.`);
}

export function monitorActionButtons(m) {
  const buttons = [];
  if (m.status === 'Activo') {
    buttons.push(`<button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar acceso</button>`);
  } else if (m.status === 'Revocado') {
    buttons.push(`<button class="btn small success" data-action="restore-monitor" data-id="${m.id}">Devolver acceso</button>`);
  } else if (m.status === 'Expirado') {
    buttons.push(`<button class="btn small" data-action="resend-invite" data-id="${m.id}">Reenviar token</button>`);
  } else if (m.status === 'Pendiente') {
    buttons.push(`<button class="btn small success" data-action="activate-monitor" data-id="${m.id}">Aceptar demo</button>`);
    buttons.push(`<button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>`);
  }
  if (m.status !== 'Expirado') {
    buttons.push(`<button class="btn small warning" data-action="expire-monitor" data-id="${m.id}">Expirar</button>`);
  }
  return buttons.join('');
}

export function monitorRow(m) {
  const relatedContact = state.contacts.find(c => String(c.monitorId) === String(m.id) || String(c.id) === String(m.contactId));
  const chatButton = relatedContact ? `<button class="btn small" data-action="open-chat-contact" data-id="${relatedContact.id}">Chat</button>` : '';
  const restore = m.status === 'Revocado' ? `<button class="btn small success" data-action="restore-monitor" data-id="${m.id}">Devolver acceso</button>` : '';
  const activate = m.status !== 'Activo' ? `<button class="btn small success" data-action="activate-monitor" data-id="${m.id}">Aceptar demo</button>` : '';
  const revoke = m.status !== 'Revocado' ? `<button class="btn small danger" data-action="revoke-monitor" data-id="${m.id}">Revocar</button>` : '';
  return `<tr>
    <td><strong>${esc(m.name)}</strong><br><span class="muted">${esc(m.requestType || 'Invitación interna')}</span></td>
    <td>@${esc(m.username)}<br><button class="link-btn" data-action="copy-invite" data-id="${m.id}">${esc(m.profileId)}</button></td>
    <td><span class="string-tag">${esc(m.connectionLabel || 'Red interna')}</span></td>
    <td><span class="badge ${monitorStatusClass(m.status)}">${esc(m.status)}</span></td>
    <td><code>${esc(m.token)}</code></td>
    <td><div class="actions"><button class="btn small" data-route="/dashboard/red-monitoreo/${m.id}">Ver</button><button class="btn small" data-action="copy-invite" data-id="${m.id}">Copiar</button>${chatButton}${activate}${restore}${revoke}</div></td>
  </tr>`;
}

export function renderMonitorNetwork() {
  ensureState();
  const status = state.filters.monitorStatus || 'todos';
  const monitors = state.monitors.filter(m => status === 'todos' || m.status === status);
  const counts = state.monitors.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});
  
  const content = `
    <div class="alert-box info">
      <div>🛡️</div>
      <div>
        <strong>Solicitudes e invitaciones internas</strong>
        <p>Esta sección simula el flujo entre cuentas existentes. Para personas nuevas, primero genera una <strong>invitación a la app</strong>; al registrarse obtienen usuario único e ID de perfil.</p>
      </div>
    </div>
    <div class="card app-invite-card">
      <div class="stat-top">
        <div>
          <h3>Invitar persona nueva a Impact.X</h3>
          <p class="muted">Útil cuando todavía no existe usuario/ID para buscarla.</p>
        </div>
        <button class="btn primary" data-route="/dashboard/invitar-app">Invitar a la app</button>
      </div>
    </div>
    <div class="grid grid-4">
      <div class="card stat-card"><h3>Activas</h3><div class="stat-value">${counts.Activo || 0}</div><p class="stat-desc">Ya aceptaron.</p></div>
      <div class="card stat-card"><h3>Pendientes</h3><div class="stat-value">${counts.Pendiente || 0}</div><p class="stat-desc">Esperan respuesta.</p></div>
      <div class="card stat-card"><h3>Revocadas</h3><div class="stat-value">${counts.Revocado || 0}</div><p class="stat-desc">Acceso retirado.</p></div>
      <div class="card stat-card"><h3>Expiradas</h3><div class="stat-value">${counts.Expirado || 0}</div><p class="stat-desc">Token vencido.</p></div>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <select data-filter="monitorStatus">
        <option value="todos">Todos</option>
        ${options(['Activo','Pendiente','Expirado','Revocado'], status)}
      </select>
      <button class="btn" data-action="clear-monitor-filters">Limpiar filtros</button>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Persona</th><th>Usuario / ID</th><th>Etiqueta</th><th>Estado</th><th>Token</th><th>Acciones</th></tr></thead><tbody>${monitors.map(monitorRow).join('') || `<tr><td colspan="6">No hay solicitudes con ese filtro.</td></tr>`}</tbody></table></div>
  `;
  
  return dashboardShell('Solicitudes e invitaciones', 'Control de acceso interno tipo red/familia.', content, `<button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Nueva solicitud</button><button class="btn" data-route="/dashboard/contactos/nuevo">Agregar por usuario/ID</button><button class="btn" data-route="/dashboard/chats">Chats</button><button class="btn" data-route="/dashboard/invitar-app">Invitar app</button>`);
}

export function renderNewInvitation() {
  ensureState();
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

export function submitInvite(form) {
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
    invitedAt: new Date().toLocaleString('es-MX'),
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
  state.drafts.inviteUrl = monitorUrl(monitor);
  addNotification('Solicitud interna generada', `Se generó solicitud para @${monitor.username}.`, 'monitor');
  toast('Solicitud interna generada', 'Copia el token o actívala en modo demo.');
  route();
}

export function renderMonitorDetail(id) {
  ensureState();
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return renderNotFound();
  const relatedContact = state.contacts.find(c => String(c.monitorId) === String(m.id) || String(c.id) === String(m.contactId));
  const content = `<div class="grid grid-2"><div class="card"><h3>${esc(m.name)}</h3><p>@${esc(m.username)} · ${esc(m.profileId)}</p><div class="divider"></div>${infoRows({Estado: m.status, Solicitud: m.requestType || 'Interna', Etiqueta: m.connectionLabel || 'Red interna', Invitado: m.invitedAt, Aceptado: m.acceptedAt || 'Pendiente', Expira: m.expiresAt, Token: m.token, Canal: 'Chat interno'})}<div class="card-actions">${monitorActionButtons(m)}${relatedContact ? `<button class="btn primary" data-action="open-chat-contact" data-id="${relatedContact.id}">Abrir chat</button>` : ''}<button class="btn" data-route="/dashboard/red-monitoreo">Volver</button></div></div><div class="card"><h3>Sentido del flujo</h3><div class="request-flow"><div class="request-step"><strong>Viene de</strong><span>Perfil web del titular.</span></div><div class="request-step"><strong>Va hacia</strong><span>Cuenta @${esc(m.username)}.</span></div><div class="request-step"><strong>Canal</strong><span>Chat interno.</span></div><div class="request-step"><strong>Estado</strong><span>${esc(m.status)}</span></div></div></div></div>`;
  return dashboardShell('Detalle de solicitud', 'Token, estado y flujo interno de invitación.', content);
}

export function renderAcceptInvite(token) {
  ensureState();
  const m = state.monitors.find(x => x.token === token);
  if (!m) {
    return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Invitación inválida</span><h2>La invitación no es válida</h2><p>Solicita al titular una nueva invitación interna.</p><button class="btn" data-route="/">Volver al inicio</button></div></div></section>`);
  }
  if (m.status === 'Activo') {
    return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Ya aceptada</span><h2>Esta invitación ya fue aceptada</h2><p>${esc(m.name)} ya forma parte de la red interna.</p><button class="btn primary" data-route="/">Entendido</button></div></div></section>`);
  }
  if (['Expirado', 'Revocado'].includes(m.status)) {
    return publicShell(`<section class="form-page"><div class="container"><div class="form-card"><span class="eyebrow">Invitación no disponible</span><h2>La invitación está ${esc(m.status.toLowerCase())}</h2><p>Solicita una nueva invitación al titular.</p><button class="btn" data-route="/">Volver</button></div></div></section>`);
  }
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

export function submitAcceptInvite(form) {
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
  
  const c = state.contacts.find(x => String(x.monitorId) === String(m.id) || String(x.id) === String(m.contactId));
  if (c) { 
    c.name = m.name; 
    c.username = m.username; 
    c.profileId = m.profileId; 
    c.phone = m.phone; 
    c.status = 'Activo'; 
    c.channel = 'Chat interno'; 
    c.requestStatus = 'Aceptada';
  }
  
  ensureChatThreads();
  addNotification('Invitación aceptada', `${m.name} aceptó formar parte de tu red interna.`, 'monitor');
  saveState();
  openModal({ 
    title: 'Invitación aceptada', 
    body: 'Ahora formas parte de la red interna de Impact.X. Podrás recibir alertas y responder por chat interno.', 
    actions: [{ label: 'Entendido', className: 'primary', onClick: () => { closeModal(); navigate('/'); } }] 
  });
}
