/* ==========================================================================
   Service Worker — TC Garments / RECETA
   الاستراتيجية:
   - الصفحات (HTML)   : Network-first مع fallback للكاش (وضع offline)
   - الأصول الساكنة   : Cache-first مع تحديث في الخلفية
   - طلبات الـ API    : Network بس — ما بنكاشّها أبداً (عشان الداتا تفضل سليمة)
   ========================================================================== */

const VERSION   = 'tc-v7';
const PRECACHE  = [
  './',
  './index.html',
  './index2.html',
  './offline.html',
  './core.js',
  './hrrr.png',
  './manifest.json'
];
const CODE_CACHE = 'tc-code-v7';
const IMG_CACHE  = 'tc-img-v7';

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

  if (req.method !== 'GET') return;                 // مبنخزّنش POST/PUT
  if (!req.url.startsWith('http')) return;           // chrome-extension://

  const url = new URL(req.url);

  // 1) طلبات الـ API والخدمات الخارجية: الشبكة دايماً (بدون كاش)
  if (/script\.google|googleusercontent|api\.github|raw\.githubusercontent|corsproxy|tmpfiles|cloudflare|jsdelivr/i.test(url.hostname + url.pathname)) {
    return; // نسيبه للمتصفح مباشرة
  }

  // 2) الصفحات: الشبكة الأول (عشان ماتفتحش نسخة قديمة بعد أي تعديل)،
  //    ولو مفيش نت بنرجع للكاش
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
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

  // 4) باقي الأصول (core.js manifest …): الشبكة الأول مع fallback للكاش.
  //    الـ assets بتتغير مع كل تحديث، فالكاش القديم لازم ما يغلبش الشبكة.
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) cachePut(CODE_CACHE, req, res.clone());
        return res;
      })
      .catch(() => caches.match(req))
  );
});

async function cachePut(cacheName, req, res) {
  try {
    if (res.type === 'opaque' || res.type === 'opaqueredirect') return;
    const c = await caches.open(cacheName);
    await c.put(req, res);
  } catch (err) { /* ignore */ }
}
