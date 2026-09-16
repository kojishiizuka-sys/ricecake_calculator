// アプリシェルをキャッシュしてオフラインでも動作させるサービスワーカー。
const CACHE_VERSION = 'ricecake-v2';
const SCOPE_URL = new URL(self.registration.scope);

const APP_SHELL = [
  '',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/ui.js',
  'js/dom.js',
  'js/calc.js',
  'js/round.js',
  'js/data.js',
  'js/store.js',
  'js/install.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
].map((path) => new URL(path, SCOPE_URL).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached || caches.match(new URL('index.html', SCOPE_URL).toString()));
      return cached || network;
    })
  );
});
