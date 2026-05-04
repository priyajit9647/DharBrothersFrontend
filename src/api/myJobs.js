import { authorizedFetch } from './auth';

// ==============================|| MY JOBS API CLIENT ||============================== //

/**
 * @typedef {Object} MyJob
 * @property {number|string} id
 * @property {string} documentId
 * @property {string} orderId
 * @property {string} stage
 * @property {Object} customer
 * @property {string} dueTime
 * @property {boolean} completed
 * @property {string} completedAt
 * @property {string} delayNote
 * @property {string} delayedAt
 */

function normalizeJobListResponse(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

/**
 * Fetch My Jobs list
 * Endpoint: /api/v1/my-jobs/job-list
 * Optional query: userid
 * @param {string} [userId] - Optional user ID to filter jobs
 * @returns {Promise<MyJob[]>}
 */
export async function getJobList(userId) {
  const query = userId ? `?${new URLSearchParams({ userid: userId }).toString()}` : '';

  const response = await authorizedFetch(`/api/v1/my-jobs/job-list${query}`, {
    method: 'GET'
  });

  return normalizeJobListResponse(response);
}

/**
 * Get a specific job by ID
 * @param {string} jobId - The job ID
 * @returns {Promise} Job object
 */
export async function getJobById(jobId) {
  if (!jobId) {
    throw new Error('Job ID is required');
  }

  return authorizedFetch(`/api/v1/my-jobs/${jobId}`, {
    method: 'GET'
  });
}

/**
 * Update job status
 * @param {string} jobId - The job ID
 * @param {Object} payload - Update payload
 * @returns {Promise} Updated job object
 */
export async function updateJobStatus(jobId, payload) {
  if (!jobId) {
    throw new Error('Job ID is required');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Valid update payload is required');
  }

  return authorizedFetch(`/api/v1/my-jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

/**
 * Update a My Job
 * Endpoint: /api/v1/my-jobs/{id}/update
 * @typedef {Object} UpdateJobRequest
 * @property {string} userId
 * @property {string} [dueTime] - ISO 8601 date string
 * @property {string} [delayNote]
 *
 * @typedef {Object} UpdateJobResponse
 * @property {string} [message]
 * @property {string} [reason]
 * @property {string} [code]
 * @property {string} [accessToken]
 * @property {string} [refreshToken]
 *
 * @param {string|number} id - The job ID
 * @param {UpdateJobRequest} payload - The job update payload
 * @returns {Promise<UpdateJobResponse>}
 */
export async function updateMyJob(id, payload) {
  if (!id) {
    throw new Error('Job ID is required');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Valid update payload is required');
  }

  if (!payload.userId) {
    throw new Error('userId is required in update payload');
  }

  return authorizedFetch(`/api/v1/my-jobs/${encodeURIComponent(String(id))}/update`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

/**
 * Mark a My Job as completed
 * Endpoint: PUT /api/v1/my-jobs/{id}/complete
 * @param {string|number} id - The job ID
 * @returns {Promise<{message?: string, reason?: string, code?: string, accessToken?: string, refreshToken?: string}>}
 */
export async function completeMyJob(id) {
  if (!id) {
    throw new Error('Job ID is required');
  }

  return authorizedFetch(`/api/v1/my-jobs/${encodeURIComponent(String(id))}/complete`, {
    method: 'PUT'
  });
}

// Backward-compatible alias
export const completeJob = completeMyJob;
