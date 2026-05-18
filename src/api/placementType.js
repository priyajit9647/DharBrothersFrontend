import { authorizedFetch } from './auth';

// ==============================|| PLACEMENT TYPE ANALYTICS API ||============================== //

/**
 * Fetch placement type analytics.
 * Endpoint: POST /api/v1/analytics/placement-type
 * Expected body: { startDate: string, endDate: string }
 * @param {{startDate?: string, endDate?: string, [k:string]: any}} payload
 * @returns {Promise<any>}
 */
export async function getPlacementTypeAnalytics(payload = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  // eslint-disable-next-line no-console
  console.log('Calling POST /api/v1/analytics/placement-type', payload);

  return authorizedFetch('/api/v1/analytics/placement-type', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export default getPlacementTypeAnalytics;
