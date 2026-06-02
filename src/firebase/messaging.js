import { authorizedFetch } from 'api/auth';

const PROMPTED_KEY = 'pushPrompted';
const TOKEN_KEY = 'pushToken';

async function initFirebase() {
  if (typeof window === 'undefined') {
    throw new Error('Not in browser');
  }

  const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase ENV variables missing');
  }

  // Resilient dynamic imports to support different bundlers/SDK shapes
  const firebaseAppModule = await import('firebase/app');
  const initializeApp = firebaseAppModule.initializeApp || firebaseAppModule.default?.initializeApp;
  const getApps = firebaseAppModule.getApps || firebaseAppModule.default?.getApps;
  const getApp = firebaseAppModule.getApp || firebaseAppModule.default?.getApp;

  const firebaseMessagingModule = await import('firebase/messaging');
  const getMessaging = firebaseMessagingModule.getMessaging || firebaseMessagingModule.default?.getMessaging;
  const isSupportedFn = firebaseMessagingModule.isSupported || firebaseMessagingModule.default?.isSupported;

  // isSupported() may not be exported in some builds — fall back to basic feature detection
  let supported = true;
  if (typeof isSupportedFn === 'function') {
    try {
      supported = await isSupportedFn();
    } catch (e) {
      supported = Boolean('serviceWorker' in navigator && 'Notification' in window);
    }
  } else {
    supported = Boolean('serviceWorker' in navigator && 'Notification' in window);
  }

  if (!supported) {
    throw new Error('Firebase messaging not supported in this browser');
  }

  if (typeof initializeApp !== 'function' || typeof getMessaging !== 'function') {
    throw new Error('Firebase SDK is not available or has unexpected exports');
  }

  // Prevent duplicate initialization — be tolerant if getApps/getApp are missing
  let app;
  try {
    if (typeof getApps === 'function' && typeof getApp === 'function') {
      const apps = getApps();
      app = apps && apps.length ? getApp() : initializeApp(firebaseConfig);
    } else {
      // Older or differently bundled SDKs may not expose getApps/getApp — try initializeApp and fall back
      try {
        app = initializeApp(firebaseConfig);
      } catch (e) {
        app = (firebaseAppModule.getApp && firebaseAppModule.getApp()) || (firebaseAppModule.default && firebaseAppModule.default.getApp && firebaseAppModule.default.getApp());
        if (!app) throw e;
      }
    }
  } catch (e) {
    throw new Error('Failed to initialize Firebase app: ' + (e?.message || String(e)));
  }

  return getMessaging(app);
}

export async function registerForPush() {
  if (typeof window === 'undefined') return null;

  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    throw new Error('Missing VITE_FIREBASE_VAPID_KEY');
  }

  const messaging = await initFirebase();

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  const messagingModuleForToken = await import('firebase/messaging');
  const getToken = messagingModuleForToken.getToken || messagingModuleForToken.default?.getToken;
  if (typeof getToken !== 'function') throw new Error('Firebase getToken is not available');

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration
  });

  if (!token) {
    throw new Error('FCM token not generated');
  }

  await authorizedFetch('/api/users/device-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      deviceToken: token
    })
  });

  localStorage.setItem(TOKEN_KEY, token);

  return token;
}

export async function requestPermissionAndRegister() {
  if (typeof window === 'undefined') return null;

  try {
    if (localStorage.getItem(PROMPTED_KEY)) {
      return null;
    }

    localStorage.setItem(PROMPTED_KEY, '1');

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return null;
    }

    return await registerForPush();
  } catch (err) {
    console.error('Push registration failed:', err);
    return null;
  }
}

export async function listenForMessages() {
  if (typeof window === 'undefined') return;

  try {
    const messaging = await initFirebase();

    const messagingModuleForListener = await import('firebase/messaging');
    const onMessage = messagingModuleForListener.onMessage || messagingModuleForListener.default?.onMessage;
    if (typeof onMessage !== 'function') return;

    onMessage(messaging, (payload) => {
      console.log('Foreground Message:', payload);

      const title =
        payload?.notification?.title ||
        payload?.data?.title ||
        'Notification';

      const body =
        payload?.notification?.body ||
        payload?.data?.body ||
        '';

      const icon =
        payload?.notification?.icon ||
        payload?.data?.icon;

      const url = payload?.data?.url;

      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        new Notification(title, {
          body,
          icon,
          data: { url }
        });
      }

      window.dispatchEvent(
        new CustomEvent('fcmMessage', {
          detail: payload
        })
      );
    });
  } catch (err) {
    console.error('listenForMessages failed:', err);
  }
}

export function getStoredPushToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function hasPromptedForPush() {
  return Boolean(localStorage.getItem(PROMPTED_KEY));
}