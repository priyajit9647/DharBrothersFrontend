import { authorizedFetch } from './auth';

// ==============================|| TEAM MASTER API ||============================== //

// Expected response: array of {
//   id: number,
//   name: string,
//   mobile?: string,
//   email?: string,
//   active: boolean
// }

export async function getTeams() {
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/team/list');
  return authorizedFetch('/api/v1/master/team/list', {
    method: 'GET'
  });
}

export async function createTeam({ name, mobile, email }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/team/create', { name, mobile, email });
  return authorizedFetch('/api/v1/master/team/create', {
    method: 'POST',
    body: JSON.stringify({ name, mobile, email })
  });
}

export async function getTeamById(id) {
  // eslint-disable-next-line no-console
  console.log(`Calling GET /api/v1/master/team/edit/${id}`);
  return authorizedFetch(`/api/v1/master/team/edit/${id}`, {
    method: 'GET'
  });
}

export async function editTeam(id, { name, mobile, email }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/team/edit/${id}`, { name, mobile, email });
  return authorizedFetch(`/api/v1/master/team/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, mobile, email })
  });
}

export async function toggleTeamActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/team/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/team/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
