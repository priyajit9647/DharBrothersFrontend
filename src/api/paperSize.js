import { authorizedFetch } from './auth';

// ==============================|| PAPER SIZE MASTER API ||============================== //

export async function getPaperSizes() {
  // Expected response: array of { id, code, displayName, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/paper-size');
  return authorizedFetch('/api/v1/master/paper-size/list', {
    method: 'GET'
  });
}

export async function createPaperSize({ code, displayName }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/paper-size/create', { code, displayName });
  return authorizedFetch('/api/v1/master/paper-size/create', {
    method: 'POST',
    body: JSON.stringify({ code, displayName })
  });
}

export async function editPaperSize(id, { code, displayName }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/paper-size/edit/${id}`, { code, displayName });
  return authorizedFetch(`/api/v1/master/paper-size/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ code, displayName })
  });
}

export async function togglePaperSizeActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/paper-size/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/paper-size/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
