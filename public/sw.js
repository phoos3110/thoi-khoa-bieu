const CACHE_NAME = 'tkb-offline-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './app-icon.png',
  './icon.svg'
];

// ──────────────────────────────────────────
// INSTALL: Cache các file cốt lõi
// ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).catch((err) => {
      console.warn('[SW] Pre-cache error:', err);
    })
  );
});

// ──────────────────────────────────────────
// ACTIVATE: Xóa cache cũ
// ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ──────────────────────────────────────────
// MESSAGE: Nhận lệnh từ app
// ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // App yêu cầu kích hoạt SW mới ngay
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // App báo có version mới → SW gửi push notification ra màn hình điện thoại
  if (event.data.type === 'SHOW_UPDATE_NOTIFICATION') {
    if (self.registration && Notification.permission === 'granted') {
      self.registration.showNotification('📚 Thời Khóa Biểu — Có bản cập nhật mới!', {
        body: 'Ứng dụng vừa được cập nhật. Mở app và bấm "Cập nhật ngay" để dùng phiên bản mới nhất.',
        icon: './app-icon.png',
        badge: './icon.svg',
        tag: 'tkb-update',          // Gộp nhiều thông báo thành 1
        renotify: false,
        requireInteraction: false,  // Tự tắt sau vài giây
        vibrate: [200, 100, 200],
        data: { url: self.location.origin + self.location.pathname },
        actions: [
          { action: 'open', title: '🔄 Cập nhật ngay' },
          { action: 'dismiss', title: 'Để sau' },
        ],
      });
    }
  }
});

// ──────────────────────────────────────────
// NOTIFICATION CLICK: Mở app khi bấm thông báo
// ──────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Nếu app đang mở, focus lại
      for (const client of clients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Nếu không, mở tab mới
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ──────────────────────────────────────────
// FETCH: Stale-while-revalidate + Offline fallback
// ──────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Luôn lấy version.json từ mạng, không cache
  if (event.request.url.includes('version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => {
        return new Response(JSON.stringify({ offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  const isNavigation = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Trả về cache ngay (tức thì) và âm thầm cập nhật cache nền
      if (cachedResponse) {
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Chưa có cache → lấy từ mạng
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          if (isNavigation) {
            return caches.match('./index.html') || caches.match('./');
          }
        });
    })
  );
});
