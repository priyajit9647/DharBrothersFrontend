import { authorizedFetch } from './auth';

// ==============================|| PAYMENT CONFIGURATION API ||============================== //

export async function getPaymentConfigurations(branchId) {
  // eslint-disable-next-line no-console
  console.log(`Calling GET /api/v1/payment/config/list?branchId=${branchId}`);

  return authorizedFetch(`/api/v1/payment/config/list?branchId=${encodeURIComponent(branchId)}`, {
    method: 'GET'
  });
}

export async function createPaymentConfiguration({ branchId, merchantId, aggregatorId, secretKey }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/payment/config/create', {
    branchId,
    merchantId,
    aggregatorId,
    secretKey
  });

  return authorizedFetch('/api/v1/payment/config/create', {
    method: 'POST',
    body: JSON.stringify({
      branchId,
      merchantId,
      aggregatorId,
      secretKey
    })
  });
}

export async function editPaymentConfiguration(id, { branchId, merchantId, aggregatorId, secretKey }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/payment/config/edit/${id}`, {
    branchId,
    merchantId,
    aggregatorId,
    secretKey
  });

  return authorizedFetch(`/api/v1/payment/config/edit/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      branchId,
      merchantId,
      aggregatorId,
      secretKey
    })
  });
}
