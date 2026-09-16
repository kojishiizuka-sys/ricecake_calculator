// エクセル「もち」シートの計算式を移植したモジュール。
// 純粋関数として実装し、UI から独立してテストできるようにする。

import { excelRound, excelRoundUp } from './round.js';

function sumAmountKg(items) {
  // items: [{ weight: g, qty: 数量 }]
  const totalG = items.reduce((acc, it) => {
    const w = Number(it.weight) || 0;
    const q = Number(it.qty) || 0;
    return acc + w * q;
  }, 0);
  return totalG / 1000;
}

/**
 * もちシートの計算（B12, B14, F12, F14, G14, D14 に相当）
 * @param {{weight:number, qty:number}[]} whiteItems 白もち系の明細
 * @param {{weight:number, qty:number}[]} awaItems 粟もち系の明細
 * @param {{awaRatio:number, mochiRatio:number}} ratio あわ/もち比率（既定 0.8 : 1）
 */
export function calcMochi(whiteItems, awaItems, ratio = { awaRatio: 0.8, mochiRatio: 1 }) {
  const whiteTotalKg = sumAmountKg(whiteItems); // B12
  const awaTotalKg = sumAmountKg(awaItems); // F12
  const { awaRatio, mochiRatio } = ratio;
  const ratioSum = awaRatio + mochiRatio;

  const whiteRiceKg = excelRoundUp((whiteTotalKg * 1000) / 1.4, 0) / 1000; // B14

  const awaBaseKg = excelRoundUp((awaTotalKg * 1000) / 1.5, 0) / 1000;
  const awaMochiPortionKg = ratioSum > 0 ? awaBaseKg * (mochiRatio / ratioSum) : 0; // F14 もち米量(粟もち用)
  const awaPortionKg = ratioSum > 0 ? awaBaseKg * (awaRatio / ratioSum) : 0; // G14 あわ量

  const whiteSeiroCount = whiteRiceKg > 0 ? excelRoundUp(whiteRiceKg / 3.8, 0) : 0;
  const awaSeiroCount = awaMochiPortionKg > 0 ? excelRoundUp(awaMochiPortionKg / 3.8, 0) : 0;
  const seiroCount = whiteSeiroCount + awaSeiroCount; // D14 せいろ数

  const perSeiroWhiteRiceKg =
    whiteSeiroCount > 0 ? excelRound(whiteRiceKg / whiteSeiroCount, 2) : 0;
  const perSeiroAwaMochiKg =
    awaSeiroCount > 0 ? excelRound(awaMochiPortionKg / awaSeiroCount, 2) : 0;
  const perSeiroAwaG =
    awaSeiroCount > 0 ? excelRound((awaPortionKg * 1000) / awaSeiroCount, 0) : 0;

  return {
    whiteTotalKg,
    awaTotalKg,
    whiteRiceKg,
    awaMochiPortionKg,
    awaPortionKg,
    whiteSeiroCount,
    awaSeiroCount,
    seiroCount,
    perSeiroWhiteRiceKg,
    perSeiroAwaMochiKg,
    perSeiroAwaG,
  };
}
