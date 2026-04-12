const CACHE_NAME = 'bcs-planner-v2';
const ASSETS = [
    './',
    './index.html',
    './css/base.css',
    './css/layout.css',
    './css/animations.css',
    './css/components.css',
    './css/notes.css',
    './js/data.js',
    './js/utils.js',
    './js/storage.js',
    './js/app.js',
    './js/countdown.js',
    './js/charts.js',
    './js/targets.js',
    './js/timetable.js',
    './js/notes.js',
    './js/effects.js',
    './assets/icon.png'
];

// Install Event
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            );
        })
    );
});

// Fetch Event (Offline First with Stale-While-Revalidate for CDNs)
self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('cdn.jsdelivr.net')) {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                const fetchPromise = fetch(e.request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, networkResponse.clone());
                    });
                    return networkResponse;
                });
                return cachedResponse || fetchPromise;
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then((res) => {
                return res || fetch(e.request);
            })
        );
    }
});
