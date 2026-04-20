import { Request, Response } from 'express';
import LaundryService from '../services/laundry.service';
import QRCode from 'qrcode';

// Provider endpoints
export const createProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const providerData = {
        ...req.body,
        userId,
      };

      const provider = await LaundryService.createProvider(providerData);
      res.status(201).json({
        success: true,
        data: provider,
        message: 'Laundry provider created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create provider',
      });
    }
};

export const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
      const { location } = req.query;
      const filters = { location: location as string };
      
      const providers = await LaundryService.getProviders(filters);
      res.status(200).json({
        success: true,
        data: providers,
        count: providers.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch providers',
      });
    }
};

export const getProviderById = async (req: Request, res: Response): Promise<void> => {
  try {
      const { providerId } = req.params;
      const provider = await LaundryService.getProviderById(providerId);
      
      if (!provider) {
        res.status(404).json({
          success: false,
          message: 'Provider not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: provider,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch provider',
      });
    }
};

export const getMyProvider = async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = (req as any).user.userId;
      const provider = await LaundryService.getProviderByUserId(userId);
      
      if (!provider) {
        res.status(404).json({
          success: false,
          message: 'Provider profile not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: provider,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch provider',
      });
    }
};

export const updateProvider = async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = (req as any).user.userId;
      const { providerId } = req.params;
      
      // Verify ownership
      const provider = await LaundryService.getProviderById(providerId);
      if (!provider || provider.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to update this provider',
        });
        return;
      }

      const updatedProvider = await LaundryService.updateProvider(providerId, req.body);
      res.status(200).json({
        success: true,
        data: updatedProvider,
        message: 'Provider updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update provider',
      });
    }
};

// Booking endpoints
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
      const studentId = (req as any).user.userId;
      const bookingData = {
        ...req.body,
        studentId,
      };

      const booking = await LaundryService.createBooking(bookingData);
      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create booking',
      });
    }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
      const { bookingId } = req.params;
      const booking = await LaundryService.getBookingById(bookingId);
      
      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch booking',
      });
    }
};

export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      let bookings;
      if (userRole === 'student') {
        bookings = await LaundryService.getStudentBookings(userId);
      } else if (userRole === 'provider') {
        const provider = await LaundryService.getProviderByUserId(userId);
        if (!provider) {
          res.status(404).json({
            success: false,
            message: 'Provider profile not found',
          });
          return;
        }
        bookings = await LaundryService.getProviderBookings(provider._id.toString());
      } else {
        res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch bookings',
      });
    }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
      const { bookingId } = req.params;
      const { status } = req.body;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const booking = await LaundryService.updateBookingStatus(
        bookingId,
        status,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: booking,
        message: 'Booking status updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update booking status',
      });
    }
};

export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
      const { bookingId } = req.params;
      const { paymentStatus } = req.body;

      const booking = await LaundryService.updatePaymentStatus(bookingId, paymentStatus);
      
      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: booking,
        message: 'Payment status updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update payment status',
      });
    }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
      const { bookingId } = req.params;
      const { rating, review } = req.body;
      const studentId = (req as any).user.userId;

      const booking = await LaundryService.addReview(bookingId, studentId, rating, review);

      res.status(200).json({
        success: true,
        data: booking,
        message: 'Review added successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add review',
      });
    }
};

// @desc    Get QR code ticket for a booking (student only - own bookings)
// @route   GET /api/laundry/bookings/:bookingId/qr
// @access  Private (Student)
export const getBookingQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const studentId = (req as any).user.userId;

    const booking = await LaundryService.getBookingById(bookingId);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.studentId.toString() !== studentId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Encode key booking details into the QR code payload
    const qrPayload = JSON.stringify({
      bookingId: booking._id,
      orderNumber: booking.orderNumber,
      studentName: booking.studentName,
      totalPrice: booking.totalPrice,
      collectionDate: booking.collectionDate,
      status: booking.status,
    });

    const qrDataURL = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
    });

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrDataURL,
        booking: {
          orderNumber: booking.orderNumber,
          studentName: booking.studentName,
          totalPrice: booking.totalPrice,
          collectionDate: booking.collectionDate,
          status: booking.status,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate QR code',
    });
  }
};
