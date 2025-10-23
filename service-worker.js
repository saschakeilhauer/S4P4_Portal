/* S4P4 PWA Service Worker – v1
   Strategie:
   - HTML (Navigation): network-first, fallback Cache/Index
   - Assets (CSS/JS/Icons): cache-first, bei Hit auch nachcachen
   Cache-Version bei Änderungen erhöhen (z.B. v2)
*/
const CACHE = 's4p4-cache-v1.1';
const ASSETS = [
  './',
  'index.html',
  's4_blueprint.html',
  's4_tool.html',
  'seiten_info_tools4.html',
  'theme.css',
  'style.css',
  'layout.css',
  'script.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-512-maskable.png',
  'favicon.ico'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isHTML = req.mode === 'navigate' ||
                 (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));

  if (isHTML) {
    // Network-first für Seiten
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() =>
        caches.match(req).then(r => r || caches.match('index.html'))
      )
    );
    return;
  }

  // Cache-first für Assets
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) {
        // im Hintergrund aktualisieren
        fetch(req).then(res => caches.open(CACHE).then(c => c.put(req, res)));
        return hit;
      }
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      });
    })
  );
});
