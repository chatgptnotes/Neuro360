import axios from 'axios';
import Cookies from 'js-cookie';

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Static credentials for demo
  staticCredentials: {
    // Super Admin
    'admin@neurosense360.com': {
      password: 'admin123',
      user: {
        id: 'admin-1',
        name: 'Super Admin',
        email: 'admin@neurosense360.com',
        role: 'super_admin',
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff',
        createdAt: new Date().toISOString(),
      }
    },
    // Clinic Admin
    'clinic@demo.com': {
      password: 'clinic123',
      user: {
        id: 'clinic-1',
        name: 'Demo Clinic Admin',
        email: 'clinic@demo.com',
        role: 'clinic_admin',
        clinicId: 'demo-clinic-id',
        avatar: 'https://ui-avatars.com/api/?name=Clinic+Admin&background=2563eb&color=fff',
        createdAt: new Date().toISOString(),
      }
    },
    // Regular User
    'user@demo.com': {
      password: 'user123',
      user: {
        id: 'user-1',
        name: 'Demo User',
        email: 'user@demo.com',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=059669&color=fff',
        createdAt: new Date().toISOString(),
      }
    },
    // Alternative entries for testing
    'test@test.com': {
      password: 'test123',
      user: {
        id: 'test-1',
        name: 'Test User',
        email: 'test@test.com',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Test+User&background=ff6b6b&color=fff',
        createdAt: new Date().toISOString(),
      }
    }
  },

  // Email/Password Authentication
  async loginWithEmail({ email, password }) {
    console.log('🔐 Attempting login with:', { email, password: password ? 'provided' : 'missing' });
    
    // Input validation
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    
    // Trim whitespace and convert to lowercase for email
    const normalizedEmail = email.trim().toLowerCase();
    console.log('📧 Normalized email:', normalizedEmail);
    
    try {
      // Check static credentials first
      const staticCred = this.staticCredentials[normalizedEmail];
      console.log('📝 Static credential found for', normalizedEmail, ':', !!staticCred);
      console.log('📝 Available emails:', Object.keys(this.staticCredentials));
      
      if (staticCred) {
        console.log('🔑 Checking password...');
        if (staticCred.password === password) {
          console.log('✅ Password match - proceeding with login');
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const token = `static_token_${Date.now()}`;
          const response = {
            success: true,
            token: token,
            user: staticCred.user
          };
          
          // Store in localStorage for persistence
          localStorage.setItem('demoUser', JSON.stringify(staticCred.user));
          localStorage.setItem('demoToken', token);
          
          console.log('✅ Login successful, user stored');
          return response;
        } else {
          console.log('❌ Password mismatch for:', normalizedEmail);
          console.log('Expected:', staticCred.password, 'Got:', password);
          throw new Error('Invalid password');
        }
      } else {
        console.log('❌ No credentials found for:', normalizedEmail);
        throw new Error('Invalid email address');
      }
      
    } catch (error) {
      console.error('🚨 Login error:', error.message);
      throw error;
    }
  },

  async registerWithEmail({ name, email, password, confirmPassword }) {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Google OAuth
  async loginWithGoogle() {
    try {
      // In a real app, you would integrate with Google OAuth
      // For demo purposes, we'll simulate the flow
      const response = await this.simulateOAuthLogin('google');
      return response;
    } catch (error) {
      throw new Error('Google login failed');
    }
  },

  async registerWithGoogle() {
    try {
      const response = await this.simulateOAuthLogin('google');
      return response;
    } catch (error) {
      throw new Error('Google registration failed');
    }
  },

  // GitHub OAuth
  async loginWithGitHub() {
    try {
      const response = await this.simulateOAuthLogin('github');
      return response;
    } catch (error) {
      throw new Error('GitHub login failed');
    }
  },

  async registerWithGitHub() {
    try {
      const response = await this.simulateOAuthLogin('github');
      return response;
    } catch (error) {
      throw new Error('GitHub registration failed');
    }
  },

  // Facebook OAuth
  async loginWithFacebook() {
    try {
      const response = await this.simulateOAuthLogin('facebook');
      return response;
    } catch (error) {
      throw new Error('Facebook login failed');
    }
  },

  async registerWithFacebook() {
    try {
      const response = await this.simulateOAuthLogin('facebook');
      return response;
    } catch (error) {
      throw new Error('Facebook registration failed');
    }
  },

  // Simulate OAuth login for demo purposes
  async simulateOAuthLogin(provider) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: `demo_token_${provider}_${Date.now()}`,
          user: {
            id: Math.random().toString(36).substr(2, 9),
            name: `Demo User (${provider})`,
            email: `demo@${provider}.com`,
            avatar: `https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff`,
            provider: provider,
            createdAt: new Date().toISOString(),
          }
        });
      }, 1000); // Simulate network delay
    });
  },

  // Get current user
  async getCurrentUser() {
    try {
      // First try to get from localStorage (for demo)
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        return JSON.parse(demoUser);
      }
      
      // Fallback to API call
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw new Error('Failed to get user data');
    }
  },

  // Logout
  async logout() {
    try {
      // Clear localStorage first
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoToken');
      
      // Try API call
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, local storage is already cleared
      console.error('Logout API call failed:', error);
    }
  },

  // Forgot Password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  // Reset Password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', { token, password: newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  // Change Password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  },

  // Update Profile
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },
};
