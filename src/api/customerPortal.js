import { authorizedFetch, publicFetch } from 'api/auth';

// ==============================|| CUSTOMER PORTAL API CLIENT (PLACEHOLDER) ||============================== //
// These helpers describe the intended backend contract for the one-time customer portal.
// Wire the paths and payloads to real API endpoints once they are available on the server.

export async function requestCustomerOtp({ orderReference, contact }) {
  // Example POST body; adjust field names and path to match backend.
  return authorizedFetch('/api/v1/customer-portal/request-otp', {
    method: 'POST',
    body: JSON.stringify({ orderReference, contact })
  });
}

// Customer login for the storefront/portal using orderId, mobileNumber and otp
export async function customerLogin({ orderId, mobileNumber, otp }) {
  return publicFetch('/api/v1/auth/customer/login', {
    method: 'POST',
    body: JSON.stringify({ orderId, mobileNumber, otp })
  });
}

export async function verifyCustomerOtp({ orderReference, contact, otp }) {
  // Backend should verify OTP and return a short-lived portal token / session id.
  return authorizedFetch('/api/v1/customer-portal/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ orderReference, contact, otp })
  });
}

export async function fetchCustomerPortalData({ portalToken }) {
  return authorizedFetch('/api/v1/customer-portal/details', {
    method: 'POST',
    body: JSON.stringify({ portalToken })
  });
}

export async function updateCustomerDeliveryAddress({ portalToken, address }) {
  return authorizedFetch('/api/v1/customer-portal/update-address', {
    method: 'POST',
    body: JSON.stringify({ portalToken, address })
  });
}

export async function initiateCustomerPayment({ portalToken }) {
  return authorizedFetch('/api/v1/customer-portal/initiate-payment', {
    method: 'POST',
    body: JSON.stringify({ portalToken })
  });
}

export async function submitDocumentApproval({ portalToken, version, approved }) {
  return authorizedFetch('/api/v1/customer-portal/approve-document', {
    method: 'POST',
    body: JSON.stringify({ portalToken, version, approved })
  });
}

export async function fetchCustomerOrders({ portalToken }) {
  return authorizedFetch('/api/v1/customer-portal/orders', {
    method: 'POST',
    body: JSON.stringify({ portalToken })
  });
}

export async function fetchCustomerNotifications({ portalToken }) {
  return authorizedFetch('/api/v1/customer-portal/notifications', {
    method: 'POST',
    body: JSON.stringify({ portalToken })
  });
}

export async function submitCustomerFeedback({ portalToken, feedback }) {
  return authorizedFetch('/api/v1/customer-portal/feedback', {
    method: 'POST',
    body: JSON.stringify({ portalToken, feedback })
  });
}

// Create customer feedback
// Endpoint: POST /api/customer/feedback/create
// Body: { customerId: number, feedbacks: [{ questionNo: number, rating: number }] }
export async function createCustomerFeedback({ customerId, feedbacks }) {
  return authorizedFetch('/api/customer/feedback/create', {
    method: 'POST',
    body: JSON.stringify({ customerId, feedbacks })
  });
}

/**
 * Get customer feedback by customerId
 * Endpoint: GET /api/customer/feedback/{customerId}
 * Response example:
 * {
 *   "customerId": 9007199254740991,
 *   "customerName": "string",
 *   "feedbacks": [{ "questionNo": 1073741824, "question": "string", "rating": 1073741824 }]
 * }
 */
export async function getCustomerFeedback(customerId) {
  if (!customerId) throw new Error('customerId is required');
  return authorizedFetch(`/api/customer/feedback/${encodeURIComponent(String(customerId))}`, {
    method: 'GET'
  });
}

/**
 * Create customer feedback for an order
 * Endpoint: POST /api/customer/feedback/create/order/{orderId}
 * Body: { customerId: number, feedbacks: [{ questionNo: number, rating: number }] }
 */
export async function createCustomerFeedbackForOrder(orderId, payload) {
  if (!orderId) throw new Error('orderId is required');
  return authorizedFetch(`/api/customer/feedback/create/order/${encodeURIComponent(String(orderId))}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ==============================|| CUSTOMER ORDERS (PUBLIC/CLIENT) ||============================== //

/**
 * List customer orders
 * Endpoint: GET /api/v1/customer/orders/list
 */
export async function listCustomerOrders() {
  return authorizedFetch('/api/v1/customer/orders/list', {
    method: 'GET'
  });
}

/**
 * Get single order details
 * Endpoint: GET /api/v1/customer/orders/{orderId}
 */
export async function getCustomerOrder(orderId) {
  if (!orderId) throw new Error('orderId is required');
  return authorizedFetch(`/api/v1/customer/orders/${encodeURIComponent(String(orderId))}`, {
    method: 'GET'
  });
}

/**
 * Change delivery address for an order
 * Endpoint: POST /api/v1/customer/orders/{orderId}/change-delivery-address
 * Body: { shippingAddress1, shippingAddress2, shippingCity, shippingState, shippingCountry, shippingPincode }
 */
export async function changeOrderDeliveryAddress(orderId, payload) {
  if (!orderId) throw new Error('orderId is required');
  return authorizedFetch(`/api/v1/customer/orders/${encodeURIComponent(String(orderId))}/change-delivery-address`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Change pickup branch for an order
 * Endpoint: POST /api/v1/customer/orders/{orderId}/change-pickup-branch-location
 * Body: { pickupBranchId }
 */
export async function changeOrderPickupBranch(orderId, payload) {
  if (!orderId) throw new Error('orderId is required');
  return authorizedFetch(`/api/v1/customer/orders/${encodeURIComponent(String(orderId))}/change-pickup-branch-location`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Fetch branches for pickup selection
 * Endpoint: GET /api/v1/web/master/branches
 */
export async function listWebBranches() {
  return authorizedFetch('/api/v1/web/master/branches', {
    method: 'GET'
  });
}
