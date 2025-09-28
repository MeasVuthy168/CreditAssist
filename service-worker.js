// /service-worker.js
const cacheName = 'credit-assist-cache-v2';
const assets = [
  './',
  './login.html',
  './index.html',
  './manifest.json',
  './Krasar-Regular.ttf',
  './LogoAC.png',
  './LogoAC2.PNG',
  './icons/icon-192.PNG',  // match your file case
  './icons/icon-512.PNG'
];

// Install & cache
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
  self.skipWaiting();
});

// Activate & cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== cacheName ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Offline-first fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// Handle pushes
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e){}
  const title = data.title || '📢 Credit Assist';
  const options = {
    body: data.body || 'មានការអាប់ដេតថ្មី',
    icon: 'icons/icon-192.PNG',
    badge: 'icons/icon-192.PNG',
    data: { url: data.url || './index.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Open/focus app on click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || './index.html';
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes(target) && 'focus' in c) return c.focus();
    }
    if (clients.openWindow) return clients.openWindow(target);
  })());
});
