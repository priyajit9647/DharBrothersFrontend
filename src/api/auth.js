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
  } catch (e) {
    throw new Error('Unable to parse server response');
  }

  if (!response.ok) {
    // Prefer server-provided message if available
    const message = data?.message || data?.error || 'Login failed';
    throw new Error(message);
  }

  // Store tokens in cookies for subsequent authorized API calls
  if (data?.accessToken || data?.refreshToken) {
    setAuthCookies({ accessToken: data.accessToken, refreshToken: data.refreshToken });
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
  } catch (e) {
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

// Generic helper for authenticated API calls.
// Usage: authorizedFetch('/api/v1/secure-endpoint', { method: 'GET' })
export async function authorizedFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  let accessToken = getAccessTokenFromCookies();
  const refreshToken = getRefreshTokenFromCookies();

  // If we have an access token and it is expired, attempt to refresh
  if (accessToken && isTokenExpired(accessToken)) {
    if (!refreshToken) {
      clearAuthCookies();
      throw new Error('Session expired. Please login again.');
    }

    try {
      const refreshed = await refreshTokenApi(refreshToken);
      accessToken = refreshed.accessToken;
    } catch (error) {
      clearAuthCookies();
      throw new Error('Session expired. Please login again.');
    }
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data;
}

