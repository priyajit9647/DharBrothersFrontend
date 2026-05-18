import { authorizedFetch } from './auth';

// ==============================|| TEMPLATE API CLIENT ||============================== //

// ==================== EMAIL TEMPLATE ====================

export async function getEmailTemplates() {
  // eslint-disable-next-line no-console
  console.log('Calling GET /api/v1/template/notification/list');
  const data = await authorizedFetch('/api/v1/template/notification/list', {
    method: 'GET'
  });

  // Support APIs that return either an array or an object with a `data` array.
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  return list.map((item, index) => ({
    id: item.id ?? index + 1,
    templateName: item.templateName ?? item.name ?? item.emailSubject ?? `Template ${index + 1}`,
    subject: item.subject ?? item.emailSubject ?? '',
    emailBody: item.emailBody ?? item.body ?? '',
    recipients: item.recipients ?? '',
    isActive: item.isActive ?? item.active ?? false,
    branchId: item.branchId ?? null,
    processStageId: item.processStageId ?? null,
    roleName: item.roleName ?? item.role?.name ?? null,
    roleId: item.roleId ?? item.role?.id ?? null,
    default: item.default ?? false,
    // keep original payload for advanced usages
    _raw: item
  }));
}

export async function createEmailTemplate({
  templateName,
  templateCode,
  subject,
  body,
  emailBody,
  recipients,
  isActive,
  roleId
}) {
  const finalBody = body ?? emailBody ?? '';
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/template/notification/create', {
    templateName,
    templateCode,
    subject,
    body: finalBody,
    recipients,
    isActive,
    roleId
  });
  return authorizedFetch('/api/v1/template/notification/create', {
    method: 'POST',
    body: JSON.stringify({
      templateName,
      templateCode,
      subject,
      body: finalBody,
      emailBody: finalBody,
      recipients,
      isActive,
      roleId
    })
  });
}

export async function editEmailTemplate(id, {
  templateName,
  templateCode,
  subject,
  body,
  emailBody,
  recipients,
  isActive,
  roleId
}) {
  const finalBody = body ?? emailBody ?? '';
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/template/notification/edit/${id}`, {
    templateName,
    templateCode,
    subject,
    body: finalBody,
    recipients,
    isActive,
    roleId
  });
  return authorizedFetch(`/api/v1/template/notification/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      templateName,
      templateCode,
      subject,
      body: finalBody,
      emailBody: finalBody,
      recipients,
      isActive,
      roleId
    })
  });
}

export async function toggleEmailTemplateActive(id, active) {
  // eslint-disable-next-line no-console
  console.log(`Calling PATCH /api/v1/template/notification/disable/${id}/${active}`);
  return authorizedFetch(`/api/v1/template/notification/disable/${id}/${active}`, {
    method: 'PATCH'
  });
}

export async function deleteEmailTemplate(id) {
  // eslint-disable-next-line no-console
  console.log(`Calling DELETE /api/v1/template/notification/${id}`);
  return authorizedFetch(`/api/v1/template/notification/${id}`, {
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
  templateContent,
  variables,
  isActive,
  roleId
}) {
  const finalBody = body ?? templateContent ?? '';
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/template/whatsapp/create', {
    templateName,
    templateCode,
    body: finalBody,
    variables,
    isActive,
    roleId
  });
  return authorizedFetch('/api/v1/template/whatsapp/create', {
    method: 'POST',
    body: JSON.stringify({
      templateName,
      templateCode,
      body: finalBody,
      templateContent: finalBody,
      variables,
      isActive,
      roleId
    })
  });
}


export async function editWhatsappTemplate(id, {
  templateName,
  templateCode,
  body,
  templateContent,
  variables,
  isActive,
  roleId
}) {
  const finalBody = body ?? templateContent ?? '';
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/template/whatsapp/edit/${id}`, {
    templateName,
    templateCode,
    body: finalBody,
    variables,
    isActive,
    roleId
  });
  return authorizedFetch(`/api/v1/template/whatsapp/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      templateName,
      templateCode,
      body: finalBody,
      templateContent: finalBody,
      variables,
      isActive,
      roleId
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
  content,
  actionUrl,
  isActive,
  roleId
}) {
  const finalBody = body ?? content ?? '';
  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/template/inapp/create', {
    templateName,
    templateCode,
    body: finalBody,
    actionUrl,
    isActive,
    roleId
  });
  return authorizedFetch('/api/v1/template/inapp/create', {
    method: 'POST',
    body: JSON.stringify({
      templateName,
      templateCode,
      body: finalBody,
      content: finalBody,
      actionUrl,
      isActive,
      roleId
    })
  });
}


export async function editInAppTemplate(id, {
  templateName,
  templateCode,
  body,
  content,
  actionUrl,
  isActive,
  roleId
}) {
  const finalBody = body ?? content ?? '';
  // eslint-disable-next-line no-console
  console.log(`Calling PUT /api/v1/template/inapp/edit/${id}`, {
    templateName,
    templateCode,
    body: finalBody,
    actionUrl,
    isActive,
    roleId
  });
  return authorizedFetch(`/api/v1/template/inapp/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      templateName,
      templateCode,
      body: finalBody,
      content: finalBody,
      actionUrl,
      isActive,
      roleId
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
