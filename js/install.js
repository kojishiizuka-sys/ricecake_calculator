// beforeinstallprompt を捕捉し、「ホーム画面に追加」ボタンを表示する。
export function registerInstallPrompt() {
  const btn = document.getElementById('install-btn');
  if (!btn) return;
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btn.hidden = false;
  });

  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    btn.hidden = true;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    btn.hidden = true;
    deferredPrompt = null;
  });
}
