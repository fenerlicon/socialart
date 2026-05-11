const CACHE_NAME = 'socialart-v1';

// Install event
self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (_event) => {
  _event.waitUntil(self.clients.claim());
});

// Fetch event (Network first)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
