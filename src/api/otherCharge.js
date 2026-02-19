import { authorizedFetch } from './auth';

// ==============================|| OTHER CHARGE MASTER API ||============================== //

export async function getOtherCharges() {
  // Expected response: array of { id, code, quantityUnit, rate, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/billing/other-charge/list');
  return authorizedFetch('/api/v1/master/billing/other-charge/list', {
    method: 'GET'
  });
}

export async function createOtherCharge({ code, quantityUnit, rate, active }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/billing/other-charge/create', {
    code,
    quantityUnit,
    rate,
    active
  });
  return authorizedFetch('/api/v1/master/billing/other-charge/create', {
    method: 'POST',
    body: JSON.stringify({ code, quantityUnit, rate, active })
  });
}

export async function editOtherCharge(id, { code, quantityUnit, rate, active }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/billing/other-charge/edit/${id}`, {
    code,
    quantityUnit,
    rate,
    active
  });
  return authorizedFetch(`/api/v1/master/billing/other-charge/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ code, quantityUnit, rate, active })
  });
}

export async function toggleOtherChargeActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/billing/other-charge/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/billing/other-charge/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
