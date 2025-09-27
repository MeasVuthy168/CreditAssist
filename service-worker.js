const cacheName = 'credit-assist-cache-v1';
const assets = [
  './',
  './login.html',
  './Krasar-Regular.ttf',
  './LogoAC.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install and cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

// Serve cached assets when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// ✅ Handle push events
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "📢 Credit Assist", body: event.data.text() };
    }
  }

  const title = data.title || "📢 Credit Assist";
  const options = {
    body: data.body || "You have a new notification.",
    icon: "icons/icon-192.png",   // from your manifest
    badge: "icons/icon-192.png",  // small badge icon
    data: { url: data.url || "./index.html" }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ✅ Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data.url || './index.html';

  // Focus if already open, otherwise open new
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
