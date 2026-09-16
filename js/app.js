import { loadProducts, saveProducts, resetProducts as resetProductsStore, loadState, saveState } from './store.js';
import { renderSekihanTab, renderMochiTab, renderIngredientsTab, renderProductsTab } from './ui.js';
import { registerInstallPrompt } from './install.js';

const state = {
  products: loadProducts(),
  data: loadState(),
};

const root = document.getElementById('app');
let currentTab = 'sekihan';

function persist() {
  saveProducts(state.products);
  saveState(state.data);
}

function render() {
  root.innerHTML = '';
  const ctx = {
    products: state.products,
    data: state.data,
    update(mutator) {
      mutator();
      persist();
      render();
    },
    resetProducts() {
      state.products = resetProductsStore();
      render();
    },
  };

  let node;
  switch (currentTab) {
    case 'mochi':
      node = renderMochiTab(ctx);
      break;
    case 'ingredients':
      node = renderIngredientsTab(ctx);
      break;
    case 'products':
      node = renderProductsTab(ctx);
      break;
    case 'sekihan':
    default:
      node = renderSekihanTab(ctx);
      break;
  }
  root.appendChild(node);
}

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');
    currentTab = btn.dataset.tab;
    render();
  });
});

render();
registerInstallPrompt();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.error('SW registration failed', err));
  });
}
