import { Router } from 'express';
import {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    deleteListing,
    approveListing,
    rejectListing,
    createReservation,
    getListingReservations,
    respondToReservation,
    getMyReservations,
    cancelReservation,
    toggleListingStatus,
    getProviderDashboard,
    getAdminDashboard,
    getAllProviderReservations,
    downloadReservationPDF
} from '../controllers/housing.controller';
import { protect, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for filtering)
router.get('/', optionalAuth, getAllListings);

// Provider routes - Dashboard (must come before /:id)
router.get('/provider/dashboard', protect, authorize('provider'), getProviderDashboard);
router.get('/provider/reservations', protect, authorize('provider'), getAllProviderReservations);

// Admin routes - Dashboard (must come before /:id)
router.get('/admin/dashboard', protect, authorize('admin'), getAdminDashboard);

// Student routes - Reservations (must come before /:id)
router.get('/my/reservations', protect, authorize('student'), getMyReservations);

// Single listing route (comes after specific routes)
router.get('/:id', optionalAuth, getListingById);

// Provider routes - Listings
router.post('/', protect, authorize('provider'), createListing);
router.put('/:id', protect, authorize('provider'), updateListing);
router.delete('/:id', protect, authorize('provider'), deleteListing);
router.put('/:id/toggle-status', protect, authorize('provider'), toggleListingStatus);
router.get('/:id/reservations', protect, authorize('provider'), getListingReservations);

// Admin routes - Listings
router.put('/:id/approve', protect, authorize('admin'), approveListing);
router.put('/:id/reject', protect, authorize('admin'), rejectListing);

// Student routes - Reservations (actions)
router.post('/:id/reserve', protect, authorize('student'), createReservation);
router.put('/reservations/:id/cancel', protect, authorize('student'), cancelReservation);
router.get('/reservations/:id/pdf', protect, authorize('student'), downloadReservationPDF);

// Provider routes - Reservations (actions)
router.put('/reservations/:id/:action', protect, authorize('provider'), respondToReservation);

export default router;
