import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('authToken') || localStorage.getItem('demoToken');
      const demoUser = localStorage.getItem('demoUser');
      
      if (token || demoUser) {
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (userError) {
          // If getting user fails, clear auth state
          console.warn('Failed to get user data, clearing auth state');
          Cookies.remove('authToken');
          localStorage.removeItem('demoUser');
          localStorage.removeItem('demoToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      // Clear all auth data on error
      Cookies.remove('authToken');
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, method = 'email') => {
    console.log('🚀 AuthContext: Starting login process');
    
    try {
      setLoading(true);
      let response;
      
      console.log('📧 Login method:', method);
      console.log('📝 Credentials:', { email: credentials.email, hasPassword: !!credentials.password });
      
      switch (method) {
        case 'email':
          response = await authService.loginWithEmail(credentials);
          break;
        case 'google':
          response = await authService.loginWithGoogle();
          break;
        case 'github':
          response = await authService.loginWithGitHub();
          break;
        case 'facebook':
          response = await authService.loginWithFacebook();
          break;
        default:
          throw new Error('Invalid authentication method');
      }

      console.log('📦 Auth response:', response);

      if (response && response.success && response.token) {
        Cookies.set('authToken', response.token, { expires: 7 }); // 7 days
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Logged in successfully');
        console.log('✅ AuthContext: Login completed successfully');
        return { success: true, user: response.user };
      } else {
        console.log('❌ AuthContext: Invalid response format:', response);
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('🚨 AuthContext: Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, method = 'email') => {
    try {
      setLoading(true);
      let response;
      
      switch (method) {
        case 'email':
          response = await authService.registerWithEmail(userData);
          break;
        case 'google':
          response = await authService.registerWithGoogle();
          break;
        case 'github':
          response = await authService.registerWithGitHub();
          break;
        case 'facebook':
          response = await authService.registerWithFacebook();
          break;
        default:
          throw new Error('Invalid registration method');
      }

      if (response.token) {
        Cookies.set('authToken', response.token, { expires: 7 });
        setUser(response.user);
        setIsAuthenticated(true);
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      Cookies.remove('authToken');
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoToken');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      // Redirect to login page after logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      Cookies.remove('authToken');
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoToken');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      console.error('Forgot password failed:', error);
      toast.error(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      await authService.resetPassword(token, newPassword);
      toast.success('Password reset successful!');
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error(error.message || 'Password reset failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
