/* Credit Assist – Service Worker
   Place this file at: /service-worker.js (REPO ROOT)
   It must be served from the same origin & scope as your pages.
*/
const SW_VERSION = 'v5';

/* ---------------- Lifecycle: take control quickly ---------------- */
self.addEventListener('install', (event) => {
  // Skip waiting so updates apply immediately after one reload
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Become active SW for all clients ASAP
  event.waitUntil(self.clients.claim());
});

/* ---------------- Utilities ---------------- */
function toJSONSafe(text) {
  try { return JSON.parse(text); }
  catch { return { body: text }; }
}

function buildOptions(data) {
  // Update these to icons that exist in your repo
  const defaultIcon  = '/icons/Notification.png';
  const defaultBadge = '/icons/Notification.png';

  return {
    body: data.body || 'ទិន្នន័យថ្មីបានបញ្ចូល',
    icon: data.icon || defaultIcon,
    badge: data.badge || defaultBadge,
    data: { url: data.url || '/CreditAssist/index.html' },
    renotify: false,
    requireInteraction: false,
  };
}

/* ---------------- Push handling ---------------- */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = toJSONSafe(event.data?.text() || '{}');
  }

  const title = data.title || 'Credit Assist';
  const options = buildOptions(data);

  event.waitUntil(self.registration.showNotification(title, options));
});

/* ---------------- Click handling ---------------- */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/CreditAssist/index.html';

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Focus an existing tab if one is already open
    for (const client of allClients) {
      const same = new URL(client.url).pathname === new URL(url, self.location.origin).pathname;
      if (same && 'focus' in client) return client.focus();
    }
    // Otherwise open a new one
    return clients.openWindow(url);
  })());
});

/* ---------------- Fallback fetch (optional) ---------------- */
// You can add caching strategies here if you want offline support.
