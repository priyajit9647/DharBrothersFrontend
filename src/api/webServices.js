import { publicFetch, authorizedFetch } from './auth';

// ==============================|| WEB SERVICES (CMS) API ||============================== //

export async function getPublicWebServices() {
  // Public facing list used by the website
  // Expected response: [{ id, title, shortDescription, image, displayOrder, active }]
  // eslint-disable-next-line no-console
  console.log('Fetching public web services');
  return publicFetch('/api/v1/web/master/services', {
    method: 'GET'
  });
}

export async function getAdminWebServices() {
  // Admin list - may include inactive entries and admin metadata
  // eslint-disable-next-line no-console
  console.log('Fetching admin web services');
  return authorizedFetch('/api/v1/master/web-services/list', {
    method: 'GET'
  });
}

export async function createWebService({ title, shortDescription, displayOrder, imageFile }) {
  // eslint-disable-next-line no-console
  console.log('Creating web service', { title, displayOrder });
  const formData = new FormData();
  formData.append('title', title);
  formData.append('shortDescription', shortDescription || '');
  if (displayOrder !== undefined && displayOrder !== null) {
    formData.append('displayOrder', String(displayOrder));
  }
  if (imageFile) formData.append('image', imageFile);

  return authorizedFetch('/api/v1/master/web-services/create', {
    method: 'POST',
    body: formData
  });
}

export async function editWebService(id, { title, shortDescription, displayOrder, imageFile }) {
  // eslint-disable-next-line no-console
  console.log('Editing web service', id);
  const formData = new FormData();
  if (title !== undefined) formData.append('title', title);
  if (shortDescription !== undefined) formData.append('shortDescription', shortDescription);
  if (displayOrder !== undefined && displayOrder !== null) formData.append('displayOrder', String(displayOrder));
  if (imageFile) formData.append('image', imageFile);

  return authorizedFetch(`/api/v1/master/web-services/edit/${id}`, {
    method: 'PUT',
    body: formData
  });
}

export async function toggleWebServiceActive(id, active) {
  // eslint-disable-next-line no-console
  console.log('Toggle active web service', id, active);
  return authorizedFetch(`/api/v1/master/web-services/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}

export async function deleteWebService(id) {
  // eslint-disable-next-line no-console
  console.log('Deleting web service', id);
  return authorizedFetch(`/api/v1/master/web-services/delete/${id}`, {
    method: 'DELETE'
  });
}

export async function reorderWebServices(orderArray) {
  // orderArray: [{ id, displayOrder }, ...]
  // eslint-disable-next-line no-console
  console.log('Reordering web services', orderArray);
  return authorizedFetch(`/api/v1/master/web-services/reorder`, {
    method: 'PATCH',
    body: JSON.stringify(orderArray)
  });
}
