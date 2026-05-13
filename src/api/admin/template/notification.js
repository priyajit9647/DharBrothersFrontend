import { authorizedFetch } from '../../auth';

/**
 * Create a template notification for a process stage
 * Endpoint: POST /api/v1/template/notification/create
 *
 * Request example:
 * {
 *   "processStageId": 9007199254740991,
 *   "emailSubject": "string",
 *   "emailBody": "string",
 *   "whatsappTemplateCode": "string",
 *   "whatsappBody": "string",
 *   "inAppBody": "string",
 *   "isActive": true,
 *   "dynamicData": "string"
 * }
 *
 * @param {Object} payload
 * @returns {Promise<Object>} server response
 */
export async function createTemplateNotification(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const { processStageId, emailSubject, emailBody, isActive } = payload;

  if (processStageId == null || !emailSubject || !emailBody || isActive == null) {
    throw new Error('processStageId, emailSubject, emailBody and isActive are required');
  }

  return authorizedFetch('/api/v1/template/notification/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export default {
  createTemplateNotification
};

/**
 * Get list of template notifications
 * Endpoint: GET /api/v1/template/notification/list
 *
 * @returns {Promise<Array<Object>>} list of template notifications
 */
export async function getTemplateNotificationList() {
  return authorizedFetch('/api/v1/template/notification/list', {
    method: 'GET'
  });
}

// extend default export
export const adminTemplateNotification = {
  createTemplateNotification,
  getTemplateNotificationList
};

/**
 * Get template notification by id
 * Endpoint: GET /api/v1/template/notification/{id}
 *
 * @param {number|string} id
 * @returns {Promise<Object>} template object
 */
export async function getTemplateNotificationById(id) {
  if (id == null) throw new Error('id is required');
  return authorizedFetch(`/api/v1/template/notification/${encodeURIComponent(id)}`, {
    method: 'GET'
  });
}

// extend export
adminTemplateNotification.getTemplateNotificationById = getTemplateNotificationById;

/**
 * Edit template notification
 * Endpoint: PUT /api/v1/template/notification/edit/{id}
 *
 * @param {number|string} id
 * @param {Object} payload
 * @returns {Promise<Object>} server response
 */
export async function editTemplateNotification(id, payload) {
  if (id == null) throw new Error('id is required');
  if (!payload || typeof payload !== 'object') throw new Error('payload is required');

  const { processStageId, emailSubject, emailBody, isActive } = payload;
  if (processStageId == null || !emailSubject || !emailBody || isActive == null) {
    throw new Error('processStageId, emailSubject, emailBody and isActive are required');
  }

  return authorizedFetch(`/api/v1/template/notification/edit/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

// extend exports
adminTemplateNotification.editTemplateNotification = editTemplateNotification;

