// js/views/subscription.js
import { state, PLAN_RULES, plan, usableContacts, suspendedContacts, generateId, addNotification } from '../state.js';
import { navigate, currentPath, route } from '../router.js';
import { esc, toast, confirmModal, validateRequired } from '../utils.js';
import { dashboardShell } from '../components/shell.js';
import { infoRows } from './onboarding.js';
import { planUsageAlert, enforceContactPlanLimit, downgradePlanWarning, renderPlans } from './plans.js';

export function submitPayment(form) {
  if (!validateRequired(form, ['holder','card','exp','cvv','zip'])) return;
  const target = form.dataset.plan;
  if (PLAN_RULES[target]) state.user.plan = target;
  enforceContactPlanLimit(target);
  state.user.subscriptionStatus = 'Activa';
  state.user.subscriptionEnd = '2026-07-30';
  state.payments.unshift({ 
    id: generateId(), 
    date: new Date().toISOString().slice(0, 10), 
    concept: `Pago Plan ${plan().name}`, 
    amount: plan().price, 
    status: 'Aprobado' 
  });
  addNotification('Pago aprobado', `Tu plan ${plan().name} quedó activo.`, 'plan');
  toast('Pago aprobado', `Tu plan ${plan().name} está activo.`);
  navigate('/dashboard/suscripcion');
}

export function confirmPlanChange(key) {
  if (PLAN_RULES[key]) state.user.plan = key;
  enforceContactPlanLimit(key);
  state.user.subscriptionStatus = 'Activa';
  state.user.subscriptionEnd = '2026-07-30';
  state.payments.unshift({ 
    id: generateId(), 
    date: new Date().toISOString().slice(0, 10), 
    concept: `Cambio Plan ${plan().name}`, 
    amount: plan().price, 
    status: 'Aprobado' 
  });
  addNotification('Plan cambiado', `Tu plan cambió a ${plan().name}.`, 'plan');
  toast('Plan cambiado', `Tu plan ahora es ${plan().name}.`);
  navigate('/dashboard/suscripcion');
}

export function expireSubscription() {
  confirmModal({ 
    title: 'Simular vencimiento', 
    body: 'El dashboard mostrará el estado de suscripción vencida.', 
    confirmText: 'Simular', 
    danger: true, 
    onConfirm: () => { 
      state.user.subscriptionStatus = 'Vencida'; 
      addNotification('Suscripción vencida', 'Tu plan venció y requiere renovación.', 'plan'); 
      navigate('/dashboard/suscripcion-vencida'); 
    } 
  });
}

export function cancelSubscription() {
  confirmModal({ 
    title: 'Cancelar suscripción', 
    body: 'La protección quedará limitada al finalizar el periodo actual.', 
    confirmText: 'Cancelar suscripción', 
    danger: true, 
    onConfirm: () => { 
      state.user.subscriptionStatus = 'Cancelada'; 
      addNotification('Suscripción cancelada', 'Tu suscripción fue cancelada de forma simulada.', 'plan'); 
      toast('Suscripción cancelada'); 
      route(); 
    } 
  });
}

export function renderSubscription() {
  ensureState();
  const p = plan();
  const content = `
    <div class="grid grid-3">
      <div class="card stat-card">
        <h3>Plan actual</h3>
        <div class="stat-value">${p.name}</div>
        <p class="stat-desc">${p.description}</p>
        <div class="card-actions">
          <button class="btn small primary" data-route="/dashboard/suscripcion/cambiar-plan/premium">Actualizar a Premium</button>
        </div>
      </div>
      <div class="card stat-card">
        <h3>Contactos</h3>
        <div class="stat-value">${usableContacts().length}/${p.contactsLimit}</div>
        <p class="stat-desc">${state.contacts.length} totales · ${suspendedContacts().length} pausados por plan.</p>
      </div>
      <div class="card stat-card">
        <h3>Vencimiento</h3>
        <div class="stat-value">${state.user.plan === 'trial' ? state.user.trialDaysLeft + 'd' : 'OK'}</div>
        <p class="stat-desc">Fecha final: ${esc(state.user.subscriptionEnd)}</p>
        <div class="card-actions">
          <button class="btn small" data-route="/dashboard/suscripcion/pago">Renovar</button>
        </div>
      </div>
    </div>
    ${suspendedContacts().length ? planUsageAlert() : ''}
    <div class="card" style="margin-top:16px">
      <h3>Funciones activas</h3>
      <ul class="features">
        ${p.sensors.map(s => `<li>${esc(s)}</li>`).join('')}
        <li>Mapas: ${p.maps ? 'Activo' : 'Bloqueado'}</li>
        <li>Reportes: ${p.exportReports ? 'Activo' : 'Bloqueado'}</li>
        <li>Bypass crítico: ${p.bypass ? 'Activo' : 'Bloqueado'}</li>
      </ul>
    </div>
    <div style="margin-top:16px">${renderPlans(false)}</div>
    <div class="card" style="margin-top:16px">
      <h3>Acciones de suscripción</h3>
      <div class="card-actions">
        <button class="btn" data-route="/dashboard/suscripcion/pago">Renovar / pagar</button>
        <button class="btn" data-route="/dashboard/suscripcion/pagos">Historial de pagos</button>
        <button class="btn warning" data-action="expire-subscription">Simular vencimiento</button>
        <button class="btn danger" data-action="cancel-subscription">Cancelar suscripción</button>
      </div>
    </div>
  `;
  return dashboardShell('Suscripción', 'Plan actual, límites, funciones bloqueadas y cambio de plan.', content);
}

export function renderChangePlan(target = 'premium') {
  const current = plan();
  const next = PLAN_RULES[target] || PLAN_RULES.premium;
  const content = `
    <div class="detail-grid">
      <div class="card">
        <h3>Plan actual: ${esc(current.name)}</h3>
        <p>${esc(current.description)}</p>
        <div class="divider"></div>
        ${infoRows({'Precio': current.price, 'Contactos': current.contactsLimit, 'Mapas': current.maps ? 'Sí' : 'No', 'Reportes': current.exportReports ? 'Sí' : 'No', 'Bypass': current.bypass ? 'Sí' : 'No'})}
      </div>
      <div class="card">
        <h3>Nuevo plan: ${esc(next.name)}</h3>
        <p>${esc(next.description)}</p>
        <div class="divider"></div>
        ${infoRows({'Precio': next.price, 'Contactos': next.contactsLimit, 'Mapas': next.maps ? 'Sí' : 'No', 'Reportes': next.exportReports ? 'Sí' : 'No', 'Bypass': next.bypass ? 'Sí' : 'No'})}
      </div>
    </div>
    ${downgradePlanWarning(target) || ''}
    <div class="card" style="margin-top:16px">
      <h3>Confirmación</h3>
      <p>En un sistema real esta pantalla se conectaría a pasarela de pago y validaría fechas. En esta demo puedes confirmar directamente o pasar a pago simulado. Si el nuevo plan reduce espacios, los contactos excedentes se pausan, no se borran.</p>
      <div class="card-actions">
        <button class="btn primary" data-action="confirm-plan-change" data-plan="${target}">Confirmar cambio</button>
        <button class="btn" data-route="/dashboard/suscripcion/pago?plan=${target}">Ir a pago</button>
        <button class="btn" data-route="/dashboard/suscripcion">Cancelar</button>
      </div>
    </div>
  `;
  return dashboardShell('Cambiar plan', 'Confirma cambio de plan y nuevas funciones desbloqueadas.', content);
}

export function renderPayment() {
  const target = new URLSearchParams(currentPath().split('?')[1] || '').get('plan') || state.user.plan;
  const content = `
    <form id="payment-form" data-plan="${esc(target)}" novalidate>
      <div class="grid grid-2">
        <div class="card"><h3>Datos de pago</h3>
          <div class="field"><label>Nombre del titular</label><input name="holder" value="${esc(state.user.name)}" required /></div>
          <div class="field"><label>Número de tarjeta</label><input name="card" value="4242 4242 4242 4242" required /></div>
          <div class="form-grid"><div class="field"><label>Expiración</label><input name="exp" value="12/29" required /></div><div class="field"><label>CVV</label><input name="cvv" value="123" required /></div></div>
          <div class="field"><label>Código postal</label><input name="zip" value="42800" required /></div>
          <label class="checkbox-row"><input name="save" type="checkbox" checked />Guardar método de pago para renovaciones.</label>
        </div>
        <div class="card"><h3>Resumen</h3>${infoRows({'Plan a pagar': PLAN_RULES[target]?.name || plan().name, 'Total': PLAN_RULES[target]?.price || plan().price, 'Estado': 'Pago simulado', 'Renovación': 'Mensual'})}<div class="alert-box info"><div>💳</div><div><strong>Demo</strong><p>No se procesa dinero real. Solo actualiza estado visual.</p></div></div></div>
      </div>
      <div class="form-actions"><button class="btn primary" type="submit">Pagar</button><button class="btn" type="button" data-route="/dashboard/suscripcion">Cancelar</button></div>
    </form>
  `;
  return dashboardShell('Pago simulado', 'Formulario visual de pago para renovación o cambio de plan.', content);
}

export function renderPayments() {
  const rows = state.payments.map(p => `<tr><td>${esc(p.date)}</td><td>${esc(p.concept)}</td><td>${esc(p.amount)}</td><td><span class="badge success">${esc(p.status)}</span></td><td><button class="btn small" data-action="download-payment" data-id="${p.id}">Descargar</button></td></tr>`).join('');
  const content = `<div class="card"><h3>Historial de pagos</h3><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  return dashboardShell('Historial de pagos', 'Pagos, renovaciones y comprobantes simulados.', content, '<button class="btn" data-route="/dashboard/suscripcion">Volver</button>');
}

export function renderSubscriptionExpired() {
  const content = `<div class="empty-state"><h3>Tu suscripción ha vencido</h3><p>Renueva tu plan para mantener activa la protección y el envío de alertas.</p><button class="btn primary" data-route="/dashboard/suscripcion/pago">Renovar ahora</button><button class="btn" data-route="/dashboard/suscripcion">Ver planes</button><button class="btn danger" data-action="logout">Cerrar sesión</button></div>`;
  return dashboardShell('Suscripción vencida', 'Estado especial de bloqueo o acceso limitado.', content);
}
