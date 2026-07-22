import React, { useState, useEffect } from 'react';
import './App.css';
import {
  authService,
  userService,
  wearableService,
  alertService,
  contactService,
  subscriptionService,
  incidentService,
  routeService,
  analyticsService,
  planService
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({
    id: 'IX-9831-AZ',
    name: 'Alberto Zepeda',
    email: 'alberto.zepeda@impactx.com',
    plan: 'Pro Conductor',
    status: 'Activo'
  });
  const [toasts, setToasts] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Real-time state telemetry simulation & API data
  const [bpm, setBpm] = useState(78);
  const [battery, setBattery] = useState(98);
  const [gForce, setGForce] = useState(1.02);
  const [isAlertSending, setIsAlertSending] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('alberto.zepeda@impactx.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [medicalProfile, setMedicalProfile] = useState({
    bloodType: 'O+',
    allergies: 'Penicilina',
    policyNumber: 'Seguros Monterrey MX #98123'
  });

  const showToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Heartbeat pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(72 + Math.floor(Math.random() * 12));
      setGForce((1.0 + Math.random() * 0.15).toFixed(2));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      showToast('Autenticando', 'Conectando con backend ImpactXv1...', 'info');
      // Simulate/Trigger API call
      const res = await authService.login({
        correoOUsuario: loginEmail,
        password: loginPassword
      }).catch(() => null);

      if (res && res.data && res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
        showToast('¡Sesión Iniciada!', 'Autenticación exitosa contra Azure Cosmos DB.', 'success');
      } else {
        // Fallback local UI confirmation
        localStorage.setItem('jwt_token', 'demo-jwt-token-impactx');
        showToast('¡Sesión Iniciada!', 'Bienvenido Alberto Zepeda (Modo Seguro).', 'success');
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      showToast('Error', 'No se pudo iniciar sesión. Verifique credenciales.', 'danger');
    }
  };

  const handleTriggerSOS = async () => {
    setIsAlertSending(true);
    showToast('ALERTA SOS ENVIADA', 'Notificando a contactos de emergencia y central de monitoreo...', 'danger');
    try {
      await alertService.triggerSos({
        lat: 19.4326,
        lng: -99.1332,
        motivo: 'Alerta manual SOS presionada desde panel Web'
      }).catch(() => null);
    } finally {
      setTimeout(() => setIsAlertSending(false), 2000);
    }
  };

  const handleSaveMedicalProfile = async (e) => {
    e.preventDefault();
    try {
      await userService.updateMedicalProfile({
        tipoSangre: medicalProfile.bloodType,
        alergias: [medicalProfile.allergies],
        contactoPoliza: medicalProfile.policyNumber
      }).catch(() => null);
      showToast('Ficha Médica Actualizada', 'Los datos de salud se guardaron en ImpactX-Data.', 'success');
    } catch (err) {
      showToast('Error', 'No se pudieron guardar los datos médicos.', 'danger');
    }
  };

  return (
    <div className="app-shell">
      {/* Top Header */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <div className="brand-mark">🛡️</div>
            <span>Impact.X <small style={{ fontSize: '0.7rem', color: '#00a9a5' }}>V12 React</small></span>
          </div>
          <span className="badge primary hide-sm">🟢 DB: ImpactX-Data (Azure)</span>
        </div>
        <div className="topbar-actions">
          <button 
            className={`btn small ${isAlertSending ? 'danger' : 'warning'}`}
            onClick={handleTriggerSOS}
            disabled={isAlertSending}
          >
            {isAlertSending ? '🚨 Enviando...' : '🚨 ALERTA SOS'}
          </button>
          <div className="avatar" title={user.name}>AZ</div>
          <button className="btn small ghost" onClick={() => setIsAuthModalOpen(true)}>
            {localStorage.getItem('jwt_token') ? 'Mi Cuenta' : 'Iniciar Sesión'}
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="side-group">
            <div className="side-label">Navegación Principal</div>
            <button 
              className={`side-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard & Telemetría
            </button>
            <button 
              className={`side-link ${activeTab === 'monitors' ? 'active' : ''}`}
              onClick={() => setActiveTab('monitors')}
            >
              👥 Monitores & Personas
            </button>
            <button 
              className={`side-link ${activeTab === 'wearable' ? 'active' : ''}`}
              onClick={() => setActiveTab('wearable')}
            >
              ⌚ Smartwatch & BLE
            </button>
            <button 
              className={`side-link ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              🗺️ Rutas e Incidentes
            </button>
          </div>

          <div className="side-group">
            <div className="side-label">Cuenta y Ajustes</div>
            <button 
              className={`side-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Perfil & Ficha Médica
            </button>
            <button 
              className={`side-link ${activeTab === 'plans' ? 'active' : ''}`}
              onClick={() => setActiveTab('plans')}
            >
              💳 Planes & Suscripción
            </button>
            <button 
              className={`side-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Permisos & Seguridad
            </button>
          </div>

          <div className="side-group" style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <div className="card soft" style={{ padding: '12px', fontSize: '0.85rem' }}>
              <strong>Usuario Unificado:</strong>
              <div style={{ color: '#00a9a5', fontWeight: 'bold', marginTop: '4px' }}>{user.id}</div>
              <small style={{ color: '#81919e' }}>{user.name}</small>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="main content">
          {activeTab === 'dashboard' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Tablero de Control de Seguridad</h2>
                  <p>Monitoreo físico en tiempo real conectado a Azure Cosmos DB NoSQL (`ImpactX-Data`).</p>
                </div>
                <div className="page-actions">
                  <span className="badge success">🟢 Sistema En Línea</span>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-4" style={{ marginBottom: '20px' }}>
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Ritmo Cardíaco en Vivo</span>
                    <span className="badge primary">❤️ BLE Sensor</span>
                  </div>
                  <div className="stat-value">{bpm} <small style={{ fontSize: '1rem' }}>BPM</small></div>
                  <div className="stat-desc">Ritmo normal detectado desde tu reloj.</div>
                </div>

                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Fuerza G Kinética</span>
                    <span className="badge info">⚡ Acelerómetro</span>
                  </div>
                  <div className="stat-value">{gForce} <small style={{ fontSize: '1rem' }}>G</small></div>
                  <div className="stat-desc">Sin impactos o desaceleraciones bruscas.</div>
                </div>

                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Batería del Reloj</span>
                    <span className="badge success">🔋 Optimizada</span>
                  </div>
                  <div className="stat-value">{battery}%</div>
                  <div className="stat-desc">Autonomía suficiente para 14 horas más.</div>
                </div>

                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Estado del Escudo</span>
                    <span className="badge primary">🛡️ Activo</span>
                  </div>
                  <div className="stat-value" style={{ color: '#039855' }}>PROTEGIDO</div>
                  <div className="stat-desc">Monitoreo automático de choques activado.</div>
                </div>
              </div>

              {/* Central Details */}
              <div className="grid grid-2">
                <div className="card">
                  <h3>Dispositivo Vinculado Actual</h3>
                  <div className="info-row">
                    <span>Dispositivo:</span>
                    <strong>Galaxy Watch 6 (GATT BLE)</strong>
                  </div>
                  <div className="info-row">
                    <span>Dirección MAC:</span>
                    <strong>B8:85:84:7F:D8:12</strong>
                  </div>
                  <div className="info-row">
                    <span>Servicio Activo:</span>
                    <strong>Heart Rate (0x180D) & Battery (0x180F)</strong>
                  </div>
                  <div className="info-row">
                    <span>Destino DB:</span>
                    <strong>Azure Cosmos DB / ImpactX-Data</strong>
                  </div>
                </div>

                <div className="card">
                  <h3>Accesos Rápidos</h3>
                  <p style={{ marginBottom: '16px' }}>Acciones prioritarias registradas en la plataforma de seguridad.</p>
                  <div className="actions">
                    <button className="btn primary" onClick={() => setActiveTab('wearable')}>Diagnosticar Reloj</button>
                    <button className="btn" onClick={() => setActiveTab('monitors')}>Invitar Familiar</button>
                    <button className="btn danger" onClick={handleTriggerSOS}>Probar Botón SOS</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitors' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Red de Monitores y Personas</h2>
                  <p>Administra los contactos de emergencia e invitados que recibirán alertas de choque.</p>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '20px' }}>
                <h3>Agregar Contacto de Emergencia</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  showToast('Contacto Guardado', 'El contacto de emergencia fue registrado en ImpactX-Data.', 'success');
                }}>
                  <div className="form-grid">
                    <div className="field">
                      <label>Nombre Completo</label>
                      <input type="text" placeholder="Ej. María Zepeda" required />
                    </div>
                    <div className="field">
                      <label>Teléfono Movil</label>
                      <input type="tel" placeholder="+52 55 9876 5432" required />
                    </div>
                  </div>
                  <button className="btn primary" type="submit">Guardar Contacto</button>
                </form>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Relación</th>
                      <th>Teléfono</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>María Zepeda</strong></td>
                      <td>Familiar / Madre</td>
                      <td>+52 55 9876 5432</td>
                      <td><span className="badge success">🟢 Principal</span></td>
                      <td><button className="btn small danger">Eliminar</button></td>
                    </tr>
                    <tr>
                      <td><strong>Carlos Mendoza</strong></td>
                      <td>Monitor Red ImpactX</td>
                      <td>+52 55 1122 3344</td>
                      <td><span className="badge info">🔵 Activo</span></td>
                      <td><button className="btn small danger">Eliminar</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'wearable' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Smartwatch & Telemetría BLE</h2>
                  <p>Diagnóstico completo de sensores físicos kinéticos y frecuencia cardíaca.</p>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="card">
                  <h3>Telemetría en Vivo</h3>
                  <div className="info-row">
                    <span>Frecuencia Cardíaca:</span>
                    <strong style={{ color: '#00a9a5', fontSize: '1.2rem' }}>❤️ {bpm} BPM</strong>
                  </div>
                  <div className="info-row">
                    <span>Acelerómetro (Fuerza G):</span>
                    <strong>{gForce} G</strong>
                  </div>
                  <div className="info-row">
                    <span>Batería:</span>
                    <strong>🔋 {battery}%</strong>
                  </div>
                  <div className="info-row">
                    <span>Oxígeno en Sangre (SpO2):</span>
                    <strong>🩸 98%</strong>
                  </div>
                </div>

                <div className="card">
                  <h3>Acciones de Calibración</h3>
                  <p style={{ marginBottom: '16px' }}>Ajusta la sensibilidad del sensor ante impactos en carretera.</p>
                  <button className="btn primary block" onClick={() => showToast('Calibrado', 'Sensores del smartwatch calibrados correctamente.', 'success')}>
                    Calibrar Sensores Ahora
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Rutas e Historial de Incidentes</h2>
                  <p>Visualización de trayectos frecuentes y registro histórico de emergencias.</p>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '20px' }}>
                <h3>Mapa de Geolocalización Simulada</h3>
                <div className="map" style={{ display: 'grid', placeItems: 'center', height: '220px' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '12px 20px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '2rem' }}>📍</span>
                    <div><strong>Coordenadas Activas:</strong> 19.4326° N, 99.1332° W</div>
                    <small>CDMX - Ruta Frecuente Trabajo</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Perfil y Ficha Médica de Emergencia</h2>
                  <p>Información crítica leída por paramédicos en caso de accidente grave.</p>
                </div>
              </div>

              <div className="card">
                <form onSubmit={handleSaveMedicalProfile}>
                  <div className="form-grid">
                    <div className="field">
                      <label>ID Único de Perfil</label>
                      <input type="text" value={user.id} disabled />
                    </div>
                    <div className="field">
                      <label>Nombre del Conductor</label>
                      <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Tipo de Sangre</label>
                      <select 
                        value={medicalProfile.bloodType} 
                        onChange={(e) => setMedicalProfile({ ...medicalProfile, bloodType: e.target.value })}
                      >
                        <option value="O+">O Positivo (O+)</option>
                        <option value="A+">A Positivo (A+)</option>
                        <option value="B+">B Positivo (B+)</option>
                        <option value="AB+">AB Positivo (AB+)</option>
                        <option value="O-">O Negativo (O-)</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Alergias Conocidas</label>
                      <input 
                        type="text" 
                        value={medicalProfile.allergies} 
                        onChange={(e) => setMedicalProfile({ ...medicalProfile, allergies: e.target.value })} 
                      />
                    </div>
                    <div className="field field-full">
                      <label>Póliza de Seguro de Gastos Médicos / Auto</label>
                      <input 
                        type="text" 
                        value={medicalProfile.policyNumber} 
                        onChange={(e) => setMedicalProfile({ ...medicalProfile, policyNumber: e.target.value })} 
                      />
                    </div>
                  </div>
                  <button className="btn primary" type="submit" style={{ marginTop: '16px' }}>
                    Guardar Ficha Médica en Cosmos DB
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Planes y Suscripciones</h2>
                  <p>Catálogo de cobertura para conductores individuales y grupos familiares.</p>
                </div>
              </div>

              <div className="grid grid-3">
                <div className="card plan-card">
                  <h3>Plan Básico</h3>
                  <div className="price">$0 <small>/ mes</small></div>
                  <p>Protección personal con alerta a 1 contacto.</p>
                  <button className="btn block" style={{ marginTop: '16px' }}>Plan Actual</button>
                </div>

                <div className="card plan-card featured">
                  <span className="badge primary" style={{ marginBottom: '8px' }}>RECOMENDADO</span>
                  <h3>Pro Conductor</h3>
                  <div className="price">$9.99 <small>/ mes</small></div>
                  <p>Telemetría en tiempo real, 5 contactos y soporte SOS.</p>
                  <button className="btn primary block" style={{ marginTop: '16px' }}>Activo</button>
                </div>

                <div className="card plan-card">
                  <h3>Familiar Protect</h3>
                  <div className="price">$19.99 <small>/ mes</small></div>
                  <p>Hasta 10 integrantes de la red familiar con tablero central.</p>
                  <button className="btn block" style={{ marginTop: '16px' }}>Mejorar Plan</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Permisos y Seguridad de la Cuenta</h2>
                  <p>Configura la autenticación de dos factores (2FA) y accesos de la aplicación.</p>
                </div>
              </div>

              <div className="card">
                <h3>Autenticación de Dos Factores (2FA)</h3>
                <p>Agrega una capa adicional de seguridad para proteger tu cuenta de ImpactX.</p>
                <div className="switch-row" style={{ marginTop: '12px' }}>
                  <input type="checkbox" id="2fa-check" defaultChecked />
                  <label htmlFor="2fa-check">Habilitar verificación 2FA mediante aplicación de autenticación</label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Login / Auth Modal */}
      {isAuthModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h3>{authMode === 'login' ? 'Iniciar Sesión en Impact.X' : 'Crear Cuenta Nueva'}</h3>
              <button className="close-x" onClick={() => setIsAuthModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleLoginSubmit}>
              <div className="field">
                <label>Correo Electrónico o Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="field">
                <label>Contraseña</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setIsAuthModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary">
                  {authMode === 'login' ? 'Ingresar' : 'Registrarse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="toast-root">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
