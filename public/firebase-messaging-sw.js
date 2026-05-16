importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBtPSr3Ky2_p3YqEqPEnxxW-vDfuNJrfJ4",
  authDomain: "orchids-44f86.firebaseapp.com",
  projectId: "orchids-44f86",
  storageBucket: "orchids-44f86.firebasestorage.app",
  messagingSenderId: "456597052380",
  appId: "1:456597052380:web:67d40b8e2485205f1ccd19"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? '🌸 Orchid Farm', {
    body: body ?? '',
    icon: icon ?? '/orchid/pwa-192x192.png',
    badge: '/orchid/pwa-192x192.png',
    data: { url: '/orchid/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/orchid/';
  event.waitUntil(clients.openWindow(url));
});
