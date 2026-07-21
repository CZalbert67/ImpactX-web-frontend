// js/components/insights.js
import { state, plan, usableContacts, activeAlertContacts, suspendedContacts } from '../state.js';
import { esc } from '../utils.js';

export function featurePill(enabled, label) {
  return `<div class="feature-pill ${enabled ? 'ok' : 'locked'}"><span>${enabled ? '✓' : '×'}</span>${esc(label)}</div>`;
}

export function dashboardInsightList() {
  const insights = [];
  if (state.wearable.connection !== 'connected') {
    insights.push(['⌚', 'Conectar wearable', 'El panel indica que el reloj no está conectado; esto reduce la cobertura de detección.']);
  }
  if (state.wearable.battery < 25) {
    insights.push(['🔋', 'Cargar dispositivo', `La batería está en ${state.wearable.battery}%, se recomienda cargarlo antes de conducir.`]);
  }
  if (activeAlertContacts().length < Math.min(2, plan().contactsLimit)) {
    insights.push(['☎️', 'Agregar contactos', 'Se recomienda tener al menos dos contactos activos para mejorar la respuesta.']);
  }
  if (state.monitors.filter(m => m.status === 'Activo').length === 0) {
    insights.push(['🛡️', 'Activar monitores', 'La red de monitoreo no tiene monitores activos para recibir ubicación en emergencia.']);
  }
  if (suspendedContacts().length) {
    insights.push(['⚠️', 'Contactos suspendidos', `${suspendedContacts().length} contacto(s) no recibirán alertas por el límite del plan actual.`]);
  }
  if (!plan().maps || !plan().bypass) {
    insights.push(['💳', 'Funciones bloqueadas', 'El plan actual no tiene todas las funciones avanzadas de telemetría, mapas o bypass crítico.']);
  }
  if (!insights.length) {
    insights.push(['✅', 'Sistema estable', 'La configuración actual tiene buena cobertura para el escenario del prototipo.']);
  }
  
  return `
    <div class="list insight-list">
      ${insights.map(([icon, title, text]) => `
        <div class="list-item">
          <div class="icon-bubble">${icon}</div>
          <div class="list-item-main">
            <h4>${esc(title)}</h4>
            <p>${esc(text)}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
