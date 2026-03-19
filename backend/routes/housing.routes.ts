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
    getMyReservations
} from '../controllers/housing.controller';
import { protect, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for filtering)
router.get('/', optionalAuth, getAllListings);
router.get('/:id', getListingById);

// Provider routes
router.post('/', protect, authorize('provider'), createListing);
router.put('/:id', protect, authorize('provider'), updateListing);
router.delete('/:id', protect, authorize('provider'), deleteListing);
router.get('/:id/reservations', protect, authorize('provider'), getListingReservations);

// Admin routes
router.put('/:id/approve', protect, authorize('admin'), approveListing);
router.put('/:id/reject', protect, authorize('admin'), rejectListing);

// Student routes
router.post('/:id/reserve', protect, authorize('student'), createReservation);
router.get('/my/reservations', protect, authorize('student'), getMyReservations);

// Provider routes for reservations
router.put('/reservations/:id/:action', protect, authorize('provider'), respondToReservation);

export default router;
