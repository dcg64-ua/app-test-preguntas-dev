// Service worker: red primero (así siempre ves la última versión si hay conexión)
// y, sin conexión, la copia guardada.
// cache: 'no-cache' obliga a preguntar al servidor si hay versión nueva en vez de usar
// la copia que el navegador guarda ~10 min (GitHub Pages manda max-age=600).
// Producción y desarrollo comparten dominio (github.io): cada uno usa cachés con su propia ruta en el nombre
// y solo borra las suyas.
const SCOPE = new URL(self.registration.scope).pathname;
const CACHE = 'quiz-v4:' + SCOPE;
const FILES = ['./', 'index.html', 'preguntas.json', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'gato.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && (k.endsWith(':' + SCOPE) || !k.includes(':'))).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

// Avisos (Firebase Cloud Messaging): el servidor manda { notification: { title, body }, fcmOptions: { link } }
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { notification: { body: e.data && e.data.text() } }; }
  const n = d.notification || d.data || {};
  const link = (d.fcmOptions && d.fcmOptions.link) || (d.data && d.data.link) || self.registration.scope;
  e.waitUntil(self.registration.showNotification(n.title || 'Tests', { body: n.body || '', icon: 'icon-192.png', badge: 'icon-192.png', data: { link } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    const w = ws.find(c => c.url.startsWith(self.registration.scope));
    return w ? w.focus() : clients.openWindow((e.notification.data && e.notification.data.link) || self.registration.scope);
  }));
});
