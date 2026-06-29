import { authorizedFetch, authorizedFetchRaw, authorizedCustomerFetch, authorizedCustomerFetchRaw, getCustomerPortalSession } from './auth';

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

async function blobToBase64(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error('Failed to read blob data'));
    };
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('Unexpected blob data'));
        return;
      }
      const idx = dataUrl.indexOf(',');
      resolve(idx >= 0 ? dataUrl.substring(idx + 1) : dataUrl);
    };
    reader.readAsDataURL(blob);
  });
}

  /**
   * Assign a staff/user to an order (admin)
   * Endpoint: POST /api/v1/orders/admin/{orderId}/assign
   * @param {string|number} orderId
   * @param {{assignedStaffId: string, assignedDate?: string}} payload
   */
  export async function assignOrderStaff(orderId, payload) {
    if (!orderId) throw new Error('orderId is required');
    if (!payload || !payload.assignedStaffId) throw new Error('assignedStaffId is required');

    return authorizedFetch(`/api/v1/orders/admin/${encodeURIComponent(String(orderId))}/assign`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

function extractBase64String(value) {
  if (value == null) return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  const commaIndex = str.indexOf(',');
  if (str.startsWith('data:') && commaIndex >= 0) {
    return str.substring(commaIndex + 1);
  }
  return str;
}

async function parseQrBase64Response(response) {
  const contentType = String(response.headers.get('Content-Type') || '').toLowerCase();

  if (contentType.includes('application/json') || contentType.includes('text/')) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      const candidate = parsed?.qrCodeBase64 ?? parsed?.qrCode ?? parsed?.data ?? parsed?.base64 ?? parsed;
      return extractBase64String(candidate);
    } catch {
      return extractBase64String(text);
    }
  }

  const blob = await response.blob();
  return blobToBase64(blob);
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

  const session = getCustomerPortalSession();
  const isCustomerPortal = Boolean(session);

  if(isCustomerPortal) {
    return authorizedCustomerFetch(`/api/v1/orders/admin/${encodeURIComponent(String(orderId))}`, {
      method: 'GET',
      allowRefresh: false
    });
  } else {
    return authorizedFetch(`/api/v1/orders/admin/${encodeURIComponent(String(orderId))}`, {
      method: 'GET',
      allowRefresh: false
    });
  }
}

/**
 * Download a file from server (admin)
 * Endpoint: POST /api/v1/orders/admin/download
 * Body: { filePath: string, fileName?: string }
 * Returns a Blob representing the file content.
 */
export async function downloadOrderFile(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('payload is required and must be an object');
  }

  const { filePath, fileName } = payload;
  if (!filePath) {
    throw new Error('filePath is required');
  }

  const session = getCustomerPortalSession();
  const isCustomerPortal = Boolean(session);

  if(isCustomerPortal) {
    const response = await authorizedCustomerFetchRaw('/api/v1/orders/admin/download', {
      method: 'POST',
      body: JSON.stringify({ filePath, fileName })
    });

    return response.blob();
  }
  else {
    const response = await authorizedFetchRaw('/api/v1/orders/admin/download', {
      method: 'POST',
      body: JSON.stringify({ filePath, fileName })
    });

    return response.blob();
  }
}

/**
 * Confirm order received by customer
 * Endpoint: POST /api/v1/customer/orders/{orderId}/confirm-received
 * Body: { receivedByCustomer: boolean, ...optional order summary }
 */
export async function confirmOrderReceived(orderId, payload) {
  if (!orderId) throw new Error('orderId is required');
  return authorizedCustomerFetch(`/api/v1/customer/orders/${encodeURIComponent(String(orderId))}/confirm-received`, {
    method: 'POST',
    body: JSON.stringify(payload || {})
  });
}

/**
 * Admin confirm order received - fallback for admin users
 * Endpoint: POST /api/v1/orders/admin/{orderId}/confirm-received
 */
export async function adminConfirmOrderReceived(orderId, payload) {
  if (!orderId) throw new Error('orderId is required');
  return authorizedFetch(`/api/v1/orders/admin/${encodeURIComponent(String(orderId))}/confirm-received`, {
    method: 'POST',
    body: JSON.stringify(payload || {})
  });
}

/**
 * Verify OTP / mark order received (Order Received)
 * Endpoint: POST /api/v1/payment/verify-otp
 * Body: payload object (e.g. { orderId, otp, paymentId, ... })
 */
export async function verifyOrderReceivedOtp(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('payload is required');
  return authorizedFetch('/api/v1/payment/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
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

  const res = await authorizedFetchRaw(`/api/v1/orders/${encodeURIComponent(String(orderId))}/shipping-address-qr/base64`, {
    method: 'GET'
  });

  console.log('[API.getOrderShippingAddressQrBase64] Response received, status:', res.status);
  return parseQrBase64Response(res);
}

/**
 * Fetch feedback QR for a given order as base64 string.
 * New endpoint: /api/customer/feedback/qr/{orderId}/base64
 * Response JSON shape: { orderId, orderNumber, qrCodeBase64 }
 * @param {string} orderId
 * @returns {Promise<string>} base64-encoded QR content (may include data: prefix)
 */
export async function getOrderFeedbackQrBase64(orderId) {
  console.log('[API.getOrderFeedbackQrBase64] Called with orderId:', orderId);
  if (!orderId) throw new Error('orderId is required');

  // New endpoint returns JSON containing `qrCodeBase64` field (data URL or raw base64)
  const res = await authorizedFetchRaw(`/api/customer/feedback/qr/${encodeURIComponent(String(orderId))}/base64`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  console.log('[API.getOrderFeedbackQrBase64] Response received, status:', res.status);
  return parseQrBase64Response(res);
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

export async function reassignOrderStaff(jobId, toStaffId, comment = '') {
  if (!jobId) throw new Error('jobId is required');
  if (!toStaffId) throw new Error('toStaffId is required');

  // If jobId is a numeric string, convert to Number; otherwise keep as string
  const normalizedJobId = /^\d+$/.test(String(jobId)) ? Number(jobId) : String(jobId);

  return authorizedFetch('/api/v1/admin/user-job/reassign-staff', {
    method: 'PUT',
    body: JSON.stringify({
      jobId: normalizedJobId,
      toStaffId: String(toStaffId),
      comment
    })
  });
}

/**
 * Fetch document version list for a document stage id
 * Endpoint: /api/v1/document/vrson-list?docStageId={docStageId}
 * @param {number|string} docStageId
 * @returns {Promise<Array>} Array of document versions
 */
export async function getDocumentVersionList(docStageId) {
  if (docStageId == null || docStageId === '') {
    throw new Error('docStageId is required');
  }

  return authorizedFetch(`/api/v1/document/vrson-list?docStageId=${encodeURIComponent(String(docStageId))}`, {
    method: 'GET'
  });
}

/**
 * Fetch document version list scoped to an order
 * Endpoint: /api/v1/document/version-list/customer?orderid={orderId}
 * @param {string|number} orderId
 * @returns {Promise<Array>} Array of document version objects
 */
export async function getDocumentVersionListForOrder(orderId) {
  if (orderId == null || orderId === '') {
    throw new Error('orderId is required');
  }

  const session = getCustomerPortalSession();
  const isCustomerPortal = Boolean(session);

  const url = `/api/v1/document/version-list/customer?orderid=${encodeURIComponent(String(orderId))}`;

  if (isCustomerPortal) {
    return authorizedCustomerFetch(url, { method: 'GET' });
  }

  return authorizedFetch(url, { method: 'GET' });
}

/**
 * Download invoice PDF for an order by ID
 * Endpoint: GET /api/v1/order/invoice/get/{orderId}
 * @param {string} orderId
 * @returns {Promise<Blob>} PDF blob
 */
export async function downloadInvoice(orderId) {
  if (!orderId) throw new Error('orderId is required');

  const response = await authorizedFetchRaw(`/api/v1/order/invoice/get/${encodeURIComponent(String(orderId))}`, {
    method: 'GET',
    headers: {
      Accept: 'application/pdf'
    }
  });

  return response.blob();
}

/**
 * Record a cash payment for an order (admin)
 * Endpoint: POST /api/v1/payment/admin/cash/{orderId}
 * @param {string|number} orderId
 * @param {{ amount: number, remarks: string }} payload
 * @returns {Promise<object>}
 */
export async function adminCashPayment(orderId, payload) {
  if (!orderId) throw new Error('orderId is required');
  if (!payload || payload.amount == null) throw new Error('amount is required');

  return authorizedFetch(`/api/v1/payment/admin/cash/${encodeURIComponent(String(orderId))}`, {
    method: 'POST',
    body: JSON.stringify({ amount: payload.amount, remarks: payload.remarks ?? '' })
  });
}

/**
 * Get payment status for an order
 * Endpoint: GET /api/customer-portal/orders/{orderId}/payment-status
 * @param {string} orderId - trackingNumber (UUID)
 * @returns {Promise<{ paymentStatus: string, dueAmount: number, paymentLink: string }>}
 */
export async function getOrderPaymentStatus(orderId) {
  if (!orderId) throw new Error('orderId is required');

  return authorizedFetch(`/api/customer-portal/orders/${encodeURIComponent(String(orderId))}/payment-status`, {
    method: 'GET'
  });
}
