// js/utils.js
import { state, saveState, plan } from './state.js';
import { navigate } from './router.js';

export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => [...document.querySelectorAll(selector)];

export const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export function toast(title, body = '') {
  const toastRoot = document.getElementById('toast-root');
  if (!toastRoot) return;
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `<strong>${esc(title)}</strong>${body ? `<p>${esc(body)}</p>` : ''}`;
  toastRoot.appendChild(node);
  saveState();
  setTimeout(() => node.remove(), 3600);
}

export function openModal({ title, body = '', content = '', actions = [], large = false }) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;
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

export function closeModal() {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) modalRoot.innerHTML = '';
}

export function confirmModal({ title, body, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false, onConfirm }) {
  openModal({
    title,
    body: `<span>${esc(body)}</span>`,
    actions: [
      { label: cancelText, onClick: closeModal },
      { label: confirmText, className: danger ? 'danger' : 'primary', onClick: () => { closeModal(); onConfirm?.(); } }
    ]
  });
}

export function premiumBlocked(feature = 'Esta función') {
  openModal({
    title: 'Función Premium bloqueada',
    body: `${esc(feature)} está disponible únicamente en el Plan Premium. Actualiza tu plan para desbloquear mapas, telemetría avanzada, reportes y bypass crítico.`,
    actions: [
      { label: 'Cerrar', onClick: closeModal },
      { label: 'Actualizar a Premium', className: 'primary', onClick: () => { closeModal(); navigate('/dashboard/suscripcion/cambiar-plan/premium'); } }
    ]
  });
}

export function limitBlocked() {
  openModal({
    title: 'Límite de contactos alcanzado',
    body: `Tu plan ${esc(plan().name)} permite ${plan().contactsLimit} contactos activos. Elimina uno, pausa alguno o actualiza tu plan para agregar más.`,
    actions: [
      { label: 'Cerrar', onClick: closeModal },
      { label: 'Actualizar plan', className: 'primary', onClick: () => { closeModal(); navigate('/dashboard/suscripcion'); } }
    ]
  });
}

export function copyText(text, title = 'Copiado') {
  navigator.clipboard.writeText(text)
    .then(() => toast(title, text))
    .catch(() => toast('Error al copiar', 'Tu navegador bloqueó el portapapeles. Enlace: ' + text));
}

export function validateRequired(form, fields) {
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
