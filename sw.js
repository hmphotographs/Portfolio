const CACHE_NAME = "hm-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/portfolio.html",
  "/style.css",
  "/main.js"
];

// install → cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// fetch → serve from cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
