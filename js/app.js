import { loadState, saveState } from './store.js';
import { PRODUCTS } from './data.js';
import { renderMochiTab } from './ui.js';
import { registerInstallPrompt } from './install.js';

const state = {
  products: PRODUCTS,
  data: loadState(),
};

const root = document.getElementById('app');

function render() {
  root.innerHTML = '';
  const ctx = {
    products: state.products,
    data: state.data,
    update(mutator) {
      mutator();
      saveState(state.data);
      render();
    },
  };
  root.appendChild(renderMochiTab(ctx));
}

render();
registerInstallPrompt();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.error('SW registration failed', err));
  });
}
