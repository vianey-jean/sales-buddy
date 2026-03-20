// Service API pour l'authentification
import api from './api';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';
import { AxiosResponse } from 'axios';

export const authApiService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/login', credentials);
    const data = response.data;
    
    // Store user and token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/register', credentials);
    const data = response.data;
    
    // Store user and token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const response: AxiosResponse<{ exists: boolean }> = await api.post('/api/auth/check-email', { email });
    return response.data;
  },

  async resetPassword(email: string): Promise<{ success: boolean }> {
    const response: AxiosResponse<{ success: boolean }> = await api.post('/api/auth/reset-password', { email });
    return response.data;
  },

  async resetPasswordRequest(data: { email: string }): Promise<boolean> {
    try {
      const response = await api.post('/api/auth/reset-password-request', data);
      return response.data.exists;
    } catch {
      return false;
    }
  },

  async verifyToken(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await api.get('/api/auth/verify');
    return response.data;
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authApiService;
