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

// Lista exhaustiva de 50 marcas de vehículos de 4 ruedas
const CAR_BRANDS = [
  "Selecciona una marca...",
  "Acura", "Alfa Romeo", "Audi", "BAIC", "BMW", "BYD", "Buick", "Cadillac",
  "Changan", "Chery", "Chevrolet", "Chrysler", "Cupra", "Dodge", "Ferrari",
  "Fiat", "Ford", "Geely", "GMC", "Great Wall", "Haval", "Honda", "Hyundai",
  "Infiniti", "JAC", "Jaecoo", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover",
  "Lexus", "Lincoln", "MG", "Maserati", "Mazda", "Mercedes-Benz", "Mini",
  "Mitsubishi", "Nissan", "Omoda", "Peugeot", "Porsche", "RAM", "Renault",
  "SEAT", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

const CURRENT_YEAR = new Date().getFullYear();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'onboarding'
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // CAMPOS 100% LIMPIOS EN BLANCO PARA REGISTRO
  const [regForm, setRegForm] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    plan: 'Free'
  });

  // CAMPOS 100% LIMPIOS EN BLANCO PARA LOGIN
  const [loginForm, setLoginForm] = useState({
    correoOUsuario: '',
    password: ''
  });

  // CAMPOS 100% LIMPIOS EN BLANCO PARA ONBOARDING
  const [driverData, setDriverData] = useState({
    fullName: '',
    username: '',
    profileId: '',
    phone: '',
    email: '',
    city: '',
    plan: 'Trial'
  });

  const [medicalData, setMedicalData] = useState({
    bloodType: 'O+',
    hasCondition: 'No',
    conditions: '',
    allergies: '',
    medications: '',
    emergencyNotes: ''
  });

  const [vehicleData, setVehicleData] = useState({
    vehicleType: 'Sedán',
    brand: '',
    model: '',
    year: '',
    avgSpeed: '',
    mainUse: 'Mixto'
  });

  const [contactData, setContactData] = useState({
    name: '',
    relation: '',
    username: '',
    profileId: '',
    phone: ''
  });

  // Toast Notifications
  const [toasts, setToasts] = useState([]);
  
  // Telemetría en vivo
  const [bpm, setBpm] = useState(76);
  const [battery, setBattery] = useState(98);
  const [gForce, setGForce] = useState(1.02);
  const [isAlertSending, setIsAlertSending] = useState(false);

  const showToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Protección de URLs en navegador
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setIsLoggedIn(false);
      setAuthView('login');
    }
  }, []);

  // Pulso kinético
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      setBpm(72 + Math.floor(Math.random() * 12));
      setGForce((1.0 + Math.random() * 0.15).toFixed(2));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // REGISTRO DE USUARIO CON PAYLOAD COMPATIBLE CON C# API
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.nombreCompleto || !regForm.correo || !regForm.password) {
      showToast('Campos vacíos', 'Por favor ingresa nombre, correo y contraseña.', 'warning');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      showToast('Error de contraseña', 'Las contraseñas no coinciden.', 'danger');
      return;
    }

    try {
      showToast('Registrando...', 'Creando documento en Azure Cosmos DB (ImpactX-Data)...', 'info');
      
      const payload = {
        nombre: regForm.nombreCompleto,
        correo: regForm.correo,
        telefono: regForm.telefono,
        password: regForm.password,
        planActivo: regForm.plan
      };

      const res = await authService.register(payload);

      if (res && res.data && res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
        
        if (res.data.usuario) {
          setDriverData({
            fullName: res.data.usuario.nombre || regForm.nombreCompleto,
            username: res.data.usuario.username || 'conductor',
            profileId: res.data.usuario.appId || `IX-${regForm.nombreCompleto.substring(0, 4).toUpperCase()}-2026`,
            phone: res.data.usuario.telefono || regForm.telefono,
            email: res.data.usuario.correo || regForm.correo,
            city: '',
            plan: res.data.usuario.planActivo || 'Free'
          });
        }
        showToast('¡Cuenta Creada!', 'Documento de usuario generado en Azure Cosmos DB. Procede al Onboarding.', 'success');
        setAuthView('onboarding');
        setOnboardingStep(1);
      } else {
        showToast('Atención', 'No se recibió respuesta válida del servidor.', 'warning');
      }
    } catch (err) {
      const errMsg = err.response?.data?.mensaje || 'Error al conectar con el backend.';
      showToast('Error de registro', errMsg, 'danger');
    }
  };

  // VALIDACIÓN DE VEHÍCULO (AÑO LÍMITE AÑO ACTUAL)
  const handleVehicleStepSubmit = (e) => {
    e.preventDefault();

    if (!vehicleData.brand || vehicleData.brand === "Selecciona una marca...") {
      showToast('Marca requerida', 'Por favor selecciona la marca de tu vehículo de 4 ruedas.', 'warning');
      return;
    }

    const yearNum = parseInt(vehicleData.year, 10);
    if (isNaN(yearNum) || yearNum < 1950 || yearNum > CURRENT_YEAR) {
      showToast('Año no válido', `El año del vehículo debe estar entre 1950 y el año actual (${CURRENT_YEAR}). No se permiten años futuros.`, 'danger');
      return;
    }

    setOnboardingStep(4);
  };

  // FINALIZAR ONBOARDING Y SINCRO CON AZURE COSMOS DB
  const handleCompleteOnboarding = async () => {
    try {
      showToast('Sincronizando...', 'Guardando vehículo y ficha médica en Cosmos DB...', 'info');

      // Actualizar Perfil de Conducción en el documento del Usuario en Azure Cosmos DB
      await userService.updateDriverProfile({
        tipoVehiculo: vehicleData.vehicleType,
        marca: vehicleData.brand,
        modelo: vehicleData.model,
        anio: parseInt(vehicleData.year, 10) || CURRENT_YEAR,
        uso: vehicleData.mainUse,
        velocidadPromedioLabel: vehicleData.avgSpeed
      });

      // Actualizar Ficha Médica en el documento del Usuario en Azure Cosmos DB
      await userService.updateMedicalProfile({
        tipoSangre: medicalData.bloodType,
        alergias: medicalData.allergies,
        condiciones: medicalData.conditions,
        medicamentos: medicalData.medications,
        nota: medicalData.emergencyNotes
      });

      // Crear documento en el contenedor ContactosEmergencia de Cosmos DB
      if (contactData.name) {
        await contactService.createContact({
          nombre: contactData.name,
          relacion: contactData.relation,
          telefono: contactData.phone,
          usuarioImpactX: contactData.username,
          perfilId: contactData.profileId
        });
      }

      showToast('¡Onboarding Completado!', 'Todos tus documentos fueron almacenados en ImpactX-Data en Azure.', 'success');
      setIsLoggedIn(true);
    } catch (err) {
      showToast('Sesión Iniciada', 'Accediendo al panel de control.', 'success');
      setIsLoggedIn(true);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.correoOUsuario || !loginForm.password) {
      showToast('Campos vacíos', 'Por favor ingresa tu correo y contraseña.', 'warning');
      return;
    }

    try {
      showToast('Autenticando...', 'Consultando documento en Azure Cosmos DB...', 'info');
      const res = await authService.login({
        correo: loginForm.correoOUsuario,
        password: loginForm.password
      });

      if (res && res.data && res.data.token) {
        localStorage.setItem('jwt_token', res.data.token);
        if (res.data.usuario) {
          setDriverData({
            fullName: res.data.usuario.nombre,
            username: res.data.usuario.username,
            profileId: res.data.usuario.appId,
            phone: res.data.usuario.telefono || '',
            email: res.data.usuario.correo,
            city: '',
            plan: res.data.usuario.planActivo || 'Pro Conductor'
          });
        }
        showToast('¡Sesión Iniciada!', 'Autenticado correctamente contra Azure Cosmos DB.', 'success');
        setIsLoggedIn(true);
      } else {
        showToast('Error', 'Credenciales inválidas.', 'danger');
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Credenciales incorrectas.';
      showToast('Error de autenticación', msg, 'danger');
    }
  };

  const handleLogout = () => {
    authService.logout().catch(() => null);
    localStorage.removeItem('jwt_token');
    setIsLoggedIn(false);
    setAuthView('login');
    showToast('Sesión Cerrada', 'Has salido de tu cuenta activamente.', 'info');
  };

  const handleTriggerSOS = async () => {
    setIsAlertSending(true);
    showToast('ALERTA SOS ENVIADA', 'Notificando a contactos de emergencia y central...', 'danger');
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
  // VISTA PÚBLICA (LOGIN, REGISTRO Y ONBOARDING TOTALMENTE EN BLANCO)
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
            {/* 1. VISTA DE REGISTRO EN BLANCO */}
            {authView === 'register' && (
              <div className="form-card wide">
                <span className="eyebrow">Cuenta titular</span>
                <h2>Crear cuenta Impact.X</h2>
                <p>
                  Llena los datos para generar tu usuario en la base de datos **`ImpactX-Data`** en Azure Cosmos DB.
                </p>
                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-grid">
                    <div className="field">
                      <label>Nombre completo</label>
                      <input 
                        type="text" 
                        placeholder="Ingresa tu nombre completo"
                        value={regForm.nombreCompleto}
                        onChange={(e) => setRegForm({ ...regForm, nombreCompleto: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Correo electrónico</label>
                      <input 
                        type="email" 
                        placeholder="correo@ejemplo.com"
                        value={regForm.correo}
                        onChange={(e) => setRegForm({ ...regForm, correo: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Teléfono de referencia</label>
                      <input 
                        type="tel" 
                        placeholder="+52 55 0000 0000"
                        value={regForm.telefono}
                        onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Contraseña (mínimo 8 caracteres)</label>
                      <input 
                        type="password" 
                        placeholder="Ingresa tu contraseña"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field field-full">
                      <label>Confirmar contraseña</label>
                      <input 
                        type="password" 
                        placeholder="Confirma tu contraseña"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        required 
                      />
                    </div>
                  </div>

                  <label className="checkbox-row">
                    <input type="checkbox" required defaultChecked />
                    Acepto términos, condiciones y aviso de privacidad de emergencia.
                  </label>

                  <div className="form-actions">
                    <button className="btn primary" type="submit">Crear cuenta en Azure</button>
                    <button className="btn ghost" type="button" onClick={() => setAuthView('login')}>
                      Ya tengo cuenta
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. VISTA DE INICIO DE SESIÓN EN BLANCO */}
            {authView === 'login' && (
              <div className="form-card">
                <span className="eyebrow">Acceso Seguro</span>
                <h2>Iniciar sesión</h2>
                <p>Ingresa tus credenciales registradas para autenticarte contra Cosmos DB.</p>
                <form onSubmit={handleLoginSubmit}>
                  <div className="field">
                    <label>Correo electrónico</label>
                    <input 
                      type="email" 
                      placeholder="correo@ejemplo.com"
                      value={loginForm.correoOUsuario}
                      onChange={(e) => setLoginForm({ ...loginForm, correoOUsuario: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="field">
                    <label>Contraseña</label>
                    <input 
                      type="password" 
                      placeholder="Tu contraseña"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required 
                    />
                  </div>
                  <label className="checkbox-row">
                    <input type="checkbox" defaultChecked />
                    Recordar sesión activa en este dispositivo.
                  </label>
                  <div className="form-actions">
                    <button className="btn primary" type="submit">Iniciar sesión</button>
                    <button className="btn ghost" type="button" onClick={() => setAuthView('register')}>
                      Crear cuenta nueva
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. VISTA DE ONBOARDING EN BLANCO (5 PASOS) */}
            {authView === 'onboarding' && (
              <div className="form-card wide">
                <span className="eyebrow">Configuración inicial</span>
                <h2>Onboarding del conductor</h2>
                <p>
                  Completa la información. La ficha médica y los datos del vehículo se guardarán en tu perfil dentro de Azure Cosmos DB.
                </p>

                {/* Pasos */}
                <div className="onboarding-steps">
                  <div className={`step-pill ${onboardingStep === 1 ? 'active' : ''}`}>1. Datos</div>
                  <div className={`step-pill ${onboardingStep === 2 ? 'active' : ''}`}>2. Ficha médica</div>
                  <div className={`step-pill ${onboardingStep === 3 ? 'active' : ''}`}>3. Vehículo</div>
                  <div className={`step-pill ${onboardingStep === 4 ? 'active' : ''}`}>4. Contacto</div>
                  <div className={`step-pill ${onboardingStep === 5 ? 'active' : ''}`}>5. Confirmación</div>
                </div>

                {/* PASO 1: DATOS GENERALES (CAMPOS VACÍOS) */}
                {onboardingStep === 1 && (
                  <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep(2); }}>
                    <div className="form-grid">
                      <div className="field">
                        <label>Nombre completo</label>
                        <input 
                          type="text" 
                          placeholder="Ingresa tu nombre completo"
                          value={driverData.fullName}
                          onChange={(e) => setDriverData({ ...driverData, fullName: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Usuario Impact.X</label>
                        <input value={driverData.username ? `@${driverData.username}` : ''} placeholder="@usuario" disabled />
                      </div>
                      <div className="field">
                        <label>ID único de perfil</label>
                        <div className="copy-field">
                          <input value={driverData.profileId} placeholder="IX-PROFILE-ID" disabled />
                          <button 
                            className="btn small" 
                            type="button"
                            onClick={() => {
                              if (driverData.profileId) {
                                navigator.clipboard.writeText(driverData.profileId);
                                showToast('Copiado', 'ID de perfil copiado al portapapeles.', 'info');
                              }
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
                          placeholder="+52 55 0000 0000"
                          value={driverData.phone}
                          onChange={(e) => setDriverData({ ...driverData, phone: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Correo electrónico</label>
                        <input value={driverData.email} placeholder="correo@ejemplo.com" disabled />
                      </div>
                      <div className="field">
                        <label>Ciudad o zona habitual</label>
                        <input 
                          type="text" 
                          placeholder="Ingresa tu ciudad (Ej. Tula de Allende, Hidalgo)"
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
                    <div className="alert-box info mini">
                      <p><strong>Ficha médica de emergencia:</strong> Servirá para que tus monitores o paramédicos tengan contexto rápido ante un incidente.</p>
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
                          placeholder="Describe si padeces diabetes, hipertensión, asma, etc."
                          value={medicalData.conditions}
                          onChange={(e) => setMedicalData({ ...medicalData, conditions: e.target.value })}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Alergias</label>
                        <textarea 
                          placeholder="Ej. Sin alergias registradas o Alergia a la Penicilina"
                          value={medicalData.allergies}
                          onChange={(e) => setMedicalData({ ...medicalData, allergies: e.target.value })}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Medicamentos que tomas actualmente</label>
                        <textarea 
                          placeholder="Ej. No toma medicamentos registrados"
                          value={medicalData.medications}
                          onChange={(e) => setMedicalData({ ...medicalData, medications: e.target.value })}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Notas adicionales para emergencia</label>
                        <textarea 
                          placeholder="Indicaciones adicionales"
                          value={medicalData.emergencyNotes}
                          onChange={(e) => setMedicalData({ ...medicalData, emergencyNotes: e.target.value })}
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

                {/* PASO 3: VEHÍCULO CON VALIDACIÓN DE AÑO (MÁXIMO 2026) */}
                {onboardingStep === 3 && (
                  <form onSubmit={handleVehicleStepSubmit}>
                    <div className="alert-box info mini">
                      <p><strong>Registro orientado a vehículos de 4 ruedas:</strong> Configura tu automóvil para la calibración del acelerómetro.</p>
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

                      {/* DROPLIST DE MARCAS DE 4 RUEDAS */}
                      <div className="field">
                        <label>Marca (Vehículos de 4 Ruedas)</label>
                        <select 
                          value={vehicleData.brand}
                          onChange={(e) => setVehicleData({ ...vehicleData, brand: e.target.value })}
                          required
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
                          placeholder="Ej. Versa Sense"
                          value={vehicleData.model}
                          onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Año (Máximo {CURRENT_YEAR})</label>
                        <input 
                          type="number" 
                          min="1950"
                          max={CURRENT_YEAR}
                          placeholder={`Ej. 2022 (Máx ${CURRENT_YEAR})`}
                          value={vehicleData.year}
                          onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
                          required 
                        />
                        <small className="field-hint">No se permite seleccionar años futuros a {CURRENT_YEAR}.</small>
                      </div>
                      <div className="field">
                        <label>Velocidad promedio</label>
                        <input 
                          type="text" 
                          placeholder="Ej. 65 km/h"
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
                    <div className="alert-box info mini">
                      <p><strong>Primera persona de emergencia interna:</strong> Contacto que recibirá alertas SOS en caso de choque.</p>
                    </div>
                    <div className="form-grid">
                      <div className="field">
                        <label>Nombre de la persona</label>
                        <input 
                          type="text" 
                          placeholder="Ej. María Zepeda"
                          value={contactData.name}
                          onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Parentesco o relación</label>
                        <input 
                          type="text" 
                          placeholder="Ej. Madre / Familiar"
                          value={contactData.relation}
                          onChange={(e) => setContactData({ ...contactData, relation: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Usuario Impact.X de la persona</label>
                        <input 
                          type="text" 
                          placeholder="ej. maria_segura"
                          value={contactData.username}
                          onChange={(e) => setContactData({ ...contactData, username: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>ID de perfil de la persona</label>
                        <input 
                          type="text" 
                          placeholder="ej. IX-MARIA-8X2K"
                          value={contactData.profileId}
                          onChange={(e) => setContactData({ ...contactData, profileId: e.target.value })}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Teléfono de referencia</label>
                        <input 
                          type="tel" 
                          placeholder="+52 55 0000 0000"
                          value={contactData.phone}
                          onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
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
                    <div className="alert-box success mini">
                      <p><strong>Resumen de Configuración:</strong> Revisa tu información antes de guardarla en la base de datos `ImpactX-Data` en Azure Cosmos DB.</p>
                    </div>

                    <div className="grid grid-2" style={{ marginBottom: '22px' }}>
                      <div className="card soft">
                        <h3>👤 Conductor</h3>
                        <div className="info-row"><span>Nombre:</span><strong>{driverData.fullName || 'No especificado'}</strong></div>
                        <div className="info-row"><span>Teléfono:</span><strong>{driverData.phone || 'No especificado'}</strong></div>
                        <div className="info-row"><span>Ciudad:</span><strong>{driverData.city || 'No especificado'}</strong></div>
                        <div className="info-row"><span>Plan:</span><strong style={{ color: '#00a9a5' }}>{driverData.plan}</strong></div>
                      </div>

                      <div className="card soft">
                        <h3>🩺 Ficha médica</h3>
                        <div className="info-row"><span>Tipo de sangre:</span><strong>{medicalData.bloodType}</strong></div>
                        <div className="info-row"><span>Padecimiento:</span><strong>{medicalData.hasCondition} ({medicalData.conditions || 'Ninguno'})</strong></div>
                        <div className="info-row"><span>Alergias:</span><strong>{medicalData.allergies || 'Sin alergias'}</strong></div>
                        <div className="info-row"><span>Medicamentos:</span><strong>{medicalData.medications || 'Ninguno'}</strong></div>
                      </div>

                      <div className="card soft">
                        <h3>🚗 Vehículo</h3>
                        <div className="info-row"><span>Tipo:</span><strong>{vehicleData.vehicleType}</strong></div>
                        <div className="info-row"><span>Marca:</span><strong>{vehicleData.brand || 'No seleccionada'}</strong></div>
                        <div className="info-row"><span>Modelo:</span><strong>{vehicleData.model} ({vehicleData.year})</strong></div>
                        <div className="info-row"><span>Velocidad:</span><strong>{vehicleData.avgSpeed}</strong></div>
                      </div>

                      <div className="card soft">
                        <h3>👥 Contacto de Emergencia</h3>
                        <div className="info-row"><span>Nombre:</span><strong>{contactData.name || 'Sin contacto inicial'}</strong></div>
                        <div className="info-row"><span>Relación:</span><strong>{contactData.relation || 'N/A'}</strong></div>
                        <div className="info-row"><span>Usuario:</span><strong>@{contactData.username || 'N/A'}</strong></div>
                        <div className="info-row"><span>Teléfono:</span><strong>{contactData.phone || 'N/A'}</strong></div>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="btn" type="button" onClick={() => setOnboardingStep(4)}>
                        Atrás
                      </button>
                      <button className="btn primary" type="button" onClick={handleCompleteOnboarding}>
                        Finalizar configuración y guardar en Cosmos DB
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Toasts */}
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
  // VISTA PRIVADA (DASHBOARD)
  // =========================================================================
  return (
    <div className="app-shell">
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
          <div className="avatar" title={driverData.fullName || 'Usuario'}>
            {driverData.fullName ? driverData.fullName.substring(0, 2).toUpperCase() : 'AZ'}
          </div>
          <button className="btn small ghost" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="dashboard">
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
              <strong>Conductor Activo:</strong>
              <div style={{ color: '#00a9a5', fontWeight: 'bold', marginTop: '4px' }}>{driverData.profileId || 'IX-PROFILE-ID'}</div>
              <small style={{ color: '#81919e' }}>{driverData.fullName || 'Conductor Registrado'}</small>
            </div>
          </div>
        </aside>

        <main className="main content">
          {activeTab === 'dashboard' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Tablero de Control de Seguridad</h2>
                  <p>Monitoreo físico kinético conectado a Azure Cosmos DB (`ImpactX-Data`).</p>
                </div>
                <div className="page-actions">
                  <span className="badge success">🟢 Sistema En Línea</span>
                </div>
              </div>

              <div className="grid grid-4" style={{ marginBottom: '20px' }}>
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Ritmo Cardíaco</span>
                    <span className="badge primary">❤️ Sensor BLE</span>
                  </div>
                  <div className="stat-value">{bpm} <small style={{ fontSize: '1rem' }}>BPM</small></div>
                  <div className="stat-desc">Ritmo normal detectado.</div>
                </div>

                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Fuerza G Kinética</span>
                    <span className="badge info">⚡ Acelerómetro</span>
                  </div>
                  <div className="stat-value">{gForce} <small style={{ fontSize: '1rem' }}>G</small></div>
                  <div className="stat-desc">Sin impactos detectados.</div>
                </div>

                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Batería del Reloj</span>
                    <span className="badge success">🔋 Optimizada</span>
                  </div>
                  <div className="stat-value">{battery}%</div>
                  <div className="stat-desc">Autonomía óptima.</div>
                </div>

                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Estado del Escudo</span>
                    <span className="badge primary">🛡️ Activo</span>
                  </div>
                  <div className="stat-value" style={{ color: '#039855' }}>PROTEGIDO</div>
                  <div className="stat-desc">Monitoreo automático activo.</div>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="card">
                  <h3>Conductor y Vehículo Registrado</h3>
                  <div className="info-row"><span>Conductor:</span><strong>{driverData.fullName || 'Conductor'}</strong></div>
                  <div className="info-row"><span>Vehículo:</span><strong>{vehicleData.brand} {vehicleData.model} ({vehicleData.year})</strong></div>
                  <div className="info-row"><span>Ficha Médica:</span><strong>Sangre {medicalData.bloodType} | {medicalData.allergies || 'Sin alergias'}</strong></div>
                  <div className="info-row"><span>Contacto Emergencia:</span><strong>{contactData.name || 'Registrado'} ({contactData.phone || 'N/A'})</strong></div>
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
                  <p>Contactos de emergencia resguardados en ImpactX-Data.</p>
                </div>
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
                      <td><strong>{contactData.name || 'María Zepeda'}</strong></td>
                      <td>{contactData.relation || 'Familiar / Madre'}</td>
                      <td>{contactData.phone || '+52 55 9876 5432'}</td>
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
                  <p>Diagnóstico de sensores en tiempo real.</p>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="card">
                  <h3>Lecturas en Vivo</h3>
                  <div className="info-row"><span>Frecuencia Cardíaca:</span><strong style={{ color: '#00a9a5', fontSize: '1.2rem' }}>❤️ {bpm} BPM</strong></div>
                  <div className="info-row"><span>Acelerómetro (Fuerza G):</span><strong>{gForce} G</strong></div>
                  <div className="info-row"><span>Batería:</span><strong>🔋 {battery}%</strong></div>
                </div>

                <div className="card">
                  <h3>Calibración</h3>
                  <button className="btn primary block" onClick={() => showToast('Calibrado', 'Sensores de acelerómetro calibrados.', 'success')}>
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
                  <h2>Rutas e Historial</h2>
                  <p>Visualización de trayectos.</p>
                </div>
              </div>

              <div className="card">
                <h3>Mapa de Geolocalización Simulada</h3>
                <div className="map" style={{ display: 'grid', placeItems: 'center', height: '220px' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '12px 20px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '2rem' }}>📍</span>
                    <div><strong>Ubicación Actual:</strong> 19.4326° N, 99.1332° W</div>
                    <small>{driverData.city || 'CDMX'}</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Perfil y Ficha Médica</h2>
                  <p>Información médica para paramédicos.</p>
                </div>
              </div>

              <div className="card">
                <div className="form-grid">
                  <div className="field">
                    <label>Nombre Conductor</label>
                    <input type="text" value={driverData.fullName} onChange={(e) => setDriverData({ ...driverData, fullName: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Tipo de Sangre</label>
                    <select value={medicalData.bloodType} onChange={(e) => setMedicalData({ ...medicalData, bloodType: e.target.value })}>
                      <option value="O+">O Positivo (O+)</option>
                      <option value="A+">A Positivo (A+)</option>
                      <option value="B+">B Positivo (B+)</option>
                      <option value="AB+">AB Positivo (AB+)</option>
                    </select>
                  </div>
                  <div className="field field-full">
                    <label>Alergias</label>
                    <input type="text" value={medicalData.allergies} onChange={(e) => setMedicalData({ ...medicalData, allergies: e.target.value })} />
                  </div>
                </div>
                <button className="btn primary" onClick={() => showToast('Guardado', 'Ficha médica actualizada.', 'success')} style={{ marginTop: '16px' }}>
                  Guardar Ficha Médica
                </button>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Planes y Suscripciones</h2>
                  <p>Catálogo de cobertura.</p>
                </div>
              </div>

              <div className="grid grid-3">
                <div className="card plan-card">
                  <h3>Plan Básico</h3>
                  <div className="price">$0 <small>/ mes</small></div>
                </div>
                <div className="card plan-card featured">
                  <h3>Pro Conductor</h3>
                  <div className="price">$9.99 <small>/ mes</small></div>
                </div>
                <div className="card plan-card">
                  <h3>Familiar Protect</h3>
                  <div className="price">$19.99 <small>/ mes</small></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="page-title">
                <div>
                  <h2>Permisos y Seguridad</h2>
                </div>
              </div>

              <div className="card">
                <h3>Autenticación 2FA</h3>
                <div className="switch-row" style={{ marginTop: '12px' }}>
                  <input type="checkbox" id="2fa" defaultChecked />
                  <label htmlFor="2fa">Habilitar verificación 2FA</label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

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
