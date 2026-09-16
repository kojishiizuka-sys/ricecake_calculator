// エクセル「赤飯」「もち」「原材料算出」シートの計算式を移植したモジュール。
// すべて純粋関数として実装し、UI から独立してテストできるようにする。

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
 * 赤飯シートの計算（B11, B13, C13, E13, H12, H13 に相当）
 * @param {{weight:number, qty:number}[]} items
 */
export function calcSekihan(items) {
  const totalKg = sumAmountKg(items); // B11 出来上がり必要量
  const riceKg = excelRoundUp((totalKg * 1000) / 1.9, 0) / 1000; // B13 必要なもち米の量
  const sasageG = excelRoundUp(((totalKg * 1000) / 1.9) * 0.07, 0); // C13 ささげの量
  const seiroCount = riceKg > 0 ? excelRoundUp(riceKg / 3.9, 0) : 0; // E13 せいろ数
  const perSeiroRiceKg = seiroCount > 0 ? excelRound(riceKg / seiroCount, 2) : 0; // H12
  const perSeiroSasageG = seiroCount > 0 ? excelRound(sasageG / seiroCount, 0) : 0; // H13

  return { totalKg, riceKg, sasageG, seiroCount, perSeiroRiceKg, perSeiroSasageG };
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

/**
 * 原材料算出シートの計算（B5, B6, B7, B8 に相当）
 * @param {number} riceKg もち米の量(kg)
 */
export function calcSekihanIngredients(riceKg) {
  if (riceKg === '' || riceKg === null || riceKg === undefined || Number.isNaN(Number(riceKg))) {
    return { redWaterG: '', waterG: '', saltG: '', sasageG: '' };
  }
  const kg = Number(riceKg);
  return {
    redWaterG: excelRound(kg * 300, -1),
    waterG: excelRound(kg * 900, -1),
    saltG: excelRound(kg * 12.5, 0),
    sasageG: excelRound(kg * 70, 0),
  };
}
