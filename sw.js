/* 미어캣 가계부 service worker — offline app shell cache */
const CACHE = 'mearcat-jangbu-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './meerkat.png',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './TDTDTadakTadak/TTF/1.0.0/TDTDTadakTadak.ttf'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // runtime-cache same-origin GETs so the app keeps working offline
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
