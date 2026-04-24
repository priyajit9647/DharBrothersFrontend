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

export async function createOrder(payload) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/api/v1/orders/open/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to create order';
    throw new Error(message);
  }

  return data;
}

export async function getOrderSummary(orderId) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/api/v1/orders/${encodeURIComponent(orderId)}/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Failed to load order summary';
    throw new Error(message);
  }

  return data;
}
