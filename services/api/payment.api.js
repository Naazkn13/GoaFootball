import axiosInstance from '@/services/axios';

const paymentAPI = {
  // Create payment order — response includes `gateway` field ('instamojo' | 'razorpay')
  // If instamojo: response has { redirectUrl } — redirect user there
  // If razorpay: response has { order, razorpayKeyId } — open Razorpay popup
  createOrder: async (userId) => {
    const payload = userId ? { userId } : {};
    const response = await axiosInstance.post('/api/payment/create-order', payload);
    return response.data;
  },

  // Verify payment after Razorpay checkout (not used for Instamojo — handled server-side)
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

