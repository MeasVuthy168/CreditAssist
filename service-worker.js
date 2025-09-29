/* ===== service-worker.js ===== */

const cacheName = 'credit-assist-cache-v3';
const assets = [
  './','./index.html','./login.html','./manifest.json',
  './Krasar-Regular.ttf','./LogoAC.png','./LogoAC2.PNG',
  './icons/icon-192.PNG','./icons/icon-512.PNG'
];

/* --- Install / Activate / Fetch (unchanged basic offline) --- */
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(cacheName).then(c=>c.addAll(assets)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==cacheName?caches.delete(k):null))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});

/* ---------------- Debug helpers ---------------- */
function postLog(...args){
  try {
    const ch = new BroadcastChannel('push-logs');
    const line = args.map(a => typeof a==='object' ? JSON.stringify(a) : String(a)).join(' ');
    ch.postMessage(line);
  } catch(_) {}
}
function now(){
  const d = new Date();
  const pad = n => String(n).padStart(2,'0');
  return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
}

/* ---------------- Push handler (VERBOSE) ---------------- */
self.addEventListener('push', event => {
  postLog(`${now()} 📬 [SW] push fired (hasData=${!!event.data})`);

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title:'📣 Credit Assist', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '📣 Credit Assist';
  const options = {
    body: data.body || 'មានការអាប់ដេតថ្មី',
    icon: '/icons/icon-192.PNG',
    badge: '/icons/icon-192.PNG',
    data: { url: data.url || '/index.html' },
    tag: 'credit-assist',
    renotify: true,
    requireInteraction: true,
    vibrate: [120,60,120]
  };

  event.waitUntil((async () => {
    try {
      postLog(`${now()} 🔔 [SW] showNotification →`, {title, body:options.body});
      await self.registration.showNotification(title, options);
      postLog(`${now()} ✅ [SW] showNotification resolved`);
    } catch (err) {
      postLog(`${now()} ❌ [SW] showNotification ERROR`, err && err.message || String(err));
    }
  })());
});

/* Click → focus or open */
self.addEventListener('notificationclick', event => {
  postLog(`${now()} 👆 [SW] notificationclick`);
  event.notification.close();
  const target = event.notification?.data?.url || '/index.html';
  event.waitUntil((async ()=>{
    const all = await clients.matchAll({ type:'window', includeUncontrolled:true });
    for (const c of all){
      if (c.url.includes(new URL(target, self.location.origin).pathname)) {
        postLog(`${now()} ↪️ [SW] focus existing`);
        return c.focus();
      }
    }
    if (clients.openWindow) {
      postLog(`${now()} ➕ [SW] openWindow ${target}`);
      return clients.openWindow(target);
    }
  })());
});

/* Local test (no server) */
self.addEventListener('message', e=>{
  if (e.data === 'LOCAL_TEST_PUSH') {
    postLog(`${now()} 🧪 [SW] LOCAL_TEST_PUSH`);
    self.registration.showNotification('🔔 Local test', {
      body:'This proves SW can show notifications.',
      icon:'/icons/icon-192.PNG', badge:'/icons/icon-192.PNG',
      data:{url:'/index.html'}
    });
  }
});
