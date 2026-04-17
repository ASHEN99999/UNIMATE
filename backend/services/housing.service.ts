import HousingListing from '../models/HousingListing';
import Reservation from '../models/Reservation';
import User from '../models/User';

export interface CreateListingDto {
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
    amenities?: string[];
    contactPhone: string;
    rulesAndRegulations?: string;
    createdBy: string;
}

export interface UpdateListingDto {
    title?: string;
    description?: string;
    price?: number;
    location?: {
        address?: string;
        city?: string;
        district?: string;
        distance?: number;
    };
    propertyType?: 'boarding' | 'room' | 'annex' | 'apartment';
    roomType?: 'single' | 'shared' | 'full-house';
    amenities?: string[];
    contactPhone?: string;
    rulesAndRegulations?: string;
    status?: string;
    availability?: boolean;
}

export interface CreateReservationDto {
    listingId: string;
    studentId: string;
    message?: string;
    moveInDate?: Date;
}

export interface GetListingsFilter {
    status?: string;
    location?: string;
    userId?: string;
    userRole?: string;
}

export class HousingService {
    /**
     * Create a new housing listing
     */
    async createListing(listingData: CreateListingDto, userId: string) {
        // Check if user is a provider
        const user = await User.findById(userId);
        if (user?.role !== 'provider') {
            throw new Error('Only providers can create housing listings');
        }

        // Check if provider is approved
        if (!user.isApproved) {
            throw new Error('Your provider account must be approved before creating listings');
        }

        // Since provider is already approved by admin, set listing as active immediately
        const listing = await HousingListing.create({
            ...listingData,
            createdBy: userId,
            status: 'active',  // Auto-approve listings from verified providers
            approvedBy: user._id,  // Self-approved since provider is trusted
            approvedAt: new Date()
        });

        return listing;
    }

    /**
     * Get all listings with filters
     * IMPORTANT: Only admin-verified (active) listings are visible to students and public users
     */
    async getAllListings(filter: GetListingsFilter) {
        const { status, location, userId, userRole } = filter;

        let query: any = {};

        // Role-based visibility control
        if (userRole === 'admin') {
            // Admin sees all listings (can filter by status)
            if (status) {
                query.status = status;
            }
        } else if (userRole === 'provider') {
            // Providers see only their own listings (all statuses)
            query.createdBy = userId;
        } else {
            // Students and Public users ONLY see admin-verified (active) listings
            // This ensures unverified boardings are hidden
            query.status = 'active';
            query.availability = true;
        }

        // Location filter (applies to all roles)
        if (location) {
            query['location.city'] = { $regex: location, $options: 'i' };
        }

        const listings = await HousingListing.find(query)
            .populate('createdBy', 'name universityEmail contactPhone')
            .sort({ createdAt: -1 });

        return listings;
    }

    /**
     * Get a single listing by ID
     * Students and public users can only view admin-verified (active) listings
     */
    async getListingById(listingId: string, userRole?: string, userId?: string) {
        const listing = await HousingListing.findById(listingId)
            .populate('createdBy', 'name universityEmail contactPhone');

        if (!listing) {
            throw new Error('Listing not found');
        }

        // Access control based on user role
        if (userRole === 'admin') {
            // Admin can view any listing
            return listing;
        } else if (userRole === 'provider' && userId) {
            // Provider can view their own listing (any status) or active listings
            if (listing.createdBy._id.toString() === userId || listing.status === 'active') {
                return listing;
            }
            throw new Error('Listing not found or not accessible');
        } else {
            // Students and public users can ONLY view active (verified) listings
            if (listing.status !== 'active') {
                throw new Error('Listing not found or not accessible');
            }
            return listing;
        }
    }

    /**
     * Update a listing
     */
    async updateListing(listingId: string, userId: string, updateData: UpdateListingDto) {
        const listing = await HousingListing.findById(listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        // Check ownership
        if (listing.createdBy.toString() !== userId) {
            throw new Error('Not authorized to update this listing');
        }

        // If listing was approved, set back to pending_approval after edit
        if (listing.status === 'active') {
            updateData.status = 'pending_approval';
        }

        const updatedListing = await HousingListing.findByIdAndUpdate(
            listingId,
            updateData,
            { new: true, runValidators: true }
        );

        return updatedListing;
    }

    /**
     * Delete a listing
     */
    async deleteListing(listingId: string, userId: string) {
        const listing = await HousingListing.findById(listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        // Check ownership
        if (listing.createdBy.toString() !== userId) {
            throw new Error('Not authorized to delete this listing');
        }

        await listing.deleteOne();
        return { message: 'Listing deleted successfully' };
    }

    /**
     * Approve a listing (Admin only)
     */
    async approveListing(listingId: string, adminId: string) {
        const listing = await HousingListing.findById(listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        if (listing.status !== 'pending_approval') {
            throw new Error('Only pending listings can be approved');
        }

        listing.status = 'active';
        listing.approvedBy = adminId as any;
        listing.approvedAt = new Date();
        await listing.save();

        return listing;
    }

    /**
     * Reject a listing (Admin only)
     */
    async rejectListing(listingId: string, rejectionReason?: string) {
        const listing = await HousingListing.findById(listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        listing.status = 'rejected';
        listing.rejectionReason = rejectionReason;
        await listing.save();

        return listing;
    }

    /**
     * Create a reservation
     */
    async createReservation(reservationData: CreateReservationDto) {
        const { listingId, studentId, message, moveInDate } = reservationData;

        // Check if listing exists and is active
        const listing = await HousingListing.findById(listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        if (listing.status !== 'active') {
            throw new Error('Cannot reserve inactive listing');
        }

        // Check if student already has a pending reservation for this listing
        const existingReservation = await Reservation.findOne({
            listingId,
            studentId,
            status: 'pending'
        });

        if (existingReservation) {
            throw new Error('You already have a pending reservation for this listing');
        }

        const reservation = await Reservation.create({
            listingId,
            studentId,
            message,
            moveInDate,
            status: 'pending'
        });

        const populatedReservation = await Reservation.findById(reservation._id)
            .populate('listingId', 'title location price')
            .populate('studentId', 'name universityEmail');

        return populatedReservation;
    }

    /**
     * Get all reservations for a listing
     */
    async getListingReservations(listingId: string, userId: string) {
        const listing = await HousingListing.findById(listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        // Check if user owns the listing
        if (listing.createdBy.toString() !== userId) {
            throw new Error('Not authorized');
        }

        const reservations = await Reservation.find({ listingId })
            .populate('studentId', 'name universityEmail')
            .sort({ createdAt: -1 });

        return reservations;
    }

    /**
     * Respond to a reservation (accept/reject)
     */
    async respondToReservation(
        reservationId: string,
        userId: string,
        action: 'accept' | 'reject',
        responseMessage?: string
    ) {
        const reservation = await Reservation.findById(reservationId)
            .populate('listingId');

        if (!reservation) {
            throw new Error('Reservation not found');
        }

        // Check if user owns the listing
        if ((reservation.listingId as any).createdBy.toString() !== userId) {
            throw new Error('Not authorized');
        }

        if (reservation.status !== 'pending') {
            throw new Error('Reservation has already been processed');
        }

        reservation.status = action === 'accept' ? 'accepted' : 'rejected';
        reservation.responseMessage = responseMessage;
        reservation.respondedAt = new Date();
        await reservation.save();

        return reservation;
    }

    /**
     * Get student's own reservations
     */
    async getMyReservations(studentId: string) {
        const reservations = await Reservation.find({ studentId })
            .populate('listingId', 'title location price images contactPhone')
            .sort({ createdAt: -1 });

        // Transform to rename listingId to listing
        return reservations.map((res: any) => {
            const jsonRes = res.toJSON();
            return {
                ...jsonRes,
                listing: jsonRes.listingId // Rename listingId to listing
            };
        });
    }

    /**
     * Cancel a reservation (Student only)
     */
    async cancelReservation(reservationId: string, studentId: string) {
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            throw new Error('Reservation not found');
        }

        // Check if student owns the reservation
        if (reservation.studentId.toString() !== studentId) {
            throw new Error('Not authorized to cancel this reservation');
        }

        // Can only cancel pending reservations
        if (reservation.status !== 'pending') {
            throw new Error('Only pending reservations can be cancelled');
        }

        reservation.status = 'cancelled';
        await reservation.save();

        return reservation;
    }

    /**
     * Toggle listing status (Provider only)
     * Switch between active and inactive
     */
    async toggleListingStatus(listingId: string, providerId: string) {
        const listing = await HousingListing.findById(listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        // Check ownership
        if (listing.createdBy.toString() !== providerId) {
            throw new Error('Not authorized to modify this listing');
        }

        // Can only toggle between active and inactive
        if (listing.status === 'pending_approval') {
            throw new Error('Cannot change status of pending listings');
        }

        if (listing.status === 'rejected') {
            throw new Error('Cannot reactivate rejected listings');
        }

        // Toggle status
        if (listing.status === 'active') {
            listing.status = 'inactive';
        } else if (listing.status === 'inactive') {
            listing.status = 'active';
        }

        await listing.save();

        return listing;
    }

    /**
     * Get provider dashboard statistics
     */
    async getProviderDashboard(providerId: string) {
        const totalListings = await HousingListing.countDocuments({ createdBy: providerId });
        const activeListings = await HousingListing.countDocuments({ 
            createdBy: providerId, 
            status: 'active' 
        });
        const pendingListings = await HousingListing.countDocuments({ 
            createdBy: providerId, 
            status: 'pending_approval' 
        });
        const rejectedListings = await HousingListing.countDocuments({ 
            createdBy: providerId, 
            status: 'rejected' 
        });

        // Get all listings for this provider
        const listings = await HousingListing.find({ createdBy: providerId }).select('_id');
        const listingIds = listings.map(l => l._id);

        // Get reservation statistics
        const totalReservations = await Reservation.countDocuments({ 
            listingId: { $in: listingIds } 
        });
        const pendingReservations = await Reservation.countDocuments({ 
            listingId: { $in: listingIds },
            status: 'pending'
        });
        const acceptedReservations = await Reservation.countDocuments({ 
            listingId: { $in: listingIds },
            status: 'accepted'
        });

        return {
            totalListings,
            activeListings,
            pendingListings,
            rejectedListings,
            totalReservations,
            pendingReservations,
            acceptedReservations
        };
    }

    /**
     * Get admin dashboard statistics
     */
    async getAdminDashboard() {
        const totalListings = await HousingListing.countDocuments();
        const pendingApprovalListings = await HousingListing.countDocuments({ 
            status: 'pending_approval' 
        });
        const activeListings = await HousingListing.countDocuments({ status: 'active' });
        const rejectedListings = await HousingListing.countDocuments({ status: 'rejected' });
        const totalReservations = await Reservation.countDocuments();
        
        const totalUsers = await User.countDocuments();
        const pendingProviders = await User.countDocuments({ 
            role: 'provider', 
            isApproved: false,
            isActive: true
        });

        return {
            totalListings,
            pendingApprovalListings,
            activeListings,
            rejectedListings,
            totalReservations,
            totalUsers,
            pendingProviders
        };
    }

    /**
     * Get all provider reservations
     */
    async getAllProviderReservations(providerId: string, statusFilter?: string) {
        // Get all listings for this provider
        const listings = await HousingListing.find({ createdBy: providerId }).select('_id');
        const listingIds = listings.map(l => l._id);

        const query: any = { listingId: { $in: listingIds } };
        
        if (statusFilter) {
            query.status = statusFilter;
        }

        const reservations = await Reservation.find(query)
            .populate('listingId', 'title location price images')
            .populate('studentId', 'name universityEmail contactNumber')
            .sort({ createdAt: -1 });

        // Transform to include student name and rename listingId to listing
        return reservations.map((res: any) => {
            const jsonRes = res.toJSON();
            return {
                ...jsonRes,
                listing: jsonRes.listingId, // Rename listingId to listing
                studentName: res.studentId?.name
            };
        });
    }

    /**
     * Get a single reservation with full populated details (for PDF generation)
     */
    async getReservationWithDetails(reservationId: string, studentId: string) {
        const reservation = await Reservation.findById(reservationId)
            .populate('studentId', 'name universityEmail')
            .populate({
                path: 'listingId',
                select: 'title location propertyType roomType amenities price contactPhone',
                populate: { path: 'createdBy', select: 'name' }
            });

        if (!reservation) {
            throw new Error('Reservation not found');
        }

        // Only the student who made the reservation can download the PDF
        if (reservation.studentId._id.toString() !== studentId) {
            throw new Error('Not authorized');
        }

        return reservation;
    }
}

export default new HousingService();
