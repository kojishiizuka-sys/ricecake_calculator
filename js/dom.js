// innerHTML を使わずに安全に DOM を組み立てるための小さなヘルパー。

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k in node && typeof node[k] !== 'function') {
      node[k] = v;
    } else {
      node.setAttribute(k, v === true ? '' : v);
    }
  }
  const list = Array.isArray(children) ? children : [children];
  for (const c of list) {
    if (c === null || c === undefined) continue;
    node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return node;
}

export function fmt(n, unit = '', maxDecimals = 3) {
  if (n === '' || n === null || n === undefined || Number.isNaN(n)) return '—';
  const text = Number(n).toLocaleString('ja-JP', { maximumFractionDigits: maxDecimals });
  return unit ? `${text}${unit}` : text;
}
