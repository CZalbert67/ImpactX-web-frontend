// js/views/routes.js
import { state, saveState, ensureState, generateId, addNotification } from '../state.js';
import { route } from '../router.js';
import { esc, toast, copyText } from '../utils.js';
import { dashboardShell } from '../components/shell.js';
import { options, infoRows } from './onboarding.js';
import { sendChatMessage } from './chats.js';

export function renderRoutes() {
  ensureState();
  const q = (state.filters.routeSearch || '').toLowerCase();
  const status = state.filters.routeStatus || 'todos';
  const routes = state.routeHistory.filter(r => {
    const text = `${r.origin} ${r.destination} ${r.originLabel} ${r.destinationLabel} ${r.sourceTag} ${r.status}`.toLowerCase();
    return (!q || text.includes(q)) && (status === 'todos' || r.status === status);
  });
  const content = `
    <div class="alert-box info"><div>🗺️</div><div><strong>Historial de rutas sincronizadas</strong><p>La web no tiene botón de iniciar viaje porque esa acción pertenece a la app móvil. Este módulo solo consulta, filtra y analiza rutas que supuestamente llegaron desde el móvil.</p></div></div>
    <div class="grid grid-4">
      <div class="card stat-card"><h3>Total rutas</h3><div class="stat-value">${state.routeHistory.length}</div><p class="stat-desc">Registros disponibles.</p></div>
      <div class="card stat-card"><h3>Con incidente</h3><div class="stat-value">${state.routeHistory.filter(r => r.status === 'Incidente').length}</div><p class="stat-desc">Rutas vinculadas a eventos.</p></div>
      <div class="card stat-card"><h3>Finalizadas</h3><div class="stat-value">${state.routeHistory.filter(r => r.status === 'Finalizada').length}</div><p class="stat-desc">Sin alerta crítica.</p></div>
      <div class="card stat-card"><h3>Fuente</h3><div class="stat-value small-text">Móvil</div><p class="stat-desc">La web solo gestiona.</p></div>
    </div>
    <div class="toolbar" style="margin-top:16px"><input value="${esc(state.filters.routeSearch || '')}" data-filter="routeSearch" placeholder="Buscar origen, destino o etiqueta" /><select data-filter="routeStatus"><option value="todos">Todos</option>${options(['Finalizada','Incidente','Cancelada','Sincronizada'], status)}</select><button class="btn" data-action="clear-route-filters">Limpiar filtros</button></div>
    <div class="grid grid-2" style="margin-top:16px">${routes.map(routeCard).join('') || '<div class="empty-state"><h3>Sin rutas</h3><p>No hay rutas que coincidan con el filtro.</p></div>'}</div>
  `;
  return dashboardShell('Historial de rutas', 'Consulta de rutas creadas desde móvil y sincronizadas a la web.', content, `<button class="btn primary" data-action="simulate-mobile-route">Simular ruta recibida desde móvil</button><button class="btn" data-route="/dashboard/incidentes">Ver incidentes</button>`);
}

export function routeCard(r) {
  const cls = r.status === 'Incidente' ? 'danger' : r.status === 'Finalizada' ? 'success' : 'info';
  return `
    <div class="card route-summary-card">
      <div class="stat-top"><h3>${esc(r.origin)} → ${esc(r.destination)}</h3><span class="badge ${cls}">${esc(r.status)}</span></div>
      <div class="route-line">
        <div class="route-dot-stack"><span class="route-dot"></span><span class="route-stick"></span><span class="route-dot end"></span></div>
        <div>
          <p><strong>Origen:</strong> ${esc(r.originLabel || r.origin)}</p>
          <p><strong>Destino:</strong> ${esc(r.destinationLabel || r.destination)}</p>
          <p class="muted">${esc(r.date)} · ${esc(r.startTime)} - ${esc(r.endTime)}</p>
        </div>
      </div>
      <div class="route-tags"><span class="string-tag">${esc(r.sourceTag)}</span><span class="string-tag alt">${esc(r.distance)}</span><span class="string-tag muted">${esc(r.avgSpeed)}</span></div>
      <div class="divider"></div>
      ${infoRows({'Vehículo': r.vehicle, Incidentes: r.incidents, Notas: r.notes})}
      <div class="card-actions">
        <button class="btn small" data-action="copy-route-summary" data-id="${r.id}">Copiar resumen</button>
        <button class="btn small" data-action="send-route-context" data-id="${r.id}">Enviar a chat activo</button>
        ${r.status === 'Incidente' ? '<button class="btn small" data-route="/dashboard/incidentes">Ver incidentes</button>' : ''}
      </div>
    </div>
  `;
}

export function routeMiniRow(r) {
  return `<div class="list-item"><div><h4>${esc(r.origin)} → ${esc(r.destination)}</h4><p>${esc(r.date)} · ${esc(r.status)} · ${esc(r.sourceTag)}</p></div><button class="btn small" data-route="/dashboard/rutas">Ver</button></div>`;
}

export function simulateMobileRoute() {
  const samples = [
    ['Casa', 'Trabajo', 'Sale de casa', 'Llega al trabajo'],
    ['Universidad', 'Casa', 'Sale de universidad', 'Regresa a casa'],
    ['Centro de Tula', 'Hospital regional', 'Punto urbano', 'Destino preventivo'],
    ['Gasolinera', 'Domicilio familiar', 'Parada intermedia', 'Punto familiar']
  ];
  const sample = samples[Math.floor(Math.random() * samples.length)];
  const statuses = ['Finalizada', 'Sincronizada', 'Finalizada'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const id = generateId();
  
  state.routeHistory.unshift({
    id,
    date: new Date().toISOString().slice(0, 10),
    startTime: new Date(Date.now() - 45 * 60000).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    endTime: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    origin: sample[0],
    destination: sample[1],
    originLabel: sample[2],
    destinationLabel: sample[3],
    sourceTag: 'Sincronizada desde móvil',
    status,
    distance: `${(Math.random() * 16 + 5).toFixed(1)} km`,
    avgSpeed: `${Math.floor(Math.random() * 30 + 40)} km/h`,
    incidents: 0,
    vehicle: `${state.driver.brand || 'Vehículo'} ${state.driver.model || 'registrado'}`,
    notes: 'Ruta generada automáticamente para simular datos enviados por la app móvil.'
  });
  
  addNotification('Ruta sincronizada', `Se recibió una ruta desde móvil: ${sample[0]} → ${sample[1]}.`, 'route');
  toast('Ruta recibida desde móvil', 'La web la muestra en historial, pero no inicia viajes.');
  route();
}

export function copyRouteSummary(id) {
  const r = state.routeHistory.find(x => String(x.id) === String(id));
  if (!r) return;
  copyText(`Ruta ${r.origin} → ${r.destination}\nFecha: ${r.date}\nEstado: ${r.status}\nEtiqueta origen: ${r.originLabel}\nEtiqueta destino: ${r.destinationLabel}\nFuente: ${r.sourceTag}`, 'Resumen de ruta copiado');
}

export function sendRouteContext(id) {
  const r = state.routeHistory.find(x => String(x.id) === String(id));
  if (!r) return;
  sendChatMessage(`Contexto de ruta: ${r.origin} → ${r.destination}. Estado: ${r.status}. Etiquetas: ${r.originLabel} / ${r.destinationLabel}.`);
}
