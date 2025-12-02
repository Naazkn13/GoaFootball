import axiosInstance from '../axios';

// Payment API endpoints
export const paymentAPI = {
  // Create Razorpay order
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/api/payment/create-order', orderData);
    return response.data;
  },

  // Verify Razorpay payment
  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post('/api/payment/verify', paymentData);
    return response.data;
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    const response = await axiosInstance.get(`/api/payment/${paymentId}`);
    return response.data;
  },

  // Get all payments
  getAllPayments: async () => {
    const response = await axiosInstance.get('/api/payment/all');
    return response.data;
  },
};

export default paymentAPI;
