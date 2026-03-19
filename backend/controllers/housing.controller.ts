import { Response } from 'express';
import HousingListing from '../models/HousingListing';
import Reservation from '../models/Reservation';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// @desc    Create a new housing listing (Provider only)
// @route   POST /api/housing
// @access  Private (Provider)
export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            title,
            description,
            price,
            location,
            address,
            rooms,
            bathrooms,
            amenities,
            contactNumber,
            availableFrom
        } = req.body;

        // Validate required fields
        if (!title || !description || !price || !location || !contactNumber) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
            return;
        }

        // Check if user is a provider
        const user = await User.findById(req.user?.userId);
        if (user?.role !== 'provider') {
            res.status(403).json({
                success: false,
                message: 'Only providers can create housing listings'
            });
            return;
        }

        const listing = await HousingListing.create({
            title,
            description,
            price,
            location,
            address,
            rooms,
            bathrooms,
            amenities,
            contactNumber,
            availableFrom,
            createdBy: req.user?.userId,
            status: 'pending_approval'
        });

        res.status(201).json({
            success: true,
            message: 'Listing created successfully. Waiting for admin approval.',
            data: listing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Get all listings (Filter by status)
// @route   GET /api/housing
// @access  Public
export const getAllListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, location } = req.query;

        let filter: any = {};

        // Students only see active listings
        if (req.user && req.user.role === 'student') {
            filter.status = 'active';
        }

        // Providers see their own listings
        if (req.user && req.user.role === 'provider') {
            filter.createdBy = req.user.userId;
        }

        // Admin sees all listings
        if (req.user && req.user.role === 'admin' && status) {
            filter.status = status;
        }

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        const listings = await HousingListing.find(filter)
            .populate('createdBy', 'name universityEmail')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Get single listing by ID
// @route   GET /api/housing/:id
// @access  Public
export const getListingById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await HousingListing.findById(req.params.id)
            .populate('createdBy', 'name universityEmail contactNumber');

        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: listing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Update a listing (Provider only - own listings)
// @route   PUT /api/housing/:id
// @access  Private (Provider)
export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await HousingListing.findById(req.params.id);

        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }

        // Check ownership
        if (listing.createdBy.toString() !== req.user?.userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this listing'
            });
            return;
        }

        // If listing was approved, set back to pending_approval after edit
        if (listing.status === 'active') {
            req.body.status = 'pending_approval';
        }

        const updatedListing = await HousingListing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: updatedListing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Delete a listing (Provider only - own listings)
// @route   DELETE /api/housing/:id
// @access  Private (Provider)
export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await HousingListing.findById(req.params.id);

        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }

        // Check ownership
        if (listing.createdBy.toString() !== req.user?.userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this listing'
            });
            return;
        }

        await listing.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Approve a listing (Admin only)
// @route   PUT /api/housing/:id/approve
// @access  Private (Admin)
export const approveListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await HousingListing.findById(req.params.id);

        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }

        if (listing.status !== 'pending_approval') {
            res.status(400).json({
                success: false,
                message: 'Only pending listings can be approved'
            });
            return;
        }

        listing.status = 'active';
        listing.approvedBy = req.user?.userId as any;
        listing.approvedAt = new Date();
        await listing.save();

        res.status(200).json({
            success: true,
            message: 'Listing approved successfully',
            data: listing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Reject a listing (Admin only)
// @route   PUT /api/housing/:id/reject
// @access  Private (Admin)
export const rejectListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { rejectionReason } = req.body;

        const listing = await HousingListing.findById(req.params.id);

        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }

        listing.status = 'rejected';
        listing.rejectionReason = rejectionReason;
        await listing.save();

        res.status(200).json({
            success: true,
            message: 'Listing rejected',
            data: listing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Create a reservation (Student only)
// @route   POST /api/housing/:id/reserve
// @access  Private (Student)
export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { message, moveInDate } = req.body;
        const listingId = req.params.id;

        // Check if listing exists and is active
        const listing = await HousingListing.findById(listingId);

        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }

        if (listing.status !== 'active') {
            res.status(400).json({
                success: false,
                message: 'Cannot reserve inactive listing'
            });
            return;
        }

        // Check if student already has a pending reservation for this listing
        const existingReservation = await Reservation.findOne({
            listingId,
            studentId: req.user?.userId,
            status: 'pending'
        });

        if (existingReservation) {
            res.status(400).json({
                success: false,
                message: 'You already have a pending reservation for this listing'
            });
            return;
        }

        const reservation = await Reservation.create({
            listingId,
            studentId: req.user?.userId,
            message,
            moveInDate,
            status: 'pending'
        });

        const populatedReservation = await Reservation.findById(reservation._id)
            .populate('listingId', 'title location price')
            .populate('studentId', 'name universityEmail');

        res.status(201).json({
            success: true,
            message: 'Reservation request sent successfully',
            data: populatedReservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Get all reservations for a listing (Provider)
// @route   GET /api/housing/:id/reservations
// @access  Private (Provider)
export const getListingReservations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await HousingListing.findById(req.params.id);

        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }

        // Check if user owns the listing
        if (listing.createdBy.toString() !== req.user?.userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        const reservations = await Reservation.find({ listingId: req.params.id })
            .populate('studentId', 'name universityEmail')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Accept/Reject reservation (Provider only)
// @route   PUT /api/housing/reservations/:id/:action
// @access  Private (Provider)
export const respondToReservation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, action } = req.params;
        const { responseMessage } = req.body;

        if (!['accept', 'reject'].includes(action)) {
            res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
            return;
        }

        const reservation = await Reservation.findById(id)
            .populate('listingId');

        if (!reservation) {
            res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
            return;
        }

        // Check if user owns the listing
        if ((reservation.listingId as any).createdBy.toString() !== req.user?.userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        if (reservation.status !== 'pending') {
            res.status(400).json({
                success: false,
                message: 'Reservation has already been processed'
            });
            return;
        }

        reservation.status = action === 'accept' ? 'accepted' : 'rejected';
        reservation.responseMessage = responseMessage;
        reservation.respondedAt = new Date();
        await reservation.save();

        res.status(200).json({
            success: true,
            message: `Reservation ${action}ed successfully`,
            data: reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

// @desc    Get student's own reservations
// @route   GET /api/housing/my-reservations
// @access  Private (Student)
export const getMyReservations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reservations = await Reservation.find({ studentId: req.user?.userId })
            .populate('listingId', 'title location price images')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as Error).message
        });
    }
};
