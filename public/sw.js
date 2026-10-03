// Basic Service Worker for Offline PWA Capabilities
const CACHE_NAME = 'initiatives-app-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle navigation requests and never fail if cache misses
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(event.request);
        return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
      })
    );
  }
});

