import { authorizedFetch } from 'api/auth';

const PROMPTED_KEY = 'pushPrompted';
const TOKEN_KEY = 'pushToken';

async function initFirebase() {
  if (typeof window === 'undefined') throw new Error('Not in a browser environment');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase config (VITE_FIREBASE_API_KEY etc.) is not set');
  }

  // Dynamically import firebase modules so the app doesn't break if env isn't set
  const { initializeApp } = await import('firebase/app');
  const { getMessaging } = await import('firebase/messaging');

  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  return messaging;
}

export async function registerForPush() {
  if (typeof window === 'undefined') throw new Error('Not in a browser environment');

  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser');
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error('VAPID key not configured (VITE_FIREBASE_VAPID_KEY)');
  }

  const messaging = await initFirebase();

  // register service worker (must be available at root scope)
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  const { getToken } = await import('firebase/messaging');

  const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!currentToken) {
    throw new Error('Unable to obtain FCM token');
  }

  // submit device token to backend
  await authorizedFetch('/api/users/device-token', {
    method: 'POST',
    body: JSON.stringify({ deviceToken: currentToken })
  });

  try {
    localStorage.setItem(TOKEN_KEY, currentToken);
  } catch {}

  return currentToken;
}

export async function requestPermissionAndRegister() {
  if (typeof window === 'undefined') return null;

  try {
    // mark that we've already asked the user once
    if (localStorage.getItem(PROMPTED_KEY)) return null;
    localStorage.setItem(PROMPTED_KEY, '1');

    // request browser permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // register for push and send token to server
    const token = await registerForPush();
    return token;
  } catch (e) {
    // swallow errors — registration is best-effort
    // eslint-disable-next-line no-console
    console.error('Push registration failed', e);
    return null;
  }
}

export function getStoredPushToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function hasPromptedForPush() {
  try {
    return Boolean(localStorage.getItem(PROMPTED_KEY));
  } catch {
    return false;
  }
}
