const CACHE_NAME = "skycast-fun-v1";
const FILES_TO_CACHE = ["/", "/index.html", "/css/style.css", "/js/app.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
