// js/views/plans.js
import { state, PLAN_RULES, plan, usableContacts, suspendedContacts } from '../state.js';
import { currentPath, navigate } from '../router.js';
import { esc, toast } from '../utils.js';
import { publicShell } from '../components/shell.js';

export function choosePlan(key) {
  if (!PLAN_RULES[key]) return;
  state.selectedPlan = key;
  if (currentPath().startsWith('/dashboard')) {
    if (state.user.plan === key) return toast('Plan actual', 'Ya tienes seleccionado este plan.');
    navigate(`/dashboard/suscripcion/cambiar-plan/${key}`);
  } else {
    navigate(`/registro?plan=${key}`);
  }
}

export function planOptions(selected) {
  return Object.entries(PLAN_RULES).map(([k, p]) => `<option value="${k}" ${selected === k ? 'selected' : ''}>${p.name} - ${p.price}</option>`).join('');
}

export function planUsageAlert() {
  const p = plan();
  const usable = usableContacts().length;
  const suspended = suspendedContacts().length;
  if (!suspended) {
    return `<div class="alert-box ${usable >= p.contactsLimit ? 'warning' : 'info'}"><div>☎️</div><div><strong>Uso del plan</strong><p>Personas activas/configuradas: ${usable}/${p.contactsLimit}. ${usable >= p.contactsLimit ? 'Límite alcanzado.' : 'Todavía puedes agregar personas.'}</p></div></div>`;
  }
  return `<div class="alert-box warning"><div>⚠️</div><div><strong>${suspended} persona(s) pausada(s) por plan</strong><p>Tu plan ${esc(p.name)} permite ${p.contactsLimit} personas. Las personas pausadas se conservan en la demo, pero no reciben alertas hasta actualizar el plan o liberar espacio.</p></div></div>`;
}

export function enforceContactPlanLimit(targetPlan = state.user.plan) {
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

export function downgradePlanWarning(targetPlan) {
  const next = PLAN_RULES[targetPlan];
  if (!next) return null;
  const overflow = Math.max(0, usableContacts().length - next.contactsLimit);
  if (!overflow) return null;
  return `<div class="alert-box warning"><div>⚠️</div><div><strong>Cambio con reducción de contactos</strong><p>Al cambiar a Plan ${esc(next.name)}, ${overflow} persona(s) quedarán pausadas por límite de plan. No se borran, pero no recibirán alertas hasta actualizar a un plan con más espacios o eliminar otras personas.</p></div></div>`;
}

export function renderPlans(publicMode = true) {
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
