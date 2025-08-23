/**
 * Service Worker for Podologie Weimar
 * Provides offline functionality and performance improvements
 */

'use strict';

const CACHE_NAME = 'podologie-weimar-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Files to cache for offline functionality
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/images/about1.jpeg',
    '/images/about2.jpeg',
    '/images/about3.jpeg',
    '/images/about4.jpeg',
    '/images/about5.jpeg',
    // Add other static assets as needed
];

// Maximum number of dynamic cache entries
const MAX_DYNAMIC_CACHE_SIZE = 50;

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
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

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match('/')
                .then((response) => {
                    return response || fetch(request);
                })
                .catch(() => {
                    return caches.match('/');
                })
        );
        return;
    }

    // Handle other requests with cache-first strategy for static assets,
    // network-first for dynamic content
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(networkFirst(request));
    }
});

// Cache-first strategy for static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache-first strategy failed:', error);
        return new Response('Offline content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network-first strategy for dynamic content
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);

            // Limit dynamic cache size
            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);

            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        return new Response('Content not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Check if request is for a static asset
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.endsWith(asset)) ||
        url.includes('/images/') ||
        url.endsWith('.css') ||
        url.endsWith('.js') ||
        url.endsWith('.jpg') ||
        url.endsWith('.jpeg') ||
        url.endsWith('.png') ||
        url.endsWith('.gif') ||
        url.endsWith('.webp');
}

// Limit cache size to prevent storage overflow
async function limitCacheSize(cacheName, size) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        if (keys.length > size) {
            // Delete oldest entries
            const keysToDelete = keys.slice(0, keys.length - size);
            await Promise.all(keysToDelete.map(key => cache.delete(key)));
        }
    } catch (error) {
        console.error('Error limiting cache size:', error);
    }
}

// Handle background sync (if needed for future features)
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implement background sync logic here if needed
    // For example: send queued form submissions, sync data, etc.
    console.log('Performing background sync...');
}

// Handle push notifications (if needed for future features)
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    const options = {
        body: event.data ? event.data.text() : 'Neue Nachricht von Podologie Weimar',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification('Podologie Weimar', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if a window is already open
                for (let client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Open a new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker script loaded');