import axiosInstance from '../axios';

// User API endpoints
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/api/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/api/user/profile', userData);
    return response.data;
  },

  // Get user payment history
  getPaymentHistory: async () => {
    const response = await axiosInstance.get('/api/user/payment-history');
    return response.data;
  },

  // Get user payment status
  getPaymentStatus: async () => {
    const response = await axiosInstance.get('/api/user/payment-status');
    return response.data;
  },
};

export default userAPI;
