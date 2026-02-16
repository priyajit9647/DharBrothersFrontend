// ==============================|| AUTH TOKEN & COOKIE UTILS ||============================== //

/**
 * Safely parse a JWT and return its payload or null.
 */
export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn('Failed to parse JWT', error);
    return null;
  }
}

/**
 * Check whether a JWT access token is expired.
 * Adds a small offset (in seconds) to proactively refresh before hard expiry.
 */
export function isTokenExpired(token, offsetSeconds = 30) {
  const payload = parseJwt(token);

  if (!payload || typeof payload.exp !== 'number') {
    // If we cannot read exp, assume not expired to avoid breaking login.
    return false;
  }

  const nowInSeconds = Date.now() / 1000;
  return payload.exp < nowInSeconds + offsetSeconds;
}

const ACCESS_TOKEN_COOKIE = 'db_access_token';
const REFRESH_TOKEN_COOKIE = 'db_refresh_token';

function setCookie(name, value, options = {}) {
  if (typeof document === 'undefined') return;

  const opts = { path: '/', ...options };
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (opts.maxAge != null) {
    cookie += `; Max-Age=${opts.maxAge}`;
  }
  if (opts.expires instanceof Date) {
    cookie += `; Expires=${opts.expires.toUTCString()}`;
  }

  if (opts.path) {
    cookie += `; Path=${opts.path}`;
  }

  // SameSite=Lax helps with basic CSRF protection while still working on most flows
  cookie += '; SameSite=Lax';

  document.cookie = cookie;
}

function deleteCookie(name) {
  setCookie(name, '', { maxAge: -1 });
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAuthCookies({ accessToken, refreshToken }) {
  if (accessToken) {
    setCookie(ACCESS_TOKEN_COOKIE, accessToken);
  }

  if (refreshToken) {
    setCookie(REFRESH_TOKEN_COOKIE, refreshToken);
  }
}

export function clearAuthCookies() {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
}

export function getAccessTokenFromCookies() {
  return getCookie(ACCESS_TOKEN_COOKIE);
}

export function getRefreshTokenFromCookies() {
  return getCookie(REFRESH_TOKEN_COOKIE);
}
