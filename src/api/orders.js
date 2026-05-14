import { authorizedFetch } from './auth';

// ==============================|| ORDERS API CLIENT ||============================== //

function normalizeOrdersResponse(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== '') {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
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

/**
 * Fetch recent dashboard orders.
 * Endpoint: /api/v1/dashboard/orders/recent
 * @param {{branchId?: number|string, fromDate?: string, toDate?: string, page?: number, size?: number, sort?: string|string[]}} params
 * @returns {Promise<Array>} Array of recent orders
 */
export async function getRecentOrders(params = {}) {
  const { branchId, fromDate, toDate, page = 0, size = 10, sort = ['createdDate,DESC'] } = params;

  const queryString = buildQueryString({
    branchId,
    fromDate,
    toDate,
    page,
    size,
    sort
  });

  const response = await authorizedFetch(`/api/v1/dashboard/orders/recent${queryString}`, {
    method: 'GET'
  });

  return normalizeOrdersResponse(response);
}

// Backwards-compatible alias
export const getOrdersByStage = getOrdersByStatus;
