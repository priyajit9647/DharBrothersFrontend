const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ensureApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function uploadTempOrderFiles(payload) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/api/v1/orders/open/upload-temp`, {
    method: 'POST',
    body: payload
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to upload order files';
    throw new Error(message);
  }

  return data;
}

export async function attachOrder(tempId, payload) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/api/v1/orders/open/attach-order/${tempId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to attach order';
    throw new Error(message);
  }

  return data;
}

export async function getOrderPageDetails(payload) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/api/v1/orders/open/get-page-details`, {
    method: 'POST',
    body: payload
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to load page details';
    throw new Error(message);
  }

  return data;
}

export async function getOrderEstimation(payload) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/api/v1/orders/open/get-estimation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to load order estimation';
    throw new Error(message);
  }

  return data;
}
