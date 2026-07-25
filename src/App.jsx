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
    hasTreatment: 'No',
    medications: '',
    emergencyNotes: ''
  });

  // Estado para el Selector de Año con Calendario
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [pickerDecade, setPickerDecade] = useState(2020);

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

  // REGISTRO Y AVANCE AL ONBOARDING (SIN CREAR CUENTA EN AZURE AÚN)
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regForm.nombreCompleto || !regForm.correo || !regForm.password) {
      showToast('Campos vacíos', 'Por favor ingresa tu nombre, correo y contraseña.', 'warning');
      return;
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regForm.correo.trim())) {
      showToast('Correo inválido', 'Por favor ingresa un correo electrónico válido (ej. usuario@ejemplo.com).', 'danger');
      return;
    }

    // Validar teléfono solo dígitos y caracteres válidos
    const phoneClean = regForm.telefono.replace(/[^0-9+ ]/g, '');
    if (!phoneClean || phoneClean.replace(/[^0-9]/g, '').length < 8) {
      showToast('Teléfono inválido', 'Ingresa un número telefónico válido (mínimo 8 dígitos).', 'warning');
      return;
    }

    // Validar fortaleza de contraseña (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
    const pwd = regForm.password;
    if (pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      showToast('Contraseña débil', 'La contraseña debe tener mínimo 8 caracteres, e incluir mayúsculas, minúsculas y números.', 'danger');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      showToast('Error de contraseña', 'Las contraseñas no coinciden.', 'danger');
      return;
    }

    // Guardar datos temporalmente en el estado local sin llamar a la API ni escribir el token aún
    const defaultUser = regForm.correo.trim().split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    setDriverData((prev) => ({
      ...prev,
      fullName: regForm.nombreCompleto.trim().substring(0, 100),
      phone: phoneClean.substring(0, 20),
      email: regForm.correo.trim().substring(0, 100),
      username: prev.username || defaultUser,
      profileId: prev.profileId || `IX-${regForm.nombreCompleto.trim().substring(0, 4).toUpperCase()}-2026`,
      plan: regForm.plan || 'Free'
    }));

    showToast('Paso 1 de 5', 'Completa los datos de tu perfil para finalizar tu registro.', 'info');
    setAuthView('onboarding');
    setOnboardingStep(1);
  };

  // VALIDACIÓN DE VEHÍCULO (AÑO LÍMITE AÑO ACTUAL)
  const handleVehicleStepSubmit = (e) => {
    e.preventDefault();

    if (!vehicleData.brand || vehicleData.brand === "Selecciona una marca...") {
      showToast('Marca requerida', 'Por favor selecciona la marca de tu vehículo.', 'warning');
      return;
    }

    const yearNum = parseInt(vehicleData.year, 10);
    if (isNaN(yearNum) || yearNum < 1950 || yearNum > CURRENT_YEAR) {
      showToast('Año no válido', `El año del vehículo debe estar entre 1950 y el año actual (${CURRENT_YEAR}).`, 'danger');
      return;
    }

    setOnboardingStep(4);
  };

  // FINALIZAR ONBOARDING: REGISTRAR EN AZURE Y PERSISTIR PERFILES EN COSMOS DB
  const handleCompleteOnboarding = async () => {
    try {
      showToast('Procesando...', 'Creando tu cuenta y perfil...', 'info');

      // 1. Crear la cuenta en la API de Azure
      const phoneClean = regForm.telefono.replace(/[^0-9+ ]/g, '');
      const payload = {
        nombre: regForm.nombreCompleto.trim().substring(0, 100),
        correo: regForm.correo.trim().substring(0, 100),
        telefono: phoneClean.substring(0, 20),
        password: regForm.password,
        planActivo: regForm.plan
      };

      const res = await authService.register(payload);

      if (!res || !res.data || !res.data.token) {
        showToast('Error de registro', 'No se pudo crear la cuenta. Inténtalo de nuevo.', 'danger');
        return;
      }

      // Guardar el token en localStorage únicamente al completarse el registro
      localStorage.setItem('jwt_token', res.data.token);

      if (res.data.usuario) {
        setDriverData((prev) => ({
          ...prev,
          fullName: res.data.usuario.nombre || prev.fullName,
          username: res.data.usuario.username || prev.username,
          profileId: res.data.usuario.appId || prev.profileId,
          phone: res.data.usuario.telefono || prev.phone,
          email: res.data.usuario.correo || prev.email,
        }));
      }

      // 2. Actualizar Perfil de Conducción en Azure Cosmos DB
      await userService.updateDriverProfile({
        tipoVehiculo: vehicleData.vehicleType,
        marca: vehicleData.brand.substring(0, 100),
        modelo: vehicleData.model.substring(0, 100),
        anio: parseInt(vehicleData.year, 10) || CURRENT_YEAR,
        uso: vehicleData.mainUse,
        velocidadPromedioLabel: vehicleData.avgSpeed.substring(0, 100)
      }).catch(() => null);

      // 3. Actualizar Ficha Médica en Azure Cosmos DB
      await userService.updateMedicalProfile({
        tipoSangre: medicalData.bloodType,
        alergias: medicalData.hasCondition === 'Sí' ? (medicalData.allergies.substring(0, 100) || 'Ninguna') : 'Sin alergias registradas',
        condiciones: medicalData.hasCondition === 'Sí' ? (medicalData.conditions.substring(0, 100) || 'Ninguna') : 'Sin padecimientos registrados',
        medicamentos: medicalData.hasTreatment === 'Sí' ? (medicalData.medications.substring(0, 100) || 'Ninguno') : 'Sin tratamiento médico activo',
        nota: medicalData.emergencyNotes.substring(0, 100)
      }).catch(() => null);

      // 4. Crear Contacto de Emergencia en Azure Cosmos DB
      if (contactData.name) {
        await contactService.createContact({
          nombre: contactData.name.substring(0, 100),
          relacion: contactData.relation.substring(0, 100),
          telefono: contactData.phone.substring(0, 20),
          usuarioImpactX: contactData.username.substring(0, 100),
          perfilId: contactData.profileId.substring(0, 100)
        }).catch(() => null);
      }

      showToast('¡Configuración Finalizada!', 'Tu cuenta ha sido creada y configurada correctamente.', 'success');
      setIsLoggedIn(true);
    } catch (err) {
      const errMsg = err.response?.data?.mensaje || 'Error al completar el registro.';
      showToast('Error de registro', errMsg, 'danger');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.correoOUsuario || !loginForm.password) {
      showToast('Campos vacíos', 'Por favor ingresa tu correo y contraseña.', 'warning');
      return;
    }

    try {
      showToast('Verificando...', 'Iniciando sesión...', 'info');
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
        showToast('¡Bienvenido!', 'Has iniciado sesión correctamente.', 'success');
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

        <section className={`form-page ${authView === 'onboarding' ? `onboarding-bg-step-${onboardingStep}` : ''}`}>
          <div className="container">
            {/* 1. VISTA DE REGISTRO EN BLANCO */}
            {authView === 'register' && (
              <div className="form-card wide">
                <span className="eyebrow">Cuenta titular</span>
                <h2>Crear cuenta Impact.X</h2>
                <p>
                  Llena los datos para generar tu usuario en el sistema.
                </p>
                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-grid">
                    <div className="field">
                      <label>Nombre completo</label>
                      <input 
                        type="text" 
                        maxLength={100}
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
                        maxLength={100}
                        placeholder="correo@ejemplo.com"
                        value={regForm.correo}
                        onChange={(e) => setRegForm({ ...regForm, correo: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Teléfono de referencia (Solo números)</label>
                      <input 
                        type="tel" 
                        maxLength={100}
                        placeholder="+52 55 0000 0000"
                        value={regForm.telefono}
                        onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value.replace(/[^0-9+ ]/g, '') })}
                        required 
                      />
                    </div>
                    <div className="field">
                      <label>Contraseña (mínimo 8 caracteres)</label>
                      <input 
                        type="password" 
                        maxLength={100}
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
                        maxLength={100}
                        placeholder="Confirma tu contraseña"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        required 
                      />
                    </div>

                    {/* INDICADOR VISUAL DE FORTALEZA DE CONTRASEÑA */}
                    {regForm.password && (
                      <div className="pwd-strength-container field-full">
                        <div className="pwd-strength-bar">
                          <div className={`pwd-strength-fill ${
                            regForm.password.length >= 8 && /[A-Z]/.test(regForm.password) && /[a-z]/.test(regForm.password) && /[0-9]/.test(regForm.password)
                              ? 'strong'
                              : regForm.password.length >= 8 && (/[A-Z]/.test(regForm.password) || /[0-9]/.test(regForm.password))
                              ? 'medium'
                              : 'weak'
                          }`} />
                        </div>
                        <div className="pwd-rules">
                          <span className={`pwd-rule-chip ${regForm.password.length >= 8 ? 'valid' : ''}`}>Mínimo 8 caracteres</span>
                          <span className={`pwd-rule-chip ${/[A-Z]/.test(regForm.password) ? 'valid' : ''}`}>Mayúscula (A-Z)</span>
                          <span className={`pwd-rule-chip ${/[a-z]/.test(regForm.password) ? 'valid' : ''}`}>Minúscula (a-z)</span>
                          <span className={`pwd-rule-chip ${/[0-9]/.test(regForm.password) ? 'valid' : ''}`}>Número (0-9)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="checkbox-row">
                    <input type="checkbox" required defaultChecked />
                    Acepto términos, condiciones y aviso de privacidad de emergencia.
                  </label>

                  <div className="form-actions">
                    <button className="btn primary" type="submit">Crear cuenta</button>
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
                <p>Ingresa tus credenciales registradas para acceder al panel.</p>
                <form onSubmit={handleLoginSubmit}>
                  <div className="field">
                    <label>Correo electrónico</label>
                    <input 
                      type="email" 
                      maxLength={100}
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
                      maxLength={100}
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
                  Completa la información. La ficha médica y los datos del vehículo se guardarán en tu perfil de conductor.
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
                          maxLength={100}
                          placeholder="Ingresa tu nombre completo"
                          value={driverData.fullName}
                          onChange={(e) => setDriverData({ ...driverData, fullName: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="field">
                        <label>Usuario Impact.X (Nombre de usuario)</label>
                        <input 
                          type="text"
                          maxLength={50}
                          placeholder="ej. juan_perez"
                          value={driverData.username}
                          onChange={(e) => setDriverData({ ...driverData, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                          required
                        />
                        <small className="field-hint">Tu identificador público. Puedes editarlo libremente.</small>
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
                        <label>Teléfono principal (Solo números)</label>
                        <input 
                          type="tel" 
                          maxLength={100}
                          placeholder="+52 55 0000 0000"
                          value={driverData.phone}
                          onChange={(e) => setDriverData({ ...driverData, phone: e.target.value.replace(/[^0-9+ ]/g, '') })}
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
                          maxLength={100}
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

                      <div className="field">
                        <label>¿Llevas algún tratamiento actualmente?</label>
                        <select 
                          value={medicalData.hasTreatment}
                          onChange={(e) => setMedicalData({ ...medicalData, hasTreatment: e.target.value })}
                        >
                          <option value="No">No</option>
                          <option value="Sí">Sí</option>
                        </select>
                      </div>

                      {/* CAMPOS CONDICIONALES DE PADECIMIENTO / ALERGIAS */}
                      {medicalData.hasCondition === 'Sí' && (
                        <>
                          <div className="field field-full conditional-field-fade">
                            <label>Padecimientos o condiciones médicas</label>
                            <textarea 
                              maxLength={100}
                              placeholder="Describe si padeces diabetes, hipertensión, asma, etc."
                              value={medicalData.conditions}
                              onChange={(e) => setMedicalData({ ...medicalData, conditions: e.target.value })}
                            />
                          </div>
                          <div className="field field-full conditional-field-fade">
                            <label>Alergias</label>
                            <textarea 
                              maxLength={100}
                              placeholder="Ej. Alergia a la Penicilina, polen, mariscos..."
                              value={medicalData.allergies}
                              onChange={(e) => setMedicalData({ ...medicalData, allergies: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      {/* CAMPO CONDICIONAL DE TRATAMIENTO Y MEDICAMENTOS */}
                      {medicalData.hasTreatment === 'Sí' && (
                        <div className="field field-full conditional-field-fade">
                          <label>Medicamentos que tomas actualmente</label>
                          <textarea 
                            maxLength={100}
                            placeholder="Ej. Insulina 10 UI cada 12 horas, Paracetamol..."
                            value={medicalData.medications}
                            onChange={(e) => setMedicalData({ ...medicalData, medications: e.target.value })}
                          />
                        </div>
                      )}

                      {/* NOTAS DE EMERGENCIA SIEMPRE VISIBLES */}
                      <div className="field field-full">
                        <label>Notas adicionales para emergencia</label>
                        <textarea 
                          maxLength={100}
                          placeholder="Indicaciones adicionales de emergencia"
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
                          maxLength={100}
                          placeholder="Ej. Versa Sense"
                          value={vehicleData.model}
                          onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                          required 
                        />
                      </div>
                      {/* SELECTOR DE AÑO CON CALENDARIO POR DÉCADAS */}
                      <div className="field">
                        <label>Año del vehículo (1950 - {CURRENT_YEAR})</label>
                        <button 
                          type="button" 
                          className={`year-picker-trigger ${showYearPicker ? 'active' : ''}`}
                          onClick={() => setShowYearPicker(!showYearPicker)}
                        >
                          <span>{vehicleData.year ? `Año ${vehicleData.year}` : 'Selecciona el año...'}</span>
                          <span>📅 ▾</span>
                        </button>

                        {showYearPicker && (
                          <div className="year-picker-modal">
                            <div className="year-picker-header">
                              <button 
                                type="button" 
                                className="year-picker-nav-btn"
                                disabled={pickerDecade <= 1950}
                                onClick={() => setPickerDecade(Math.max(1950, pickerDecade - 10))}
                              >
                                ‹
                              </button>
                              <h4>Década de {pickerDecade}s</h4>
                              <button 
                                type="button" 
                                className="year-picker-nav-btn"
                                disabled={pickerDecade + 10 > CURRENT_YEAR}
                                onClick={() => setPickerDecade(Math.min(2020, pickerDecade + 10))}
                              >
                                ›
                              </button>
                            </div>
                            <div className="year-grid">
                              {Array.from({ length: 10 }, (_, i) => pickerDecade + i)
                                .filter((y) => y >= 1950 && y <= CURRENT_YEAR)
                                .map((y) => (
                                  <button
                                    key={y}
                                    type="button"
                                    className={`year-btn ${vehicleData.year == y ? 'selected' : ''} ${y === CURRENT_YEAR ? 'current' : ''}`}
                                    onClick={() => {
                                      setVehicleData({ ...vehicleData, year: y.toString() });
                                      setShowYearPicker(false);
                                    }}
                                  >
                                    {y}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                        <small className="field-hint">Selecciona el año del vehículo desde el calendario por décadas.</small>
                      </div>
                      <div className="field">
                        <label>Velocidad promedio</label>
                        <input 
                          type="text" 
                          maxLength={100}
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
                          maxLength={100}
                          placeholder="Ej. María Zepeda"
                          value={contactData.name}
                          onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Parentesco o relación</label>
                        <input 
                          type="text" 
                          maxLength={100}
                          placeholder="Ej. Madre / Familiar"
                          value={contactData.relation}
                          onChange={(e) => setContactData({ ...contactData, relation: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Usuario Impact.X de la persona</label>
                        <input 
                          type="text" 
                          maxLength={100}
                          placeholder="ej. maria_segura"
                          value={contactData.username}
                          onChange={(e) => setContactData({ ...contactData, username: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>ID de perfil de la persona</label>
                        <input 
                          type="text" 
                          maxLength={100}
                          placeholder="ej. IX-MARIA-8X2K"
                          value={contactData.profileId}
                          onChange={(e) => setContactData({ ...contactData, profileId: e.target.value })}
                        />
                      </div>
                      <div className="field field-full">
                        <label>Teléfono de referencia (Solo números)</label>
                        <input 
                          type="tel" 
                          maxLength={100}
                          placeholder="+52 55 0000 0000"
                          value={contactData.phone}
                          onChange={(e) => setContactData({ ...contactData, phone: e.target.value.replace(/[^0-9+ ]/g, '') })}
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
                      <p><strong>Resumen de Configuración:</strong> Revisa tu información antes de confirmar el registro.</p>
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
                        <div className="info-row"><span>Padecimiento:</span><strong>{medicalData.hasCondition === 'Sí' ? medicalData.conditions || 'Padecimiento activo' : 'Ninguno'}</strong></div>
                        <div className="info-row"><span>Alergias:</span><strong>{medicalData.hasCondition === 'Sí' ? medicalData.allergies || 'Ninguna' : 'Sin alergias'}</strong></div>
                        <div className="info-row"><span>Tratamiento:</span><strong>{medicalData.hasTreatment === 'Sí' ? medicalData.medications || 'Tratamiento activo' : 'Sin tratamiento'}</strong></div>
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
                        Finalizar configuración
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
