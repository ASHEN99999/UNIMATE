/**
 * Second-Hand Marketplace Service
 * Handles second-hand item listings
 */

import apiClient from '../api-client';
import type { SecondHandItem } from '../types';

export interface CreateItemRequest {
  title: string;
  description: string;
  price: number;
  category: 'books' | 'electronics' | 'furniture' | 'clothing' | 'sports' | 'other';
  condition: 'like-new' | 'good' | 'fair' | 'used';
  images?: string[];
  contactPhone: string;
  location?: {
    address: string;
    city: string;
  };
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  isAvailable?: boolean;
  isActive?: boolean;
}

export const secondhandService = {
  async getAllItems(): Promise<SecondHandItem[]> {
    return apiClient.get<SecondHandItem[]>('/secondhand/items');
  },

  async getItemById(id: string): Promise<SecondHandItem> {
    return apiClient.get<SecondHandItem>(`/secondhand/items/${id}`);
  },

  async getMyItems(): Promise<SecondHandItem[]> {
    return apiClient.get<SecondHandItem[]>('/secondhand/my-items');
  },

  async createItem(data: CreateItemRequest): Promise<SecondHandItem> {
    return apiClient.post<SecondHandItem>('/secondhand/items', data);
  },

  async updateItem(id: string, data: UpdateItemRequest): Promise<SecondHandItem> {
    return apiClient.put<SecondHandItem>(`/secondhand/items/${id}`, data);
  },

  async deleteItem(id: string): Promise<void> {
    return apiClient.delete(`/secondhand/items/${id}`);
  },

  async markAsSold(id: string): Promise<SecondHandItem> {
    return apiClient.patch<SecondHandItem>(`/secondhand/items/${id}/sold`);
  },
};

export default secondhandService;
