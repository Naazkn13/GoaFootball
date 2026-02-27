// Razorpay Payment Service
import Razorpay from 'razorpay';
import crypto from 'crypto';

class PaymentService {
  constructor() {
    // Initialize Razorpay instance
    this.razorpay = null;
    this.initializeRazorpay();
  }

  initializeRazorpay() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log('✅ Razorpay initialized successfully');
    } else {
      console.warn('⚠️  Razorpay credentials not found. Payment service will use mock mode.');
    }
  }

  // Create Razorpay order
  async createOrder(amount, currency = 'INR', receipt = null) {
    if (!this.razorpay) {
      // Mock order for development
      return this.createMockOrder(amount, currency);
    }

    try {
      const amountInPaise = Math.round(amount * 100);

      console.log('Creating Razorpay order with:', {
        amount: amountInPaise,
        currency,
        receipt: receipt || `receipt_${Date.now()}`
      });

      const options = {
        amount: amountInPaise, // Amount in paise (smallest currency unit)
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1, // Auto capture payment
      };

      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay order created:', order.id);

      return {
        success: true,
        orderId: order.id,
        amount: amountInPaise, // Amount in paise, ready for Razorpay checkout
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Create mock order for development
  createMockOrder(amount, currency) {
    const orderId = `order_mock_${Date.now()}`;
    console.log('🔧 Creating mock Razorpay order:', orderId);

    return {
      success: true,
      orderId: orderId,
      amount: amount,
      currency: currency,
      receipt: `receipt_mock_${Date.now()}`,
      status: 'created',
      isMock: true,
    };
  }

  // Verify Razorpay payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    if (!this.razorpay) {
      // Mock verification for development
      console.log('🔧 Mock payment verification');
      return true;
    }

    try {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = generatedSignature === signature;
      console.log('Payment signature verification:', isValid ? '✅ Valid' : '❌ Invalid');

      return isValid;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  // Fetch payment details from Razorpay
  async fetchPaymentDetails(paymentId) {
    if (!this.razorpay) {
      return this.getMockPaymentDetails(paymentId);
    }

    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        id: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date(payment.created_at * 1000),
      };
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  // Get mock payment details
  getMockPaymentDetails(paymentId) {
    console.log('🔧 Getting mock payment details');
    return {
      id: paymentId,
      orderId: 'order_mock_123456',
      amount: 50000,
      currency: 'INR',
      status: 'captured',
      method: 'card',
      email: 'user@example.com',
      contact: '9999999999',
      createdAt: new Date(),
      isMock: true,
    };
  }

  // Fetch all payments for an order
  async fetchOrderPayments(orderId) {
    if (!this.razorpay) {
      return [];
    }

    try {
      const payments = await this.razorpay.orders.fetchPayments(orderId);
      return payments.items || [];
    } catch (error) {
      console.error('Error fetching order payments:', error);
      return [];
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount = null) {
    if (!this.razorpay) {
      console.log('🔧 Mock refund initiated');
      return { success: true, refundId: `rfnd_mock_${Date.now()}`, isMock: true };
    }

    try {
      const refundData = amount ? { amount: amount * 100 } : {};
      const refund = await this.razorpay.payments.refund(paymentId, refundData);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      };
    } catch (error) {
      console.error('Refund error:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Capture payment (if not auto-captured)
  async capturePayment(paymentId, amount) {
    if (!this.razorpay) {
      console.log('🔧 Mock payment capture');
      return { success: true, isMock: true };
    }

    try {
      const capture = await this.razorpay.payments.capture(
        paymentId,
        amount * 100,
        'INR'
      );

      return {
        success: true,
        paymentId: capture.id,
        amount: capture.amount / 100,
        status: capture.status,
      };
    } catch (error) {
      console.error('Capture error:', error);
      throw new Error('Failed to capture payment');
    }
  }
}

export default new PaymentService();
