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
 * Example payload (adjust to backend):
 * {
 *   body: string;
 *   mediaUrl?: string;
 *   metadata?: Record<string, any>;
 * }
 */
export function sendWhatsappMessage(phone, payload) {
	if (!phone) {
		throw new Error('phone is required to send a WhatsApp message');
	}

	if (!payload) {
		throw new Error('payload is required to send a WhatsApp message');
	}

	// Backend route: POST /api/v1/admin/whatsapp/reply
	const body = {
		phone,
		...payload
	};

	return authorizedFetch('/api/v1/admin/whatsapp/reply', {
		method: 'POST',
		body: JSON.stringify(body)
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

// Note: webhook verification and receive endpoints are handled server-side only.

