// js/views/help.js
import { state } from '../state.js';
import { dashboardShell } from '../components/shell.js';
import { currentPath } from '../router.js';
import { esc, openModal, closeModal, validateRequired } from '../utils.js';

export function options(items, selected) {
  return items.map(item => `<option value="${esc(item)}" ${item === selected ? 'selected' : ''}>${esc(item)}</option>`).join('');
}

export function renderHelp() {
  const tabs = ['chat', 'contactos', 'monitores', 'incidentes', 'rutas', 'wearable', 'planes', 'soporte'];
  const labels = {
    chat: 'Chat',
    contactos: 'Red interna',
    monitores: 'Solicitudes',
    incidentes: 'Incidentes',
    rutas: 'Rutas',
    wearable: 'Wearable',
    planes: 'Planes',
    soporte: 'Soporte'
  };
  const active = new URLSearchParams(currentPath().split('?')[1] || '').get('tema') || state.ui.activeHelp;
  state.ui.activeHelp = tabs.includes(active) ? active : 'chat';
  
  const content = `
    <div class="tabs">${tabs.map(t => `<button class="tab ${state.ui.activeHelp === t ? 'active' : ''}" data-action="help-tab" data-tab="${t}">${labels[t]}</button>`).join('')}</div>
    <div class="card">${renderHelpContent(state.ui.activeHelp)}</div>
  `;
  return dashboardShell('Ayuda y soporte', 'Guías para usar la web como panel de gestión.', content);
}

export function renderHelpContent(tab) {
  if (tab === 'monitores') {
    return `<h3>Solicitudes internas e invitación a app</h3><p>Cuando la persona ya tiene cuenta, se usa usuario/ID. Cuando no la tiene, primero se genera una invitación a la aplicación para que cree cuenta propia y después pueda integrarse a la red interna.</p><div class="card-actions"><button class="btn primary" data-route="/dashboard/red-monitoreo/nueva-invitacion">Solicitud a cuenta existente</button><button class="btn" data-route="/dashboard/invitar-app">Invitar a la app</button></div>`;
  }
  if (tab === 'contactos') {
    return `<h3>Red interna</h3><p>Agrega personas existentes por usuario Impact.X o ID de perfil. No se capturan teléfonos, correos ni canales externos. Si la persona no tiene cuenta, invítala primero a la aplicación.</p><div class="card-actions"><button class="btn primary" data-route="/dashboard/contactos/nuevo">Enviar solicitud</button><button class="btn" data-route="/dashboard/invitar-app">Invitar a la app</button></div>`;
  }
  if (tab === 'chat') {
    return `<h3>Chat interno</h3><p>El sistema usa mensajes dentro del aplicativo para alertas, ubicación, contexto de rutas y respuestas rápidas. Es un canal interno entre cuentas Impact.X.</p><button class="btn primary" data-route="/dashboard/chats">Abrir chats</button>`;
  }
  if (tab === 'incidentes') {
    return `<h3>Incidentes</h3><p>El historial muestra eventos, ubicación y telemetría. Algunas funciones avanzadas se bloquean si no hay Premium.</p><button class="btn primary" data-route="/dashboard/incidentes">Ver incidentes</button>`;
  }
  if (tab === 'rutas') {
    return `<h3>Historial de rutas</h3><p>La web no inicia viajes. Solo muestra rutas que se simulan como registradas desde la app móvil, con etiquetas de origen, destino y contexto.</p><button class="btn primary" data-route="/dashboard/rutas">Ver rutas</button>`;
  }
  if (tab === 'wearable') {
    return `<h3>Vincular wearable</h3><p>La vinculación real se realiza con app móvil y smartwatch. La web solo muestra estado de sincronización.</p><button class="btn primary" data-action="show-pairing-guide">Ver guía</button>`;
  }
  if (tab === 'planes') {
    return `<h3>Planes</h3><p>Trial tiene 2 personas, Básico 3 y Premium 8. Si superas el límite, las personas excedentes se conservan pausadas.</p><button class="btn primary" data-route="/dashboard/suscripcion">Ver suscripción</button>`;
  }
  return `
    <h3>Contactar soporte</h3>
    <form id="support-form">
      <div class="field">
        <label>Asunto</label>
        <input name="subject" required />
      </div>
      <div class="field">
        <label>Tipo de problema</label>
        <select name="type">
          ${options(['Wearable', 'Red interna', 'Chat interno', 'Rutas', 'Pago', 'Incidente', 'Otro'], 'Chat interno')}
        </select>
      </div>
      <div class="field">
        <label>Descripción</label>
        <textarea name="description" required></textarea>
      </div>
      <div class="form-actions">
        <button class="btn primary" type="submit">Enviar solicitud</button>
        <button class="btn" type="button" data-route="/dashboard/chats">Cancelar</button>
      </div>
    </form>
  `;
}

export function submitSupport(form) {
  if (!validateRequired(form, ['subject', 'description'])) return;
  openModal({
    title: 'Solicitud enviada',
    body: 'Tu ticket de soporte fue creado de forma simulada. Un agente revisaría el caso.',
    actions: [{ label: 'Aceptar', className: 'primary', onClick: closeModal }]
  });
  form.reset();
}
