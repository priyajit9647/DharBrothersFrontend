import { authorizedFetch } from './auth';

// ==============================|| PROCESS STAGE ASSIGNMENT API ||============================== //

export async function getProcessStageAssignments() {
  const response = await authorizedFetch('/api/v1/process-stage-assignment/list', {
    method: 'GET'
  });

  const items = Array.isArray(response) ? response : response?.items || response?.data || [];

  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    userName: item.userName,
    stageId: item.stageId,
    stageName: item.stageName,
    noOfDays: item.noOfDays,
    branchId: item.branchId,
    branchName: item.branchName
  }));
}

export async function createProcessStageAssignment({ stageId, userId, noOfDays, branchId }) {
  if (stageId == null || userId == null || noOfDays == null || branchId == null) {
    throw new Error('stageId, userId, noOfDays and branchId are required');
  }

  return authorizedFetch('/api/v1/process-stage-assignment/create', {
    method: 'POST',
    body: JSON.stringify({
      stageId,
      userId,
      noOfDays: Number(noOfDays),
      branchId: Number(branchId)
    })
  });
}

export async function editProcessStageAssignment(id, { stageId, userId, noOfDays, branchId }) {
  if (id == null) {
    throw new Error('id is required to edit a process stage assignment');
  }

  if (stageId == null || userId == null || noOfDays == null || branchId == null) {
    throw new Error('stageId, userId, noOfDays and branchId are required');
  }

  return authorizedFetch(`/api/v1/process-stage-assignment/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      stageId,
      userId,
      noOfDays: Number(noOfDays),
      branchId: Number(branchId)
    })
  });
}