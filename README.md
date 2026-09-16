# もち必要原材料算出

添付のExcelファイル「もち」シートの算出ロジックを移植した、ビルド不要の静的PWA
（Progressive Web App）です。

ビルドツールやフレームワークは使わず、素の HTML / CSS / JavaScript（ESモジュール）だけで
構成しているので、Node.js のインストールも不要で動かせます（開発時の簡易サーバー起動にのみ
Python か Node があると便利、という程度です）。

## 機能

- 白もち・なまこ・お供え等の商品と数量、粟もちの商品と数量、あわ／もち比率を入力すると、
  出来上がり必要量・必要もち米量・必要あわ量・せいろ数を自動計算（元シート「もち」を移植）
- 必要もち米量は四捨五入で小数第2位までの表示
- 入力内容はすべて端末の `localStorage` に自動保存されます（サーバー通信なし）
- Service Worker によりオフラインでも起動・利用可能
- 「ホーム画面に追加」でアプリのようにインストール可能（PWA）

計算式は `js/calc.js` に集約し、元Excelから抽出した実測値との一致を
`tests/calc.test.mjs` で検証済みです。

## 商品マスタの変更方法

商品名・内容量（g）のマスタは `js/data.js` に直接定義されています。アプリ内に編集画面は
ないため、商品の追加・削除・内容量の変更が必要な場合は、このリポジトリの `js/data.js` を
直接編集してコミット・プッシュしてください。

```js
export const PRODUCTS = {
  mochi: [
    { name: '白のしもち（2升）', weight: 2700 },
    // ...
  ],
  awamochi: [
    { name: '粟もち（2升）', weight: 2700 },
    // ...
  ],
};
```

GitHub Pages で公開している場合、このファイルをpushすると自動的に反映されます。

## 環境構築（ローカルで試す）

このアプリはビルド不要の静的ファイルです。Service Worker はセキュリティ上の理由で
`file://` では動作しないため、ローカルでも簡易的な HTTP サーバー経由で開いてください。
（`localhost` は特別扱いされるので、HTTPS化は不要です。）

どちらか使える方でOKです。

```bash
# Python3 がある場合
cd ricecake_calculator
python3 -m http.server 8080

# Node.js がある場合
cd ricecake_calculator
npx serve . -l 8080
```

起動後、ブラウザで `http://localhost:8080/index.html` を開いてください。

## 本番公開

GitHub Pages / Netlify / Vercel などの静的ホスティングに、リポジトリ直下
（`index.html` のある階層）をそのまま公開すれば動作します。

## 計算ロジックの検証

```bash
node tests/calc.test.mjs
```

Excel側の実測値（白のしもち2700g×1＋お供え6寸2700g×2＋お供え5寸1800g×2 →
出来上がり必要量11.7kg／必要もち米8.358kg／せいろ数3）と完全一致することを確認済みです。

## ディレクトリ構成

```
index.html            画面のエントリポイント
css/style.css          スタイル
js/round.js             Excel の ROUND / ROUNDUP を再現する丸め関数
js/calc.js               もちの計算ロジック本体
js/data.js               商品マスタ（Excel「商品一覧」シート D/E, G/H 列を移植）
js/store.js              localStorage への入力内容の保存・読み込み
js/ui.js                  画面描画
js/dom.js                 DOM生成の小さなヘルパー
js/app.js                 起動処理・Service Worker登録
js/install.js             「ホーム画面に追加」ボタンの制御
manifest.webmanifest    PWAマニフェスト
sw.js                    Service Worker（オフラインキャッシュ）
icons/                  アプリアイコン
tests/calc.test.mjs      計算ロジックの検証テスト
```

## 元Excelとの対応・注意点

- せいろ数などの丸め方は Excel の `ROUND` / `ROUNDUP` の挙動（0から離れる方向への丸め）を
  忠実に再現しています。
- あわ／もち比率（元シートの `H12=0.8`, `I12=1`）は画面内で自由に変更できます。
- 必要もち米量の表示のみ、内部計算値（3桁精度）とは別に、画面表示時に四捨五入で
  小数第2位までに丸めています。
