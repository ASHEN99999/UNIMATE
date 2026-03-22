/**
 * Housing Service  
 * Handles housing listings and reservations
 */

import apiClient from '../api-client';
import type { HousingListing, HousingReservation, ListingStatus, ReservationStatus } from '../types';

export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    district?: string;
    distance: number;
  };
  propertyType: 'boarding' | 'room' | 'annex' | 'apartment';
  roomType: 'single' | 'shared' | 'full-house';
  amenities: string[];
  images?: string[];
  contactPhone: string;
  rulesAndRegulations?: string;
}

export interface UpdateListingRequest extends Partial<CreateListingRequest> {
  availability?: boolean;
  isActive?: boolean;
}

export interface CreateReservationRequest {
  listingId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export const housingService = {
  // Listings
  async getAllListings(): Promise<HousingListing[]> {
    const response = await apiClient.get<{ success: boolean; data: HousingListing[] }>('/housing');
    return response.data;
  },

  async getListingById(id: string): Promise<HousingListing> {
    const response = await apiClient.get<{ success: boolean; data: HousingListing }>(`/housing/${id}`);
    return response.data;
  },

  async getMyListings(): Promise<HousingListing[]> {
    const response = await apiClient.get<{ success: boolean; data: HousingListing[] }>('/housing/my-listings');
    return response.data;
  },

  async createListing(data: CreateListingRequest): Promise<HousingListing> {
    const response = await apiClient.post<{ success: boolean; data: HousingListing }>('/housing', data);
    return response.data;
  },

  async updateListing(id: string, data: UpdateListingRequest): Promise<HousingListing> {
    return apiClient.put<HousingListing>(`/housing/listings/${id}`, data);
  },

  async deleteListing(id: string): Promise<void> {
    return apiClient.delete(`/housing/listings/${id}`);
  },

  async updateListingStatus(id: string, status: ListingStatus): Promise<HousingListing> {
    return apiClient.patch<HousingListing>(`/housing/listings/${id}/status`, { status });
  },

  // Reservations
  async getAllReservations(): Promise<HousingReservation[]> {
    return apiClient.get<HousingReservation[]>('/housing/reservations');
  },

  async getReservationById(id: string): Promise<HousingReservation> {
    return apiClient.get<HousingReservation>(`/housing/reservations/${id}`);
  },

  async getMyReservations(): Promise<HousingReservation[]> {
    return apiClient.get<HousingReservation[]>('/housing/my-reservations');
  },

  async createReservation(data: CreateReservationRequest): Promise<HousingReservation> {
    return apiClient.post<HousingReservation>('/housing/reservations', data);
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<HousingReservation> {
    return apiClient.patch<HousingReservation>(`/housing/reservations/${id}/status`, { status });
  },

  async cancelReservation(id: string): Promise<HousingReservation> {
    return apiClient.patch<HousingReservation>(`/housing/reservations/${id}/cancel`);
  },
};

export default housingService;
