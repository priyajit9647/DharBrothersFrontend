import { getOrderFeedbackQrBase64, getOrderShippingAddressQrBase64 } from 'api/orders';

/**
 * orderService provides higher-level order-related utilities for the UI.
 */
const orderService = {
  /**
   * Fetch shipping address QR as base64 string.
   * Returns a plain base64 string (without data: prefix) or throws.
   * @param {string} orderId
   */
  async getShippingQrBase64(orderId) {
    console.log('[orderService.getShippingQrBase64] Called with orderId:', orderId);
    if (!orderId) {
      const err = 'orderId is required';
      console.error('[orderService.getShippingQrBase64] Error:', err);
      throw new Error(err);
    }
    try {
      console.log('[orderService.getShippingQrBase64] Calling getOrderShippingAddressQrBase64...');
      const data = await getOrderShippingAddressQrBase64(orderId);
      console.log('[orderService.getShippingQrBase64] API response type:', typeof data, 'keys:', Object.keys(data || {}));
      // server may return object { base64: '...' } or string
      if (!data) {
        const err = 'Empty QR response';
        console.error('[orderService.getShippingQrBase64]', err);
        throw new Error(err);
      }
      if (typeof data === 'string') {
        console.log('[orderService.getShippingQrBase64] Returning string, length:', data.length);
        return data;
      }
      if (typeof data === 'object') {
        const result = data?.base64 || data?.data || JSON.stringify(data);
        console.log('[orderService.getShippingQrBase64] Extracted from object, length:', result?.length);
        return result;
      }
      const result = String(data);
      console.log('[orderService.getShippingQrBase64] Converted to string, length:', result.length);
      return result;
    } catch (e) {
      console.error('[orderService.getShippingQrBase64] Exception:', e?.message, e);
      throw e;
    }
  },

  async getFeedbackQrBase64(orderId) {
    console.log('[orderService.getFeedbackQrBase64] Called with orderId:', orderId);
    if (!orderId) {
      const err = 'orderId is required';
      console.error('[orderService.getFeedbackQrBase64] Error:', err);
      throw new Error(err);
    }
    try {
      console.log('[orderService.getFeedbackQrBase64] Calling getOrderFeedbackQrBase64...');
      const data = await getOrderFeedbackQrBase64(orderId);
      console.log('[orderService.getFeedbackQrBase64] API response type:', typeof data, 'keys:', Object.keys(data || {}));
      if (!data) {
        const err = 'Empty feedback QR response';
        console.error('[orderService.getFeedbackQrBase64]', err);
        throw new Error(err);
      }
      if (typeof data === 'string') {
        console.log('[orderService.getFeedbackQrBase64] Returning string, length:', data.length);
        return data;
      }
      if (typeof data === 'object') {
        const result = data?.base64 || data?.data || JSON.stringify(data);
        console.log('[orderService.getFeedbackQrBase64] Extracted from object, length:', result?.length);
        return result;
      }
      const result = String(data);
      console.log('[orderService.getFeedbackQrBase64] Converted to string, length:', result.length);
      return result;
    } catch (e) {
      console.error('[orderService.getFeedbackQrBase64] Exception:', e?.message, e);
      throw e;
    }
  },

  async getQrBase64(orderId, type = 'shipping') {
    if (String(type).toLowerCase() === 'feedback') {
      return this.getFeedbackQrBase64(orderId);
    }
    return this.getShippingQrBase64(orderId);
  }
};

export default orderService;
