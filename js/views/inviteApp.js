// js/views/inviteApp.js
import { state, saveState, generateId, v8Slug, v8ProfileId, addNotification, threadIdForContact, ensureChatThreads } from '../state.js';
import { route, navigate } from '../router.js';
import { esc, toast, validateRequired, openModal, closeModal, confirmModal, copyText } from '../utils.js';
import { dashboardShell, publicShell } from '../components/shell.js';
import { addContact } from './contacts.js';
import { usernameAvailable } from './chats.js';

export function options(items, selected) {
  return items.map(item => `<option value="${esc(item)}" ${item === selected ? 'selected' : ''}>${esc(item)}</option>`).join('');
}

export function infoRows(obj) {
  return Object.entries(obj).map(([k, v]) => `<div class="info-row"><span>${esc(k)}</span><strong>${esc(v || 'No configurado')}</strong></div>`).join('');
}

export function v11Now() {
  const d = new Date();
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
         d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function v11Token(prefix = 'APP') {
  return prefix + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function appInviteStatusClass(status) {
  if (status === 'Pendiente de registro') return 'warning';
  if (status === 'Cuenta creada') return 'info';
  if (status === 'Agregada a red') return 'success';
  if (status === 'Cancelada') return 'danger';
  return 'muted';
}

export function appInviteUrl(inv) {
  return `${location.origin}${location.pathname}#/registro-invitado/${inv.token}`;
}

export function renderAppInviteList(limit = null) {
  const status = state.filters.appInviteStatus || 'todos';
  let invites = state.appInvites.filter(inv => status === 'todos' || inv.status === status);
  if (limit) invites = invites.slice(0, limit);
  if (!invites.length) {
    return `<div class="empty-state compact"><h3>Sin invitaciones a la app</h3><p>Aún no hay invitaciones para personas que no tienen cuenta.</p></div>`;
  }
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Persona invitada</th>
            <th>Estado</th>
            <th>Etiquetas</th>
            <th>Token / enlace</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${invites.map(inv => `
            <tr>
              <td><strong>${esc(inv.suggestedName)}</strong><br><span class="muted">@${esc(inv.suggestedUsername || v8Slug(inv.suggestedName))} · ${esc(inv.relation || 'Sin relación')}</span></td>
              <td><span class="badge ${appInviteStatusClass(inv.status)}">${esc(inv.status)}</span><br><span class="muted">${esc(inv.createdAt || '')}</span></td>
              <td><div class="route-tags"><span class="string-tag">${esc(inv.connectionLabel)}</span><span class="string-tag alt">${esc(inv.originTag)}</span><span class="string-tag muted">${esc(inv.destinationTag)}</span></div></td>
              <td><code>${esc(inv.token)}</code><br><button class="link-btn" data-action="copy-app-invite" data-id="${inv.id}">Copiar enlace</button></td>
              <td>
                <div class="actions">
                  <button class="btn small" data-action="open-app-invite" data-id="${inv.id}">Abrir registro</button>
                  <button class="btn small success" data-action="mark-app-invite-used" data-id="${inv.id}">Marcar creado</button>
                  <button class="btn small danger" data-action="cancel-app-invite" data-id="${inv.id}">Cancelar</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function renderInviteApp() {
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

export function submitAppInvite(form) {
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

export function renderAppInviteAccept(token) {
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

export function submitAppAccount(form) {
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

export function copyAppInvite(id) {
  const inv = state.appInvites.find(x => String(x.id) === String(id));
  if (!inv) return;
  inv.inviteUrl = appInviteUrl(inv);
  copyText(inv.inviteUrl, 'Enlace de invitación a la app copiado');
}

export function openAppInvite(id) {
  const inv = state.appInvites.find(x => String(x.id) === String(id));
  if (!inv) return;
  navigate(`/registro-invitado/${inv.token}`);
}

export function markAppInviteUsed(id) {
  const inv = state.appInvites.find(x => String(x.id) === String(id));
  if (!inv) return;
  inv.status = 'Cuenta creada';
  inv.acceptedAt = v11Now();
  toast('Invitación marcada', 'Se marcó como cuenta creada en modo demo.');
  route();
}

export function cancelAppInvite(id) {
  const inv = state.appInvites.find(x => String(x.id) === String(id));
  if (!inv) return;
  confirmModal({
    title: 'Cancelar invitación a la app',
    body: `La invitación para ${esc(inv.suggestedName)} dejará de estar disponible en la demo.`,
    confirmText: 'Cancelar invitación',
    danger: true,
    onConfirm: () => {
      inv.status = 'Cancelada';
      toast('Invitación cancelada');
      route();
    }
  });
}
