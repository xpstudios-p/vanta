const CACHE_NAME = "weather-app-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/geo.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
];

// INSTALL
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});

// ACTIVATE
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
});

// FETCH (OFFLINE SUPPORT)
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
