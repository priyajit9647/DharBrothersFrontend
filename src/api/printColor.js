import { authorizedFetch } from './auth';

// ==============================|| PRINT COLOR MASTER API ||============================== //

export async function getPrintColors() {
  // Expected response: array of { code, name, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/print-color/list');
  return authorizedFetch('/api/v1/master/print-color/list', {
    method: 'GET'
  });
}

export async function createPrintColor({ code, name }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/print-color/create', { code, name });
  return authorizedFetch('/api/v1/master/print-color/create', {
    method: 'POST',
    body: JSON.stringify({ code, name })
  });
}

export async function editPrintColor(id, { code, name }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/print-color/edit/${id}`, { code, name });
  return authorizedFetch(`/api/v1/master/print-color/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ code, name })
  });
}

export async function togglePrintColorActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/print-color/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/print-color/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
