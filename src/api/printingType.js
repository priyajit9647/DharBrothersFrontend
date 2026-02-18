import { authorizedFetch } from './auth';

// ==============================|| PRINTING TYPE MASTER API ||============================== //

export async function getPrintingTypes() {
  // Expected response: array of { code, name, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/printing-type/list');
  return authorizedFetch('/api/v1/master/printing-type/list', {
    method: 'GET'
  });
}

export async function createPrintingType({ code, name }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/printing-type/create', { code, name });
  return authorizedFetch('/api/v1/master/printing-type/create', {
    method: 'POST',
    body: JSON.stringify({ code, name })
  });
}

export async function editPrintingType(id, { code, name }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/printing-type/edit/${id}`, { code, name });
  return authorizedFetch(`/api/v1/master/printing-type/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ code, name })
  });
}

export async function togglePrintingTypeActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/printing-type/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/printing-type/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
