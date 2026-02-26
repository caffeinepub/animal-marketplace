const CACHE_NAME = "pashu-mandi-v3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Origins that must NEVER be intercepted — Internet Identity and ICP infrastructure
const BYPASS_ORIGINS = [
  "identity.ic0.app",
  "identity.internetcomputer.org",
  "ic0.app",
  "icp0.io",
  "internetcomputer.org",
  "raw.ic0.app",
  "raw.icp0.io",
];

// Check if a URL should bypass the service worker entirely
function shouldBypass(url) {
  try {
    const parsed = new URL(url);
    // Bypass all non-http(s) schemes
    if (!parsed.protocol.startsWith("http")) return true;
    // Bypass any ICP/II origin
    for (const origin of BYPASS_ORIGINS) {
      if (parsed.hostname === origin || parsed.hostname.endsWith("." + origin)) {
        return true;
      }
    }
    // Bypass canister API calls (query/update endpoints)
    if (parsed.pathname.startsWith("/api/v2/")) return true;
    if (parsed.pathname.startsWith("/api/v3/")) return true;
    return false;
  } catch {
    return true;
  }
}

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: smart routing strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // 1. Always bypass Internet Identity, ICP API calls, and non-GET requests
  if (shouldBypass(url) || request.method !== "GET") {
    return; // Let the browser handle it natively
  }

  // 2. Navigation requests (HTML pages / deep links) — network-first with app-shell fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a fresh copy of the response
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Offline fallback: serve the cached app shell
          caches.match("/index.html").then(
            (cached) =>
              cached ||
              new Response("Offline — please check your connection.", {
                status: 503,
                headers: { "Content-Type": "text/plain" },
              })
          )
        )
    );
    return;
  }

  // 3. Static assets — cache-first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Return a minimal offline placeholder for images
          if (request.destination === "image") {
            return new Response("", {
              status: 200,
              headers: { "Content-Type": "image/svg+xml" },
            });
          }
          return new Response("", { status: 503 });
        });
    })
  );
});
