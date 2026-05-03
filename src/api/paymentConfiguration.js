import { authorizedFetch } from './auth';

// ==============================|| PAYMENT CONFIGURATION API ||============================== //

export async function getPaymentConfigurations(branchId) {
  // eslint-disable-next-line no-console
  console.log(`Calling GET /api/v1/payment/config/list?branchId=${branchId}`);

  return authorizedFetch(`/api/v1/payment/config/list?branchId=${encodeURIComponent(branchId)}`, {
    method: 'GET'
  });
}

export async function createPaymentConfiguration({ id = '', branchId, merchantId, aggregatorId, secretKey, percentage, active }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/payment/config/create', {
    id,
    branchId,
    merchantId,
    aggregatorId,
    secretKey,
    percentage,
    active
  });

  return authorizedFetch('/api/v1/payment/config/create', {
    method: 'POST',
    body: JSON.stringify({
      id,
      branchId,
      merchantId,
      aggregatorId,
      secretKey,
      percentage,
      active
    })
  });
}

export async function editPaymentConfiguration(id, { branchId, merchantId, aggregatorId, secretKey, percentage, active }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/payment/config/edit/${id}`, {
    id,
    branchId,
    merchantId,
    aggregatorId,
    secretKey,
    percentage,
    active
  });

  return authorizedFetch(`/api/v1/payment/config/edit/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      id: String(id),
      branchId,
      merchantId,
      aggregatorId,
      secretKey,
      percentage,
      active
    })
  });
}
