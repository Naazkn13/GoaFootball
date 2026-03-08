import axiosInstance from '@/services/axios';

const paymentAPI = {
  // Create payment order (amount is server-side, not passed from client)
  createOrder: async (userId) => {
    const payload = userId ? { userId } : {};
    const response = await axiosInstance.post('/api/payment/create-order', payload);
    return response.data;
  },

  // Verify payment after Razorpay checkout
  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post('/api/payment/verify', paymentData);
    return response.data;
  },

  // Get all payments
  getAllPayments: async () => {
    const response = await axiosInstance.get('/api/payment/all');
    return response.data;
  },
};

export default paymentAPI;
