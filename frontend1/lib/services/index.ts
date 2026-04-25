/**
 * Services Index
 * Centralized export for all API services
 */

export { authService } from './auth.service';
export { housingService } from './housing.service';
export { laundryService } from './laundry.service';
export { foodService } from './food.service';
export { secondhandService } from './secondhand.service';

export type { LoginRequest, RegisterRequest, AuthResponse } from './auth.service';
export type { CreateListingRequest, UpdateListingRequest, CreateReservationRequest } from './housing.service';
export type { CreateProviderRequest, UpdateProviderRequest, CreateBookingRequest } from './laundry.service';
export type { CreateFoodRequestRequest, UpdateFoodRequestRequest } from './food.service';
export type { CreateItemRequest, UpdateItemRequest } from './secondhand.service';
