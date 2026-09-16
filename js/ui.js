import { el, fmt } from './dom.js';
import { calcSekihan, calcMochi, calcSekihanIngredients } from './calc.js';

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
    value: String(item.qty ?? 0),
    onchange: (e) => {
      const v = e.target.value === '' ? 0 : Number(e.target.value);
      onChange({ ...item, qty: Number.isNaN(v) ? 0 : v });
    },
  });
}

function lineItemsCard({ title, items, products, category, ctx, onItemsChange }) {
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
          onItemsChange(copy.length ? copy : [{ name: '', qty: 0 }]);
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
      onclick: () => onItemsChange(items.concat([{ name: '', qty: 0 }])),
    }),
  ]);
}

function resultRow(label, value, unit) {
  return el('div', { class: 'result-row' }, [
    el('span', { class: 'label', text: label }),
    el('span', { class: 'value' }, [fmt(value), el('span', { class: 'unit', text: unit })]),
  ]);
}

export function renderSekihanTab(ctx) {
  const { products, data, update } = ctx;
  const items = data.sekihanItems;
  const itemsWithWeight = items
    .filter((i) => i.name)
    .map((i) => ({ weight: weightOf(products, 'sekihan', i.name), qty: i.qty }));
  const r = calcSekihan(itemsWithWeight);

  const wrap = el('div');
  wrap.appendChild(
    lineItemsCard({
      title: '赤飯：商品と数量',
      items,
      products,
      category: 'sekihan',
      ctx,
      onItemsChange: (next) => update(() => (data.sekihanItems = next)),
    })
  );

  wrap.appendChild(
    el('div', { class: 'card' }, [
      el('h2', { text: '算出結果' }),
      el('div', { class: 'result-box' }, [
        resultRow('出来上がり必要量', r.totalKg, 'kg'),
        resultRow('必要なもち米の量', r.riceKg, 'kg'),
        resultRow('ささげの量', r.sasageG, 'g'),
        resultRow('せいろ数', r.seiroCount, '枚'),
      ]),
      el('div', { class: 'result-box result-highlight' }, [
        resultRow('1せいろあたり もち米', r.perSeiroRiceKg, `kg × ${fmt(r.seiroCount)}`),
        resultRow('1せいろあたり ささげ', r.perSeiroSasageG, `g × ${fmt(r.seiroCount)}`),
      ]),
      el('p', {
        class: 'note',
        text:
          '※ ささげ（煮たもの）は米1kgあたり70g。1せいろあたり最大3.8kg程度の米が目安です。',
      }),
    ])
  );

  return wrap;
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
      title: '白もち・お供えなど',
      items: whiteItems,
      products,
      category: 'mochi',
      ctx,
      onItemsChange: (next) => update(() => (data.mochiWhiteItems = next)),
    })
  );

  wrap.appendChild(
    lineItemsCard({
      title: '粟もち',
      items: awaItems,
      products,
      category: 'awamochi',
      ctx,
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
        resultRow('必要もち米量', r.whiteRiceKg, 'kg'),
        resultRow('せいろ数', r.whiteSeiroCount, '枚'),
      ]),
      el('h3', { text: '粟もち系' }),
      el('div', { class: 'result-box' }, [
        resultRow('出来上がり必要量', r.awaTotalKg, 'kg'),
        resultRow('必要もち米量', r.awaMochiPortionKg, 'kg'),
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

export function renderIngredientsTab(ctx) {
  const { data, update } = ctx;
  const r = calcSekihanIngredients(data.ingredientRiceKg);

  return el('div', {}, [
    el('div', { class: 'card' }, [
      el('h2', { text: 'お赤飯 必要原材料算出' }),
      el('div', { class: 'line-item', style: 'grid-template-columns: 1fr 120px;' }, [
        el('span', { text: 'もち米' }),
        el('input', {
          type: 'number',
          min: '0',
          step: '0.1',
          value: String(data.ingredientRiceKg),
          onchange: (e) => update(() => (data.ingredientRiceKg = e.target.value === '' ? '' : Number(e.target.value))),
        }),
      ]),
      el('div', { class: 'result-box' }, [
        resultRow('赤い水', r.redWaterG, 'g'),
        resultRow('水', r.waterG, 'g'),
        resultRow('塩', r.saltG, 'g'),
        resultRow('ささげ', r.sasageG, 'g'),
      ]),
    ]),
  ]);
}

function productListEditor(products, category, title, onChange) {
  const list = products[category];
  const rows = list.map((p, idx) =>
    el('div', { class: 'product-row' }, [
      el('input', {
        type: 'text',
        value: p.name,
        onchange: (e) => {
          const copy = list.slice();
          copy[idx] = { ...copy[idx], name: e.target.value };
          onChange(copy);
        },
      }),
      el('input', {
        type: 'number',
        min: '0',
        value: String(p.weight),
        onchange: (e) => {
          const copy = list.slice();
          copy[idx] = { ...copy[idx], weight: Number(e.target.value) || 0 };
          onChange(copy);
        },
      }),
      el('button', {
        class: 'remove-btn',
        text: '×',
        'aria-label': '削除',
        onclick: () => {
          const copy = list.slice();
          copy.splice(idx, 1);
          onChange(copy);
        },
      }),
    ])
  );

  return el('div', { class: 'products-group' }, [
    el('h3', { text: title }),
    ...rows,
    el('button', {
      class: 'add-btn',
      text: '＋ 商品を追加',
      onclick: () => onChange(list.concat([{ name: '', weight: 0 }])),
    }),
  ]);
}

export function renderProductsTab(ctx) {
  const { products, update, resetProducts } = ctx;

  return el('div', { class: 'card' }, [
    el('h2', { text: '商品一覧（マスタ管理）' }),
    el('p', { class: 'note', text: 'ここで登録した商品が「赤飯」「もち」タブの選択肢に反映されます。' }),
    productListEditor(products, 'sekihan', '赤飯用商品', (next) =>
      update(() => (products.sekihan = next))
    ),
    productListEditor(products, 'mochi', 'もち用商品（白もち・お供えなど）', (next) =>
      update(() => (products.mochi = next))
    ),
    productListEditor(products, 'awamochi', '粟もち用商品', (next) =>
      update(() => (products.awamochi = next))
    ),
    el('div', { class: 'product-actions' }, [
      el('button', {
        class: 'btn btn-secondary',
        text: '初期値に戻す',
        onclick: () => {
          if (confirm('商品一覧を初期値に戻します。よろしいですか？')) {
            resetProducts();
          }
        },
      }),
    ]),
  ]);
}
