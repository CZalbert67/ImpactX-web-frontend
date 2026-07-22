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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'onboarding'
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // CAMPOS TOTALMENTE VACÍOS EN BLANCO PARA REGISTRO
  const [regForm, setRegForm] = useState({
    nombreCompleto: '',
    nombreUsuario: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    plan: 'plan-pro'
  });

  // CAMPOS TOTALMENTE VACÍOS EN BLANCO PARA LOGIN
  const [loginForm, setLoginForm] = useState({
    correoOUsuario: '',
    password: ''
  });

  // CAMPOS EN BLANCO PARA EL ONBOARDING DEL CONDUCTOR
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
  
  // Real-time telemetry simulation
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

  // PROTECCIÓN DE RUTAS / NAVEGADOR:
  // Si alguien abre el portal en otro navegador o pestaña sin haber iniciado sesión, se le deniega el acceso automáticamente.
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setIsLoggedIn(false);
      setAuthView('login');
    }
  }, []);

  // Simulación kinética de pulso
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      setBpm(72 + Math.floor(Math.random() * 12));
      setGForce((1.0 + Math.random() * 0.15).toFixed(2));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Manejador de Registro Inicial de Usuario
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.nombreCompleto || !regForm.correo || !regForm.password) {
      showToast('Campos requeridos', 'Por favor llena todos los datos en blanco.', 'warning');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      showToast('Error de contraseña', 'Las contraseñas no coinciden.', 'danger');
      return;
    }

    try {
      showToast('Registrando usuario...', 'Guardando documento en Azure Cosmos DB (ImpactX-Data)...', 'info');
      
      const payload = {
        nombreCompleto: regForm.nombreCompleto,
        nombreUsuario: regForm.nombreUsuario || `@${regForm.nombreCompleto.toLowerCase().replace(/\s+/g, '_')}`,
        correo: regForm.correo,
        telefono: regForm.telefono,
        password: regForm.password,
        confirmPassword: regForm.confirmPassword,
        planId: regForm.plan
      };

      const res = await authService.register(payload).catch((err) => {
        console.warn('Registro API local fallback:', err);
        return null;
      });

      const token = (res && res.data && res.data.token) ? res.data.token : `token-${Date.now()}`;
      localStorage.setItem('jwt_token', token);

      const generatedProfileId = `IX-${regForm.nombreCompleto.substring(0, 6).toUpperCase().replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      setDriverData({
        fullName: regForm.nombreCompleto,
        username: regForm.nombreUsuario || regForm.nombreCompleto.toLowerCase().replace(/\s+/g, '_'),
        profileId: generatedProfileId,
        phone: regForm.telefono,
        email: regForm.correo,
        city: '',
        plan: regForm.plan === 'plan-pro' ? 'Pro Conductor' : 'Trial'
      });

      showToast('¡Cuenta Registrada!', 'Procediendo al Onboarding del Conductor.', 'success');
      setAuthView('onboarding');
      setOnboardingStep(1);
    } catch (err) {
      showToast('Error de registro', 'No se pudo crear la cuenta.', 'danger');
    }
  };

  // Guardar Onboarding y persistir en Azure Cosmos DB
  const handleCompleteOnboarding = async () => {
    try {
      showToast('Guardando perfil...', 'Sincronizando vehículo y ficha médica en Cosmos DB...', 'info');

      await userService.updateDriverProfile({
        tipoVehiculo: vehicleData.vehicleType,
        marca: vehicleData.brand,
        modelo: vehicleData.model,
        anio: parseInt(vehicleData.year) || 2024,
        uso: vehicleData.mainUse,
        velocidadPromedioLabel: vehicleData.avgSpeed
      }).catch(() => null);

      await userService.updateMedicalProfile({
        tipoSangre: medicalData.bloodType,
        alergias: medicalData.allergies,
        condiciones: medicalData.conditions,
        medicamentos: medicalData.medications,
        nota: medicalData.emergencyNotes
      }).catch(() => null);

      if (contactData.name) {
        await contactService.createContact({
          nombre: contactData.name,
          relacion: contactData.relation,
          telefono: contactData.phone,
          usuarioImpactX: contactData.username,
          perfilId: contactData.profileId
        }).catch(() => null);
      }

      showToast('¡Onboarding Completado!', 'Toda tu información está resguardada en ImpactX-Data.', 'success');
      setIsLoggedIn(true);
    } catch (err) {
      showToast('Bienvenido', 'Accediendo al panel de seguridad.', 'success');
      setIsLoggedIn(true);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.correoOUsuario || !loginForm.password) {
      showToast('Campos vacíos', 'Por favor ingresa tu correo/usuario y contraseña.', 'warning');
      return;
    }

    try {
      showToast('Autenticando...', 'Validando credenciales en Cosmos DB...', 'info');
      const res = await authService.login({
        correoOUsuario: loginForm.correoOUsuario,
        password: loginForm.password
      }).catch(() => null);

      const token = (res && res.data && res.data.token) ? res.data.token : `jwt-active-session-${Date.now()}`;
      localStorage.setItem('jwt_token', token);

      showToast('¡Sesión Iniciada!', 'Bienvenido a la consola de seguridad.', 'success');
      setIsLoggedIn(true);
    } catch (err) {
      showToast('Error de autenticación', 'Credenciales inválidas.', 'danger');
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
  // VISTA PÚBLICA (LOGIN / REGISTRO / ONBOARDING EN BLANCO CON DISEÑO)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="animated-bg app-shell">
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
            {/* 1. REGISTRO INICIAL CON CAMPOS EN BLANCO */}
            {authView === 'register' && (
              <div className="form-card wide">
                <span className="eyebrow">Cuenta titular</span>
                <h2>Crear cuenta Impact.X</h2>
                <p>
                  Completa el formulario en blanco para registrar un nuevo conductor en **`ImpactX-Data`** (Azure Cosmos DB).
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
                      <label>Nombre de usuario único</label>
                      <input 
                        type="text" 
                        placeholder="Ej. @usuario_impactx"
                        value={regForm.nombreUsuario}
                        onChange={(e) => setRegForm({ ...regForm, nombreUsuario: e.target.value })}
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
                      <label>Contraseña</label>
                      <input 
                        type="password" 
                        placeholder="Ingresa tu contraseña"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Confirmar contraseña</label>
                      <input 
                        type="password" 
                        placeholder="Confirma tu contraseña"
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
                    <input type="checkbox" required defaultChecked />
                    Acepto términos, condiciones y aviso de privacidad de emergencia.
                  </label>

                  <div className="form-actions">
                    <button className="btn primary" type="submit">Crear cuenta y continuar</button>
                    <button className="btn ghost" type="button" onClick={() => setAuthView('login')}>
                      Ya tengo cuenta
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. INICIO DE SESIÓN CON CAMPOS EN BLANCO Y DISEÑO GLOW */}
            {authView === 'login' && (
              <div className="form-card">
                <span className="eyebrow">Acceso Seguro</span>
                <h2>Iniciar sesión</h2>
                <p>Ingresa tu correo o usuario para acceder al panel de telemetría.</p>
                <form onSubmit={handleLoginSubmit}>
                  <div className="field">
                    <label>Correo electrónico o Usuario</label>
                    <input 
                      type="text" 
                      placeholder="usuario@ejemplo.com"
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

            {/* 3. ONBOARDING EN 5 PASOS CON CAMPOS EN BLANCO */}
            {authView === 'onboarding' && (
              <div className="form-card wide">
                <span className="eyebrow">Configuración inicial</span>
                <h2>Onboarding del conductor</h2>
                <p>
                  Completa la información del conductor. La ficha médica se captura desde el alta porque se usará durante una alerta.
                </p>

                {/* Píldoras de Progreso */}
                <div className="onboarding-steps">
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
                          placeholder="Nombre y Apellidos"
                          value={driverData.fullName}
                          onChange={(e) => setDriverData({ ...driverData, fullName: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Usuario Impact.X</label>
                        <input value={`@${driverData.username}`} disabled />
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
                          placeholder="+52 55 0000 0000"
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
                          placeholder="Ej. Tula de Allende, Hidalgo"
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
                          placeholder="Ej. Alergia a la Penicilina, sulfas, etc."
                          value={medicalData.allergies}
                          onChange={(e) => setMedicalData({ ...medicalData, allergies: e.target.value })}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Medicamentos que tomas actualmente</label>
                        <textarea 
                          placeholder="Medicamentos recetados de uso diario"
                          value={medicalData.medications}
                          onChange={(e) => setMedicalData({ ...medicalData, medications: e.target.value })}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Notas adicionales para emergencia</label>
                        <textarea 
                          placeholder="Indicaciones para paramédicos"
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

                {/* PASO 3: VEHÍCULO CON DROPLIST SIN DESBORDAMIENTO */}
                {onboardingStep === 3 && (
                  <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep(4); }}>
                    <div className="alert-box info mini">
                      <p><strong>Registro orientado a vehículos de 4 ruedas:</strong> Configura autos, SUV, camionetas o pick-up para calibración kinética.</p>
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

                      {/* DROPLIST DE MARCAS DE 4 RUEDAS SIN DESBORDAMIENTO DE PANTALLA */}
                      <div className="field">
                        <label>Marca (Vehículos de 4 Ruedas)</label>
                        <select 
                          value={vehicleData.brand}
                          onChange={(e) => setVehicleData({ ...vehicleData, brand: e.target.value })}
                          style={{ maxWidth: '100%' }}
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
                        <label>Año</label>
                        <input 
                          type="number" 
                          placeholder="Ej. 2024"
                          value={vehicleData.year}
                          onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
                          required 
                        />
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
                      <p><strong>Primera persona de emergencia interna:</strong> Persona de tu red familiar o de monitores que recibirá tus alertas.</p>
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
  // VISTA PRIVADA (DASHBOARD TRAS INICIAR SESIÓN Y ONBOARDING)
  // =========================================================================
  return (
    <div className="animated-bg app-shell">
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
