import { authorizedFetch, authorizedFetchRaw } from './auth';

// ==============================|| EMAIL / THREADS API CLIENT ||============================== //

// Fetch list of email threads for the admin inbox
// GET /api/v1/admin/threads/list
export async function fetchEmailThreads() {
	return authorizedFetch('/api/v1/admin/threads/list', {
		method: 'GET'
	});
}

// Fetch all messages for a given thread
// GET /api/v1/admin/threads/{threadId}
export async function fetchThreadMessages(threadId) {
	if (!threadId) {
		throw new Error('Thread id is required');
	}

	return authorizedFetch(`/api/v1/admin/threads/${threadId}`, {
		method: 'GET'
	});
}

// Send a reply message in a given thread
// POST /api/v1/admin/threads/{threadId}/reply?replyBody=...
export async function replyToThread(threadId, replyBody) {
	if (!threadId) {
		throw new Error('Thread id is required');
	}
	if (!replyBody || !replyBody.trim()) {
		throw new Error('Reply body is required');
	}

	const query = `replyBody=${encodeURIComponent(replyBody.trim())}`;
	return authorizedFetch(`/api/v1/admin/threads/${threadId}/reply?${query}`, {
		method: 'POST'
	});
}

// Mark a thread as read by admin
// PATCH /api/v1/admin/threads/{threadId}/readed
export async function markThreadRead(threadId) {
	if (!threadId) {
		throw new Error('Thread id is required');
	}

	return authorizedFetch(`/api/v1/admin/threads/${threadId}/readed`, {
		method: 'PATCH'
	});
}

// Download a specific attachment by its id
// GET /api/v1/admin/threads/attachments/{attachmentId}/download
export async function fetchAttachmentBlob(attachmentId) {
	if (!attachmentId) {
		throw new Error('Attachment id is required');
	}

	const response = await authorizedFetchRaw(`/api/v1/admin/threads/attachments/${attachmentId}/download`, {
		method: 'GET'
	});

	return response.blob();
}

// ==============================|| EMAIL NOTIFICATION TEMPLATE API CLIENT ||============================== //

/**
 * Create an email notification template.
 *
 * Backend route: POST /api/v1/master/email-notifications/create
 */
export async function createEmailNotificationTemplate({ event, subjectTemplate, bodyTemplate, active }) {
	if (!event) {
		throw new Error('event is required to create an email notification template');
	}

	return authorizedFetch('/api/v1/master/email-notifications/create', {
		method: 'POST',
		body: JSON.stringify({ event, subjectTemplate, bodyTemplate, active })
	});
}

/**
 * Fetch email Notification History.
 *
 * Backend route: POST /api/v1/master/email-notifications/list
 */
export async function fetchEmailNotificationTemplates() {
	return authorizedFetch('/api/v1/master/email-notifications/list', {
		method: 'POST'
	});
}

/**
 * Edit an email notification template.
 *
 * Backend route: PUT /api/v1/master/email-notifications/edit/{id}
 */
export async function editEmailNotificationTemplate(id, { event, subjectTemplate, bodyTemplate, active }) {
	if (!id) {
		throw new Error('id is required to edit an email notification template');
	}

	if (!event) {
		throw new Error('event is required to edit an email notification template');
	}

	return authorizedFetch(`/api/v1/master/email-notifications/edit/${encodeURIComponent(id)}`, {
		method: 'PUT',
		body: JSON.stringify({ event, subjectTemplate, bodyTemplate, active })
	});
}

/**
 * Enable or disable an email notification template.
 *
 * Backend route: PATCH /api/v1/master/email-notifications/disable/{id}/{active}
 */
export async function toggleEmailNotificationTemplate(id, active) {
	if (!id) {
		throw new Error('id is required to update an email notification template');
	}

	return authorizedFetch(`/api/v1/master/email-notifications/disable/${encodeURIComponent(id)}/${active}`, {
		method: 'PATCH'
	});
}

/**
 * Fetch sent email notification history.
 *
 * Backend route: GET /api/v1/notifications/email/list
 */
export async function fetchEmailNotificationHistory() {
	return authorizedFetch('/api/v1/notifications/email/list', {
		method: 'GET'
	});
}

