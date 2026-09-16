// 元エクセルファイルから抽出した実測値との比較テスト。
// 実行: node tests/calc.test.mjs
import assert from 'node:assert/strict';
import { calcSekihan, calcMochi, calcSekihanIngredients } from '../js/calc.js';

let passed = 0;
function check(label, actual, expected) {
  assert.deepEqual(actual, expected, `${label}: got ${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
  passed++;
  console.log(`OK: ${label}`);
}

// 赤飯シート: お赤飯（通常パック,300g）x20 + 230gパック x42
const sekihan = calcSekihan([
  { weight: 300, qty: 20 },
  { weight: 230, qty: 42 },
  { weight: 1000, qty: 0 },
  { weight: 280, qty: 0 },
]);
check('赤飯 totalKg (B11)', sekihan.totalKg, 15.66);
check('赤飯 riceKg (B13)', sekihan.riceKg, 8.243);
check('赤飯 sasageG (C13)', sekihan.sasageG, 577);
check('赤飯 seiroCount (E13)', sekihan.seiroCount, 3);
check('赤飯 perSeiroRiceKg (H12)', sekihan.perSeiroRiceKg, 2.75);
check('赤飯 perSeiroSasageG (H13)', sekihan.perSeiroSasageG, 192);

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

// 原材料算出: もち米4kg
const ingredients = calcSekihanIngredients(4);
check('原材料 redWaterG (B5)', ingredients.redWaterG, 1200);
check('原材料 waterG (B6)', ingredients.waterG, 3600);
check('原材料 saltG (B7)', ingredients.saltG, 50);
check('原材料 sasageG (B8)', ingredients.sasageG, 280);

console.log(`\n${passed} tests passed.`);
