import { crmAPI } from './api';

export const authService = {
  login: async (email, password) => {
    // In a real app, you would authenticate with your backend
    // For demo purposes, we'll simulate a successful login
    const user = {
      id: 'user_' + Date.now(),
      email: email,
      name: email.split('@')[0],
      company: 'Demo Company'
    };
    
    return user;
  },

  signup: async (userData) => {
    try {
      const response = await crmAPI.createUser(userData);
      
      const user = {
        id: response.user_id,
        name: userData.name,
        email: userData.email,
        company: userData.company,
      };
      
      return user;
    } catch (error) {
      throw new Error('Signup failed. Please try again.');
    }
  },
};