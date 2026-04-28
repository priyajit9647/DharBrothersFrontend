import { authorizedFetch } from './auth';

// ==============================|| PROCESS STAGE ASSIGNMENT API ||============================== //

export async function createProcessStageAssignment({ stageId, userId, assignmentType }) {
  if (stageId == null || userId == null || !assignmentType) {
    throw new Error('stageId, userId and assignmentType are required');
  }

  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/process-stage-assignment/create', {
    stageId,
    userId,
    assignmentType
  });

  return authorizedFetch('/api/v1/process-stage-assignment/create', {
    method: 'POST',
    body: JSON.stringify({
      stageId,
      userId,
      assignmentType
    })
  });
}

export async function editProcessStageAssignment(id, { stageId, userId, assignmentType }) {
  if (id == null) {
    throw new Error('id is required to edit a process stage assignment');
  }

  if (stageId == null || userId == null || !assignmentType) {
    throw new Error('stageId, userId and assignmentType are required');
  }

  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/process-stage-assignment/edit/${id}`, {
    stageId,
    userId,
    assignmentType
  });

  return authorizedFetch(`/api/v1/process-stage-assignment/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      stageId,
      userId,
      assignmentType
    })
  });
}