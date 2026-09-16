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
  return el('select', { onchange: (e) => onChange(e.target.value) }, options);
}

function qtyInput(item, onChange) {
  return el('input', {
    type: 'number',
    min: '0',
    inputmode: 'numeric',
    placeholder: '0',
    value: item.qty === '' || item.qty === undefined || item.qty === null ? '' : String(item.qty),
    // input イベントで入力の都度反映する（blur を待たない）
    oninput: (e) => {
      if (e.target.value === '') {
        onChange('');
        return;
      }
      const v = Number(e.target.value);
      onChange(Number.isNaN(v) ? '' : v);
    },
  });
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

function buildResultsContent(products, data) {
  const whiteWeighted = data.mochiWhiteItems
    .filter((i) => i.name)
    .map((i) => ({ weight: weightOf(products, 'mochi', i.name), qty: i.qty }));
  const awaWeighted = data.mochiAwaItems
    .filter((i) => i.name)
    .map((i) => ({ weight: weightOf(products, 'awamochi', i.name), qty: i.qty }));

  const ratio = { awaRatio: Number(data.awaRatio) || 0, mochiRatio: Number(data.mochiRatio) || 0 };
  const r = calcMochi(whiteWeighted, awaWeighted, ratio);

  return [
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
    el('div', { class: 'result-box result-highlight' }, [resultRow('合計せいろ数', r.seiroCount, '枚')]),
    el('p', { class: 'note', text: '※ 1せいろあたり最大3.8kg程度の米が目安です。' }),
  ];
}

/**
 * もちタブを root にマウントする。
 * 数量入力のたびに結果カードだけを再描画し、商品選択欄・数量欄自体は
 * 再生成しない（入力中にフォーカスが外れて再入力が必要になるのを防ぐため）。
 */
export function mountMochiTab(root, ctx) {
  const { products, data, persist } = ctx;

  const resultsSection = el('div', { class: 'card' });

  function refreshResults() {
    resultsSection.innerHTML = '';
    for (const node of buildResultsContent(products, data)) {
      resultsSection.appendChild(node);
    }
  }

  function renderItemsSection(container, title, itemsKey, category) {
    container.innerHTML = '';
    container.appendChild(el('h2', { text: title }));
    const items = data[itemsKey];

    items.forEach((item, idx) => {
      container.appendChild(
        el('div', { class: 'line-item' }, [
          productSelect(products, category, item, (name) => {
            items[idx] = { ...items[idx], name };
            persist();
            refreshResults();
          }),
          qtyInput(item, (qty) => {
            items[idx] = { ...items[idx], qty };
            persist();
            refreshResults();
          }),
          el('button', {
            class: 'remove-btn',
            text: '×',
            'aria-label': '削除',
            onclick: () => {
              items.splice(idx, 1);
              if (!items.length) items.push({ name: '', qty: '' });
              persist();
              renderItemsSection(container, title, itemsKey, category);
              refreshResults();
            },
          }),
        ])
      );
    });

    container.appendChild(
      el('button', {
        class: 'add-btn',
        text: '＋ 商品を追加',
        onclick: () => {
          items.push({ name: '', qty: '' });
          persist();
          renderItemsSection(container, title, itemsKey, category);
        },
      })
    );
  }

  const whiteSection = el('div', { class: 'card' });
  const awaSection = el('div', { class: 'card' });
  renderItemsSection(whiteSection, '白もち・なまこ・お供え等', 'mochiWhiteItems', 'mochi');
  renderItemsSection(awaSection, '粟もち', 'mochiAwaItems', 'awamochi');

  const ratioSection = el('div', { class: 'card' }, [
    el('h2', { text: 'あわ / もち比率（粟もち用）' }),
    el('div', { class: 'ratio-row' }, [
      el('label', {}, [
        'あわ',
        el('input', {
          type: 'number',
          step: '0.1',
          min: '0',
          value: String(data.awaRatio),
          oninput: (e) => {
            data.awaRatio = Number(e.target.value) || 0;
            persist();
            refreshResults();
          },
        }),
      ]),
      el('span', { text: ':' }),
      el('label', {}, [
        'もち',
        el('input', {
          type: 'number',
          step: '0.1',
          min: '0',
          value: String(data.mochiRatio),
          oninput: (e) => {
            data.mochiRatio = Number(e.target.value) || 0;
            persist();
            refreshResults();
          },
        }),
      ]),
    ]),
  ]);

  refreshResults();

  root.appendChild(whiteSection);
  root.appendChild(awaSection);
  root.appendChild(ratioSection);
  root.appendChild(resultsSection);
}
