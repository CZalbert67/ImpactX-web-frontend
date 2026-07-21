// js/components/shell.js
import { state, plan } from '../state.js';
import { currentPath } from '../router.js';
import { esc } from '../utils.js';

export function publicHeader() {
  return `
    <header class="public-header">
      <div class="container public-nav">
        <a href="#/" class="brand"><span class="brand-mark">IX</span><span>Impact.X</span></a>
        <nav class="nav-links">
          <a href="#/" class="keep">Inicio</a>
          <a href="#/planes" class="keep">Planes</a>
          <button data-action="scroll-how">Cómo funciona</button>
          <a href="#/login" class="keep">Iniciar sesión</a>
          <a href="#/registro" class="btn primary keep">Prueba gratis</a>
        </nav>
      </div>
    </header>
  `;
}

export function publicShell(content) {
  return `<div class="app-shell">${publicHeader()}${content}</div>`;
}

export function sideLink(path, icon, label, current) {
  const active = current === path || (path !== '/dashboard/chats' && current.startsWith(path));
  return `<a class="side-link ${active ? 'active' : ''}" href="#${path}"><span>${icon}</span><span>${label}</span></a>`;
}

export function avatarMenu() {
  return `
    <div class="mini-menu">
      <button data-route="/dashboard/perfil">Ver perfil</button>
      <button data-route="/dashboard/configuracion">Configuración</button>
      <button class="danger-text" data-action="logout">Cerrar sesión</button>
    </div>
  `;
}

export function dashboardShell(title, subtitle, content, actions = '') {
  const unread = state.notifications.filter(n => n.unread).length;
  const chatUnread = state.chatThreads.reduce((sum, t) => sum + (Number(t.unread) || 0), 0);
  const path = currentPath();
  const initials = esc((state.user.name || 'IX').split(' ').map(x => x[0]).slice(0,2).join(''));
  const wearableClass = state.wearable.linked && state.wearable.connection === 'connected' ? 'success' : state.wearable.connection === 'syncing' ? 'warning' : 'danger';
  
  return `
    <div class="dashboard">
      <aside class="sidebar">
        <a href="#/dashboard/chats" class="brand"><span class="brand-mark">IX</span><span>Impact.X</span></a>
        <div class="side-group">
          <div class="side-label">Gestión web</div>
          ${sideLink('/dashboard/chats', '💬', `Chats internos ${chatUnread ? `(${chatUnread})` : ''}`, path)}
          ${sideLink('/dashboard/contactos', '🧑‍🤝‍🧑', 'Red interna', path)}
          ${sideLink('/dashboard/red-monitoreo', '🛡️', 'Solicitudes e invitaciones', path)}
          ${sideLink('/dashboard/invitar-app', '➕', 'Invitar a la app', path)}
          ${sideLink('/dashboard/rutas', '🗺️', 'Historial de rutas', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Seguridad</div>
          ${sideLink('/dashboard/incidentes', '📍', 'Incidentes', path)}
          ${sideLink('/dashboard/alerta/501', '🚨', 'Alerta activa demo', path)}
          ${sideLink('/dashboard/wearable', '⌚', 'Wearable', path)}
        </div>
        <div class="side-group">
          <div class="side-label">Cuenta</div>
          ${sideLink('/dashboard/perfil', '👤', 'Perfil del conductor', path)}
          ${sideLink('/dashboard/suscripcion', '💳', 'Suscripción', path)}
          ${sideLink('/dashboard/notificaciones', '🔔', `Notificaciones ${unread ? `(${unread})` : ''}`, path)}
          ${sideLink('/dashboard/configuracion', '⚙️', 'Configuración', path)}
          ${sideLink('/dashboard/permisos', '🔐', 'Permisos web', path)}
          ${sideLink('/dashboard/ayuda', '❔', 'Ayuda', path)}
        </div>
        <div class="side-group">
          <button class="side-link" data-action="reset-demo">♻️ Reiniciar demo</button>
          <button class="side-link danger-text" data-action="logout">↩ Cerrar sesión</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <button class="icon-btn menu-btn" data-action="toggle-sidebar">☰</button>
          <div class="top-status">
            <span class="badge ${wearableClass}">Wearable ${state.wearable.connection === 'connected' ? 'online' : 'offline'}</span>
            <span class="badge primary">Plan ${esc(plan().name)}</span>
            <span class="badge success">@${esc(state.user.username)}</span>
          </div>
          <div class="top-actions">
            <button class="btn small hide-sm" data-route="/dashboard/contactos/nuevo">+ Solicitud</button>
            <button class="btn small hide-sm" data-route="/dashboard/invitar-app">Invitar app</button>
            <button class="btn small" data-route="/dashboard/chats">💬 ${chatUnread}</button>
            <button class="icon-btn" data-route="/dashboard/notificaciones">🔔${unread ? `<span>${unread}</span>` : ''}</button>
            <div class="avatar-wrap">
              <button class="avatar" data-action="toggle-avatar-menu">${initials}</button>
              ${state.ui.avatarMenu ? avatarMenu() : ''}
            </div>
          </div>
        </header>
        <section class="page-head">
          <div>
            <p class="eyebrow">Impact.X Web · Panel de gestión empresarial</p>
            <h1>${esc(title)}</h1>
            <p>${esc(subtitle)}</p>
          </div>
          <div class="page-actions">${actions}</div>
        </section>
        ${content}
      </main>
    </div>
  `;
}
