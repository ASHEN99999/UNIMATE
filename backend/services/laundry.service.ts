import LaundryProvider, { ILaundryProvider } from '../models/LaundryProvider';
import LaundryBooking, { ILaundryBooking, IClothesItem } from '../models/LaundryBooking';
import mongoose from 'mongoose';

export class LaundryService {
  // Provider Management
  async createProvider(providerData: Partial<ILaundryProvider>): Promise<ILaundryProvider> {
    const provider = new LaundryProvider(providerData);
    return await provider.save();
  }

  async getProviders(filters: any = {}): Promise<ILaundryProvider[]> {
    const query: any = { isActive: true };
    
    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }

    return await LaundryProvider.find(query)
      .populate('userId', 'name email')
      .sort({ rating: -1, createdAt: -1 });
  }

  async getProviderById(providerId: string): Promise<ILaundryProvider | null> {
    return await LaundryProvider.findById(providerId)
      .populate('userId', 'name email');
  }

  async getProviderByUserId(userId: string): Promise<ILaundryProvider | null> {
    return await LaundryProvider.findOne({ userId })
      .populate('userId', 'name email');
  }

  async updateProvider(providerId: string, updateData: Partial<ILaundryProvider>): Promise<ILaundryProvider | null> {
    return await LaundryProvider.findByIdAndUpdate(
      providerId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Booking Management
  async createBooking(bookingData: {
    studentId: string;
    providerId: string;
    studentName: string;
    studentContact: string;
    clothesItems: IClothesItem[];
    selectedServices: { name: string; price: number }[];
    serviceDuration: { duration: string; hours: number; price: number };
    collectionDate: Date;
  }): Promise<ILaundryBooking> {
    // Calculate total price
    const clothesTotal = bookingData.clothesItems.reduce((sum, item) => sum + item.subtotal, 0);
    const servicesTotal = bookingData.selectedServices.reduce((sum, service) => sum + service.price, 0);
    const totalPrice = clothesTotal + servicesTotal + bookingData.serviceDuration.price;

    const booking = new LaundryBooking({
      ...bookingData,
      totalPrice,
      status: 'requested',
      paymentStatus: 'unpaid',
    });

    return await booking.save();
  }

  async getBookingById(bookingId: string): Promise<ILaundryBooking | null> {
    return await LaundryBooking.findById(bookingId)
      .populate('studentId', 'name email')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email' }
      });
  }

  async getStudentBookings(studentId: string): Promise<ILaundryBooking[]> {
    return await LaundryBooking.find({ studentId })
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 });
  }

  async getProviderBookings(providerId: string): Promise<ILaundryBooking[]> {
    return await LaundryBooking.find({ providerId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
  }

  async updateBookingStatus(
    bookingId: string,
    status: ILaundryBooking['status'],
    userId: string,
    userRole: string
  ): Promise<ILaundryBooking | null> {
    const booking = await LaundryBooking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      requested: ['handover_pending', 'cancelled'],
      handover_pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['ready', 'cancelled'],
      ready: ['completed', 'cancelled'],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      throw new Error(`Invalid status transition from ${booking.status} to ${status}`);
    }

    // Check permissions
    if (userRole === 'student' && booking.studentId.toString() !== userId) {
      throw new Error('Unauthorized: Not your booking');
    }

    if (userRole === 'provider') {
      const provider = await LaundryProvider.findOne({ _id: booking.providerId, userId });
      if (!provider) {
        throw new Error('Unauthorized: Not your booking');
      }
    }

    booking.status = status;
    return await booking.save();
  }

  async updatePaymentStatus(bookingId: string, paymentStatus: 'unpaid' | 'paid'): Promise<ILaundryBooking | null> {
    return await LaundryBooking.findByIdAndUpdate(
      bookingId,
      { paymentStatus },
      { new: true }
    );
  }

  async addReview(
    bookingId: string,
    studentId: string,
    rating: number,
    review: string
  ): Promise<ILaundryBooking | null> {
    const booking = await LaundryBooking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.studentId.toString() !== studentId) {
      throw new Error('Unauthorized: Not your booking');
    }

    if (booking.status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    // Update provider rating
    await this.updateProviderRating(booking.providerId.toString());

    return booking;
  }

  private async updateProviderRating(providerId: string): Promise<void> {
    const bookings = await LaundryBooking.find({
      providerId,
      rating: { $exists: true, $ne: null }
    });

    if (bookings.length > 0) {
      const totalRating = bookings.reduce((sum, booking) => sum + (booking.rating || 0), 0);
      const averageRating = totalRating / bookings.length;

      await LaundryProvider.findByIdAndUpdate(providerId, {
        rating: Math.round(averageRating * 10) / 10,
        totalReviews: bookings.length,
      });
    }
  }
}

export default new LaundryService();
