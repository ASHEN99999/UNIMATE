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

  async createOffer(itemId: string, data: { offerPrice: number; message?: string; buyerName: string; buyerContact: string }): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/secondhand/items/${itemId}/offers`, data);
    return response.data;
  },

  async getItemOffers(itemId: string): Promise<any[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/secondhand/items/${itemId}/offers`);
    return response.data;
  },

  async getMyOffers(): Promise<any[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/secondhand/offers/my-offers');
    return response.data;
  },

  async respondToOffer(offerId: string, action: 'accept' | 'reject' | 'counter', counterPrice?: number, counterMessage?: string): Promise<any> {
    const response = await apiClient.put<{ success: boolean; data: any }>(`/secondhand/offers/${offerId}/respond`, { action, counterPrice, counterMessage });
    return response.data;
  },

  async withdrawOffer(offerId: string): Promise<any> {
    const response = await apiClient.put<{ success: boolean; data: any }>(`/secondhand/offers/${offerId}/withdraw`, {});
    return response.data;
  },

  async purchaseItem(itemId: string, data: { buyerName: string; buyerContact: string }): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any; message: string }>(`/secondhand/items/${itemId}/purchase`, data);
    return response.data;
  },

  async reserveItem(itemId: string, data: { buyerName: string; buyerContact: string }): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/secondhand/items/${itemId}/reserve`, data);
    return response.data;
  },
};

export default secondhandService;
