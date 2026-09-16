// localStorage を使った入力内容の永続化ストア。
// 商品マスタ（js/data.js）はアプリ内では編集しないため、ここでは保存しない。

const KEY_STATE = 'ricecake.state.v2';

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

const DEFAULT_STATE = {
  mochiWhiteItems: [{ name: '', qty: '' }],
  mochiAwaItems: [{ name: '', qty: '' }],
  awaRatio: 0.8,
  mochiRatio: 1,
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
