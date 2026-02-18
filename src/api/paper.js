import { authorizedFetch } from './auth';

// ==============================|| PAPER MASTER API ||============================== //

export async function getPapers() {
  // Expected response: array of { code, name, gsm, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/paper/list');
  return authorizedFetch('/api/v1/master/paper/list', {
    method: 'GET'
  });
}

export async function createPaper({ code, name, gsm }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/paper/create', { code, name, gsm });
  return authorizedFetch('/api/v1/master/paper/create', {
    method: 'POST',
    body: JSON.stringify({ code, name, gsm })
  });
}

export async function editPaper(id, { code, name, gsm }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/paper/edit/${id}`, { code, name, gsm });
  return authorizedFetch(`/api/v1/master/paper/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ code, name, gsm })
  });
}

export async function togglePaperActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/paper/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/paper/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
