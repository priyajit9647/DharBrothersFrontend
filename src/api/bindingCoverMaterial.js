import { authorizedFetch } from './auth';

// ==============================|| BINDING COVER MATERIAL MASTER API ||============================== //

export async function getBindingCoverMaterials() {
  // Expected response: array of { id, code, name, bindingType, active, design }
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/master/binding-cover-material/list');
  return authorizedFetch('/api/v1/master/binding-cover-material/list', {
    method: 'GET'
  });
}

export async function createBindingCoverMaterial({ code, name, bindingType, designFile }) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/master/binding-cover-material/create', { code, name, bindingType, designFile });

  const formData = new FormData();
  formData.append('code', code);
  formData.append('name', name);
  formData.append('bindingType', bindingType);
  if (designFile) {
    formData.append('design', designFile);
  }

  return authorizedFetch('/api/v1/master/binding-cover-material/create', {
    method: 'POST',
    body: formData
  });
}

export async function editBindingCoverMaterial(id, { code, name, bindingType, designFile }) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/master/binding-cover-material/edit/${id}`);

  const formData = new FormData();
  formData.append('code', code);
  formData.append('name', name);
  formData.append('bindingType', bindingType);
  if (designFile) {
    formData.append('design', designFile);
  }

  return authorizedFetch(`/api/v1/master/binding-cover-material/edit/${id}`, {
    method: 'PUT',
    body: formData
  });
}

export async function toggleBindingCoverMaterialActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/master/binding-cover-material/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/master/binding-cover-material/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}
