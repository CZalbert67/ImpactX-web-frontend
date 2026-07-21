// js/views/incidents.js
import { state, saveState, ensureState, plan, generateId, addNotification, activeAlertContacts, suspendedContacts } from '../state.js';
import { route, navigate, currentPath, renderNotFound } from '../router.js';
import { esc, toast, confirmModal, openModal, closeModal, premiumBlocked } from '../utils.js';
import { dashboardShell } from '../components/shell.js';
import { options, infoRows } from './onboarding.js';
import { internalNetworkActive, broadcastAccident, V9_QUICK_MESSAGES } from './chats.js';

export function severityWeight(severity = '') {
  const map = { Baja: 1, Media: 2, Alta: 3, Crítica: 4, Critica: 4 };
  return map[severity] || 1;
}

export function incidentSeverityCounts() {
  const counts = { Baja: 0, Media: 0, Alta: 0, Crítica: 0 };
  state.incidents.forEach(i => {
    const key = i.severity === 'Critica' ? 'Crítica' : i.severity;
    if (counts[key] === undefined) counts[key] = 0;
    counts[key] += 1;
  });
  return counts;
}

export function parseSeconds(value = '') {
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function avgResponseSeconds() {
  const values = state.incidents.map(i => parseSeconds(i.responseTime)).filter(v => v > 0);
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function suspendedContactsCount() {
  return state.contacts.filter(c => c.status === 'Suspendido por plan').length;
}

export function riskIndex() {
  let score = 18;
  score += state.incidents.reduce((sum, i) => sum + severityWeight(i.severity) * 7, 0);
  score += suspendedContactsCount() * 8;
  score += state.monitors.filter(m => m.status !== 'Activo').length * 3;
  if (state.wearable.connection !== 'connected' || !state.wearable.linked) score += 20;
  if (state.wearable.battery < 25) score += 12;
  if (state.user.subscriptionStatus === 'Vencida') score += 25;
  if (state.user.plan === 'basico') score += 8;
  if (state.user.plan === 'premium') score -= 10;
  
  const activeAlertContacts = state.contacts.filter(c => c.status === 'Activo');
  if (activeAlertContacts.length === 0) score += 25;
  return Math.max(0, Math.min(100, score));
}

export function protectionScore() {
  let score = 0;
  if (state.user.subscriptionStatus !== 'Vencida') score += 20;
  if (state.wearable.linked && state.wearable.connection === 'connected') score += 20;
  if (state.wearable.battery >= 25) score += 10;
  
  const activeAlertContacts = state.contacts.filter(c => c.status === 'Activo');
  score += Math.min(20, activeAlertContacts.length * 8);
  score += Math.min(15, state.monitors.filter(m => m.status === 'Activo').length * 8);
  if (state.driver.allowLocation) score += 5;
  if (state.webPermissions.emergencySharing) score += 5;
  if (plan().bypass) score += 5;
  return Math.max(0, Math.min(100, score));
}

export function operationalStatus() {
  const protection = protectionScore();
  const risk = riskIndex();
  if (state.user.subscriptionStatus === 'Vencida') {
    return { label: 'Bloqueado', cls: 'danger', text: 'La suscripción vencida impide operar la protección.' };
  }
  if (protection >= 85 && risk < 45) {
    return { label: 'Óptimo', cls: 'success', text: 'El sistema tiene cobertura suficiente para operar ante un incidente.' };
  }
  if (protection >= 60) {
    return { label: 'Aceptable', cls: 'warning', text: 'La protección funciona, pero existen puntos por reforzar.' };
  }
  return { label: 'Riesgo alto', cls: 'danger', text: 'Faltan elementos críticos como personas activas, wearable o permisos.' };
}

export function exportIncidents() {
  if (!plan().exportReports) return premiumBlocked('La exportación de reportes');
  openModal({ 
    title: 'Exportar incidentes', 
    body: 'Selecciona un formato de exportación.', 
    content: `<div class="form-grid"><button class="btn" id="export-pdf-btn">PDF</button><button class="btn" id="export-csv-btn">CSV</button></div>`, 
    actions: [{ label: 'Cerrar', onClick: closeModal }] 
  });
  setTimeout(() => {
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => { closeModal(); toast('PDF generado', 'Se generaría el reporte PDF.'); });
    document.getElementById('export-csv-btn')?.addEventListener('click', () => { closeModal(); toast('CSV generado', 'Se generaría el archivo CSV.'); });
  });
}

export function downloadReport(id) {
  if (!plan().exportReports) return premiumBlocked('La descarga de reportes');
  const i = state.incidents.find(x => String(x.id) === String(id));
  toast('Reporte generado', `Reporte ${i?.type || 'incidente'} en ${state.drafts.lastReportFormat || 'PDF'}.`);
}

export function openExternalMap(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return;
  if (!state.webPermissions.mapLinks && !state.webPermissions.geolocation) {
    return toast('Permiso de mapas desactivado', 'Actívalo en Permisos web para abrir ubicaciones.');
  }
  if (!plan().maps && currentPath().includes('/incidentes')) return premiumBlocked('Abrir ubicación en mapa');
  openModal({ 
    title: 'Abrir mapa externo', 
    body: `Se abriría Google Maps/Mapbox con las coordenadas ${esc(i.coords)}.`, 
    content: `<div class="code-box">https://maps.google.com/?q=${esc(i.coords)}</div>`, 
    actions: [{ label: 'Cerrar', onClick: closeModal }] 
  });
}

export function markFalseAlarm(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return;
  confirmModal({ 
    title: 'Marcar falsa alarma', 
    body: 'El incidente quedará marcado para mejorar el historial y el entrenamiento del sistema.', 
    confirmText: 'Confirmar', 
    onConfirm: () => { 
      i.status = 'Falsa alarma'; 
      i.note = `${i.note || ''} Marcado como falsa alarma por el usuario.`.trim(); 
      addNotification('Falsa alarma registrada', `El incidente ${i.id} se marcó como falsa alarma.`, 'incident'); 
      toast('Incidente actualizado'); 
      route(); 
    } 
  });
}

export function addIncidentNote(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return;
  openModal({ 
    title: 'Agregar nota', 
    content: `<div class="field"><label>Nota del incidente</label><textarea id="incident-note-input">${esc(i.note || '')}</textarea></div>`, 
    actions: [
      { label: 'Cancelar', onClick: closeModal }, 
      { 
        label: 'Guardar nota', 
        className: 'primary', 
        onClick: () => { 
          i.note = document.getElementById('incident-note-input').value.trim(); 
          closeModal(); 
          toast('Nota guardada'); 
          route(); 
        } 
      }
    ] 
  });
}

export function simulateCriticalIncident() {
  const id = generateId();
  const activeNames = internalNetworkActive().map(c => c.name);
  state.incidents.unshift({ 
    id, 
    date: new Date().toISOString().slice(0,10), 
    time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), 
    type: 'Colisión crítica simulada', 
    severity: 'Crítica', 
    status: 'Alerta interna enviada', 
    location: 'Carretera Tula-Tepeji km 14', 
    coords: '20.054901, -99.343201', 
    gForce: '11.4G', 
    decibels: '134dB', 
    heartRate: '128 bpm', 
    activation: 'Bypass crítico + chat interno', 
    notified: activeNames, 
    responseTime: '1 segundo', 
    note: 'Evento generado para validar chat interno y alerta activa.', 
    timeline: [['Ahora', 'Impacto crítico detectado'], ['Ahora', 'Bypass crítico activado'], ['Ahora', 'Red interna notificada por chat']] 
  });
  broadcastAccident('Ocurrió un accidente crítico. Revisa mi ubicación en la alerta activa.');
  navigate(`/dashboard/alerta/${id}`);
}

export function markAlertAttended(id) {
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return;
  confirmModal({ 
    title: 'Marcar alerta como atendida', 
    body: '¿Confirmas que esta emergencia ya fue atendida?', 
    confirmText: 'Confirmar atención', 
    onConfirm: () => { 
      i.status = 'Atendido'; 
      addNotification('Alerta atendida', `El incidente ${i.id} fue marcado como atendido.`, 'incident'); 
      toast('Alerta atendida'); 
      navigate(`/dashboard/incidentes/${i.id}`); 
    } 
  });
}

export function incidentRow(i) {
  return `<tr>
    <td><strong>${esc(i.date)}</strong><br>${esc(i.time)}</td>
    <td>${esc(i.type)}</td>
    <td><span class="badge ${i.severity === 'Crítica' ? 'danger' : i.severity === 'Alta' ? 'warning' : 'info'}">${esc(i.severity)}</span></td>
    <td>${esc(i.status)}</td>
    <td>${esc(i.location)}</td>
    <td>${i.notified.length}</td>
    <td>
      <div class="actions">
        <button class="btn small" data-route="/dashboard/incidentes/${i.id}">Ver detalle</button>
        <button class="btn small" data-action="view-incident-map" data-id="${i.id}">Mapa</button>
        <button class="btn small" data-action="download-report" data-id="${i.id}">Reporte</button>
      </div>
    </td>
  </tr>`;
}

export function renderIncidents() {
  ensureState();
  const q = state.filters.incidents.toLowerCase();
  const severity = state.filters.severity;
  const status = state.filters.incidentStatus;
  const filtered = state.incidents.filter(i => {
    const text = `${i.type} ${i.status} ${i.location} ${i.severity}`.toLowerCase();
    return text.includes(q) && (severity === 'todos' || i.severity === severity) && (status === 'todos' || i.status === status);
  });
  
  const content = `
    ${!plan().telemetry ? '<div class="alert-box warning"><div>🔒</div><div><strong>Historial limitado</strong><p>Tu plan actual no tiene telemetría avanzada. Puedes ver eventos básicos, pero mapas, exportación y señales completas requieren Premium.</p></div></div>' : ''}
    <div class="searchbar">
      <input value="${esc(state.filters.incidents)}" data-filter="incidents" placeholder="Buscar por tipo, ubicación o estado" />
      <select data-filter="severity">
        <option value="todos">Todas las severidades</option>
        ${options(['Baja','Media','Alta','Crítica'], severity)}
      </select>
      <select data-filter="incidentStatus">
        <option value="todos">Todos los estados</option>
        ${options(['Cancelado por usuario','Prueba completada','Alerta enviada','Falsa alarma','Atendido'], status)}
      </select>
      <button class="btn" data-action="clear-incident-filters">Limpiar</button>
      <button class="btn" data-action="export-incidents">Exportar</button>
    </div>
    ${filtered.length ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Severidad</th><th>Estado</th><th>Ubicación</th><th>Notificados</th><th>Acciones</th></tr></thead><tbody>${filtered.map(incidentRow).join('')}</tbody></table></div>` : '<div class="empty-state"><h3>Sin incidentes</h3><p>No se encontraron incidentes con los filtros actuales.</p></div>'}
  `;
  return dashboardShell('Historial de incidentes', 'Eventos detectados, filtros, exportación y detalle de telemetría.', content, '<button class="btn warning" data-action="simulate-critical-incident">Simular incidente crítico</button>');
}

export function renderIncidentDetail(id) {
  ensureState();
  const i = state.incidents.find(x => String(x.id) === String(id));
  if (!i) return renderNotFound();
  const premium = plan().maps;
  const content = `
    <div class="detail-grid">
      <div class="card">
        <h3>${esc(i.type)}</h3>
        <p>${esc(i.date)} ${esc(i.time)} · ${esc(i.location)}</p>
        <div class="divider"></div>
        ${infoRows({'Severidad': i.severity, Estado: i.status, Coordenadas: i.coords, 'Fuerza G': i.gForce, 'Decibeles': plan().telemetry ? i.decibels : 'Bloqueado por plan', 'Frecuencia cardíaca': plan().telemetry ? i.heartRate : 'Bloqueado por plan', Activación: i.activation, 'Tiempo de respuesta': i.responseTime})}
        <div class="card-actions">
          <button class="btn" data-route="/dashboard/incidentes">Volver</button>
          <button class="btn" data-action="open-external-map" data-id="${i.id}">Abrir en Maps</button>
          <button class="btn" data-action="download-report" data-id="${i.id}">Descargar reporte</button>
          <button class="btn warning" data-action="mark-false-alarm" data-id="${i.id}">Marcar falsa alarma</button>
          <button class="btn" data-action="add-incident-note" data-id="${i.id}">Agregar nota</button>
        </div>
      </div>
      <div class="card">
        <h3>Mapa del incidente</h3>
        ${premium ? '<div class="map"></div>' : '<div class="empty-state"><h3>Mapa bloqueado</h3><p>Los mapas de incidentes requieren Plan Premium.</p><button class="btn primary" data-route="/dashboard/suscripcion/cambiar-plan/premium">Actualizar</button></div>'}
      </div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>Contactos notificados</h3><div class="list">${i.notified.map(name => `<div class="list-item"><div><h4>${esc(name)}</h4><p>Notificación enviada durante este evento.</p></div><span class="badge success">Enviado</span></div>`).join('')}</div></div>
      <div class="card"><h3>Línea de tiempo</h3><div class="timeline">${i.timeline.map(([time, text]) => `<div class="timeline-item"><h4>${esc(time)}</h4><p>${esc(text)}</p></div>`).join('')}</div></div>
    </div>
    <div class="card" style="margin-top:16px"><h3>Notas</h3><p>${esc(i.note || 'Sin notas.')}</p></div>
  `;
  return dashboardShell('Detalle de incidente', 'Ubicación, señales, contactos notificados y acciones de reporte.', content);
}

export function renderActiveAlert(id) {
  ensureState();
  const incident = state.incidents.find(i => String(i.id) === String(id)) || state.incidents[0];
  if (!incident) return renderNotFound();
  const medical = state.driver.shareMedicalInfo 
    ? `<div class="card"><h3>Ficha médica visible</h3>${infoRows({'Tipo de sangre': state.driver.bloodType, Padecimiento: state.driver.hasMedicalCondition, Condiciones: state.driver.medicalConditions, Alergias: state.driver.allergies, Medicamentos: state.driver.medications, Notas: state.driver.emergencyNotes})}</div>` 
    : `<div class="card"><h3>Ficha médica</h3><p>El usuario no autorizó compartir ficha médica en alertas.</p></div>`;
  const activePeople = internalNetworkActive();
  
  const content = `
    <div class="alert-banner danger">
      <div>
        <strong>🚨 Alerta de emergencia activa</strong>
        <p>La ubicación, datos médicos autorizados y mensajes se comparten por chat interno Impact.X.</p>
      </div>
      <button class="btn light" data-action="mark-alert-attended" data-id="${incident.id}">Marcar atendida</button>
    </div>
    <div class="grid grid-3">
      <div class="card stat-card"><h3>Conductor</h3><div class="stat-value small-text">${esc(state.driver.fullName)}</div><p>@${esc(state.user.username)} · ${esc(state.user.profileId)}</p></div>
      <div class="card stat-card"><h3>Severidad</h3><div class="stat-value">${esc(incident.severity)}</div><p>${esc(incident.type)} · ${esc(incident.time)}</p></div>
      <div class="card stat-card"><h3>Red interna notificada</h3><div class="stat-value">${activePeople.length}</div><p>Personas activas dentro del límite del plan.</p></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <h3>Ubicación del incidente</h3>
        <div class="map-mock"><div>📍 ${esc(incident.location)}</div><small>${esc(incident.coords)}</small></div>
        <div class="card-actions">
          <button class="btn" data-action="send-alert-message" data-message="Comparto mi ubicación">Enviar ubicación por chat</button>
          <button class="btn" data-route="/dashboard/chats">Abrir chats</button>
          <button class="btn" data-action="open-external-map" data-id="${incident.id}">Abrir mapa externo</button>
        </div>
      </div>
      ${medical}
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Mensajes rápidos para emergencia</h3>
      <div class="quick-messages">${V9_QUICK_MESSAGES.slice(0,7).map(msg => `<button class="chip" data-action="send-alert-message" data-message="${esc(msg)}">${esc(msg)}</button>`).join('')}</div>
    </div>
  `;
  return dashboardShell('Alerta activa', 'Vista operativa de emergencia con chat interno, ubicación y ficha médica.', content);
}

export function simulateDashboardDay() {
  const eventTypes = ['Movimiento brusco', 'Prueba manual', 'Frenado de emergencia', 'Bache severo'];
  const severities = ['Baja', 'Media', 'Media', 'Alta'];
  const index = Math.floor(Math.random() * eventTypes.length);
  const now = new Date();
  const id = generateId();
  state.incidents.unshift({
    id,
    date: now.toISOString().slice(0,10),
    time: now.toTimeString().slice(0,5),
    type: eventTypes[index],
    severity: severities[index],
    status: eventTypes[index] === 'Prueba manual' ? 'Prueba completada' : 'Registrado para análisis',
    location: 'Ruta habitual del conductor',
    coords: '20.054901, -99.343201',
    gForce: `${(Math.random()*4 + 1.2).toFixed(1)}G`,
    decibels: `${Math.round(Math.random()*45 + 65)}dB`,
    heartRate: `${Math.round(Math.random()*35 + 78)} bpm`,
    activation: 'Simulación dashboard',
    notified: activeAlertContacts().map(c => c.name),
    responseTime: `${Math.round(Math.random()*18 + 3)} segundos`,
    note: 'Evento generado desde el dashboard analítico para validar actualización de gráficas.',
    timeline: [[now.toTimeString().slice(0,8), 'Evento simulado registrado'], [now.toTimeString().slice(0,8), 'Dashboard actualizado']]
  });
  state.wearable.lastSync = 'Hace unos segundos';
  state.wearable.battery = Math.max(5, state.wearable.battery - 2);
  addNotification('Día de operación simulado', `Se registró ${eventTypes[index]} y las métricas se actualizaron.`, 'incident');
  toast('Dashboard actualizado', 'Se agregó un evento operativo y cambiaron las gráficas.');
  route();
}

export function exportDashboardSummary() {
  const summary = {
    fecha: new Date().toLocaleString('es-MX'),
    plan: plan().name,
    proteccion: `${protectionScore()}%`,
    riesgo: `${riskIndex()}%`,
    contactosActivos: activeAlertContacts().length,
    contactosSuspendidos: suspendedContacts().length,
    monitoresActivos: state.monitors.filter(m => m.status === 'Activo').length,
    incidentesRegistrados: state.incidents.length,
    respuestaPromedio: `${avgResponseSeconds()} segundos`
  };
  console.table(summary);
  addNotification('Resumen exportado', 'Se generó un resumen simulado del dashboard en consola.', 'system');
  toast('Resumen exportado', 'En una app real se descargará un PDF/CSV. En la demo se muestra en consola.');
  route();
}
