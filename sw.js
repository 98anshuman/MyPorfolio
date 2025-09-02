const VERSION = '2.0.1';
const STATIC_CACHE = 'static-v2.0';
const DYNAMIC_CACHE = 'dynamic-v2.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './data-manager.js',
  './no_bg.png',
  './Anshuman_Resume.pdf',
  './data/portfolio-data.json',
  './manifest.json'
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css?family=Roboto+Mono:400,700|Roboto:400,700&display=swap',
  'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(DYNAMIC_CACHE).then(cache => cache.addAll(EXTERNAL_ASSETS))
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle static assets
  if (STATIC_ASSETS.some(asset => request.url.includes(asset.replace('./', '')))) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          const responseClone = fetchResponse.clone();
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }
  
  // Handle external assets
  if (EXTERNAL_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          const responseClone = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }
  
  // Default: network first, cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});