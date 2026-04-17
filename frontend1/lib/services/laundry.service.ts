/**
 * Laundry Service
 * Handles laundry providers and bookings
 */

import apiClient from '../api-client';
import type { LaundryProvider, LaundryBooking } from '../types';

export interface CreateProviderRequest {
  shopName: string;
  description: string;
  location: {
    address: string;
    city: string;
    district?: string;
    distance: number;
  };
  contactPhone: string;
  services: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
  operatingHours: {
    open: string;
    close: string;
  };
  availableDays: string[];
}

export interface UpdateProviderRequest extends Partial<CreateProviderRequest> {
  isActive?: boolean;
}

export interface CreateBookingRequest {
  providerId: string;
  service: string;
  scheduledDate: string;
  scheduledTime: string;
  itemCount: number;
  specialInstructions?: string;
}

export const laundryService = {
  // Providers
  async getAllProviders(): Promise<LaundryProvider[]> {
    return apiClient.get<LaundryProvider[]>('/laundry/providers');
  },

  async getProviderById(id: string): Promise<LaundryProvider> {
    return apiClient.get<LaundryProvider>(`/laundry/providers/${id}`);
  },

  async getMyProvider(): Promise<LaundryProvider> {
    return apiClient.get<LaundryProvider>('/laundry/my-provider');
  },

  async createProvider(data: CreateProviderRequest): Promise<LaundryProvider> {
    return apiClient.post<LaundryProvider>('/laundry/providers', data);
  },

  async updateProvider(id: string, data: UpdateProviderRequest): Promise<LaundryProvider> {
    return apiClient.put<LaundryProvider>(`/laundry/providers/${id}`, data);
  },

  async deleteProvider(id: string): Promise<void> {
    return apiClient.delete(`/laundry/providers/${id}`);
  },

  // Bookings
  async getAllBookings(): Promise<LaundryBooking[]> {
    return apiClient.get<LaundryBooking[]>('/laundry/bookings');
  },

  async getBookingById(id: string): Promise<LaundryBooking> {
    return apiClient.get<LaundryBooking>(`/laundry/bookings/${id}`);
  },

  async getMyBookings(): Promise<LaundryBooking[]> {
    return apiClient.get<LaundryBooking[]>('/laundry/my-bookings');
  },

  async createBooking(data: CreateBookingRequest): Promise<LaundryBooking> {
    return apiClient.post<LaundryBooking>('/laundry/bookings', data);
  },

  async updateBookingStatus(id: string, status: string): Promise<LaundryBooking> {
    return apiClient.patch<LaundryBooking>(`/laundry/bookings/${id}/status`, { status });
  },

  async cancelBooking(id: string): Promise<LaundryBooking> {
    return apiClient.patch<LaundryBooking>(`/laundry/bookings/${id}/cancel`);
  },

  async getBookingQRCode(bookingId: string): Promise<{ qrCode: string; booking: any }> {
    const response = await apiClient.get<{ success: boolean; data: { qrCode: string; booking: any } }>(
      `/laundry/bookings/${bookingId}/qr`
    );
    return response.data;
  },
};

export default laundryService;
