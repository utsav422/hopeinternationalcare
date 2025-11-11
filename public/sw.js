// Service Worker for Hope International - Next.js 15 PWA
const CACHE_NAME = 'hope-international-v1';
const STATIC_CACHE_NAME = 'hope-international-static-v1';
const DYNAMIC_CACHE_NAME = 'hope-international-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/courses',
    '/aboutus',
    '/contactus',
    '/manifest.json',
    '/favicon.ico',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/apple-touch-icon.png',
    '/opengraph-image.png',
];

// API routes to cache
const API_ROUTES = [
    '/api/public/courses',
    '/api/public/categories',
    '/api/public/intakes',
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches
            .open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (
                            cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== DYNAMIC_CACHE_NAME
                        ) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle different types of requests
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    } else if (isAPIRequest(request.url)) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
    } else if (isPageRequest(request)) {
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
    }
});

// Cache strategies
async function cacheFirst(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline content not available', { status: 503 });
    }
}

async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Content not available offline', { status: 503 });
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });

    return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
    return (
        STATIC_ASSETS.some(asset => url.includes(asset)) ||
        url.includes('/favicon') ||
        url.includes('/icon-') ||
        url.includes('/apple-touch') ||
        url.includes('/manifest') ||
        url.includes('/_next/static/')
    );
}

function isAPIRequest(url) {
    return (
        API_ROUTES.some(route => url.includes(route)) || url.includes('/api/')
    );
}

function isPageRequest(request) {
    return request.destination === 'document';
}

// Background sync for offline form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    try {
        // Get stored form data from IndexedDB
        const formData = await getStoredFormData();
        if (formData) {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await clearStoredFormData();
                console.log('Contact form synced successfully');
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: data.url,
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icon-192x192.png',
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png',
            },
        ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(clients.openWindow(event.notification.data));
    }
});

// Message handling for cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Utility functions for IndexedDB (simplified)
async function getStoredFormData() {
    // Implementation would use IndexedDB to retrieve stored form data
    return null;
}

async function clearStoredFormData() {
    // Implementation would clear stored form data from IndexedDB
}
