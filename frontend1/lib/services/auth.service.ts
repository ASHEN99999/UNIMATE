/**
 * Authentication Service
 * Handles user authentication, registration, and profile management
 */

import apiClient from '../api-client';
import type { User, UserRole, ProviderType } from '../types';

export interface LoginRequest {
  universityEmail: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  universityEmail: string;
  password: string;
  role: UserRole;
  contactPhone?: string;
  providerType?: ProviderType;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; token: string; user: User }>('/auth/login', data);
    
    // Store token
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return { token: response.token, user: response.user };
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; token: string; user: User }>('/auth/register', data);
    
    // Store token
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return { token: response.token, user: response.user };
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>('/auth/profile', data);
    return response.data;
  },

  /**
   * Logout user
   */
  logout(): void {
    apiClient.removeToken();
  },

  /**
   * Admin: Get pending providers
   */
  async getPendingProviders(): Promise<User[]> {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/auth/pending-providers');
    return response.data || [];
  },

  /**
   * Admin: Approve provider
   */
  async approveProvider(providerId: string): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>(`/auth/approve-provider/${providerId}`, {});
    return response.data;
  },

  /**
   * Admin: Reject provider
   */
  async rejectProvider(providerId: string): Promise<void> {
    await apiClient.put<{ success: boolean; data: User }>(`/auth/reject-provider/${providerId}`, {});
  },

  /**
   * Admin: Get all providers
   */
  async getAllProviders(): Promise<User[]> {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/auth/providers');
    return response.data;
  },

  /**
   * Admin: Get all users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/auth/users');
    return response.data;
  },
};

export default authService;
