import { authorizedFetch } from './auth';

// ==============================|| ORDERS API CLIENT ||============================== //

function normalizeOrdersResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

/**
 * Fetch orders for an admin by stage name
 * Endpoint: /api/v1/orders/admin/list/{stageName}
 * @param {string} stageName
 * @returns {Promise<Array>} Array of orders
 */
export async function getOrdersByStatus(stageName) {
  if (!stageName) {
    throw new Error('stageName is required');
  }

  const response = await authorizedFetch(`/api/v1/orders/admin/list/${encodeURIComponent(String(stageName))}`, {
    method: 'GET'
  });

  return normalizeOrdersResponse(response);
}

// Backwards-compatible alias
export const getOrdersByStage = getOrdersByStatus;
