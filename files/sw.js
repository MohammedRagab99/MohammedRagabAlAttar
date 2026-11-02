// Bump CACHE_VERSION only if you change the list below; HTML/CSS/JS update automatically.
const CACHE_VERSION = 'ragabverse-v2';
const OFFLINE_FILES = ['/', '/index.html', '/cv.html', '/style.css', '/script.js', '/data.js', '/cv.js', '/enhancements.css', '/enhancements.js', '/favicon.svg'];

self.addEventListener('install', event => {
  // Cache each file separately so one missing file doesn't break the whole install
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      Promise.all(OFFLINE_FILES.map(url => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first: visitors always get your latest site; cache is only the offline fallback.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('/index.html')))
  );
});
