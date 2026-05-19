import { authorizedFetch } from './auth';

// ==============================|| ORDERS API CLIENT ||============================== //

function normalizeOrdersResponse(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== '') {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Fetch orders for an admin by stage name
 * Endpoint: /api/v1/orders/admin/list/{stageName}
 * @param {string} stageName
 * @returns {Promise<Array>} Array of orders
 */
export async function getOrdersByStatus(stageName) {
  if (!stageName) {
    throw new Error('stageName is required');
  }

  const response = await authorizedFetch(`/api/v1/orders/admin/list/${encodeURIComponent(String(stageName))}`, {
    method: 'GET'
  });

  return normalizeOrdersResponse(response);
}

/**
 * Fetch recent dashboard orders.
 * Endpoint: /api/v1/dashboard/orders/recent
 * @param {{branchId?: number|string, fromDate?: string, toDate?: string, page?: number, size?: number, sort?: string|string[]}} params
 * @returns {Promise<Array>} Array of recent orders
 */
export async function getRecentOrders(params = {}) {
  const { branchId, fromDate, toDate, page = 0, size = 10, sort = ['createdDate,DESC'] } = params;

  const queryString = buildQueryString({
    branchId,
    fromDate,
    toDate,
    page,
    size,
    sort
  });

  const response = await authorizedFetch(`/api/v1/dashboard/orders/recent${queryString}`, {
    method: 'GET'
  });

  return normalizeOrdersResponse(response);
}

// Backwards-compatible alias
export const getOrdersByStage = getOrdersByStatus;

/**
 * Fetch order details from admin endpoint by order ID
 * Endpoint: /api/v1/orders/admin/{orderId}
 * @param {string} orderId
 * @returns {Promise<object>} Order details
 */
export async function getOrderById(orderId) {
  if (!orderId) {
    throw new Error('orderId is required');
  }

  return authorizedFetch(`/api/v1/orders/admin/${encodeURIComponent(String(orderId))}`, {
    method: 'GET'
  });
}

/**
 * Send payment link to customer for a given order
 * Endpoint: /api/v1/dashboard/send-payment-link/{orderId}
 * @param {string} orderId
 * @returns {Promise<object>} Response from server
 */
export async function sendPaymentLink(orderId) {
  if (!orderId) {
    throw new Error('orderId is required');
  }

  return authorizedFetch(`/api/v1/dashboard/send-payment-link/${encodeURIComponent(String(orderId))}`, {
    method: 'GET'
  });
}

/**
 * Fetch shipping address QR as base64 string for a given orderId
 * Endpoint: /api/v1/orders/{orderId}/shipping-address-qr/base64
 * Uses authorizedFetchRaw because the endpoint may return plain text or binary.
 * @param {string} orderId
 * @returns {Promise<string|object>} base64 string or parsed JSON
 */
export async function getOrderShippingAddressQrBase64(orderId) {
  console.log('[API.getOrderShippingAddressQrBase64] Called with orderId:', orderId);
  if (!orderId) throw new Error('orderId is required');

  try {
    const res = await authorizedFetchRaw(`/api/v1/orders/${encodeURIComponent(String(orderId))}/shipping-address-qr/base64`, {
      method: 'GET'
    });

    console.log('[API.getOrderShippingAddressQrBase64] Response received, status:', res.status);
    // Try to parse as text first. The server may return plain base64 or a JSON wrapper.
    const text = await res.text();
    console.log('[API.getOrderShippingAddressQrBase64] Response text length:', text?.length);
    try {
      const parsed = JSON.parse(text);
      console.log('[API.getOrderShippingAddressQrBase64] Parsed as JSON, keys:', Object.keys(parsed || {}));
      // prefer common property names
      return parsed?.data || parsed?.base64 || parsed?.content || parsed;
    } catch (e) {
      console.log('[API.getOrderShippingAddressQrBase64] Not JSON, returning raw text');
      return text;
    }
  } catch (e) {
    console.error('[API.getOrderShippingAddressQrBase64] Error:', e);
    throw e;
  }
}

/**
 * Fetch shipping address QR as binary PNG and return base64 string (without data: prefix)
 * Endpoint: /api/v1/orders/{orderId}/shipping-address-qr
 * @param {string} orderId
 * @returns {Promise<string>} base64-encoded PNG content
 */
export async function getOrderShippingAddressQr(orderId) {
  if (!orderId) throw new Error('orderId is required');

  const res = await authorizedFetchRaw(`/api/v1/orders/${encodeURIComponent(String(orderId))}/shipping-address-qr`, {
    method: 'GET',
    headers: {
      Accept: 'image/png'
    }
  });

  // read as blob then convert to base64
  const blob = await res.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error('Failed to read QR image'));
    };
    reader.onload = () => {
      const dataUrl = reader.result; // e.g. data:image/png;base64,....
      if (typeof dataUrl === 'string') {
        const idx = dataUrl.indexOf(',');
        resolve(idx >= 0 ? dataUrl.substring(idx + 1) : dataUrl);
      } else {
        reject(new Error('Unexpected QR image data'));
      }
    };
    reader.readAsDataURL(blob);
  });
}
