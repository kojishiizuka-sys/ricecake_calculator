// localStorage を使った永続化ストア。
// 商品マスタ、各タブの入力内容、比率設定を保存する。

import { DEFAULT_PRODUCTS } from './data.js';

const KEY_PRODUCTS = 'ricecake.products.v1';
const KEY_STATE = 'ricecake.state.v1';

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function loadProducts() {
  const raw = localStorage.getItem(KEY_PRODUCTS);
  if (!raw) return clone(DEFAULT_PRODUCTS);
  const parsed = safeParse(raw, null);
  if (!parsed || !parsed.sekihan || !parsed.mochi || !parsed.awamochi) {
    return clone(DEFAULT_PRODUCTS);
  }
  return parsed;
}

export function saveProducts(products) {
  localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));
}

export function resetProducts() {
  const defaults = clone(DEFAULT_PRODUCTS);
  saveProducts(defaults);
  return defaults;
}

const DEFAULT_STATE = {
  sekihanItems: [{ name: '', qty: 0 }],
  mochiWhiteItems: [{ name: '', qty: 0 }],
  mochiAwaItems: [{ name: '', qty: 0 }],
  awaRatio: 0.8,
  mochiRatio: 1,
  ingredientRiceKg: 4,
};

export function loadState() {
  const raw = localStorage.getItem(KEY_STATE);
  if (!raw) return clone(DEFAULT_STATE);
  const parsed = safeParse(raw, null);
  return parsed ? { ...clone(DEFAULT_STATE), ...parsed } : clone(DEFAULT_STATE);
}

export function saveState(state) {
  localStorage.setItem(KEY_STATE, JSON.stringify(state));
}
