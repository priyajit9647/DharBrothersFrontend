import { authorizedFetch } from './auth';

// ==============================|| TEMPLATE API CLIENT ||============================== //

// ==================== EMAIL TEMPLATE ====================

export async function getEmailTemplates() {
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/template/email/list');
  return authorizedFetch('/api/v1/template/email/list', {
    method: 'GET'
  });
}

export async function createEmailTemplate({
  templateName,
  templateCode,
  subject,
  body,
  isActive
}) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/template/email/create', {
    templateName,
    templateCode,
    subject,
    body,
    isActive
  });
  return authorizedFetch('/api/v1/template/email/create', {
    method: 'POST',
    body: JSON.stringify({
      templateName,
      templateCode,
      subject,
      body,
      isActive
    })
  });
}

export async function editEmailTemplate(id, {
  templateName,
  templateCode,
  subject,
  body,
  isActive
}) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/template/email/edit/${id}`, {
    templateName,
    templateCode,
    subject,
    body,
    isActive
  });
  return authorizedFetch(`/api/v1/template/email/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      templateName,
      templateCode,
      subject,
      body,
      isActive
    })
  });
}

export async function toggleEmailTemplateActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/template/email/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/template/email/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}

export async function deleteEmailTemplate(id) {
  // eslint-disable-next-line no-console
  console.log(`Calling DELETE /api/v1/template/email/${id}`);
  return authorizedFetch(`/api/v1/template/email/${id}`, {
    method: 'DELETE'
  });
}

// ==================== WHATSAPP TEMPLATE ====================

export async function getWhatsappTemplates() {
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/template/whatsapp/list');
  return authorizedFetch('/api/v1/template/whatsapp/list', {
    method: 'GET'
  });
}

export async function createWhatsappTemplate({
  templateName,
  templateCode,
  body,
  isActive
}) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/template/whatsapp/create', {
    templateName,
    templateCode,
    body,
    isActive
  });
  return authorizedFetch('/api/v1/template/whatsapp/create', {
    method: 'POST',
    body: JSON.stringify({
      templateName,
      templateCode,
      body,
      isActive
    })
  });
}

export async function editWhatsappTemplate(id, {
  templateName,
  templateCode,
  body,
  isActive
}) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/template/whatsapp/edit/${id}`, {
    templateName,
    templateCode,
    body,
    isActive
  });
  return authorizedFetch(`/api/v1/template/whatsapp/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      templateName,
      templateCode,
      body,
      isActive
    })
  });
}

export async function toggleWhatsappTemplateActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/template/whatsapp/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/template/whatsapp/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}

export async function deleteWhatsappTemplate(id) {
  // eslint-disable-next-line no-console
  console.log(`Calling DELETE /api/v1/template/whatsapp/${id}`);
  return authorizedFetch(`/api/v1/template/whatsapp/${id}`, {
    method: 'DELETE'
  });
}

// ==================== IN-APP TEMPLATE ====================

export async function getInAppTemplates() {
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/template/inapp/list');
  return authorizedFetch('/api/v1/template/inapp/list', {
    method: 'GET'
  });
}

export async function createInAppTemplate({
  templateName,
  templateCode,
  body,
  isActive
}) {
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/template/inapp/create', {
    templateName,
    templateCode,
    body,
    isActive
  });
  return authorizedFetch('/api/v1/template/inapp/create', {
    method: 'POST',
    body: JSON.stringify({
      templateName,
      templateCode,
      body,
      isActive
    })
  });
}

export async function editInAppTemplate(id, {
  templateName,
  templateCode,
  body,
  isActive
}) {
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/template/inapp/edit/${id}`, {
    templateName,
    templateCode,
    body,
    isActive
  });
  return authorizedFetch(`/api/v1/template/inapp/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      templateName,
      templateCode,
      body,
      isActive
    })
  });
}

export async function toggleInAppTemplateActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/template/inapp/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/template/inapp/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}

export async function deleteInAppTemplate(id) {
  // eslint-disable-next-line no-console
  console.log(`Calling DELETE /api/v1/template/inapp/${id}`);
  return authorizedFetch(`/api/v1/template/inapp/${id}`, {
    method: 'DELETE'
  });
}
