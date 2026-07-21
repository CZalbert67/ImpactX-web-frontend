// js/views/landing.js
import { publicShell } from '../components/shell.js';
import { esc } from '../utils.js';

export function infoCard(icon, title, text) {
  return `<div class="card"><div class="card-icon">${icon}</div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
}

export function renderLanding() {
  return publicShell(`
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">🛡️ Burbuja de seguridad privada</span>
          <h1>Detección inteligente de accidentes desde tu smartwatch.</h1>
          <p class="lead">Impact.X conecta wearable, app móvil y dashboard web para detectar impactos, validar señales multisensoriales y avisar a tus contactos de emergencia con ubicación GPS.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#/registro?plan=trial">Iniciar prueba gratis</a>
            <a class="btn" href="#/planes">Ver planes</a>
            <a class="btn ghost" href="#/login">Ya tengo cuenta</a>
          </div>
          <div class="kpi-strip">
            <div class="kpi-card"><strong>30 días</strong><span>Trial funcional</span></div>
            <div class="kpi-card"><strong>GPS</strong><span>Ubicación de emergencia</span></div>
            <div class="kpi-card"><strong>SPA</strong><span>Dashboard web en React</span></div>
          </div>
        </div>
        <div class="device-mock">
          <div class="mock-top"><span class="mock-pill">SOS listo</span><span class="badge success"><span class="status-dot success"></span>Conectado</span></div>
          <div class="mock-card">
            <h3>Estado de protección</h3>
            <p>Wearable conectado · 2 contactos activos · Trial con 24 días restantes.</p>
          </div>
          <div class="mock-map"></div>
          <div class="mock-card"><strong>Último evento:</strong> Movimiento brusco cancelado por usuario.</div>
        </div>
      </div>
    </section>
    <section id="como-funciona" class="section">
      <div class="container">
        <div class="section-head"><div><h2>Cómo funciona</h2><p>Flujo básico desde detección hasta notificación a monitores.</p></div></div>
        <div class="grid grid-4">
          ${infoCard('1', 'Detección inicial', 'El smartwatch detecta anomalías de aceleración y movimientos bruscos.')}
          ${infoCard('2', 'Validación multisensorial', 'Se evalúa fuerza G, micrófono, frecuencia cardíaca y contexto del conductor.')}
          ${infoCard('3', 'Confirmación o bypass', 'Según el plan, espera confirmación o activa bypass crítico en impactos graves.')}
          ${infoCard('4', 'Alerta privada', 'Los contactos y monitores reciben ubicación y datos del incidente.')}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head"><div><h2>Módulos web incluidos</h2><p>Este prototipo incluye el flujo completo del apartado web para maquetado.</p></div></div>
        <div class="grid grid-3">
          ${infoCard('🧭', 'Dashboard Overview', 'Estado del wearable, plan, contactos, incidentes y accesos rápidos.')}
          ${infoCard('☎️', 'Gestor de contactos', 'CRUD completo con límite de plan, confirmaciones y prioridad principal.')}
          ${infoCard('🛡️', 'Red de monitoreo', 'Invitaciones por URL, copiar enlace, revocar, reenviar y aceptar invitación.')}
          ${infoCard('📍', 'Incidentes', 'Historial, detalle, mapa simulado, reportes y bloqueo Premium.')}
          ${infoCard('💳', 'Suscripción', 'Planes, cambio de plan, pago simulado e historial.')}
          ${infoCard('⚙️', 'Configuración', 'Cuenta, seguridad, preferencias y privacidad.')}
        </div>
      </div>
    </section>
    <footer class="section"><div class="container card"><strong>Impact.X</strong><p>Prototipo web para proyecto wearable de seguridad vial.</p></div></footer>
  `);
}
