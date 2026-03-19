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

