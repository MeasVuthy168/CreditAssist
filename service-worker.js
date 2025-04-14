// service-worker.js
const cacheName = 'credit-assist-cache-v1';
const assets = [
  './',
  './login.html',
  './Krasar-Regular.ttf',
  './LogoAC.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
