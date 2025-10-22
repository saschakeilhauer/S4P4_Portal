/* ============================================================
   FILE: script.js
   PURPOSE: Theme-Steuerung (Auto/Light/Dark) + kleine UI-Helfer
   NOTES:
     - Speichert Modus in localStorage ('s4-theme-mode')
     - Setzt data-theme="light|dark" auf <html> (für theme.css)
   ============================================================ */

(function () {
  const STORE_KEY = 's4-theme-mode';

  // Aktuellen Systemmodus ermitteln
  const prefersDark = window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;

  // gespeicherten Modus laden oder 'auto'
  let mode = localStorage.getItem(STORE_KEY) || 'auto';

  // data-theme anwenden
  function applyMode(m) {
    const eff = (m === 'auto') ? (prefersDark ? 'dark' : 'light') : m;
    document.documentElement.setAttribute('data-theme', eff);
    // Toggle-Buttons optisch updaten
    document.querySelectorAll('#themeToggle button')
      .forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  }

  // Initial
  applyMode(mode);

  // Toggle-Handler
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-mode]');
      if (!btn) return;
      mode = btn.dataset.mode;               // 'auto' | 'light' | 'dark'
      localStorage.setItem(STORE_KEY, mode);
      applyMode(mode);
    });
  }

  // Reagieren auf Systemwechsel (nur wenn 'auto')
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    // Safari < 14 hat addListener, moderne Browser addEventListener
    const handler = () => {
      if ((localStorage.getItem(STORE_KEY) || 'auto') === 'auto') {
        applyMode('auto');
      }
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  // „Nach oben“-Button: weich scrollen (nur Optik)
  document.querySelectorAll('a[href="#top"], .fab-top').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // (Optional) Sticky-Table-Header fix auf iOS: nichts weiter nötig hier.
})();
