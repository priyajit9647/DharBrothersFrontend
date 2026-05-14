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
