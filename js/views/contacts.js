// js/views/contacts.js
import { state, saveState, ensureState, plan, usableContacts, suspendedContacts, v8Slug, v8ProfileId, ensureChatThreads, generateId, addNotification, threadIdForContact } from '../state.js';
import { route, navigate, renderNotFound } from '../router.js';
import { esc, toast, confirmModal, validateRequired, limitBlocked, copyText, $ } from '../utils.js';
import { dashboardShell } from '../components/shell.js';
import { options, infoRows } from './onboarding.js';
import { planUsageAlert, enforceContactPlanLimit } from './plans.js';
import { routeMiniRow } from './routes.js';
import { usernameAvailable, profileIdAvailable, pushMessage } from './chats.js';

export const V9_MOCK_USERS = [
  { name: 'María Fernanda Tejeda', username: 'maria_segura', profileId: 'IX-MARIA-9Q2WA', relation: 'Madre', label: 'Familia principal' },
  { name: 'Carlos Barrera', username: 'carlos_barrera', profileId: 'IX-CARLOS-72KMD', relation: 'Hermano', label: 'Familia secundaria' },
  { name: 'Andrea Monroy', username: 'andrea_monroy', profileId: 'IX-ANDREA-54FPL', relation: 'Pareja', label: 'Monitor frecuente' },
  { name: 'Omar Picazo', username: 'omar_picazo', profileId: 'IX-OMAR-88ZTR', relation: 'Amigo', label: 'Apoyo cercano' },
  { name: 'Felicitas Diego', username: 'felicitas_diego', profileId: 'IX-FELI-16VRP', relation: 'Familiar', label: 'Contacto familiar' },
  { name: 'Yael Monroy', username: 'yael_monroy', profileId: 'IX-YAEL-43QXA', relation: 'Amigo', label: 'Monitor eventual' }
];

export function v9FindMockUser(input = '') {
  const raw = String(input).trim().replace(/^@/, '');
  const normalized = v8Slug(raw);
  const upper = raw.toUpperCase();
  return V9_MOCK_USERS.find(u => u.username.toLowerCase() === normalized.toLowerCase() || u.profileId.toUpperCase() === upper) || null;
}

export function v9BuildExternalProfile(input = '') {
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

export function addContact(data) {
  ensureState();
  const id = generateId();
  const c = { id, createdAt: new Date().toISOString().slice(0, 10), ...data };
  state.contacts.push(c);
  enforceContactPlanLimit();
  ensureChatThreads();
  saveState();
  return c;
}

export function goAddContact() {
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

export function cancelContactForm() {
  confirmModal({ 
    title: 'Salir sin guardar', 
    body: 'Los cambios capturados se perderán.', 
    confirmText: 'Salir sin guardar', 
    danger: true, 
    onConfirm: () => navigate('/dashboard/contactos') 
  });
}

export function deleteContact(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  confirmModal({
    title: 'Eliminar persona',
    body: `${c.name} dejará de recibir alertas de emergencia. Esta acción no se puede deshacer en la maqueta.`,
    confirmText: 'Eliminar persona',
    danger: true,
    onConfirm: () => {
      state.contacts = state.contacts.filter(x => String(x.id) !== String(id));
      state.monitors.forEach(m => { if (m.contactId && String(m.contactId) === String(id)) m.contactId = null; });
      enforceContactPlanLimit();
      addNotification('Contacto eliminado', `${c.name} fue eliminado de tus personas agregadas.`, 'contact');
      toast('Persona eliminada');
      navigate('/dashboard/contactos');
    }
  });
}

export function makePrimary(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  if (c.priority === 'Principal') return toast('Ya es principal', `${c.name} ya está marcado como principal.`);
  confirmModal({ 
    title: 'Cambiar contacto principal', 
    body: `¿Deseas marcar a ${c.name} como contacto principal? El anterior pasará a secundario.`, 
    confirmText: 'Reemplazar', 
    onConfirm: () => { 
      state.contacts.forEach(x => x.priority = x.id === c.id ? 'Principal' : x.priority === 'Principal' ? 'Secundario' : x.priority); 
      toast('Contacto principal actualizado'); 
      route(); 
    } 
  });
}

export function copyContactProfile(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  copyText(`${c.profileId} · @${c.username}`, 'Perfil de persona copiado');
}

export function saveContactFromForm() {
  const form = $('#contact-form');
  if (!form) return;
  const mode = form.dataset.mode;
  const id = form.dataset.id;
  if (mode === 'edit') {
    if (!validateRequired(form, ['relation'])) return;
    const current = state.contacts.find(c => String(c.id) === String(id));
    if (!current) return;
    const nextStatus = form.elements.status.value;
    if (nextStatus !== 'Suspendido por plan' && current.status === 'Suspendido por plan' && usableContacts().length >= plan().contactsLimit) {
      return limitBlocked();
    }
    if (form.elements.priority.value === 'Principal') {
      state.contacts.forEach(c => c.priority = 'Secundario');
    }
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
  if (created.status === 'Suspendido por plan') {
    toast('Solicitud creada fuera del límite', 'La persona se conserva pausada. Actualiza el plan o libera espacio para activarla.');
  } else {
    toast('Solicitud interna enviada', `Se creó la solicitud para @${created.username}.`);
  }
  navigate('/dashboard/contactos');
}

export function acceptContactRequest(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  if (c.status === 'Suspendido por plan' || usableContacts().length > plan().contactsLimit) return limitBlocked();
  c.status = 'Activo';
  c.requestStatus = 'Aceptada en demo';
  c.acceptedAt = new Date().toLocaleString('es-MX');
  ensureChatThreads();
  const t = state.chatThreads.find(x => x.id === threadIdForContact(c.id));
  if (t) pushMessage(t, 'system', `${c.name} aceptó la solicitud interna en modo demo.`);
  addNotification('Solicitud aceptada', `${c.name} ahora forma parte de tu red activa.`, 'contact');
  toast('Solicitud aceptada', 'El chat interno quedó habilitado.');
  route();
}

export function pauseContactRequest(id) {
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  if (c.status !== 'Suspendido por plan') c.previousStatus = c.status;
  c.status = 'Inactivo';
  c.requestStatus = 'Pausada';
  toast('Vínculo pausado', 'La persona queda guardada, pero no recibe chats ni alertas.');
  route();
}

export function contactRow(c) {
  const priorityClass = c.priority === 'Principal' ? 'primary' : 'info';
  const statusClass = c.status === 'Activo' ? 'success' : c.status === 'Suspendido por plan' ? 'warning' : 'danger';
  return `<tr>
    <td><strong>${esc(c.name)}</strong><br><span class="muted">@${esc(c.username)}</span></td>
    <td><span class="v9-id-pill">${esc(c.profileId)}</span></td>
    <td>${esc(c.relation)}</td>
    <td>
      <span class="string-tag">${esc(c.connectionLabel || 'Red interna')}</span>
    </td>
    <td>
      <span class="badge ${statusClass}">${esc(c.status)}</span>
      ${c.status === 'Suspendido por plan' ? '<br><span class="muted" style="font-size:0.8em">Pausado por plan</span>' : ''}
    </td>
    <td>
      <div class="actions">
        <button class="btn small" data-route="/dashboard/contactos/${c.id}">Ver</button>
        <button class="btn small" data-route="/dashboard/contactos/${c.id}/editar">Editar</button>
        <button class="btn small success" data-action="accept-contact-request" data-id="${c.id}">Aceptar</button>
        <button class="btn small warning" data-action="make-primary" data-id="${c.id}">Principal</button>
        <button class="btn small danger" data-action="delete-contact" data-id="${c.id}">Eliminar</button>
      </div>
    </td>
  </tr>`;
}

export function renderContacts() {
  ensureState();
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
    <div class="empty-state">
      <h3>Aún no tienes personas agregadas</h3>
      <p>Agrega una cuenta existente por usuario/ID o invita primero a alguien que todavía no tenga cuenta.</p>
      <button class="btn primary" data-route="/dashboard/contactos/nuevo">Enviar solicitud</button>
      <button class="btn" data-route="/dashboard/invitar-app">Invitar a la app</button>
    </div>
  ` : '';
  
  const content = `
    <div class="alert-box info">
      <div>🤝</div>
      <div>
        <strong>Red interna tipo solicitud</strong>
        <p>Si la persona ya tiene cuenta, agrégala por <strong>usuario</strong> o <strong>ID de perfil</strong>. Si no tiene cuenta, usa <strong>Invitar a la aplicación</strong> para generar su registro. Las etiquetas siguen siendo solo texto de referencia.</p>
      </div>
    </div>
    <div class="card app-invite-card">
      <div class="stat-top">
        <div>
          <h3>¿La persona no tiene cuenta?</h3>
          <p class="muted">Genera una invitación de registro. Después la persona podrá aparecer en tu red interna y chats.</p>
        </div>
        <button class="btn primary" data-route="/dashboard/invitar-app">Invitar a la app</button>
      </div>
    </div>
    ${planUsageAlert()}
    <div class="grid grid-3">
      <div class="card stat-card"><h3>Personas activas</h3><div class="stat-value">${state.contacts.filter(c => c.status === 'Activo').length}</div><p class="stat-desc">Pueden recibir chats y alertas internas.</p></div>
      <div class="card stat-card"><h3>Límite del plan</h3><div class="stat-value">${usableContacts().length}/${p.contactsLimit}</div><p class="stat-desc">Pendientes y activas ocupan espacio. Las excedentes se pausan por plan.</p></div>
      <div class="card stat-card"><h3>Solicitudes pendientes</h3><div class="stat-value">${state.contacts.filter(c => c.status === 'Pendiente' || c.status === 'Solicitud enviada').length}</div><p class="stat-desc">Esperando aceptación o activación demo.</p></div>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <input value="${esc(state.filters.contacts || '')}" data-filter="contacts" placeholder="Buscar por usuario, ID, relación o etiqueta" />
      <select data-filter="contactStatus">
        <option value="todos">Todos</option>
        ${options(['Activo','Pendiente','Solicitud enviada','Suspendido por plan','Rechazado','Inactivo'], status)}
      </select>
      <button class="btn" data-action="clear-contact-filters">Limpiar filtros</button>
    </div>
    ${empty || `<div class="table-wrap"><table><thead><tr><th>Persona</th><th>Usuario / ID</th><th>Relación</th><th>Etiquetas</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${filtered.map(contactRow).join('') || `<tr><td colspan="6">No hay resultados con esos filtros.</td></tr>`}</tbody></table></div>`}
  `;
  
  return dashboardShell('Red interna', `Plan ${p.name}: ${usableContacts().length}/${p.contactsLimit} espacios ocupados.`, content, `<button class="btn primary" data-action="go-add-contact">+ Enviar solicitud</button><button class="btn" data-route="/dashboard/red-monitoreo">Solicitudes</button><button class="btn" data-route="/dashboard/chats">Chats</button><button class="btn" data-route="/dashboard/invitar-app">Invitar app</button>`);
}

export function renderContactForm(mode = 'new', id = null) {
  ensureState();
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
      <div class="alert-box info">
        <div>🤝</div>
        <div>
          <strong>Enviar solicitud interna</strong>
          <p>La persona ya debe tener una cuenta Impact.X. Solo ingresa su <strong>usuario</strong> o <strong>ID de perfil</strong>. Si no tiene cuenta, primero invítala a la aplicación.</p>
        </div>
      </div>
      <div class="card app-invite-card">
        <div class="stat-top">
          <div>
            <h3>Persona sin cuenta Impact.X</h3>
            <p class="muted">Genera un enlace para que cree usuario único e ID de perfil. Luego podrá integrarse a tu red interna.</p>
          </div>
          <button class="btn primary" type="button" data-route="/dashboard/invitar-app">Invitar a la aplicación</button>
        </div>
      </div>
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

export function renderContactDetail(id) {
  ensureState();
  const c = state.contacts.find(x => String(x.id) === String(id));
  if (!c) return renderNotFound();
  const thread = state.chatThreads.find(t => String(t.contactId) === String(c.id));
  const relatedRoutes = state.routeHistory.slice(0, 2);
  const content = `
    <div class="grid grid-2">
      <div class="card">
        <h3>${esc(c.name)}</h3>
        <p><span class="v9-id-pill">@${esc(c.username)}</span> <span class="v9-id-pill">${esc(c.profileId)}</span></p>
        <div class="divider"></div>
        ${infoRows({'Relación': c.relation || 'No definida', Prioridad: c.priority, Estado: c.status, Solicitud: c.requestStatus || c.status, Canal: 'Chat interno Impact.X', 'Fecha de alta': c.createdAt})}
        <div class="route-tags">
          <span class="string-tag">${esc(c.connectionLabel || 'Red interna')}</span>
          <span class="string-tag alt">${esc(c.originTag || 'Origen web')}</span>
          <span class="string-tag muted">${esc(c.destinationTag || 'Destino alertas')}</span>
        </div>
        <div class="card-actions">
          <button class="btn primary" data-action="open-chat-contact" data-id="${c.id}">Abrir chat</button>
          <button class="btn" data-route="/dashboard/contactos/${c.id}/editar">Editar vínculo</button>
          <button class="btn" data-action="copy-contact-profile" data-id="${c.id}">Copiar usuario/ID</button>
          <button class="btn danger" data-action="delete-contact" data-id="${c.id}">Eliminar</button>
        </div>
      </div>
      <div class="card">
        <h3>Estado de solicitud</h3>
        <p class="compact-note">Esta pantalla representa la relación entre cuentas. No administra datos privados de la otra persona; solo tu vínculo, etiquetas, prioridad y permisos internos.</p>
        <div class="request-flow">
          <div class="request-step"><strong>Usuario</strong><span>Cuenta externa.</span></div>
          <div class="request-step"><strong>Solicitud</strong><span>${esc(c.requestStatus || c.status)}</span></div>
          <div class="request-step"><strong>Plan</strong><span>${esc(plan().name)}</span></div>
          <div class="request-step"><strong>Chat</strong><span>${c.status === 'Activo' ? 'Habilitado' : 'Limitado'}</span></div>
        </div>
        <div class="card-actions">
          <button class="btn success" data-action="accept-contact-request" data-id="${c.id}">Aceptar demo</button>
          <button class="btn warning" data-action="pause-contact-request" data-id="${c.id}">Pausar</button>
          <button class="btn" data-route="/dashboard/contactos">Volver</button>
        </div>
      </div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>Conversación asociada</h3>${thread ? `<p>${thread.messages.length} mensajes · Última actividad: ${esc(thread.updatedAt)}</p><button class="btn primary" data-action="open-chat-contact" data-id="${c.id}">Abrir conversación</button>` : '<p>No hay conversación asociada.</p>'}</div>
      <div class="card"><h3>Rutas recientes relacionadas</h3><div class="list">${relatedRoutes.map(routeMiniRow).join('')}</div><button class="btn" data-route="/dashboard/rutas">Ver historial de rutas</button></div>
    </div>
  `;
  return dashboardShell('Detalle de persona', 'Relación interna, etiquetas y accesos de chat.', content);
}
