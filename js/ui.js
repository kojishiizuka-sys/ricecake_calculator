import { el, fmt } from './dom.js';
import { calcMochi } from './calc.js';
import { excelRound } from './round.js';

function weightOf(products, category, name) {
  const p = products[category].find((x) => x.name === name);
  return p ? p.weight : 0;
}

function productSelect(products, category, item, onChange) {
  const options = [
    el('option', { value: '', text: '選択してください' }),
    ...products[category].map((p) =>
      el('option', {
        value: p.name,
        text: `${p.name}（${p.weight}g）`,
        selected: p.name === item.name,
      })
    ),
  ];
  return el('select', { onchange: (e) => onChange({ ...item, name: e.target.value }) }, options);
}

function qtyInput(item, onChange) {
  return el('input', {
    type: 'number',
    min: '0',
    inputmode: 'numeric',
    placeholder: '0',
    value: item.qty === '' || item.qty === undefined || item.qty === null ? '' : String(item.qty),
    onchange: (e) => {
      if (e.target.value === '') {
        onChange({ ...item, qty: '' });
        return;
      }
      const v = Number(e.target.value);
      onChange({ ...item, qty: Number.isNaN(v) ? '' : v });
    },
  });
}

function lineItemsCard({ title, items, products, category, onItemsChange }) {
  const rows = items.map((item, idx) =>
    el('div', { class: 'line-item' }, [
      productSelect(products, category, item, (next) => {
        const copy = items.slice();
        copy[idx] = next;
        onItemsChange(copy);
      }),
      qtyInput(item, (next) => {
        const copy = items.slice();
        copy[idx] = next;
        onItemsChange(copy);
      }),
      el('button', {
        class: 'remove-btn',
        text: '×',
        'aria-label': '削除',
        onclick: () => {
          const copy = items.slice();
          copy.splice(idx, 1);
          onItemsChange(copy.length ? copy : [{ name: '', qty: '' }]);
        },
      }),
    ])
  );

  return el('div', { class: 'card' }, [
    el('h2', { text: title }),
    ...rows,
    el('button', {
      class: 'add-btn',
      text: '＋ 商品を追加',
      onclick: () => onItemsChange(items.concat([{ name: '', qty: '' }])),
    }),
  ]);
}

function resultRow(label, value, unit) {
  return el('div', { class: 'result-row' }, [
    el('span', { class: 'label', text: label }),
    el('span', { class: 'value' }, [fmt(value), el('span', { class: 'unit', text: unit })]),
  ]);
}

function riceResultRow(label, value, unit) {
  // もち米の量は四捨五入で小数第2位までの表示にする
  const rounded = value === '' || value === null || value === undefined ? '' : excelRound(value, 2);
  return el('div', { class: 'result-row' }, [
    el('span', { class: 'label', text: label }),
    el('span', { class: 'value' }, [fmt(rounded, '', 2), el('span', { class: 'unit', text: unit })]),
  ]);
}

export function renderMochiTab(ctx) {
  const { products, data, update } = ctx;
  const whiteItems = data.mochiWhiteItems;
  const awaItems = data.mochiAwaItems;

  const whiteWeighted = whiteItems
    .filter((i) => i.name)
    .map((i) => ({ weight: weightOf(products, 'mochi', i.name), qty: i.qty }));
  const awaWeighted = awaItems
    .filter((i) => i.name)
    .map((i) => ({ weight: weightOf(products, 'awamochi', i.name), qty: i.qty }));

  const ratio = { awaRatio: Number(data.awaRatio) || 0, mochiRatio: Number(data.mochiRatio) || 0 };
  const r = calcMochi(whiteWeighted, awaWeighted, ratio);

  const wrap = el('div');

  wrap.appendChild(
    lineItemsCard({
      title: '白もち・なまこ・お供え等',
      items: whiteItems,
      products,
      category: 'mochi',
      onItemsChange: (next) => update(() => (data.mochiWhiteItems = next)),
    })
  );

  wrap.appendChild(
    lineItemsCard({
      title: '粟もち',
      items: awaItems,
      products,
      category: 'awamochi',
      onItemsChange: (next) => update(() => (data.mochiAwaItems = next)),
    })
  );

  wrap.appendChild(
    el('div', { class: 'card' }, [
      el('h2', { text: 'あわ / もち比率（粟もち用）' }),
      el('div', { class: 'ratio-row' }, [
        el('label', {}, ['あわ', el('input', {
          type: 'number', step: '0.1', min: '0', value: String(data.awaRatio),
          onchange: (e) => update(() => (data.awaRatio = Number(e.target.value) || 0)),
        })]),
        el('span', { text: ':' }),
        el('label', {}, ['もち', el('input', {
          type: 'number', step: '0.1', min: '0', value: String(data.mochiRatio),
          onchange: (e) => update(() => (data.mochiRatio = Number(e.target.value) || 0)),
        })]),
      ]),
    ])
  );

  wrap.appendChild(
    el('div', { class: 'card' }, [
      el('h2', { text: '算出結果' }),
      el('h3', { text: '白もち系' }),
      el('div', { class: 'result-box' }, [
        resultRow('出来上がり必要量', r.whiteTotalKg, 'kg'),
        riceResultRow('必要もち米量', r.whiteRiceKg, 'kg'),
        resultRow('せいろ数', r.whiteSeiroCount, '枚'),
      ]),
      el('h3', { text: '粟もち系' }),
      el('div', { class: 'result-box' }, [
        resultRow('出来上がり必要量', r.awaTotalKg, 'kg'),
        riceResultRow('必要もち米量', r.awaMochiPortionKg, 'kg'),
        resultRow('必要あわ量', r.awaPortionKg, 'kg'),
        resultRow('せいろ数', r.awaSeiroCount, '枚'),
      ]),
      el('div', { class: 'result-box result-highlight' }, [
        resultRow('合計せいろ数', r.seiroCount, '枚'),
      ]),
      el('p', {
        class: 'note',
        text: '※ 1せいろあたり最大3.8kg程度の米が目安です。',
      }),
    ])
  );

  return wrap;
}
