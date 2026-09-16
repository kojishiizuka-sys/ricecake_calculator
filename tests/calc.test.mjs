// 元エクセルファイルから抽出した実測値との比較テスト。
// 実行: node tests/calc.test.mjs
import assert from 'node:assert/strict';
import { calcMochi } from '../js/calc.js';

let passed = 0;
function check(label, actual, expected) {
  assert.deepEqual(actual, expected, `${label}: got ${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
  passed++;
  console.log(`OK: ${label}`);
}

// もちシート: 白のしもち(2700g)x1, お供え6寸(2700g)x2, お供え5寸(1800g)x2, 粟もちなし
const mochi = calcMochi(
  [
    { weight: 2700, qty: 1 },
    { weight: 2700, qty: 2 },
    { weight: 1800, qty: 2 },
  ],
  []
);
check('もち whiteTotalKg (B12)', mochi.whiteTotalKg, 11.7);
check('もち whiteRiceKg (B14)', mochi.whiteRiceKg, 8.358);
check('もち awaTotalKg (F12)', mochi.awaTotalKg, 0);
check('もち awaMochiPortionKg (F14)', mochi.awaMochiPortionKg, 0);
check('もち awaPortionKg (G14)', mochi.awaPortionKg, 0);
check('もち seiroCount (D14)', mochi.seiroCount, 3);

console.log(`\n${passed} tests passed.`);
