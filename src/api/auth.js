import { getAccessTokenFromCookies, getRefreshTokenFromCookies, isTokenExpired, setAuthCookies, clearAuthCookies } from 'utils/authTokens';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ==============================|| AUTH API CLIENT ||============================== //

export async function loginApi({ email, password }) {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Unable to parse server response');
  }

  if (!response.ok) {
    // Prefer server-provided message if available
    const message = data?.message || data?.error || 'Login failed';
    throw new Error(message);
  }

  return data;
}

export async function publicFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(options.headers || {})
  };

  if (!isFormData) {
    const hasContentTypeHeader = Object.keys(headers).some((key) => key.toLowerCase() === 'content-type');
    if (!hasContentTypeHeader) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function refreshTokenApi(refreshToken) {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Unable to parse server response');
  }

  if (!response.ok) {
    const message = data?.message || data?.error || 'Unable to refresh session';
    throw new Error(message);
  }

  if (data?.accessToken || data?.refreshToken) {
    setAuthCookies({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken });
  }

  return data;
}

function getAuthStateFromLocalStorage() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('dharbrothers-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

// Generic helper for authenticated API calls.
// Usage: authorizedFetch('/api/v1/secure-endpoint', { method: 'GET' })
export async function authorizedFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  const localAuth = getAuthStateFromLocalStorage();
  let accessToken = getAccessTokenFromCookies() || localAuth?.accessToken || null;
  const refreshToken = getRefreshTokenFromCookies() || localAuth?.refreshToken || null;

  // If there is no access token or it is expired, but a refresh
  // token exists, attempt to obtain a new access token via the
  // refresh token endpoint.
  if (refreshToken && (!accessToken || isTokenExpired(accessToken))) {
    try {
      const refreshed = await refreshTokenApi(refreshToken);
      accessToken = refreshed.accessToken;
    } catch {
      clearAuthCookies();
      throw new Error('Session expired. Please login again.');
    }
  } else if (accessToken && isTokenExpired(accessToken)) {
    // Access token expired and there is no refresh token
    clearAuthCookies();
    throw new Error('Session expired. Please login again.');
  }

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    ...(accessToken
      ? {
          Authorization: `Bearer ${accessToken}`
        }
      : {})
  };

  // For JSON requests, ensure we send the appropriate Content-Type header.
  // For FormData, let the browser set the multipart boundary automatically.
  if (!isFormData) {
    const hasContentTypeHeader = Object.keys(headers).some((key) => key.toLowerCase() === 'content-type');
    if (!hasContentTypeHeader) {
      headers['Content-Type'] = 'application/json';
    }
  }

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && refreshToken) {
    try {
      const refreshed = await refreshTokenApi(refreshToken);
      const nextAccessToken = refreshed?.accessToken;
      if (nextAccessToken) {
        response = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${nextAccessToken}`
          }
        });
      }
    } catch {
      clearAuthCookies();
      throw new Error('Session expired. Please login again.');
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Variant of authorizedFetch that returns the raw Response instead of parsing JSON.
// Useful for downloading binary data like file attachments.
export async function authorizedFetchRaw(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  const localAuth = getAuthStateFromLocalStorage();
  let accessToken = getAccessTokenFromCookies() || localAuth?.accessToken || null;
  const refreshToken = getRefreshTokenFromCookies() || localAuth?.refreshToken || null;

  if (refreshToken && (!accessToken || isTokenExpired(accessToken))) {
    try {
      const refreshed = await refreshTokenApi(refreshToken);
      accessToken = refreshed.accessToken;
    } catch {
      clearAuthCookies();
      throw new Error('Session expired. Please login again.');
    }
  } else if (accessToken && isTokenExpired(accessToken)) {
    clearAuthCookies();
    throw new Error('Session expired. Please login again.');
  }

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    ...(accessToken
      ? {
          Authorization: `Bearer ${accessToken}`
        }
      : {})
  };

  if (!isFormData) {
    const hasContentTypeHeader = Object.keys(headers).some((key) => key.toLowerCase() === 'content-type');
    if (!hasContentTypeHeader) {
      headers['Content-Type'] = 'application/json';
    }
  }

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && refreshToken) {
    try {
      const refreshed = await refreshTokenApi(refreshToken);
      const nextAccessToken = refreshed?.accessToken;
      if (nextAccessToken) {
        response = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${nextAccessToken}`
          }
        });
      }
    } catch {
      clearAuthCookies();
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data?.message || data?.error || message;
    } catch {
      // ignore JSON parse errors for non-JSON responses
    }
    throw new Error(message);
  }

  return response;
}

export async function getUserProfile() {
  return authorizedFetch('/api/v1/user/me/profile');
}

