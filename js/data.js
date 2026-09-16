// 商品マスタのデフォルトデータ（元エクセル「商品一覧」シート D2:E12 / G2:H4 を移植）。
// マスタを変更する場合は、このファイルをGitHub上で直接編集してください
// （アプリ内に編集UIはありません）。
// name: 商品名 / weight: 内容量(g) / note: 補足（任意）

export const PRODUCTS = {
  // 白もち・お供えなど
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
  // 粟もち
  awamochi: [
    { name: '粟もち（2升）', weight: 2700 },
    { name: '粟もち（1升）', weight: 1350 },
    { name: '粟もち（6切）', weight: 450 },
  ],
};
