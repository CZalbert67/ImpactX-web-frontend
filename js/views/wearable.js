// js/views/wearable.js
import { state, saveState, ensureState } from '../state.js';
import { route, navigate } from '../router.js';
import { esc, toast, confirmModal, openModal, closeModal } from '../utils.js';
import { dashboardShell } from '../components/shell.js';

export function wearableBadge() {
  if (!state.wearable.linked) return '<span class="badge danger"><span class="status-dot danger"></span>No vinculado</span>';
  if (state.wearable.connection === 'connected') return '<span class="badge success"><span class="status-dot success"></span>Conectado</span>';
  return '<span class="badge danger"><span class="status-dot danger"></span>Desconectado</span>';
}

export function syncWearable() {
  if (!state.wearable.linked) return pairingGuide();
  toast('Sincronizando', 'Intentando conectar con el wearable...');
}

export function pairingGuide() {
  openModal({
    title: 'Guía de vinculación',
    content: `<div class="timeline"><div class="timeline-item"><h4>1. Abre la app móvil</h4><p>La app móvil actúa como puente de comunicación.</p></div><div class="timeline-item"><h4>2. Activa Bluetooth y permisos</h4><p>GPS, sensores, micrófono, actividad en segundo plano y chat interno móvil.</p></div><div class="timeline-item"><h4>3. Selecciona tu smartwatch</h4><p>Confirma el código de sincronización.</p></div><div class="timeline-item"><h4>4. Revisa Impact.X</h4><p>El estado del wearable y el chat interno deben aparecer activos.</p></div></div>`,
    actions: [{ label: 'Entendido', className: 'primary', onClick: closeModal }],
    large: true
  });
}

export function unlinkWearable() {
  confirmModal({ 
    title: 'Desvincular dispositivo', 
    body: 'El wearable dejará de enviar datos y el sistema quedará limitado.', 
    confirmText: 'Desvincular', 
    danger: true, 
    onConfirm: () => { 
      state.wearable.linked = false; 
      state.wearable.connection = 'disconnected'; 
      state.notifications.unshift({
        id: Math.max(1000, ...state.notifications.map(n => n.id)) + 1,
        title: 'Wearable desvinculado',
        body: 'El smartwatch fue desvinculado de la cuenta.',
        type: 'wearable',
        unread: true,
        date: new Date().toLocaleString('es-MX')
      });
      toast('Dispositivo desvinculado'); 
      route(); 
    } 
  });
}

export function renderWearable() {
  ensureState();
  const w = state.wearable;
  const labels = { 
    accelerometer: 'Acelerómetro', 
    microphone: 'Micrófono', 
    heartRate: 'Frecuencia cardíaca', 
    gps: 'GPS', 
    background: 'Servicio en segundo plano', 
    internalBridge: 'Puente de chat interno móvil' 
  };
  const permissions = Object.entries(w.permissions)
    .filter(([k]) => k !== 'smsBridge')
    .map(([k, v]) => `<div class="list-item"><div><h4>${labels[k] || k}</h4><p>${v ? 'Permiso activo y funcional.' : 'Permiso pendiente o bloqueado.'}</p></div><span class="badge ${v ? 'success' : 'danger'}">${v ? 'Activo' : 'Pendiente'}</span></div>`)
    .join('');
    
  const content = !w.linked ? `
    <div class="empty-state">
      <h3>Sin wearable vinculado</h3>
      <p>Vincula un smartwatch desde la app móvil para activar la protección.</p>
      <button class="btn primary" data-action="show-pairing-guide">Ver instrucciones</button>
    </div>
  ` : `
    <div class="grid grid-3">
      <div class="card stat-card"><div class="stat-top"><h3>Dispositivo</h3>${wearableBadge()}</div><div class="stat-value">${esc(w.model)}</div><div class="stat-desc">Versión ${esc(w.appVersion)} · ${esc(w.lastSync)}</div><div class="card-actions"><button class="btn small" data-action="sync-wearable">Sincronizar ahora</button><button class="btn small" data-action="show-pairing-guide">Instrucciones</button></div></div>
      <div class="card stat-card"><div class="stat-top"><h3>Batería</h3><span class="badge ${w.battery > 25 ? 'success' : 'warning'}">${w.battery > 25 ? 'Correcta' : 'Baja'}</span></div><div class="stat-value">${w.battery}%</div><div class="progress"><span style="width:${w.battery}%"></span></div><div class="card-actions"><button class="btn small" data-action="simulate-low-battery">Simular batería baja</button></div></div>
      <div class="card stat-card"><div class="stat-top"><h3>Conexión</h3><span class="badge ${w.connection === 'connected' ? 'success' : 'danger'}">${w.connection === 'connected' ? 'Online' : 'Offline'}</span></div><div class="stat-value">${w.connection === 'connected' ? 'OK' : 'OFF'}</div><div class="stat-desc">La protección depende del reloj, app móvil y chat interno.</div><div class="card-actions"><button class="btn small" data-action="toggle-wearable-connection">Cambiar estado</button></div></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>Permisos y sensores</h3><div class="list">${permissions}</div></div>
      <div class="card">
        <h3>Acciones de dispositivo</h3>
        <p>Opciones simuladas para maqueta.</p>
        <div class="card-actions">
          <button class="btn" data-action="show-pairing-guide">Ver guía de vinculación</button>
          <button class="btn warning" data-action="toggle-wearable-connection">Simular desconexión/conexión</button>
          <button class="btn danger" data-action="unlink-wearable">Desvincular dispositivo</button>
          <button class="btn" data-route="/dashboard/ayuda?tema=wearable">Ir a ayuda</button>
        </div>
      </div>
    </div>`;
  return dashboardShell('Estado del wearable', 'Estado de conexión, batería, sensores, permisos y chat interno.', content);
}
