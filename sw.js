// PASO service worker: lets the app open with no connection and serves downloaded trips (map tiles, photos,
// "Learn more" texts) from the "paso-offline-v1" cache when the network fails. Upload next to index.html.
const SHELL = "paso-shell-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.add("./index.html")).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // tester answers and other sends always go to the network
  if (req.mode === "navigate") { // the app page: newest when online, saved copy when offline
    e.respondWith(fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(SHELL).then((c) => c.put("./index.html", copy)); } return r; })
      .catch(() => caches.match("./index.html", { cacheName: SHELL })));
    return;
  }
  e.respondWith(fetch(req).catch(() => caches.match(req.url, { ignoreVary: true }).then((r) => r || Response.error())));
});
