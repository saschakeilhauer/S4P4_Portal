/* S4P4 PWA Service Worker – v2
   Strategie:
   - HTML: network-first, fallback Cache/Index
   - Assets: cache-first + Hintergrund-Update
   - Update-Logik: neue Version sofort aktiv + Client-Benachrichtigung
*/

const CACHE = 's4p4-cache-v1.0';
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
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) {
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

// Neue Clients benachrichtigen, wenn ein neuer SW aktiv ist
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('controllerchange', () => {
  console.log('🆕 Neuer Service Worker aktiv');
});
