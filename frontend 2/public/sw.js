const CACHE_NAME = 'mars-shop-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/mars_shop logo.png',
  '/placeholder.svg',
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Lobster:wght@400&family=Pacifico&display=swap'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 