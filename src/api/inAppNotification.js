import { authorizedFetch } from './auth';

// ==============================|| IN-APP NOTIFICATION API CLIENT ||============================== //

/**
 * Fetch in-app notification history.
 *
 * Backend route: GET /api/v1/notifications/inapp/list
 */
export async function fetchInAppNotificationHistory() {
	return authorizedFetch('/api/v1/notifications/inapp/list', {
		method: 'GET'
	});
}