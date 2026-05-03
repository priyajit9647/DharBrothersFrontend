import { authorizedFetch, authorizedFetchRaw } from './auth';

// ==============================|| WHATSAPP CONVERSATIONS API CLIENT ||============================== //

/**
 * Fetch a paginated / filtered list of WhatsApp conversations.
 *
 * Backend route: GET /api/v1/admin/whatsapp/escalated
 */
export function fetchWhatsappConversations(params = {}) {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		// Backend no longer expects explicit paging query params here,
		// so drop any page/pageSize values even if callers still send them.
		if ((key === 'page' || key === 'pageSize')) {
			return;
		}

		if (value !== undefined && value !== null && value !== '') {
			searchParams.append(key, String(value));
		}
	});

	const queryString = searchParams.toString();
	const path = `/api/v1/admin/whatsapp/escalated${queryString ? `?${queryString}` : ''}`;

	return authorizedFetch(path, { method: 'GET' });
}

/**
 * Fetch a single WhatsApp conversation (including its messages) by phone.
 *
 * Expected response shape (adjust to backend):
 * {
 *   id: string | number;
 *   customerName?: string;
 *   phone?: string;
 *   messages: Array<{
 *     id: string | number;
 *     direction: 'inbound' | 'outbound';
 *     body: string;
 *     sentAt: string;
 *   }>;
 *   ...
 * }
 */
export function fetchWhatsappConversationById(phone) {
	if (!phone) {
		throw new Error('phone is required to fetch a WhatsApp conversation');
	}

	// Backend route: GET /api/v1/admin/whatsapp/conversation/{phone}
	return authorizedFetch(`/api/v1/admin/whatsapp/conversation/${encodeURIComponent(phone)}`, {
		method: 'GET'
	});
}

/**
 * Send a WhatsApp message within an existing conversation.
 *
 * Backend expects request params:
 *   phone: string
 *   adminUsername: string
 *   message: string
 */
export function sendWhatsappMessage(phone, payload) {
	if (!phone) {
		throw new Error('phone is required to send a WhatsApp message');
	}

	if (!payload) {
		throw new Error('payload is required to send a WhatsApp message');
	}

	const adminUsername = payload.adminUsername || payload.username || '';
	const message = payload.message || payload.body || '';

	if (!adminUsername) {
		throw new Error('adminUsername is required to send a WhatsApp message');
	}

	if (!message) {
		throw new Error('message is required to send a WhatsApp message');
	}

	const searchParams = new URLSearchParams({
		phone: String(phone),
		adminUsername: String(adminUsername),
		message: String(message)
	});

	return authorizedFetch(`/api/v1/admin/whatsapp/reply?${searchParams.toString()}`, {
		method: 'POST'
	});
}

/**
 * Disable AI assistance for a given WhatsApp conversation.
 *
 * Backend route: POST /api/v1/admin/whatsapp/disable-ai
 */
export function disableAiForWhatsappConversation(phone, payload = {}) {
	if (!phone) {
		throw new Error('phone is required to disable AI for a WhatsApp conversation');
	}

	const body = {
		phone,
		...payload
	};

	return authorizedFetch('/api/v1/admin/whatsapp/disable-ai', {
		method: 'POST',
		body: JSON.stringify(body)
	});
}

/**
 * Close a WhatsApp conversation.
 *
 * Backend route: POST /api/v1/admin/whatsapp/close
 */
export function closeWhatsappConversation(phone, payload = {}) {
	if (!phone) {
		throw new Error('phone is required to close a WhatsApp conversation');
	}

	const body = {
		phone,
		...payload
	};

	return authorizedFetch('/api/v1/admin/whatsapp/close', {
		method: 'POST',
		body: JSON.stringify(body)
	});
}

/**
 * Download a specific WhatsApp attachment by its id.
 *
 * Backend route: GET /api/v1/admin/whatsapp/attachments/{attachmentId}/download
 */
export async function fetchWhatsappAttachmentBlob(attachmentId) {
	if (!attachmentId && attachmentId !== 0 && attachmentId !== '0') {
		throw new Error('attachmentId is required to download a WhatsApp attachment');
	}

	const response = await authorizedFetchRaw(`/api/v1/admin/whatsapp/attachments/${encodeURIComponent(String(attachmentId))}/download`, {
		method: 'GET'
	});

	return response.blob();
}

/**
 * Create a WhatsApp notification template.
 *
 * Backend route: POST /api/v1/master/whatsapp-notifications/create
 */
export function createWhatsappNotificationTemplate({ event, subjectTemplate, bodyTemplate, active }) {
	if (!event) {
		throw new Error('event is required to create a WhatsApp notification template');
	}

	return authorizedFetch('/api/v1/master/whatsapp-notifications/create', {
		method: 'POST',
		body: JSON.stringify({ event, subjectTemplate, bodyTemplate, active })
	});
}

/**
 * Fetch the list of WhatsApp Notification History.
 *
 * Backend route: POST /api/v1/master/whatsapp-notifications/list
 */
export function fetchWhatsappNotificationTemplates() {
	return authorizedFetch('/api/v1/master/whatsapp-notifications/list', {
		method: 'POST'
	});
}

/**
 * Update a WhatsApp notification template.
 *
 * Backend route: PUT /api/v1/master/whatsapp-notifications/edit/{id}
 */
export function editWhatsappNotificationTemplate(id, { event, subjectTemplate, bodyTemplate, active }) {
	if (!id) {
		throw new Error('id is required to edit a WhatsApp notification template');
	}

	if (!event) {
		throw new Error('event is required to edit a WhatsApp notification template');
	}

	return authorizedFetch(`/api/v1/master/whatsapp-notifications/edit/${encodeURIComponent(id)}`, {
		method: 'PUT',
		body: JSON.stringify({ event, subjectTemplate, bodyTemplate, active })
	});
}

/**
 * Enable or disable a WhatsApp notification template.
 *
 * Backend route: PATCH /api/v1/master/whatsapp-notifications/disable/{id}/{active}
 */
export function toggleWhatsappNotificationTemplate(id, active) {
	if (!id) {
		throw new Error('id is required to update a WhatsApp notification template');
	}

	return authorizedFetch(`/api/v1/master/whatsapp-notifications/disable/${encodeURIComponent(id)}/${active}`, {
		method: 'PATCH'
	});
}

/**
 * Fetch the list of WhatsApp notifications (sent notification history/logs).
 *
 * Backend route: POST /api/v1/notifications/whatsapp/list
 * Returns an array of notification objects with id, customerId, customerName, customerPhone, 
 * notificationId, event, subject, body, sent, retryCount, errorMessage, createdDate
 */
export function fetchWhatsappNotificationHistory() {
	return authorizedFetch('/api/v1/notifications/whatsapp/list', {
		method: 'GET'
	});
}

// Note: webhook verification and receive endpoints are handled server-side only.

