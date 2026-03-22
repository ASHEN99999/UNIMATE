// User Types
export type UserRole = "student" | "provider" | "admin"
export type ProviderType = "housing" | "laundry"

export interface User {
  id: string
  name: string
  universityEmail: string
  role: UserRole
  providerType?: ProviderType
  contactPhone?: string
  contactNumber?: string
  profilePicture?: string
  isActive: boolean
  isApproved?: boolean
  createdAt: string
  updatedAt: string
}

// Housing Types
export type PropertyType = "boarding" | "room" | "annex" | "apartment"
export type RoomType = "single" | "shared" | "full-house"
export type ListingStatus = "pending_approval" | "active" | "inactive" | "rejected"
export type ReservationStatus = "pending" | "approved" | "rejected" | "confirmed" | "cancelled" | "completed"

export interface HousingLocation {
  address: string
  city: string
  district?: string
  distance: number
}

export interface HousingListing {
  id: string
  title: string
  description: string
  price: number
  location: HousingLocation
  propertyType: PropertyType
  roomType: RoomType
  amenities: string[]
  images: string[]
  providerId?: string
  providerName?: string
  contactPhone: string
  availability: boolean
  status: ListingStatus
  rulesAndRegulations?: string
  createdAt: string
  updatedAt: string
}

export interface HousingReservation {
  id: string
  listingId: string
  listing?: HousingListing
  studentId: string
  studentName?: string
  checkInDate: string
  duration: number
  totalPrice: number
  status: ReservationStatus
  message?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

// Laundry Types
export type LaundryBookingStatus = "requested" | "handover_pending" | "confirmed" | "processing" | "ready" | "completed" | "cancelled"
export type PaymentStatus = "pending" | "paid"

export interface ClothesCategory {
  name: string
  pricePerPiece: number
}

export interface ServiceType {
  name: string
  price: number
}

export interface ServiceDuration {
  name: string
  price: number
}

export interface LaundryProvider {
  id: string
  businessName: string
  userId: string
  location: string
  contactNumber: string
  operatingHours: {
    open: string
    close: string
  }
  clothesCategories: ClothesCategory[]
  serviceTypes: ServiceType[]
  serviceDurations: ServiceDuration[]
  rating: number
  totalReviews: number
  isActive: boolean
  createdAt: string
}

export interface ClothesItem {
  category: string
  quantity: number
  price?: number
}

export interface LaundryBooking {
  id: string
  orderNumber: string
  providerId: string
  provider?: LaundryProvider
  studentId: string
  studentName: string
  studentContact: string
  clothesItems: ClothesItem[]
  selectedServices: string[]
  serviceDuration: string
  totalPrice: number
  collectionDate: string
  status: LaundryBookingStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  review?: {
    rating: number
    comment: string
  }
  createdAt: string
}

// Food Assistance Types
export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack"
export type FoodRequestStatus = "pending" | "accepted" | "purchased" | "delivering" | "delivered" | "completed" | "cancelled"

export interface FoodItem {
  item: string
  quantity: number
}

export interface DeliveryLocation {
  type: string
  details: string
}

export interface FoodRequest {
  id: string
  requestNumber: string
  requesterId: string
  requesterName: string
  requesterContact: string
  mealType: MealType
  foodItems: FoodItem[]
  deliveryLocation: DeliveryLocation
  requiredTime: string
  helperId?: string
  helperName?: string
  helperContact?: string
  status: FoodRequestStatus
  estimatedCost?: number
  serviceCharge?: number
  totalCost?: number
  paymentStatus: PaymentStatus
  paymentMethod?: string
  feedback?: {
    rating: number
    comment: string
  }
  specialInstructions?: string
  createdAt: string
}

// Second-Hand Marketplace Types
export type ItemCategory = "Electronics" | "Books & Notes" | "Furniture" | "Clothing" | "Sports Equipment" | "Household Items" | "Stationery" | "Other"
export type ItemCondition = "Like New" | "Good" | "Fair" | "Poor"
export type ItemStatus = "available" | "reserved" | "sold"

export interface SecondHandItem {
  id: string
  title: string
  description: string
  category: ItemCategory
  price: number
  condition: ItemCondition
  images: string[]
  sellerId: string
  sellerName: string
  sellerContact: string
  location: string
  status: ItemStatus
  buyerId?: string
  buyerName?: string
  buyerContact?: string
  reservationExpiry?: string
  views: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  count?: number
}

// Filter Types
export interface HousingFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  propertyType?: PropertyType
  amenities?: string[]
}

export interface MarketplaceFilters {
  category?: ItemCategory
  minPrice?: number
  maxPrice?: number
  condition?: ItemCondition
  search?: string
}

// Dashboard Stats
export interface ProviderDashboardStats {
  totalListings: number
  activeListings: number
  pendingReservations: number
  totalReservations: number
  totalRevenue: number
}

export interface AdminDashboardStats {
  totalUsers: number
  totalStudents: number
  totalProviders: number
  pendingProviders: number
  totalListings: number
  pendingListings: number
  totalBookings: number
  totalRequests: number
}

export interface SellerStats {
  totalItems: number
  availableItems: number
  reservedItems: number
  soldItems: number
  totalRevenue: number
  totalViews: number
  averagePrice: number
}
