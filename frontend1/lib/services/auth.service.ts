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
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Store token
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Store token
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', data);
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
    return response.data;
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
    return apiClient.get<User[]>('/auth/providers');
  },

  /**
   * Admin: Get all users
   */
  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/auth/users');
  },
};

export default authService;
