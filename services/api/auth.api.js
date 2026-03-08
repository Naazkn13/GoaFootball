import axiosInstance from '@/services/axios';

export const authAPI = {
  // Send OTP to email (email-only login, no password)
  sendOTP: async (email, purpose = 'login') => {
    const response = await axiosInstance.post('/api/auth/send-otp', { email, purpose });
    return response.data;
  },

  // Verify OTP and create session
  verifyOTP: async (email, otp) => {
    const response = await axiosInstance.post('/api/auth/verify-login-otp', { email, otp });
    return response.data;
  },

  // Logout — clear session cookie
  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email, purpose = 'login') => {
    const response = await axiosInstance.post('/api/auth/send-otp', { email, purpose });
    return response.data;
  },
};

export default authAPI;
