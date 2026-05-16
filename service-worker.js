const CACHE_NAME = "my-child-game-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./css/animations.css",
  "./js/app.js",
  "./js/game-state.js",
  "./js/players.js",
  "./js/dice.js",
  "./js/board.js",
  "./js/storage.js",
  "./js/ui.js",
  "./images/avatars/t-avatar-1.png",
  "./images/avatars/t-avatar-2.png",
  "./images/avatars/t-avatar-3.png",
  "./images/avatars/t-avatar-4.png",
  "./images/avatars/t-avatar-5.png",
  "./images/avatars/t-avatar-6.png",
  "./images/avatars/m-avatar-1.png",
  "./images/avatars/m-avatar-2.png",
  "./images/avatars/m-avatar-3.png",
  "./images/avatars/m-avatar-4.png",
  "./images/avatars/p-avatar-1.png",
  "./images/avatars/p-avatar-2.png",
  "./images/avatars/p-avatar-3.png",
  "./images/avatars/p-avatar-4.png",
  "./images/avatars/g-avatar-1.png",
  "./images/avatars/g-avatar-2.png",
  "./images/avatars/g-avatar-3.png",
  "./images/avatars/g-avatar-4.png",
  "./images/maps/sunny-trail.png",
  "./images/maps/moon-park.png",
  "./images/preview-maps/sunny-trail.png",
  "./images/preview-maps/moon-park.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
