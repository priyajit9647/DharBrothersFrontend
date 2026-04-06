import { authorizedFetch } from './auth';

// ==============================|| USER API CLIENT ||============================== //

// Generic user create API. Pass roleName = 'ADMIN' (or your admin role key)
// to create an admin user.
export function createUser(payload) {
  // Expected payload shape:
  // {
  //   userName: string,
  //   firstName: string,
  //   lastName: string,
  //   email: string,
  //   mobile: string,
  //   whatsapp: string,
  //   password: string,
  //   roleName: string,
  //   branchId: string
  // }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Valid user payload is required');
  }

  return authorizedFetch('/api/v1/user/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Convenience helper specifically for admin users
export function createAdminUser({
  userName,
  firstName,
  lastName,
  email,
  mobile,
  whatsapp,
  password,
  branchId,
  roleName = 'ADMIN'
}) {
  return createUser({
    userName,
    firstName,
    lastName,
    email,
    mobile,
    whatsapp,
    password,
    roleName,
    branchId
  });
}

// Get a single user by id
export function getUserById(id) {
  if (!id) {
    throw new Error('id is required to fetch user details');
  }

  return authorizedFetch(`/api/v1/user/get/${encodeURIComponent(id)}`, {
    method: 'GET'
  });
}

// Enable/disable (activate/deactivate) a user
export function toggleUserActive(id, active) {
  if (!id) {
    throw new Error('id is required to toggle user active state');
  }

  const activeFlag = Boolean(active);

  return authorizedFetch(`/api/v1/user/disable/${encodeURIComponent(id)}/${activeFlag}`, {
    method: 'PATCH'
  });
}

// Get all users for a branch
export function getUsersByBranch(branchId) {
  if (!branchId) {
    throw new Error('branchId is required to fetch branch users');
  }

  return authorizedFetch(`/api/v1/user/branch/${encodeURIComponent(branchId)}`, {
    method: 'GET'
  });
}

// Get only active users for a branch
export function getActiveUsersByBranch(branchId) {
  if (!branchId) {
    throw new Error('branchId is required to fetch active branch users');
  }

  return authorizedFetch(`/api/v1/user/branch/${encodeURIComponent(branchId)}/active`, {
    method: 'GET'
  });
}
