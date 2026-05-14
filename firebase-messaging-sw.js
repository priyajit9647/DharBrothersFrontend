importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyB5_qp96iNki0Wq_BzeVGAAbmCB3YQfun4',
    authDomain: 'finonis-e7492.firebaseapp.com',
    projectId: 'finonis-e7492',
    messagingSenderId: '1061669041188',
    storageBucket: 'finonis-e7492.firebasestorage.app',
    appId: '1:1061669041188:web:4f425aa83a7e420ccd94b1',
    measurementId: 'G-6R5642ZJE8'
});

const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function(payload) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);

//   const notificationTitle = payload.data.title;
//   const notificationOptions = {
//     body: payload.data.body,
//     icon: payload.data.icon, // ✅ now you control this
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });



messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const { title, body, icon, url } = payload.data;

  const notificationOptions = {
    body: body,
    icon: icon || '/assets/images/logos/logoBird.png',
    data: {
      url: url || '/' // custom URL to open when clicked
    }
  };

  self.registration.showNotification(title, notificationOptions);
});

// Handle notification click (foreground or background)
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  const urlToOpen = event.notification.data?.url || '/';
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});