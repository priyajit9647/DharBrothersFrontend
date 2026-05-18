import { authorizedFetch } from './auth';

// ==============================|| ROLE API CLIENT ||============================== //

/**
 * Fetch list of roles
 * Endpoint: /api/v1/role/list
 * Expected response: array of roles with shape { id, name, active, accessCodes }
 */
export async function getRoles() {
  return authorizedFetch('/api/v1/role/list', {
    method: 'GET'
  });
}

export default { getRoles };
