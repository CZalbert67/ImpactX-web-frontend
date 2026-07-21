// js/main.js
import { route } from './router.js';
import { ensureState } from './state.js';
import { closeModal } from './utils.js';

// Initialize and run routing immediately
ensureState();
route();

window.addEventListener('hashchange', () => {
  route();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
