/**
 * Food Assistance Service
 * Handles food assistance requests
 */

import apiClient from '../api-client';
import type { FoodRequest } from '../types';

export interface CreateFoodRequestRequest {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  requestDate: string;
  numberOfMeals: number;
  dietaryRestrictions?: string[];
  reason: string;
  urgencyLevel: 'low' | 'medium' | 'high';
}

export interface UpdateFoodRequestRequest extends Partial<CreateFoodRequestRequest> {
  status?: 'pending' | 'approved' | 'rejected' | 'fulfilled';
}

export const foodService = {
  async getAllRequests(): Promise<FoodRequest[]> {
    return apiClient.get<FoodRequest[]>('/food-assistance/requests');
  },

  async getRequestById(id: string): Promise<FoodRequest> {
    return apiClient.get<FoodRequest>(`/food-assistance/requests/${id}`);
  },

  async getMyRequests(): Promise<FoodRequest[]> {
    return apiClient.get<FoodRequest[]>('/food-assistance/my-requests');
  },

  async createRequest(data: CreateFoodRequestRequest): Promise<FoodRequest> {
    return apiClient.post<FoodRequest>('/food-assistance/requests', data);
  },

  async updateRequest(id: string, data: UpdateFoodRequestRequest): Promise<FoodRequest> {
    return apiClient.put<FoodRequest>(`/food-assistance/requests/${id}`, data);
  },

  async deleteRequest(id: string): Promise<void> {
    return apiClient.delete(`/food-assistance/requests/${id}`);
  },

  async updateRequestStatus(id: string, status: string): Promise<FoodRequest> {
    return apiClient.patch<FoodRequest>(`/food-assistance/requests/${id}/status`, { status });
  },
};

export default foodService;
