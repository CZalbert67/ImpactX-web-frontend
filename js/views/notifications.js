// js/views/notifications.js
import { state } from '../state.js';
import { route } from '../router.js';
import { esc, toast, confirmModal } from '../utils.js';
import { dashboardShell } from '../components/shell.js';

export function toggleRead(id) {
  const n = state.notifications.find(x => String(x.id) === String(id));
  if (n) n.unread = !n.unread;
  route();
}

export function deleteNotification(id) {
  state.notifications = state.notifications.filter(x => String(x.id) !== String(id));
  toast('Notificación eliminada');
  route();
}

export function deleteAllNotifications() {
  confirmModal({ 
    title: 'Eliminar notificaciones', 
    body: 'Se eliminarán todas las notificaciones del prototipo.', 
    confirmText: 'Eliminar todas', 
    danger: true, 
    onConfirm: () => { 
      state.notifications = []; 
      toast('Notificaciones eliminadas'); 
      route(); 
    } 
  });
}

export function notificationRoute(n) {
  if (n.type === 'wearable') return '/dashboard/wearable';
  if (n.type === 'monitor') return '/dashboard/red-monitoreo';
  if (n.type === 'plan') return '/dashboard/suscripcion';
  if (n.type === 'incident') return '/dashboard/incidentes/501';
  return '/dashboard/overview';
}

export function notificationItem(n) {
  const routePath = notificationRoute(n);
  return `<div class="list-item"><div class="list-item-main"><h4>${n.unread ? '● ' : ''}${esc(n.title)}</h4><p>${esc(n.body)} · ${esc(n.date)}</p></div><button class="btn small" data-route="${routePath}">Ver</button></div>`;
}

export function renderNotifications() {
  ensureState();
  const filter = state.filters.notifications || 'todas';
  const list = state.notifications.filter(n => filter === 'todas' || (filter === 'no-leidas' ? n.unread : !n.unread));
  
  const content = `
    <div class="searchbar">
      <select data-filter="notifications">
        <option value="todas">Todas</option>
        <option value="no-leidas" ${filter === 'no-leidas' ? 'selected' : ''}>No leídas</option>
        <option value="leidas" ${filter === 'leidas' ? 'selected' : ''}>Leídas</option>
      </select>
      <button class="btn" data-action="mark-all-read">Marcar todo como leído</button>
      <button class="btn danger" data-action="delete-all-notifications">Eliminar todas</button>
    </div>
    <div class="list">
      ${list.map(n => `
        <div class="list-item">
          <div class="list-item-main">
            <h4>${n.unread ? '● ' : ''}${esc(n.title)}</h4>
            <p>${esc(n.body)} · ${esc(n.date)}</p>
          </div>
          <div class="actions">
            <button class="btn small" data-route="${notificationRoute(n)}">Ver</button>
            <button class="btn small" data-action="toggle-read" data-id="${n.id}">${n.unread ? 'Leída' : 'No leída'}</button>
            <button class="btn small danger" data-action="delete-notification" data-id="${n.id}">Eliminar</button>
          </div>
        </div>
      `).join('') || '<div class="empty-state"><h3>Sin notificaciones</h3><p>No hay elementos para este filtro.</p></div>'}
    </div>
  `;
  return dashboardShell('Notificaciones', 'Avisos de wearable, plan, contactos, monitores e incidentes.', content);
}

// Simple wrapper helper
function ensureState() {
  // Safe validation
  if (!state.filters) state.filters = {};
  if (!state.filters.notifications) state.filters.notifications = 'todas';
}
