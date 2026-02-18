import { authorizedFetch } from './auth';

// ==============================|| PAGE TYPE MASTER API ||============================== //

export async function getPageTypes() {
  // Expected response: array of { code, name, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/page-type/list');
  return authorizedFetch('/api/v1/master/page-type/list', {
    method: 'GET'
  });
}

export async function createPageType({ code, name }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/page-type/create', { code, name });
  return authorizedFetch('/api/v1/master/page-type/create', {
    method: 'POST',
    body: JSON.stringify({ code, name })
  });
}

export async function editPageType(id, { code, name }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/page-type/edit/${id}`, { code, name });
  return authorizedFetch(`/api/v1/master/page-type/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ code, name })
  });
}

export async function togglePageTypeActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/page-type/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/page-type/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
