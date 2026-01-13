import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import { setAccessToken, getAccessToken, removeAccessToken } from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const token = getAccessToken();
    if (token) {
      // Verify token and restore user session
      const restoreSession = async () => {
        try {
          // Try to refresh token first to ensure it's valid
          const refreshResult = await authApi.refresh();
          if (refreshResult.accessToken) {
            setAccessToken(refreshResult.accessToken);
          }
          
          // Get current user profile
          const userData = await userApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token is invalid or expired, clear it
          console.error('Failed to restore session:', error);
          removeAccessToken();
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      
      restoreSession();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      setAccessToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const signup = async (username, email, password, avatarFile = null) => {
    try {
      const data = await authApi.signup(username, email, password, avatarFile);
      setAccessToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAccessToken();
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const data = await authApi.refresh();
      setAccessToken(data.accessToken);
      return { success: true };
    } catch (error) {
      removeAccessToken();
      setUser(null);
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

