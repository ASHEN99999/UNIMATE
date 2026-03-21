import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import housingService from '../services/housing.service';

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
            propertyType,
            roomType,
            amenities,
            contactPhone,
            rulesAndRegulations
        } = req.body;

        // Validate required fields
        if (!title || !description || !price || !location || !contactPhone) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
            return;
        }

        if (!propertyType || !roomType) {
            res.status(400).json({
                success: false,
                message: 'Please specify property type and room type'
            });
            return;
        }

        const listing = await housingService.createListing(
            {
                title,
                description,
                price,
                location,
                propertyType,
                roomType,
                amenities,
                contactPhone,
                rulesAndRegulations,
                createdBy: req.user?.userId!
            },
            req.user?.userId!
        );

        res.status(201).json({
            success: true,
            message: 'Listing created successfully. Waiting for admin approval.',
            data: listing
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Only providers can create housing listings') statusCode = 403;
        if (errorMessage === 'Your provider account must be approved before creating listings') statusCode = 403;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Get all listings (Filter by status)
// @route   GET /api/housing
// @access  Public
export const getAllListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, location } = req.query;

        const listings = await housingService.getAllListings({
            status: status as string,
            location: location as string,
            userId: req.user?.userId,
            userRole: req.user?.role
        });

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

// @desc    Get single listing by ID
// @route   GET /api/housing/:id
// @access  Public (but only active listings visible to non-owners)
export const getListingById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await housingService.getListingById(
            req.params.id,
            req.user?.role,
            req.user?.userId
        );

        res.status(200).json({
            success: true,
            data: listing
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Listing not found' || 
            errorMessage === 'Listing not found or not accessible') {
            statusCode = 404;
        }
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage === 'Listing not found or not accessible' 
                ? 'Listing not found' 
                : errorMessage
        });
    }
};

// @desc    Update a listing (Provider only - own listings)
// @route   PUT /api/housing/:id
// @access  Private (Provider)
export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const updatedListing = await housingService.updateListing(
            req.params.id,
            req.user?.userId!,
            req.body
        );

        res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: updatedListing
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Listing not found') statusCode = 404;
        if (errorMessage === 'Not authorized to update this listing') statusCode = 403;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Delete a listing (Provider only - own listings)
// @route   DELETE /api/housing/:id
// @access  Private (Provider)
export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await housingService.deleteListing(req.params.id, req.user?.userId!);

        res.status(200).json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Listing not found') statusCode = 404;
        if (errorMessage === 'Not authorized to delete this listing') statusCode = 403;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Approve a listing (Admin only)
// @route   PUT /api/housing/:id/approve
// @access  Private (Admin)
export const approveListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await housingService.approveListing(
            req.params.id,
            req.user?.userId!
        );

        res.status(200).json({
            success: true,
            message: 'Listing approved successfully',
            data: listing
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Listing not found') statusCode = 404;
        if (errorMessage === 'Only pending listings can be approved') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Reject a listing (Admin only)
// @route   PUT /api/housing/:id/reject
// @access  Private (Admin)
export const rejectListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { rejectionReason } = req.body;

        const listing = await housingService.rejectListing(
            req.params.id,
            rejectionReason
        );

        res.status(200).json({
            success: true,
            message: 'Listing rejected',
            data: listing
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        const statusCode = errorMessage === 'Listing not found' ? 404 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
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

        const populatedReservation = await housingService.createReservation({
            listingId,
            studentId: req.user?.userId!,
            message,
            moveInDate
        });

        res.status(201).json({
            success: true,
            message: 'Reservation request sent successfully',
            data: populatedReservation
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Listing not found') statusCode = 404;
        if (errorMessage === 'Cannot reserve inactive listing' || 
            errorMessage === 'You already have a pending reservation for this listing') {
            statusCode = 400;
        }
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Get all reservations for a listing (Provider)
// @route   GET /api/housing/:id/reservations
// @access  Private (Provider)
export const getListingReservations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reservations = await housingService.getListingReservations(
            req.params.id,
            req.user?.userId!
        );

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Listing not found') statusCode = 404;
        if (errorMessage === 'Not authorized') statusCode = 403;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
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

        const reservation = await housingService.respondToReservation(
            id,
            req.user?.userId!,
            action as 'accept' | 'reject',
            responseMessage
        );

        res.status(200).json({
            success: true,
            message: `Reservation ${action}ed successfully`,
            data: reservation
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Reservation not found') statusCode = 404;
        if (errorMessage === 'Not authorized') statusCode = 403;
        if (errorMessage === 'Reservation has already been processed') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Get student's own reservations
// @route   GET /api/housing/my-reservations
// @access  Private (Student)
export const getMyReservations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reservations = await housingService.getMyReservations(req.user?.userId!);

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

// @desc    Cancel a reservation
// @route   PUT /api/housing/reservations/:id/cancel
// @access  Private (Student)
export const cancelReservation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reservation = await housingService.cancelReservation(
            req.params.id,
            req.user?.userId!
        );

        res.status(200).json({
            success: true,
            message: 'Reservation cancelled successfully',
            data: reservation
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Reservation not found') statusCode = 404;
        if (errorMessage === 'Not authorized to cancel this reservation' || 
            errorMessage === 'Only pending reservations can be cancelled') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Toggle listing status (active/inactive)
// @route   PUT /api/housing/:id/toggle-status
// @access  Private (Provider)
export const toggleListingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await housingService.toggleListingStatus(
            req.params.id,
            req.user?.userId!
        );

        res.status(200).json({
            success: true,
            message: `Listing ${listing.status} successfully`,
            data: listing
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Listing not found') statusCode = 404;
        if (errorMessage === 'Not authorized to modify this listing') statusCode = 403;
        if (errorMessage === 'Cannot change status of pending listings' || 
            errorMessage === 'Cannot reactivate rejected listings') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Get provider dashboard statistics
// @route   GET /api/housing/provider/dashboard
// @access  Private (Provider)
export const getProviderDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const dashboard = await housingService.getProviderDashboard(req.user?.userId!);

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/housing/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const dashboard = await housingService.getAdminDashboard();

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

// @desc    Get all provider reservations
// @route   GET /api/housing/provider/reservations
// @access  Private (Provider)
export const getAllProviderReservations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.query;
        
        const reservations = await housingService.getAllProviderReservations(
            req.user?.userId!,
            status as string
        );

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

