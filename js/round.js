// Excel の ROUND / ROUNDUP を JavaScript の浮動小数点誤差に強い形で再現する。
// 例: ROUND(1200, -1) -> 1200 / ROUNDUP(8242.10..., 0) -> 8243

function cleanFloat(n) {
  // 15.660000000000002 のような誤差を除去する
  return parseFloat(n.toPrecision(12));
}

// Excel ROUND: 四捨五入（0から離れる方向）。digits は小数桁数（負値可）。
export function excelRound(value, digits = 0) {
  if (value === '' || value === null || value === undefined || Number.isNaN(value)) return '';
  const factor = Math.pow(10, digits);
  const scaled = cleanFloat(value * factor);
  const rounded = Math.sign(scaled) * Math.round(Math.abs(scaled));
  return cleanFloat(rounded / factor);
}

// Excel ROUNDUP: 切り上げ（0から離れる方向）。digits は小数桁数。
export function excelRoundUp(value, digits = 0) {
  if (value === '' || value === null || value === undefined || Number.isNaN(value)) return '';
  const factor = Math.pow(10, digits);
  const scaled = cleanFloat(value * factor);
  const rounded = Math.sign(scaled) * Math.ceil(Math.abs(scaled));
  return cleanFloat(rounded / factor);
}
