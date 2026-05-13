import { authorizedFetch } from '../auth';

/**
 * Approve a document version
 * Endpoint: /api/v1/document/approve
 * @param {{documentId:number, versionNo:number, customerId:string, approved:boolean, remarks?:string}} payload
 * @returns {Promise<{message?:string, reason?:string, code?:string, accessToken?:string, refreshToken?:string}>}
 */
export async function approveDocumentAdmin(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const { documentId, versionNo, customerId, approved } = payload;

  if (documentId == null || versionNo == null || !customerId || approved == null) {
    throw new Error('documentId, versionNo, customerId and approved are required');
  }

  return authorizedFetch('/api/v1/document/approve', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export default {
  approveDocumentAdmin
};
