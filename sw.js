const CACHE_NAME = 'bcs-planner-v1';
const ASSETS = [
    './',
    './index.html',
    './css/base.css',
    './css/layout.css',
    './css/components.css',
    './js/data.js',
    './js/utils.js',
    './js/app.js',
    './js/countdown.js',
    './js/charts.js',
    './js/targets.js',
    './js/timetable.js',
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

// Fetch Event (Offline First)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => {
            return res || fetch(e.request);
        })
    );
});
