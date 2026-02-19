import { authorizedFetch } from './auth';

// ==============================|| BINDING RATE MASTER API ||============================== //

export async function getBindingRates() {
  // Expected response: array of { id, bindingType, minCopies, maxCopies, ratePerCopy, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/billing/binding-rate/list');
  return authorizedFetch('/api/v1/master/billing/binding-rate/list', {
    method: 'GET'
  });
}

export async function createBindingRate({ bindingType, minCopies, maxCopies, ratePerCopy, active }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/billing/binding-rate/create', {
    bindingType,
    minCopies,
    maxCopies,
    ratePerCopy,
    active
  });
  return authorizedFetch('/api/v1/master/billing/binding-rate/create', {
    method: 'POST',
    body: JSON.stringify({ bindingType, minCopies, maxCopies, ratePerCopy, active })
  });
}

export async function editBindingRate(id, { bindingType, minCopies, maxCopies, ratePerCopy, active }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/billing/binding-rate/edit/${id}`, {
    bindingType,
    minCopies,
    maxCopies,
    ratePerCopy,
    active
  });
  return authorizedFetch(`/api/v1/master/billing/binding-rate/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ bindingType, minCopies, maxCopies, ratePerCopy, active })
  });
}

export async function toggleBindingRateActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/billing/binding-rate/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/billing/binding-rate/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
