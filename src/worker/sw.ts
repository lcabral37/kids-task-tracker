// Service Worker for Kids Task Tracker
// Using plain JavaScript with minimal TypeScript to avoid worker context issues

const CACHE_NAME = 'kids-task-tracker-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

// Install event - cache the necessary resources
self.addEventListener('install', (event: any) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache: Cache) => {
      console.log('Cache opened');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  (self as any).skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: any) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames: string[]) => {
      return Promise.all(
        cacheNames.map((cacheName: string) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  (self as any).clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event: any) => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.includes(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response: Response) => {
        // Don't cache non-200 responses or non-basic responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses
        caches.open(CACHE_NAME).then((cache: Cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse: Response | undefined) => {
          return cachedResponse || new Response('Offline - resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});
