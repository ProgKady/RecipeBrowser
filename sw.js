/* ==========================================================================
   Service Worker — TC Garments / RECETA
   الاستراتيجية:
   - الصفحات + ملفات الموقع نفسه (html/js/css/json) : Network-first مع fallback للكاش
   - الصور                                        : Cache-first
   - طلبات الـ API والخدمات الخارجية               : Network بس — ما بنكاشّها أبداً
   ========================================================================== */

const VERSION   = 'tc-v5';
const PRECACHE  = [
  './',
  './index.html',
  './index2.html',
  './offline.html',
  './core.js',
  './hrrr.png',
  './manifest.json'
];
const CODE_CACHE = 'tc-code-v5';
const IMG_CACHE  = 'tc-img-v5';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== VERSION && k !== CODE_CACHE && k !== IMG_CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;

  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  const url = new URL(req.url);

  // 1) الـ API والخدمات الخارجية: الشبكة دايماً (بدون كاش)
  if (/script\.google|googleusercontent|api\.github|raw\.githubusercontent|corsproxy|tmpfiles|cloudflare|jsdelivr/i.test(url.hostname + url.pathname)) {
    return;
  }

  // 2) الصفحات: الشبكة الأول، ولو مفيش نت → الكاش → صفحة offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => { cachePut(CODE_CACHE, req, res.clone()); return res; })
        .catch(async () => {
          const cache = await caches.match(req);
          return cache || caches.match('./offline.html') || caches.match('./index.html');
        })
    );
    return;
  }

  // 3) الصور: Cache-first
  if (req.destination === 'image') {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) cachePut(IMG_CACHE, req, res.clone());
        return res;
      }).catch(() => caches.match('./hrrr.png')))
    );
    return;
  }

  // 4) ملفات الموقع نفسه (js/css/json): الشبكة الأول عشان التحديثات توصل فوراً
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => { if (res.ok) cachePut(CODE_CACHE, req, res.clone()); return res; })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 5) باقي الأصول الخارجية: Cache-first مع تحديث خلفي
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req)
        .then(res => {
          if (res.ok) cachePut(CODE_CACHE, req, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});

async function cachePut(cacheName, req, res) {
  try {
    if (res.type === 'opaque' || res.type === 'opaqueredirect') return;
    const c = await caches.open(cacheName);
    await c.put(req, res);
  } catch (err) { /* ignore */ }
}
