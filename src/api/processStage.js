import { authorizedFetch } from './auth';

// ==============================|| PROCESS STAGE MASTER API ||============================== //

export async function getProcessStages() {
  // Expected response: array of { id, code, stageName, sequenceNo, active }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/process-stage/list');
  return authorizedFetch('/api/v1/master/process-stage/list', {
    method: 'GET'
  });
}

export async function createProcessStage({ code, stageName, sequenceNo }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/process-stage/create', { code, stageName, sequenceNo });
  return authorizedFetch('/api/v1/master/process-stage/create', {
    method: 'POST',
    body: JSON.stringify({ code, stageName, sequenceNo })
  });
}

export async function editProcessStage(id, { code, stageName, sequenceNo }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/process-stage/edit/${id}`, { code, stageName, sequenceNo });
  return authorizedFetch(`/api/v1/master/process-stage/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ code, stageName, sequenceNo })
  });
}

export async function toggleProcessStageActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/process-stage/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/process-stage/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
