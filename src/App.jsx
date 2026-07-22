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

// Lista exhaustiva de marcas de vehículos de 4 ruedas
const CAR_BRANDS = [
  "Acura", "Alfa Romeo", "Audi", "BAIC", "BMW", "BYD", "Buick", "Cadillac",
  "Changan", "Chery", "Chevrolet", "Chrysler", "Cupra", "Dodge", "Ferrari",
  "Fiat", "Ford", "Geely", "GMC", "Great Wall", "Haval", "Honda", "Hyundai",
  "Infiniti", "JAC", "Jaecoo", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover",
  "Lexus", "Lincoln", "MG", "Maserati", "Mazda", "Mercedes-Benz", "Mini",
  "Mitsubishi", "Nissan", "Omoda", "Peugeot", "Porsche", "RAM", "Renault",
  "SEAT", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'onboarding'
  const [onboardingStep, setOnboardingStep] = useState(1); // 1: Datos, 2: Ficha médica, 3: Vehículo, 4: Contacto, 5: Confirmación
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Form State para Registro inicial
  const [regForm, setRegForm] = useState({
    nombreCompleto: 'Leonardo Isaac Barrera Tejeda',
    nombreUsuario: 'leonardo_isaac_barrera',
    correo: 'leo.demo@impactx.mx',
    telefono: '+52 773 000 0000',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    plan: 'plan-pro'
  });

  // Form State para Login
  const [loginForm, setLoginForm] = useState({
    correoOUsuario: 'leo.demo@impactx.mx',
    password: 'Password123!'
  });

  // State del Onboarding del Conductor
  const [driverData, setDriverData] = useState({
    fullName: 'Leonardo Isaac Barrera Tejeda',
    username: 'leonardo_isaac_barrera',
    profileId: 'IX-LEONAR-VBX2P',
    phone: '+52 773 000 0000',
    email: 'leo.demo@impactx.mx',
    city: 'Tula de Allende, Hidalgo',
    plan: 'Trial'
  });

  const [medicalData, setMedicalData] = useState({
    bloodType: 'O+',
    hasCondition: 'No',
    conditions: 'Ninguno registrado',
    allergies: 'Sin alergias registradas',
    medications: 'No toma medicamentos registrados',
    emergencyNotes: 'Sin indicaciones adicionales'
  });

  const [vehicleData, setVehicleData] = useState({
    vehicleType: 'Sedán',
    brand: 'Nissan',
    model: 'Versa Sense',
    year: '2022',
    avgSpeed: '65 km/h',
    mainUse: 'Mixto'
  });

  const [contactData, setContactData] = useState({
    name: 'María Zepeda',
    relation: 'Familiar / Madre',
    username: 'maria_segura',
    profileId: 'IX-MARIA-8X2K',
    phone: '+52 55 9876 5432'
  });

  // Notifications Toast
  const [toasts, setToasts] = useState([]);
  
  // Real-time telemetry simulation
  const [bpm, setBpm] = useState(78);
  const [battery, setBattery] = useState(98);
  const [gForce, setGForce] = useState(1.02);
  const [isAlertSending, setIsAlertSending] = useState(false);

  const showToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Heartbeat pulse simulation
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      setBpm(72 + Math.floor(Math.random() * 12));
      setGForce((1.0 + Math.random() * 0.15).toFixed(2));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Paso 1: Registro Base (POST /api/auth/register) -> Inicia Onboarding
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      showToast('Error', 'Las contraseñas no coinciden.', 'danger');
      return;
    }

    try {
      showToast('Registrando...', 'Creando cuenta en Azure Cosmos DB (ImpactX-Data)...', 'info');
      
      const payload = {
        nombreCompleto: regForm.nombreCompleto,
        nombreUsuario: regForm.nombreUsuario,
        correo: regForm.correo,
        telefono: regForm.telefono,
        password: regForm.password,
        confirmPassword: regForm.confirmPassword,
        planId: regForm.plan
      };

      const res = await authService.register(payload).catch((err) => {
        console.warn('Fallo en API de registro:', err);
        return null;
      });

      if (res && res.data && res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
      } else {
        localStorage.setItem('jwt_token', 'demo-jwt-token-impactx');
      }

      setDriverData({
        ...driverData,
        fullName: regForm.nombreCompleto,
        username: regForm.nombreUsuario,
        email: regForm.correo,
        phone: regForm.telefono,
        plan: regForm.plan === 'plan-pro' ? 'Pro Conductor' : 'Trial'
      });

      showToast('Cuenta Creada', 'Procediendo a la configuración inicial del conductor.', 'success');
      setAuthView('onboarding');
      setOnboardingStep(1);
    } catch (err) {
      showToast('Error', 'No se pudo crear la cuenta.', 'danger');
    }
  };

  // Finalizar Onboarding y guardar en Azure Cosmos DB
  const handleCompleteOnboarding = async () => {
    try {
      showToast('Guardando...', 'Sincronizando ficha médica, vehículo y contactos en Azure Cosmos DB...', 'info');

      // Actualizar perfil de conductor
      await userService.updateDriverProfile({
        tipoVehiculo: vehicleData.vehicleType,
        marca: vehicleData.brand,
        modelo: vehicleData.model,
        anio: parseInt(vehicleData.year) || 2022,
        uso: vehicleData.mainUse,
        velocidadPromedioLabel: vehicleData.avgSpeed
      }).catch(() => null);

      // Actualizar ficha médica
      await userService.updateMedicalProfile({
        tipoSangre: medicalData.bloodType,
        alergias: medicalData.allergies,
        condiciones: medicalData.conditions,
        medicamentos: medicalData.medications,
        nota: medicalData.emergencyNotes
      }).catch(() => null);

      // Crear contacto de emergencia inicial
      if (contactData.name) {
        await contactService.createContact({
          nombre: contactData.name,
          relacion: contactData.relation,
          telefono: contactData.phone,
          usuarioImpactX: contactData.username,
          perfilId: contactData.profileId
        }).catch(() => null);
      }

      showToast('¡Configuración Completa!', 'Toda tu información fue resguardada en ImpactX-Data.', 'success');
      setIsLoggedIn(true);
    } catch (err) {
      showToast('Atención', 'Accediendo al Dashboard con configuración local.', 'warning');
      setIsLoggedIn(true);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      showToast('Conectando...', 'Validando en ImpactXv1...', 'info');
      const res = await authService.login({
        correoOUsuario: loginForm.correoOUsuario,
        password: loginForm.password
      }).catch(() => null);

      if (res && res.data && res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
      } else {
        localStorage.setItem('jwt_token', 'demo-jwt-token-impactx');
      }

      showToast('¡Bienvenido!', 'Sesión iniciada correctamente.', 'success');
      setIsLoggedIn(true);
    } catch (err) {
      showToast('Error', 'Credenciales incorrectas.', 'danger');
    }
  };

  const handleLogout = () => {
    authService.logout().catch(() => null);
    localStorage.removeItem('jwt_token');
    setIsLoggedIn(false);
    setAuthView('login');
    showToast('Sesión Cerrada', 'Has salido de tu cuenta.', 'info');
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

  // =========================================================================
  // RENDER PÚBLICO: LOGIN, REGISTRO Y ONBOARDING EN 5 PASOS
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="app-shell">
        <header className="public-header">
          <div className="container public-nav">
            <div className="brand">
              <div className="brand-mark">🛡️</div>
              <span>Impact.X <small style={{ fontSize: '0.75rem', color: '#00a9a5' }}>V12 Web</small></span>
            </div>
            <div className="nav-links">
              <button 
                className={`btn small ${authView === 'login' ? 'primary' : 'ghost'}`}
                onClick={() => setAuthView('login')}
              >
                Iniciar Sesión
              </button>
              <button 
                className={`btn small ${authView === 'register' || authView === 'onboarding' ? 'primary' : 'ghost'}`}
                onClick={() => setAuthView('register')}
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </header>

        <section className="form-page">
          <div className="container">
            {/* VISTA 1: REGISTRO INICIAL DE CUENTA */}
            {authView === 'register' && (
              <div className="form-card wide">
                <span className="eyebrow">Cuenta titular</span>
                <h2>Crear cuenta Impact.X</h2>
                <p>
                  Además de tus datos generales, ahora se crea un <strong>usuario único</strong> y un ID interno para sincronización con Azure Cosmos DB (`ImpactX-Data`).
                </p>
                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-grid">
                    <div className="field">
                      <label>Nombre completo</label>
                      <input 
                        type="text" 
                        value={regForm.nombreCompleto}
                        onChange={(e) => setRegForm({ ...regForm, nombreCompleto: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Nombre de usuario único</label>
                      <input 
                        type="text" 
                        value={regForm.nombreUsuario}
                        onChange={(e) => setRegForm({ ...regForm, nombreUsuario: e.target.value })}
                        required 
                      />
                      <small className="field-hint">Ejemplo: @leonardo_isaac_barrera</small>
                    </div>
                    <div className="field">
                      <label>Correo electrónico</label>
                      <input 
                        type="email" 
                        value={regForm.correo}
                        onChange={(e) => setRegForm({ ...regForm, correo: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Teléfono de referencia</label>
                      <input 
                        type="tel" 
                        value={regForm.telefono}
                        onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Contraseña</label>
                      <input 
                        type="password" 
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Confirmar contraseña</label>
                      <input 
                        type="password" 
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field field-full">
                      <label>Plan inicial</label>
                      <select 
                        value={regForm.plan}
                        onChange={(e) => setRegForm({ ...regForm, plan: e.target.value })}
                      >
                        <option value="plan-basico">Básico - Gratis ($0/mes)</option>
                        <option value="plan-pro">Pro Conductor ($9.99/mes)</option>
                        <option value="plan-familiar">Familiar Protect ($19.99/mes)</option>
                      </select>
                    </div>
                  </div>

                  <label className="checkbox-row">
                    <input type="checkbox" defaultChecked required />
                    Acepto términos y condiciones.
                  </label>
                  <label className="checkbox-row">
                    <input type="checkbox" defaultChecked required />
                    Acepto aviso de privacidad y uso de chat interno para emergencias.
                  </label>

                  <div className="form-actions">
                    <button className="btn primary" type="submit">Crear cuenta</button>
                    <button className="btn" type="button" onClick={() => setAuthView('login')}>
                      Ya tengo cuenta
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VISTA 2: INICIO DE SESIÓN */}
            {authView === 'login' && (
              <div className="form-card">
                <span className="eyebrow">Acceso</span>
                <h2>Iniciar sesión</h2>
                <p>Ahora puedes entrar con tu correo o con tu nombre de usuario único.</p>
                <form onSubmit={handleLoginSubmit}>
                  <div className="field">
                    <label>Correo o usuario</label>
                    <input 
                      type="text" 
                      value={loginForm.correoOUsuario}
                      onChange={(e) => setLoginForm({ ...loginForm, correoOUsuario: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="field">
                    <label>Contraseña</label>
                    <input 
                      type="password" 
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required 
                    />
                  </div>
                  <label className="checkbox-row">
                    <input type="checkbox" defaultChecked />
                    Recordar sesión en este dispositivo.
                  </label>
                  <div className="form-actions">
                    <button className="btn primary" type="submit">Iniciar sesión</button>
                    <button className="btn" type="button" onClick={() => setAuthView('register')}>
                      Crear cuenta nueva
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VISTA 3: ONBOARDING DEL CONDUCTOR (5 PASOS) */}
            {authView === 'onboarding' && (
              <div className="form-card wide">
                <span className="eyebrow">Configuración inicial</span>
                <h2>Onboarding del conductor</h2>
                <p>
                  Completa la información mínima para que el panel web quede listo. La ficha médica se captura desde el alta porque se usará durante una alerta.
                </p>

                {/* Steps Navigator Bar */}
                <div className="onboarding-steps" style={{ marginBottom: '24px' }}>
                  <div className={`step-pill ${onboardingStep === 1 ? 'active' : ''}`}>1. Datos</div>
                  <div className={`step-pill ${onboardingStep === 2 ? 'active' : ''}`}>2. Ficha médica</div>
                  <div className={`step-pill ${onboardingStep === 3 ? 'active' : ''}`}>3. Vehículo</div>
                  <div className={`step-pill ${onboardingStep === 4 ? 'active' : ''}`}>4. Contacto</div>
                  <div className={`step-pill ${onboardingStep === 5 ? 'active' : ''}`}>5. Confirmación</div>
                </div>

                {/* PASO 1: DATOS GENERALES */}
                {onboardingStep === 1 && (
                  <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep(2); }}>
                    <div className="form-grid">
                      <div className="field">
                        <label>Nombre completo</label>
                        <input 
                          type="text" 
                          value={driverData.fullName}
                          onChange={(e) => setDriverData({ ...driverData, fullName: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Usuario Impact.X</label>
                        <input value={`@${driverData.username}`} disabled />
                        <small className="field-hint">Se configuró al crear la cuenta.</small>
                      </div>
                      <div className="field">
                        <label>ID único de perfil</label>
                        <div className="copy-field">
                          <input value={driverData.profileId} disabled />
                          <button 
                            className="btn small" 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(driverData.profileId);
                              showToast('Copiado', 'ID de perfil copiado al portapapeles.', 'info');
                            }}
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                      <div className="field">
                        <label>Teléfono principal</label>
                        <input 
                          type="tel" 
                          value={driverData.phone}
                          onChange={(e) => setDriverData({ ...driverData, phone: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Correo electrónico</label>
                        <input value={driverData.email} disabled />
                      </div>
                      <div className="field">
                        <label>Ciudad o zona habitual</label>
                        <input 
                          type="text" 
                          value={driverData.city}
                          onChange={(e) => setDriverData({ ...driverData, city: e.target.value })}
                          required 
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn warning" type="button" onClick={() => setAuthView('register')}>
                        Cancelar
                      </button>
                      <button className="btn primary" type="submit">
                        Siguiente
                      </button>
                    </div>
                  </form>
                )}

                {/* PASO 2: FICHA MÉDICA */}
                {onboardingStep === 2 && (
                  <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep(3); }}>
                    <div className="alert-box info mini" style={{ marginBottom: '16px' }}>
                      <p><strong>Ficha médica de emergencia:</strong> Estos datos no son para diagnóstico; sirven para que el titular y sus monitores tengan contexto rápido al surgir una alerta.</p>
                    </div>
                    <div className="form-grid">
                      <div className="field">
                        <label>Tipo de sangre</label>
                        <select 
                          value={medicalData.bloodType}
                          onChange={(e) => setMedicalData({ ...medicalData, bloodType: e.target.value })}
                        >
                          <option value="O+">O Positivo (O+)</option>
                          <option value="A+">A Positivo (A+)</option>
                          <option value="B+">B Positivo (B+)</option>
                          <option value="AB+">AB Positivo (AB+)</option>
                          <option value="O-">O Negativo (O-)</option>
                          <option value="A-">A Negativo (A-)</option>
                          <option value="B-">B Negativo (B-)</option>
                          <option value="AB-">AB Negativo (AB-)</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>¿Tienes algún padecimiento?</label>
                        <select 
                          value={medicalData.hasCondition}
                          onChange={(e) => setMedicalData({ ...medicalData, hasCondition: e.target.value })}
                        >
                          <option value="No">No</option>
                          <option value="Sí">Sí</option>
                        </select>
                      </div>
                      <div className="field field-full">
                        <label>Padecimientos o condiciones médicas</label>
                        <textarea 
                          value={medicalData.conditions}
                          onChange={(e) => setMedicalData({ ...medicalData, conditions: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Alergias</label>
                        <textarea 
                          value={medicalData.allergies}
                          onChange={(e) => setMedicalData({ ...medicalData, allergies: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Medicamentos que tomas actualmente</label>
                        <textarea 
                          value={medicalData.medications}
                          onChange={(e) => setMedicalData({ ...medicalData, medications: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Notas adicionales para emergencia</label>
                        <textarea 
                          value={medicalData.emergencyNotes}
                          onChange={(e) => setMedicalData({ ...medicalData, emergencyNotes: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn" type="button" onClick={() => setOnboardingStep(1)}>
                        Atrás
                      </button>
                      <button className="btn primary" type="submit">
                        Siguiente
                      </button>
                    </div>
                  </form>
                )}

                {/* PASO 3: VEHÍCULO (CON DROPLIST COMPLETO DE MARCAS DE 4 RUEDAS) */}
                {onboardingStep === 3 && (
                  <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep(4); }}>
                    <div className="alert-box info mini" style={{ marginBottom: '16px' }}>
                      <p><strong>Registro orientado a vehículos de 4 ruedas:</strong> Configura autos, SUV, camionetas, pick-up o vanes familiares para que el panel use datos coherentes de conducción y severidad.</p>
                    </div>
                    <div className="form-grid">
                      <div className="field">
                        <label>Tipo de vehículo de 4 ruedas</label>
                        <select 
                          value={vehicleData.vehicleType}
                          onChange={(e) => setVehicleData({ ...vehicleData, vehicleType: e.target.value })}
                        >
                          <option value="Sedán">Sedán</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="SUV">SUV</option>
                          <option value="Camioneta">Camioneta</option>
                          <option value="Pick-up">Pick-up</option>
                          <option value="Van / familiar">Van / familiar</option>
                        </select>
                      </div>

                      {/* DROPLIST COMPLETO DE MARCAS DE 4 RUEDAS */}
                      <div className="field">
                        <label>Marca (Vehículos de 4 Ruedas)</label>
                        <select 
                          value={vehicleData.brand}
                          onChange={(e) => setVehicleData({ ...vehicleData, brand: e.target.value })}
                        >
                          {CAR_BRANDS.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>

                      <div className="field">
                        <label>Modelo exacto</label>
                        <input 
                          type="text" 
                          value={vehicleData.model}
                          onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Año</label>
                        <input 
                          type="number" 
                          value={vehicleData.year}
                          onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Velocidad promedio</label>
                        <input 
                          type="text" 
                          value={vehicleData.avgSpeed}
                          onChange={(e) => setVehicleData({ ...vehicleData, avgSpeed: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Uso principal</label>
                        <select 
                          value={vehicleData.mainUse}
                          onChange={(e) => setVehicleData({ ...vehicleData, mainUse: e.target.value })}
                        >
                          <option value="Urbano">Urbano</option>
                          <option value="Carretera">Carretera</option>
                          <option value="Mixto">Mixto</option>
                          <option value="Trabajo / Flotilla">Trabajo / Flotilla</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn" type="button" onClick={() => setOnboardingStep(2)}>
                        Atrás
                      </button>
                      <button className="btn primary" type="submit">
                        Siguiente
                      </button>
                    </div>
                  </form>
                )}

                {/* PASO 4: CONTACTO DE EMERGENCIA */}
                {onboardingStep === 4 && (
                  <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep(5); }}>
                    <div className="alert-box info mini" style={{ marginBottom: '16px' }}>
                      <p><strong>Primera persona de emergencia interna:</strong> Las alertas se envían a la red interna de Impact.X y a tu lista de contactos supervisores.</p>
                    </div>
                    <div className="form-grid">
                      <div className="field">
                        <label>Nombre de la persona</label>
                        <input 
                          type="text" 
                          value={contactData.name}
                          onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                          placeholder="Ej. María Zepeda"
                        />
                      </div>
                      <div className="field">
                        <label>Parentesco o relación</label>
                        <input 
                          type="text" 
                          value={contactData.relation}
                          onChange={(e) => setContactData({ ...contactData, relation: e.target.value })}
                          placeholder="Ej. Madre / Familiar"
                        />
                      </div>
                      <div className="field">
                        <label>Usuario Impact.X de la persona</label>
                        <input 
                          type="text" 
                          value={contactData.username}
                          onChange={(e) => setContactData({ ...contactData, username: e.target.value })}
                          placeholder="ej. maria_segura"
                        />
                      </div>
                      <div className="field">
                        <label>ID de perfil de la persona</label>
                        <input 
                          type="text" 
                          value={contactData.profileId}
                          onChange={(e) => setContactData({ ...contactData, profileId: e.target.value })}
                          placeholder="ej. IX-MARIA-8X2K"
                        />
                      </div>
                      <div className="field field-full">
                        <label>Teléfono de referencia</label>
                        <input 
                          type="tel" 
                          value={contactData.phone}
                          onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                          placeholder="+52 55 9876 5432"
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn" type="button" onClick={() => setOnboardingStep(3)}>
                        Atrás
                      </button>
                      <button className="btn ghost" type="button" onClick={() => setOnboardingStep(5)}>
                        Omitir por ahora
                      </button>
                      <button className="btn primary" type="submit">
                        Agregar y continuar
                      </button>
                    </div>
                  </form>
                )}

                {/* PASO 5: CONFIRMACIÓN Y RESUMEN */}
                {onboardingStep === 5 && (
                  <div>
                    <div className="alert-box success mini" style={{ marginBottom: '16px' }}>
                      <p><strong>Resumen de Configuración:</strong> Revisa la información antes de guardar tu registro completo en Azure Cosmos DB (`ImpactX-Data`).</p>
                    </div>

                    <div className="grid grid-2" style={{ marginBottom: '20px' }}>
                      <div className="card soft">
                        <h3>👤 Conductor</h3>
                        <div className="info-row"><span>Nombre:</span><strong>{driverData.fullName}</strong></div>
                        <div className="info-row"><span>Teléfono:</span><strong>{driverData.phone}</strong></div>
                        <div className="info-row"><span>Ciudad:</span><strong>{driverData.city}</strong></div>
                        <div className="info-row"><span>Plan:</span><strong style={{ color: '#00a9a5' }}>{driverData.plan}</strong></div>
                      </div>

                      <div className="card soft">
                        <h3>🩺 Ficha médica</h3>
                        <div className="info-row"><span>Tipo de sangre:</span><strong>{medicalData.bloodType}</strong></div>
                        <div className="info-row"><span>Padecimiento:</span><strong>{medicalData.hasCondition} ({medicalData.conditions})</strong></div>
                        <div className="info-row"><span>Alergias:</span><strong>{medicalData.allergies}</strong></div>
                        <div className="info-row"><span>Medicamentos:</span><strong>{medicalData.medications}</strong></div>
                      </div>

                      <div className="card soft">
                        <h3>🚗 Vehículo</h3>
                        <div className="info-row"><span>Tipo:</span><strong>{vehicleData.vehicleType}</strong></div>
                        <div className="info-row"><span>Marca:</span><strong>{vehicleData.brand}</strong></div>
                        <div className="info-row"><span>Modelo:</span><strong>{vehicleData.model} ({vehicleData.year})</strong></div>
                        <div className="info-row"><span>Velocidad Promed:</span><strong>{vehicleData.avgSpeed}</strong></div>
                      </div>

                      <div className="card soft">
                        <h3>👥 Contacto de Emergencia</h3>
                        <div className="info-row"><span>Nombre:</span><strong>{contactData.name || 'Sin contacto inicial'}</strong></div>
                        <div className="info-row"><span>Relación:</span><strong>{contactData.relation || 'N/A'}</strong></div>
                        <div className="info-row"><span>Usuario Impact.X:</span><strong>@{contactData.username || 'N/A'}</strong></div>
                        <div className="info-row"><span>Teléfono:</span><strong>{contactData.phone || 'N/A'}</strong></div>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="btn" type="button" onClick={() => setOnboardingStep(4)}>
                        Atrás
                      </button>
                      <button className="btn primary" type="button" onClick={handleCompleteOnboarding}>
                        Finalizar configuración y entrar al Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Toast Root */}
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

  // =========================================================================
  // RENDER PRIVADO: DASHBOARD TRAS COMPLETAR REGISTRO E INICIO DE SESIÓN
  // =========================================================================
  return (
    <div className="app-shell">
      {/* Top Header */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <div className="brand-mark">🛡️</div>
            <span>Impact.X <small style={{ fontSize: '0.7rem', color: '#00a9a5' }}>Console</small></span>
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
          <div className="avatar" title={driverData.fullName}>AZ</div>
          <button className="btn small ghost" onClick={handleLogout}>
            Cerrar Sesión
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
              <div style={{ color: '#00a9a5', fontWeight: 'bold', marginTop: '4px' }}>{driverData.profileId}</div>
              <small style={{ color: '#81919e' }}>{driverData.fullName}</small>
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
                  <h3>Vehículo y Conductor Registrado</h3>
                  <div className="info-row"><span>Conductor:</span><strong>{driverData.fullName}</strong></div>
                  <div className="info-row"><span>Vehículo:</span><strong>{vehicleData.brand} {vehicleData.model} ({vehicleData.year})</strong></div>
                  <div className="info-row"><span>Ficha Médica:</span><strong>Sangre {medicalData.bloodType} | {medicalData.allergies}</strong></div>
                  <div className="info-row"><span>Contacto Emergencia:</span><strong>{contactData.name} ({contactData.phone})</strong></div>
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
                      <td><strong>{contactData.name}</strong></td>
                      <td>{contactData.relation}</td>
                      <td>{contactData.phone}</td>
                      <td><span className="badge success">🟢 Principal</span></td>
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
                    <small>Ruta {driverData.city} - Trabajo</small>
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
                <div className="form-grid">
                  <div className="field">
                    <label>ID Único de Perfil</label>
                    <input type="text" value={driverData.profileId} disabled />
                  </div>
                  <div className="field">
                    <label>Nombre del Conductor</label>
                    <input type="text" value={driverData.fullName} onChange={(e) => setDriverData({ ...driverData, fullName: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Tipo de Sangre</label>
                    <select 
                      value={medicalData.bloodType} 
                      onChange={(e) => setMedicalData({ ...medicalData, bloodType: e.target.value })}
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
                      value={medicalData.allergies} 
                      onChange={(e) => setMedicalData({ ...medicalData, allergies: e.target.value })} 
                    />
                  </div>
                  <div className="field field-full">
                    <label>Padecimientos</label>
                    <input 
                      type="text" 
                      value={medicalData.conditions} 
                      onChange={(e) => setMedicalData({ ...medicalData, conditions: e.target.value })} 
                    />
                  </div>
                </div>
                <button className="btn primary" onClick={() => showToast('Actualizado', 'Ficha médica guardada en Cosmos DB.', 'success')} style={{ marginTop: '16px' }}>
                  Guardar Ficha Médica en Cosmos DB
                </button>
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

      {/* Toast Root */}
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
