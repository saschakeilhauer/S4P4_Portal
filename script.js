/* ============================================================
   FILE: script.js
   VERSION: 2.1
   PURPOSE: Theme-Steuerung (Auto/Light/Dark) + PWA-SW + UI-Helfer
   ============================================================ */

(function () {
  const STORE_KEY = 's4-theme-mode';
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  let mode = localStorage.getItem(STORE_KEY) || 'auto';

  function applyMode(m) {
    const eff = (m === 'auto') ? (prefersDark ? 'dark' : 'light') : m;
    document.documentElement.setAttribute('data-theme', eff);
    document.querySelectorAll('#themeToggle button')
      .forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  }

  applyMode(mode);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-mode]');
      if (!btn) return;
      mode = btn.dataset.mode;
      localStorage.setItem(STORE_KEY, mode);
      applyMode(mode);
    });
  }

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if ((localStorage.getItem(STORE_KEY) || 'auto') === 'auto') {
        applyMode('auto');
      }
    };
    mq.addEventListener?.('change', handler) || mq.addListener?.(handler);
  }

  document.querySelectorAll('a[href="#top"], .fab-top').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   PWA: Service Worker Registrierung + Versionswechsel-Erkennung
   ============================================================ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker registriert');

        // Wenn neuer Worker aktiv wird → Seite neu laden
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🆕 Neuer SW aktiv – Seite wird neu geladen');
          window.location.reload();
        });

        // Optional: Force-Aktivierung neuer SW direkt nach Install
        if (reg.waiting) {
          reg.waiting.postMessage('SKIP_WAITING');
        }

        // Sobald neuer SW installiert ist → aktivieren
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage('SKIP_WAITING');
              }
            });
          }
        });
      })
      .catch(err => console.warn('⚠️ Service Worker Fehler:', err));
  });
}

