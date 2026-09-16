import { loadState, saveState } from './store.js';
import { PRODUCTS } from './data.js';
import { mountMochiTab } from './ui.js';
import { registerInstallPrompt } from './install.js';

const state = {
  products: PRODUCTS,
  data: loadState(),
};

const root = document.getElementById('app');

mountMochiTab(root, {
  products: state.products,
  data: state.data,
  persist: () => saveState(state.data),
});

registerInstallPrompt();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.error('SW registration failed', err));
  });
}
