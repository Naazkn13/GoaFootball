import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? '' : 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Cookies are sent automatically with every request
  withCredentials: true,
});

// Track if a refresh is already in progress to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor — Handle 401 with silent refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Public pages that should never trigger a redirect to /login
    const publicPages = ['/', '/login', '/about', '/contact', '/privacy-policy', '/refund-policy', '/terms-and-conditions'];
    const isOnPublicPage = typeof window !== 'undefined' && publicPages.includes(window.location.pathname);

    // Handle 401 Unauthorized — try to refresh before redirecting
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh endpoint itself
      if (originalRequest.url === '/api/auth/refresh') {
        // Only redirect to /login if we're on a PROTECTED page
        if (typeof window !== 'undefined' && !isOnPublicPage) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request to retry after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh
        await axiosInstance.post('/api/auth/refresh');

        // Refresh successful — retry all queued requests
        processQueue(null);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed — only redirect if on a protected page
        processQueue(refreshError);

        if (typeof window !== 'undefined' && !isOnPublicPage) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      console.error('API Error:', message);
    } else if (error.request) {
      console.error('Network Error:', 'No response received');
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
