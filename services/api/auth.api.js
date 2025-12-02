import axiosInstance from '../axios';

// Auth API endpoints
export const authAPI = {
  // Signup - Request OTP
  signup: async (userData) => {
    const response = await axiosInstance.post('/api/auth/signup', userData);
    return response.data;
  },

  // Verify OTP after signup
  verifySignupOTP: async (data) => {
    const response = await axiosInstance.post('/api/auth/verify-signup-otp', data);
    return response.data;
  },

  // Login - Request OTP
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },

  // Verify OTP after login
  verifyLoginOTP: async (data) => {
    const response = await axiosInstance.post('/api/auth/verify-login-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (data) => {
    const response = await axiosInstance.post('/api/auth/resend-otp', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  },
};

export default authAPI;
