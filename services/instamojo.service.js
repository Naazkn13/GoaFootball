// Instamojo Payment Service (API v1.1)
// Uses Private API Key + Auth Token for authentication

class InstamojoService {
  constructor() {
    this.apiKey = process.env.INSTAMOJO_API_KEY;
    this.authToken = process.env.INSTAMOJO_AUTH_TOKEN;
    this.privateSalt = process.env.INSTAMOJO_PRIVATE_SALT;
    this.baseUrl = process.env.INSTAMOJO_BASE_URL || 'https://www.instamojo.com/api/1.1';
  }

  getHeaders() {
    return {
      'X-Api-Key': this.apiKey,
      'X-Auth-Token': this.authToken,
    };
  }

  /**
   * Create a payment request on Instamojo.
   * Returns a URL the user should be redirected to.
   */
  async createPaymentRequest({ amount, purpose, buyerName, email, phone, redirectUrl, webhookUrl }) {
    // Build form data
    const params = new URLSearchParams();
    params.append('amount', amount.toString());
    params.append('purpose', purpose);
    if (buyerName) params.append('buyer_name', buyerName);
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);
    if (redirectUrl) params.append('redirect_url', redirectUrl);
    if (webhookUrl) params.append('webhook', webhookUrl);
    params.append('allow_repeated_payments', 'false');
    params.append('send_email', 'false');
    params.append('send_sms', 'false');

    const response = await fetch(`${this.baseUrl}/payment-requests/`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Instamojo create payment request failed:', response.status, errorData);
      throw new Error(`Instamojo API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    return {
      success: true,
      paymentRequestId: data.payment_request?.id || data.id,
      longUrl: data.payment_request?.longurl || data.longurl,
    };
  }

  /**
   * Verify a payment by fetching its status from Instamojo.
   * Called after user is redirected back from Instamojo.
   */
  async getPaymentRequestStatus(paymentRequestId) {
    const response = await fetch(`${this.baseUrl}/payment-requests/${paymentRequestId}/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Instamojo verify failed:', response.status, errorData);
      throw new Error(`Instamojo verification error: ${response.status}`);
    }

    const data = await response.json();
    const paymentRequest = data.payment_request || data;

    return {
      id: paymentRequest.id,
      status: paymentRequest.status,
      amount: paymentRequest.amount,
      payments: paymentRequest.payments || [],
    };
  }

  /**
   * Verify a specific payment within a payment request.
   */
  async verifyPayment(paymentRequestId, paymentId) {
    const requestStatus = await this.getPaymentRequestStatus(paymentRequestId);

    // Find the specific payment in the request
    const payment = requestStatus.payments.find(p => p.payment_id === paymentId);

    if (!payment) {
      return { success: false, status: 'not_found', amount: null, paymentId: null };
    }

    return {
      success: payment.status === 'Credit',
      status: payment.status,
      amount: payment.amount || requestStatus.amount,
      paymentId: payment.payment_id,
    };
  }

  /**
   * Verify webhook signature using HMAC-SHA1 with private salt.
   * Instamojo sends MAC in the webhook payload for verification.
   */
  verifyWebhookSignature(payload, receivedMac) {
    if (!this.privateSalt) {
      console.warn('Instamojo private salt not configured, skipping webhook verification');
      return true;
    }

    const crypto = require('crypto');

    // Sort the payload keys and create the message string
    // Instamojo computes MAC over sorted key-value pairs (excluding 'mac')
    const sortedKeys = Object.keys(payload).filter(k => k !== 'mac').sort();
    const message = sortedKeys.map(k => payload[k]).join('|');

    const computedMac = crypto
      .createHmac('sha1', this.privateSalt)
      .update(message)
      .digest('hex');

    return computedMac === receivedMac;
  }
}

export default new InstamojoService();
