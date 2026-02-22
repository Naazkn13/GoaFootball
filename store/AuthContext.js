import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from cookie-authenticated API
  const fetchUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/user/profile');
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // Not authenticated or error — clear user
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Called after OTP verification (cookie is already set by the API)
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Logout — call API to clear cookie, then clear local state
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (err) {
      // Even if API call fails, clear local state
      console.error('Logout API error:', err);
    }
    setUser(null);
  }, []);

  // Refresh user data from server (e.g., after registration or approval change)
  const refreshUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/user/profile');
      if (response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
    return null;
  }, []);

  const value = {
    user,
    login,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || user?.is_super_admin || false,
    isSuperAdmin: user?.is_super_admin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
