import { apiService } from './apis';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async signup(userData) {
    try {
      const response = await apiService.post('/auth/signup', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      const response = await apiService.post('/auth/logout');
      return response;
    } catch (error) {
      throw error;
    }
  },

  async verifyAadhaar(aadhaarNumber) {
    try {
      const response = await apiService.post('/auth/verify-aadhaar', {
        aadhaar: aadhaarNumber,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await apiService.get('/user/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(userData) {
    try {
      const response = await apiService.put('/user/update', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
