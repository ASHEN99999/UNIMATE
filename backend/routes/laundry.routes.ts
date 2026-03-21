import { Router } from 'express';
import * as LaundryController from '../controllers/laundry.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Provider routes
router.post('/providers', protect, LaundryController.createProvider);
router.get('/providers', protect, LaundryController.getProviders);
router.get('/providers/my-provider', protect, LaundryController.getMyProvider);
router.get('/providers/:providerId', protect, LaundryController.getProviderById);
router.put('/providers/:providerId', protect, LaundryController.updateProvider);

// Booking routes
router.post('/bookings', protect, LaundryController.createBooking);
router.get('/bookings', protect, LaundryController.getMyBookings);
router.get('/bookings/:bookingId', protect, LaundryController.getBookingById);
router.patch('/bookings/:bookingId/status', protect, LaundryController.updateBookingStatus);
router.patch('/bookings/:bookingId/payment', protect, LaundryController.updatePaymentStatus);
router.post('/bookings/:bookingId/review', protect, LaundryController.addReview);

export default router;
