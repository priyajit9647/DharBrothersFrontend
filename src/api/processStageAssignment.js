import { authorizedFetch } from './auth';

// ==============================|| PROCESS STAGE ASSIGNMENT API ||============================== //

export async function getProcessStageAssignments() {
  const response = await authorizedFetch('/api/v1/process-stage-assignment/list', {
    method: 'GET'
  });

  const items = Array.isArray(response) ? response : response?.items || response?.data || [];

  return items.map((item) => {
    // Backend may return a processStageMap object: { "1": "NAME1", "2": "NAME2" }
    // Normalize to an array of numeric IDs and a comma-joined stageName string for the UI.
    let stageIds = [];
    let stageName = '';
    if (item && item.processStageMap && typeof item.processStageMap === 'object') {
      stageIds = Object.keys(item.processStageMap).map((k) => Number(k));
      stageName = Object.values(item.processStageMap).join(', ');
    } else if (item && item.stageId != null) {
      stageIds = Array.isArray(item.stageId) ? item.stageId.map((s) => Number(s)) : [Number(item.stageId)];
      stageName = item.stageName || (Array.isArray(item.stageId) ? item.stageId.join(', ') : String(item.stageId));
    }

    return {
      id: item.id,
      userId: item.userId,
      userName: item.userName,
      stageId: stageIds,
      stageName,
      noOfDays: item.noOfDays,
      branchId: item.branchId,
      branchName: item.branchName,
      active: item.active == null ? true : Boolean(item.active)
    };
  });
}

export async function createProcessStageAssignment({ stageId, userId, noOfDays, branchId }) {
  if (stageId == null || userId == null || noOfDays == null || branchId == null) {
    throw new Error('stageId, userId, noOfDays and branchId are required');
  }

  // Accept either a single id or an array of ids. Normalize to array of numbers.
  const stageIds = Array.isArray(stageId) ? stageId : [stageId];
  if (!Array.isArray(stageIds) || stageIds.length === 0) {
    throw new Error('stageId must be a non-empty array or single id');
  }
  const normalizedStageIds = stageIds.map((s) => Number(s));

  return authorizedFetch('/api/v1/process-stage-assignment/create', {
    method: 'POST',
    body: JSON.stringify({
      stageId: normalizedStageIds,
      userId,
      noOfDays: Number(noOfDays),
      branchId: Number(branchId)
    })
  });
}

export async function editProcessStageAssignment(id, { stageId, userId, noOfDays, branchId, active } = {}) {
  if (id == null) {
    throw new Error('id is required to edit a process stage assignment');
  }

  if (stageId == null || userId == null || noOfDays == null || branchId == null) {
    throw new Error('stageId, userId, noOfDays and branchId are required');
  }

  // Normalize stageId to array of numbers
  const stageIds = Array.isArray(stageId) ? stageId : [stageId];
  if (!Array.isArray(stageIds) || stageIds.length === 0) {
    throw new Error('stageId must be a non-empty array or single id');
  }
  const normalizedStageIds = stageIds.map((s) => Number(s));

  const body = {
    stageId: normalizedStageIds,
    userId,
    noOfDays: Number(noOfDays),
    branchId: Number(branchId)
  };

  if (typeof active === 'boolean') {
    body.active = active;
  }

  return authorizedFetch(`/api/v1/process-stage-assignment/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}
// Note: Toggling `active` for an assignment is done via the edit endpoint
// by passing the `active` flag in the request body.