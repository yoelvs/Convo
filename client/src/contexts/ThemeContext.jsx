import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userApi } from '../api/userApi';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference (fallback)
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Load theme from user profile when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && !themeLoaded) {
      const loadUserTheme = async () => {
        try {
          const userData = await userApi.getCurrentUser();
          if (userData.theme) {
            const isDark = userData.theme === 'dark';
            setDarkMode(isDark);
            setThemeLoaded(true);
          }
        } catch (error) {
          console.error('Failed to load user theme:', error);
        }
      };
      loadUserTheme();
    }
  }, [isAuthenticated, user, themeLoaded]);

  useEffect(() => {
    // Apply dark mode class to document root
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    
    // Save to database if user is authenticated
    if (isAuthenticated && user?.id && themeLoaded) {
      const saveTheme = async () => {
        try {
          await userApi.updateProfile(user.id, { theme: darkMode ? 'dark' : 'light' });
        } catch (error) {
          console.error('Failed to save theme:', error);
        }
      };
      saveTheme();
    } else {
      // Fallback to localStorage if not authenticated
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }
  }, [darkMode, isAuthenticated, user, themeLoaded]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const value = {
    darkMode,
    toggleDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

