importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-messaging-compat.js');

// Use provided Firebase project config for push testing
firebase.initializeApp({
  apiKey: 'AIzaSyA995D50ZMwXV9TFEe-I7T0GtDRbLaUsTs',
  authDomain: 'pushnotification-9fa82.firebaseapp.com',
  projectId: 'pushnotification-9fa82',
  storageBucket: 'pushnotification-9fa82.firebasestorage.app',
  messagingSenderId: '313549477282',
  appId: '1:313549477282:web:45f0a4d0413586cddc0efb',
  measurementId: 'G-8XETKYXL38'
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
    icon: icon || '/src/assets/images/users/logo/hader-logo.png',
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
