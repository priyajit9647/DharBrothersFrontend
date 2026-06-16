/* eslint-disable prettier/prettier */
import { authorizedCustomerFetch, authorizedFetch, getCustomerPortalSession } from './auth';

// ==============================|| DOCUMENT API CLIENT ||============================== //

/**
 * Upload a document version
 * Endpoint: /api/v1/document/upload
 * @param {{documentId: number|string, staffId: string, file: string}} payload
 * @returns {Promise<Object>} server response
 */
export async function uploadDocumentVersion(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const { documentId, staffId, file } = payload;

  if (documentId == null || !staffId || !file) {
    throw new Error('documentId, staffId and file are required');
  }

  return authorizedFetch('/api/v1/document/upload', {
    method: 'POST',
    body: JSON.stringify({ documentId, staffId, file })
  });
}

export async function uploadDocumentVersionFormData(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const { documentStageId, documentId, file, remarks } = payload;

  if (file == null) {
    throw new Error('file is required for multipart upload');
  }

  const formData = new FormData();
  if (documentStageId != null) {
    formData.append('documentStageId', String(documentStageId));
  } else if (documentId != null) {
    formData.append('documentId', String(documentId));
  } else {
    throw new Error('documentStageId or documentId is required');
  }

  if (remarks != null) {
    formData.append('remarks', String(remarks));
  }

  formData.append('file', file);

  return authorizedFetch('/api/v1/document/upload', {
    method: 'POST',
    body: formData
  });
}


/**
 * Initialize a document version workflow
 * Endpoint: /api/v1/document/init
 * @typedef {Object} InitDocumentRequest
 * @property {string} orderDetailsId
 * @property {string} assignedStaffId
 *
 * @typedef {Object} InitDocumentResponse
 * @property {string} [message]
 * @property {string} [reason]
 * @property {string} [code]
 * @property {string} [accessToken]
 * @property {string} [refreshToken]
 *
 * @param {InitDocumentRequest} payload
 * @returns {Promise<InitDocumentResponse>}
 */
export async function initDocument(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const { orderDetailsId, assignedStaffId } = payload;

  if (!orderDetailsId || !assignedStaffId) {
    throw new Error('orderDetailsId and assignedStaffId are required');
  }

  return authorizedFetch('/api/v1/document/init', {
    method: 'POST',
    body: JSON.stringify({ orderDetailsId, assignedStaffId })
  });
}

/**
 * Approve a document version
 * Endpoint: /api/v1/document/approve
 * @typedef {Object} ApproveDocumentRequest
 * @property {number} documentId
 * @property {number} versionNo
 * @property {string} customerId
 * @property {boolean} approved
 * @property {string} remarks
 *
 * @param {ApproveDocumentRequest} payload
 * @returns {Promise<{message: string, reason: string, code: string, accessToken: string, refreshToken: string}>}
 */
export async function approveDocument(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const { documentId, versionNo, customerId, approved, remarks } = payload;

  if (documentId == null || versionNo == null || !customerId || approved == null) {
    throw new Error('documentId, versionNo, customerId and approved are required');
  }

  return authorizedFetch('/api/v1/document/approve', {
    method: 'POST',
    body: JSON.stringify({ documentId, versionNo, customerId, approved, remarks })
  });
}

/**
 * Get document status by id
 * Endpoint: /api/v1/document/{id}/status
 * @param {number|string} id
 * @returns {Promise<{
 *   documentId: number,
 *   currentStage: string,
 *   activeVersion: number,
 *   latestVersionNo: number,
 *   versionFilePaths: string[],
 *   assignedStaffId: string,
 *   assignedStaffName: string,
 *   versions: Array<{
 *     versionNo: number,
 *     filePath: string,
 *     approvalStatus: string,
 *     active: boolean,
 *     remarks: string
 *   }>
 * } | {
 *   message: string,
 *   reason: string,
 *   code: string,
 *   accessToken: string,
 *   refreshToken: string
 * }>}
 */
export async function getDocumentStatus(id) {
  if (id == null || id === '') {
    throw new Error('id is required');
  }

  return authorizedFetch(`/api/v1/document/${id}/status`, {
    method: 'GET'
  });
}

export async function getDocumentVersionList(docStageId) {
  if (docStageId == null || docStageId === '') {
    throw new Error('docStageId is required');
  }

  const session = getCustomerPortalSession();
  const isCustomerPortal = Boolean(session);

  if(isCustomerPortal) {
    return authorizedCustomerFetch(`/api/v1/document/vrson-list?docStageId=${encodeURIComponent(String(docStageId))}`, {
      method: 'GET'
    });
  } else {
    return authorizedFetch(`/api/v1/document/vrson-list?docStageId=${encodeURIComponent(String(docStageId))}`, {
      method: 'GET'
    });
  }
}

export async function getDocumentVersionListFromOrderId(orderId) {
  if (orderId == null || orderId === '') {
    throw new Error('orderId is required');
  }

  const session = getCustomerPortalSession();
  const isCustomerPortal = Boolean(session);

  if(isCustomerPortal) {
    return authorizedCustomerFetch(`/api/v1/document/version-list?orderid=${encodeURIComponent(String(orderId))}`, {
      method: 'GET'
    });
  } else {
    return authorizedFetch(`/api/v1/document/version-list?orderid=${encodeURIComponent(String(orderId))}`, {
      method: 'GET'
    });
  }
}

export default {
  uploadDocumentVersion,
  uploadDocumentVersionFormData,
  initDocument,
  approveDocument,
  getDocumentStatus,
  getDocumentVersionList
};

