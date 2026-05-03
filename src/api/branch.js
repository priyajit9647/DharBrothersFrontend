import { authorizedFetch } from './auth';

// ==============================|| BRANCH MASTER API ||============================== //

// Expected response: array of {
//   id: number, // e.g. 9007199254740991 (Number.MAX_SAFE_INTEGER)
//   name: string,
//   code: string,
//   branchType: 'MANUFACTURING_UNIT' | 'LOOK_AND_FEEL_STORE',
//   address: string,
//   pincode: string,
//   keyContactPersonName: string,
//   keyContactPersonPhone: string,
//   active: boolean
// }

export async function getBranches() {
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/branch/list');
  return authorizedFetch('/api/v1/master/branch/list', {
    method: 'GET'
  });
}

export async function createBranch({ name, code, branchType, address, pincode, keyContactPersonName, keyContactPersonPhone }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/branch/create', {
    name,
    code,
    branchType,
    address,
    pincode,
    keyContactPersonName,
    keyContactPersonPhone
  });
  return authorizedFetch('/api/v1/master/branch/create', {
    method: 'POST',
    body: JSON.stringify({ name, code, branchType, address, pincode, keyContactPersonName, keyContactPersonPhone })
  });
}

export async function getBranchById(id) {
  // eslint-disable-next-line no-console
  console.log(`Calling GET /api/v1/master/branch/edit/${id}`);
  return authorizedFetch(`/api/v1/master/branch/edit/${id}`, {
    method: 'GET'
  });
}

export async function editBranch(id, { name, code, branchType, address, pincode, keyContactPersonName, keyContactPersonPhone }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/branch/edit/${id}`, {
    name,
    code,
    branchType,
    address,
    pincode,
    keyContactPersonName,
    keyContactPersonPhone
  });
  return authorizedFetch(`/api/v1/master/branch/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, code, branchType, address, pincode, keyContactPersonName, keyContactPersonPhone })
  });
}

export async function toggleBranchActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/branch/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/branch/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
