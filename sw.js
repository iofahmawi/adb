const CACHE_NAME = 'adb-generator-v4'; // اسم التخزين المؤقت وإصداره
const ASSETS_TO_CACHE = [
  './',                // الصفحة الرئيسية
  './index.html',      // اسم ملف HTML الخاص بك
  './manifest.json',   // ملف المانيفست
  './icon-1440.png'    // الأيقونة التي ذكرتها في الكود
];

// 1. تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // فرض التفعيل الفوري للخدمة الجديدة
  self.skipWaiting();
});

// 2. تفعيل الـ Service Worker وتنظيف التخزين القديم
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ....');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // السماح للـ Service Worker بالتحكم في الصفحة فوراً
  return self.clients.claim();
});

// 3. استراتيجية الجلب (Cache first, then Network)
// محاولة جلب الملف من الذاكرة، إذا لم يوجد، جلبه من الإنترنت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا وجد الملف في الكاش، قم بإرجاعه
      if (response) {
        return response;
      }
      // إذا لم يوجد، قم بطلبه من الشبكة
      return fetch(event.request);
    })
  );

});
