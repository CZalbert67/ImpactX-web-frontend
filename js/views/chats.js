// js/views/chats.js
import { state, saveState, ensureState, v8Slug, v8ProfileId, threadIdForContact, ensureChatThreads, addNotification } from '../state.js';
import { route, navigate } from '../router.js';
import { esc, toast } from '../utils.js';
import { dashboardShell } from '../components/shell.js';

export const V9_QUICK_MESSAGES = [
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

export const V8_AUTO_RESPONSES = [
  'Recibido. Estoy revisando tu ubicación dentro de Impact.X.',
  'Voy a mantenerme pendiente del chat interno.',
  'Avísame si necesitas que contacte a alguien más.',
  'Estoy al tanto de la alerta. Cuídate mucho.',
  'Entendido, ¿estás bien?',
  '¡Qué bueno que estás a salvo! Gracias por avisar.',
  '¿Ocurrió algo con el coche?',
  'Revisando el reporte.',
  '¿Necesitas que marque al 911?'
];

export function knownUsernames(ignoreContactId = null) {
  const values = [state.user.username];
  state.contacts.forEach(c => { if (String(c.id) !== String(ignoreContactId)) values.push(c.username); });
  state.monitors.forEach(m => values.push(m.username));
  return values.filter(Boolean).map(x => String(x).toLowerCase());
}

export function usernameAvailable(username, ignoreContactId = null) {
  const normalized = v8Slug(username);
  if (String(state.user.username).toLowerCase() === normalized.toLowerCase()) return false;
  return !knownUsernames(ignoreContactId).includes(normalized.toLowerCase());
}

export function profileIdAvailable(profileId, ignoreContactId = null) {
  const normalized = String(profileId).trim().toUpperCase();
  if (String(state.user.profileId).toUpperCase() === normalized) return false;
  const takenContacts = state.contacts
    .filter(c => String(c.id) !== String(ignoreContactId))
    .map(c => String(c.profileId).toUpperCase());
  const takenMonitors = state.monitors.map(m => String(m.profileId).toUpperCase());
  return !takenContacts.includes(normalized) && !takenMonitors.includes(normalized);
}

export function getActiveThread() {
  return state.chatThreads.find(t => t.id === state.ui.activeChatId) || state.chatThreads[0];
}

export function contactByThread(thread) {
  if (!thread) return null;
  return state.contacts.find(c => String(c.id) === String(thread.contactId));
}

export function internalNetworkActive() {
  return state.contacts.filter(c => c.status === 'Activo');
}

export function openChatContact(id) {
  ensureState();
  const threadId = threadIdForContact(id);
  state.ui.activeChatId = threadId;
  const t = state.chatThreads.find(x => x.id === threadId);
  if (t) t.unread = 0;
  navigate('/dashboard/chats');
}

export function openChatFromMonitor(id) {
  const m = state.monitors.find(x => String(x.id) === String(id));
  if (!m) return;
  const c = state.contacts.find(x => String(x.monitorId) === String(m.id) || String(x.id) === String(m.contactId));
  if (c) openChatContact(c.id); 
  else toast('Sin chat asociado', 'Primero agrega esta persona a tu red interna.');
}

export function openPrimaryChat() {
  const c = state.contacts.find(x => x.priority === 'Principal' && x.status === 'Activo') || state.contacts.find(x => x.status === 'Activo');
  if (c) openChatContact(c.id); 
  else toast('Sin persona activa', 'Agrega una persona activa para abrir chat.');
}

export function selectChat(id) {
  state.ui.activeChatId = id;
  const t = state.chatThreads.find(x => x.id === id);
  if (t) t.unread = 0;
  route();
}

export function pushMessage(thread, from, text) {
  thread.messages.push({ from, text, time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) });
  thread.updatedAt = new Date().toLocaleString('es-MX');
}

export function sendChatMessage(text) {
  ensureState();
  const thread = getActiveThread();
  const c = contactByThread(thread);
  if (!thread || !c) return toast('Sin chat activo', 'Selecciona una conversación.');
  if (c.status !== 'Activo') return toast('Chat pausado', 'La persona debe estar activa y dentro del límite del plan.');
  
  pushMessage(thread, 'me', text || 'Mensaje interno');
  setTimeout(() => {
    ensureState();
    const activeThread = state.chatThreads.find(t => t.id === thread.id);
    if (activeThread) {
      pushMessage(activeThread, 'them', V8_AUTO_RESPONSES[Math.floor(Math.random() * V8_AUTO_RESPONSES.length)]);
      activeThread.unread = (activeThread.unread || 0) + 1;
      saveState();
      route();
    }
  }, 500);
  
  toast('Mensaje enviado', 'Se envió por chat interno.');
  route();
}

export function submitChat(form) {
  const text = form.elements.message.value.trim();
  if (!text) return;
  sendChatMessage(text);
  form.reset();
}

export function simulateReply() {
  const thread = getActiveThread();
  if (!thread) return;
  pushMessage(thread, 'them', V8_AUTO_RESPONSES[Math.floor(Math.random() * V8_AUTO_RESPONSES.length)]);
  toast('Respuesta simulada', `${thread.title} respondió por chat interno.`);
  route();
}

export function broadcastAccident(customMessage) {
  ensureState();
  const active = internalNetworkActive();
  if (!active.length) return toast('Sin red activa', 'No hay personas activas para recibir el mensaje.');
  const text = customMessage || 'Ocurrió un accidente. Revisa mi ubicación y la alerta activa en Impact.X.';
  active.forEach(c => {
    const t = state.chatThreads.find(x => x.id === threadIdForContact(c.id));
    if (t) { 
      pushMessage(t, 'me', text); 
      t.unread = (t.unread || 0) + 1; 
    }
  });
  addNotification('Mensaje interno enviado', `Se notificó a ${active.length} persona(s) activas por chat interno.`, 'incident');
  toast('Red interna notificada', `${active.length} persona(s) recibieron el mensaje.`);
  route();
}

export function renderChats() {
  ensureState();
  const q = (state.filters.chatSearch || '').toLowerCase();
  const threads = state.chatThreads.filter(t => `${t.title} ${t.username} ${t.profileId}`.toLowerCase().includes(q));
  const active = getActiveThread();
  const contact = contactByThread(active);
  const canSend = contact && contact.status === 'Activo';
  const routeContext = state.routeHistory?.[0];
  
  const sidebar = `
    <div class="chat-sidebar card">
      <div class="section-head compact">
        <div><h3>Conversaciones</h3><p>${state.chatThreads.length} chats internos</p></div>
        <button class="btn small" data-route="/dashboard/contactos/nuevo">+ Solicitud</button>
      </div>
      <input class="chat-search" value="${esc(state.filters.chatSearch || '')}" data-filter="chatSearch" placeholder="Buscar chat, usuario o ID" />
      <div class="chat-list">
        ${threads.map(t => {
          const c = contactByThread(t);
          return `<button class="chat-thread ${active?.id === t.id ? 'active' : ''}" data-action="select-chat" data-id="${t.id}"><strong>${esc(t.title)}</strong><span>@${esc(t.username)} · ${esc(c?.status || 'Sin estado')}</span>${t.unread ? `<em>${t.unread}</em>` : ''}</button>`;
        }).join('') || '<div class="empty-state compact"><h3>Sin chats</h3><p>Envía una solicitud interna para crear conversaciones.</p></div>'}
      </div>
    </div>`;
    
  const panel = active ? `
    <div class="chat-panel card">
      <div class="chat-header">
        <div><h3>${esc(active.title)}</h3><p>@${esc(active.username)} · ${esc(active.profileId)} · ${esc(contact?.status || 'Sin persona')}</p></div>
        <div class="actions">
          <button class="btn small" data-route="/dashboard/contactos/${contact?.id || ''}">Ver vínculo</button>
          <button class="btn small" data-action="simulate-reply">Simular respuesta</button>
        </div>
      </div>
      ${routeContext ? `<div class="chat-route-context"><span class="string-tag">Ruta: ${esc(routeContext.origin)} → ${esc(routeContext.destination)}</span><span class="string-tag alt">${esc(routeContext.sourceTag)}</span><button class="chip" data-action="send-route-context" data-id="${routeContext.id}" ${canSend ? '' : 'disabled'}>Enviar contexto de ruta</button></div>` : ''}
      ${!canSend ? `<div class="alert-box warning"><div>⚠️</div><div><strong>Chat limitado</strong><p>Esta persona está ${esc(contact?.status || 'no disponible')}. Debe aceptar la solicitud, estar activa y quedar dentro del límite del plan.</p></div></div>` : ''}
      <div class="quick-messages">
        ${V9_QUICK_MESSAGES.map(msg => `<button class="chip" data-action="send-quick-message" data-message="${esc(msg)}" ${canSend ? '' : 'disabled'}>${esc(msg)}</button>`).join('')}
      </div>
      <div class="messages">
        ${active.messages.map(m => `<div class="message ${esc(m.from)}"><span>${esc(m.text)}</span><small>${esc(m.time || '')}</small></div>`).join('')}
      </div>
      <form id="chat-form" class="chat-compose" novalidate>
        <input name="message" placeholder="Escribe un mensaje interno..." ${canSend ? '' : 'disabled'} required />
        <button class="btn primary" type="submit" ${canSend ? '' : 'disabled'}>Enviar</button>
      </form>
    </div>` : `
    <div class="chat-panel card">
      <div class="empty-state">
        <h3>Sin conversaciones</h3>
        <p>Primero envía una solicitud interna por usuario o ID.</p>
        <button class="btn primary" data-route="/dashboard/contactos/nuevo">Agregar persona</button>
      </div>
    </div>`;
    
  const content = `
    <div class="alert-box info"><div>💬</div><div><strong>Chat interno Impact.X</strong><p>La web es para gestionar red, solicitudes, rutas e incidentes. Los viajes se inician desde móvil; aquí solo puedes consultar historial y comunicarte internamente.</p></div></div>
    <div class="chat-layout">${sidebar}${panel}</div>
  `;
  
  return dashboardShell('Chats internos', 'Comunicación privada con mensajes rápidos, respuestas simuladas y contexto de rutas.', content, `<button class="btn primary" data-action="broadcast-accident">Enviar alerta a red activa</button><button class="btn" data-route="/dashboard/contactos/nuevo">Nueva solicitud</button><button class="btn" data-route="/dashboard/rutas">Ver rutas</button>`);
}
