// 元エクセル「商品一覧」シートのデフォルトデータ。
// name: 商品名 / weight: 内容量(g) / note: 補足（任意）

export const DEFAULT_PRODUCTS = {
  // 赤飯シート用（商品一覧!A2:B21）
  sekihan: [
    { name: 'お赤飯（通常パック）', weight: 300 },
    { name: '7寸折箱', weight: 300 },
    { name: '8寸紙折箱', weight: 420 },
    { name: '3合赤箱', weight: 600 },
    { name: '5合赤箱', weight: 900 },
    { name: '8合赤箱', weight: 1200 },
    { name: '1升赤箱', weight: 1600 },
    { name: '1kg 赤飯', weight: 1000 },
    { name: '特注500g', weight: 500 },
    { name: '7寸折箱（特注370g）', weight: 370 },
    { name: '280gパック（東片町下組）', weight: 280 },
    { name: 'おにぎり', weight: 100 },
    { name: '270gパック', weight: 270 },
    { name: '250gパック', weight: 250 },
    { name: '200gパック', weight: 200 },
    { name: '150gパック', weight: 150 },
    { name: '220gパック', weight: 220 },
    { name: '230gパック', weight: 230 },
    { name: '245gパック', weight: 245 },
    { name: '260gパック', weight: 260 },
  ],
  // もちシート 白もち系用（商品一覧!D2:E12）
  mochi: [
    { name: '白のしもち（2升）', weight: 2700 },
    { name: '白のしもち（1升）', weight: 1350 },
    { name: 'なまこ餅', weight: 920, note: '※具を80g入れる' },
    { name: 'お供え1寸', weight: 180 },
    { name: 'お供え2寸', weight: 360 },
    { name: 'お供え3寸', weight: 540 },
    { name: 'お供え5合', weight: 900 },
    { name: 'お供え5寸', weight: 1800 },
    { name: 'お供え6寸', weight: 2700 },
    { name: 'お供え7寸', weight: 5400 },
    { name: '1升餅', weight: 1400 },
  ],
  // もちシート 粟もち系用（商品一覧!G2:H4）
  awamochi: [
    { name: '粟もち（2升）', weight: 2700 },
    { name: '粟もち（1升）', weight: 1350 },
    { name: '粟もち（6切）', weight: 450 },
  ],
};
