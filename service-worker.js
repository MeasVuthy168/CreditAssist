/* Credit Assist – Service Worker (scope must be /CreditAssist/) */
const SW_VERSION = 'v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Build options helper
function buildOptions(data) {
  const defaultIcon  = '/CreditAssist/icons/Notification.png';
  const defaultBadge = '/CreditAssist/icons/Notification.png';
  return {
    body:  data.body || 'You have a new message.',
    icon:  data.icon || defaultIcon,
    badge: data.badge || defaultBadge,
    data:  { url: data.url || 'https://measvuthy168.github.io/CreditAssist/' },
    requireInteraction: !!data.requireInteraction,
  };
}

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}
  const title = data.title || 'Credit Assist';
  const options = buildOptions(data);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://measvuthy168.github.io/CreditAssist/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const already = list.find(c => c.url.startsWith(url));
      return already ? already.focus() : clients.openWindow(url);
    })
  );
});
