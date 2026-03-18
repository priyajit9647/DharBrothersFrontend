import { authorizedFetch } from './auth';

// ==============================|| WHATSAPP CONVERSATIONS API CLIENT ||============================== //

/**
 * Fetch a paginated / filtered list of WhatsApp conversations.
 *
 * Backend route: GET /api/v1/admin/whatsapp/escalated
 */
export function fetchWhatsappConversations(params = {}) {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
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
 * Low-level helpers for webhook integration if needed from the UI.
 */
export function verifyWhatsappWebhook(params = {}) {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			searchParams.append(key, String(value));
		}
	});
	const queryString = searchParams.toString();
	const path = `/api/v1/whatsapp/webhook/verify${queryString ? `?${queryString}` : ''}`;
	return authorizedFetch(path, { method: 'GET' });
}

export function receiveWhatsappWebhook(payload) {
	if (!payload) {
		throw new Error('payload is required to call WhatsApp webhook receive');
	}

	return authorizedFetch('/api/v1/whatsapp/webhook/receive', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

