/* Credit Assist – Service Worker
   Place this file at the REPO ROOT:  /service-worker.js
   It must be served from the same origin & scope as your pages.
*/

const SW_VERSION = 'v4';

// —————————————————————————————————————————————
// Basic lifecycle: take control quickly
// —————————————————————————————————————————————
self.addEventListener('install', (event) => {
  // Skip waiting so updates apply immediately after refresh
  self.skipWaiting();
  // (Optional) pre-cache could go here
});

self.addEventListener('activate', (event) => {
  // Become the active SW for all pages asap
  event.waitUntil(self.clients.claim());
});

// —————————————————————————————————————————————
// Utilities
// —————————————————————————————————————————————
function toJSONSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { body: text };
  }
}

function buildOptions(data) {
  // Choose icons you actually have in your repo
  // If you keep icons under /icons, these paths work on GitHub Pages.
  const defaultIcon  = '/icons/Notification.png';
  const defaultBadge = '/icons/Notification.png';

  return {
    body: data.body || 'New notification received.',
    icon: data.icon || defaultIcon,
    badge: data.badge || defaultBadge,
    image: data.image,             // optional large image
    tag: data.tag || 'credit-assist',
    renotify: !!data.renotify,
    requireInteraction: !!data.requireInteraction, // keep visible until user acts
    data: {
      url: data.url || '/',        // where to open on tap
      meta: data.meta || null
    },
    actions: Array.isArray(data.actions) ? data.actions : []
    // Example actions:
    // actions: [{ action: 'open', title: 'Open App' }]
  };
}

function showNotificationFromPayload(payload) {
  const title = payload.title || '📢 Credit Assist';
  const options = buildOptions(payload);
  return self.registration.showNotification(title, options);
}

// —————————————————————————————————————————————
// PUSH: show a notification (this is what makes it appear
//       in Android/iOS notification shade on supported browsers)
// —————————————————————————————————————————————
self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    // Log for debugging in DevTools > Application > Service Workers
    try {
      // Read as text first so we can log the raw body if needed
      const raw = event.data.text();
      console.log('[SW] Push received raw:', raw);
      payload = toJSONSafe(raw);
    } catch (e) {
      console.warn('[SW] Failed to parse push payload:', e);
      payload = { body: 'You have a new message.' };
    }
  } else {
    console.warn('[SW] Push event had no data.');
    payload = { body: 'You have a new message.' };
  }

  event.waitUntil(showNotificationFromPayload(payload));
});

// —————————————————————————————————————————————
// NOTIFICATION CLICK: open/focus a tab
// —————————————————————————————————————————————
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';

  event.waitUntil((async () => {
    // Reuse an existing client if one is open to the same origin
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      try {
        const url = new URL(client.url);
        if (url.origin === self.location.origin) {
          // Focus existing tab and navigate if needed
          await client.focus();
          if (targetUrl && url.pathname !== targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      } catch (_) {}
    }
    // Otherwise open a new tab
    await clients.openWindow(targetUrl);
  })());
});

// —————————————————————————————————————————————
// OPTIONAL: Local test from a page (handy for debugging)
// Post from the page: navigator.serviceWorker.controller.postMessage({type:'LOCAL_TEST', title:'Hello', body:'It works!', url:'/notifications/index.html'})
// —————————————————————————————————————————————
self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'LOCAL_TEST') {
    const payload = {
      title: msg.title || '🔧 Local SW test',
      body: msg.body || 'This is a local test notification.',
      url: msg.url || '/'
    };
    event.waitUntil(showNotificationFromPayload(payload));
  }
});

// —————————————————————————————————————————————
// OPTIONAL: Handle subscription refresh (rarely needed)
// —————————————————————————————————————————————
// Note: Re-subscribing here requires the appServerKey. If you want to
// implement it, postMessage the key from the page and store it in IDB.
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] pushsubscriptionchange:', event);
  // Intentionally no automatic re-subscribe here; your page logic already
  // handles (re)subscribe with your VAPID public key.
});
