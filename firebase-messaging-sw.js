/* Simple service worker to surface incoming push messages as notifications.
   This file is intentionally lightweight. For full Firebase Messaging
   background handling replace this with the official firebase-messaging-sw.js
   that initializes firebase.messaging() with your project config.
*/

'use strict';

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    try {
      data = { body: event.data.text() };
    } catch (err) {
      data = { body: '' };
    }
  }

  const title = (data?.notification?.title) || data?.title || 'Notification';
  const options = data.notification || { body: data.body || '' };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
