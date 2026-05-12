import { authorizedFetch } from '../auth';

/**
 * Create or update branch notification template
 * Endpoint: /api/branch/notification-template
 * @param {{branchId:number, processStageId:number, emailSubject:string, emailBody:string, whatsappTemplateCode?:string, whatsappBody?:string, inAppBody?:string, isActive:boolean}} payload
 * @returns {Promise<Object>} server response
 */
export async function createNotificationTemplate(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const { branchId, processStageId, emailSubject, emailBody, isActive } = payload;

  if (branchId == null || processStageId == null || !emailSubject || !emailBody || isActive == null) {
    throw new Error('branchId, processStageId, emailSubject, emailBody and isActive are required');
  }

  return authorizedFetch('/api/branch/notification-template', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export default {
  createNotificationTemplate
};

/**
 * Get branch notification template for a specific stage
 * Endpoint: GET /api/branch/{branchId}/notification-template/{stageId}
 *
 * @param {number|string} branchId
 * @param {number|string} stageId
 * @returns {Promise<Object>} template object
 */
export async function getNotificationTemplate(branchId, stageId) {
  if (branchId == null || stageId == null) {
    throw new Error('branchId and stageId are required');
  }

  return authorizedFetch(`/api/branch/${encodeURIComponent(branchId)}/notification-template/${encodeURIComponent(stageId)}`, {
    method: 'GET'
  });
}

/**
 * Delete branch notification template for a specific stage
 * Endpoint: DELETE /api/branch/{branchId}/notification-template/{stageId}
 *
 * @param {number|string} branchId
 * @param {number|string} stageId
 * @returns {Promise<Object>} server response
 */
export async function deleteNotificationTemplate(branchId, stageId) {
  if (branchId == null || stageId == null) {
    throw new Error('branchId and stageId are required');
  }

  return authorizedFetch(`/api/branch/${encodeURIComponent(branchId)}/notification-template/${encodeURIComponent(stageId)}`, {
    method: 'DELETE'
  });
}

export const adminTemplateEmail = {
  createNotificationTemplate,
  getNotificationTemplate,
  deleteNotificationTemplate
};
