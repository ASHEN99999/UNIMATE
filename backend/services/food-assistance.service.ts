import FoodRequest, { IFoodRequest } from '../models/FoodRequest';
import User from '../models/User';

export class FoodAssistanceService {
  // Food Request Management
  async createFoodRequest(requestData: {
    requesterId: string;
    requesterName: string;
    requesterContact: string;
    requesterLocation: string;
    mealType: IFoodRequest['mealType'];
    foodItems: IFoodRequest['foodItems'];
    requiredTime: Date;
    estimatedCost?: number;
    serviceCharge?: number;
  }): Promise<IFoodRequest> {
    const serviceCharge = requestData.serviceCharge || 0;
    const totalCost = (requestData.estimatedCost || 0) + serviceCharge;

    const foodRequest = new FoodRequest({
      ...requestData,
      serviceCharge,
      totalCost,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    return await foodRequest.save();
  }

  async getPendingRequests(location?: string): Promise<IFoodRequest[]> {
    const query: any = { status: 'pending' };
    
    if (location) {
      query.requesterLocation = new RegExp(location, 'i');
    }

    return await FoodRequest.find(query)
      .populate('requesterId', 'name email')
      .sort({ requiredTime: 1 });
  }

  async getAllRequests(filters: any = {}): Promise<IFoodRequest[]> {
    const query: any = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.mealType) {
      query.mealType = filters.mealType;
    }
    
    if (filters.location) {
      query.requesterLocation = new RegExp(filters.location, 'i');
    }

    return await FoodRequest.find(query)
      .populate('requesterId', 'name email')
      .populate('helperId', 'name email')
      .sort({ createdAt: -1 });
  }

  async getRequestById(requestId: string): Promise<IFoodRequest | null> {
    return await FoodRequest.findById(requestId)
      .populate('requesterId', 'name email contactNumber')
      .populate('helperId', 'name email contactNumber');
  }

  async getMyRequests(userId: string): Promise<IFoodRequest[]> {
    return await FoodRequest.find({ requesterId: userId })
      .populate('helperId', 'name email contactNumber')
      .sort({ createdAt: -1 });
  }

  async getMyHelperRequests(helperId: string): Promise<IFoodRequest[]> {
    return await FoodRequest.find({ helperId })
      .populate('requesterId', 'name email contactNumber')
      .sort({ createdAt: -1 });
  }

  async acceptRequest(
    requestId: string,
    helperId: string,
    helperName: string,
    helperContact: string
  ): Promise<IFoodRequest | null> {
    const request = await FoodRequest.findById(requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is no longer available');
    }

    request.helperId = helperId as any;
    request.helperName = helperName;
    request.helperContact = helperContact;
    request.status = 'accepted';

    return await request.save();
  }

  async updateRequestStatus(
    requestId: string,
    status: IFoodRequest['status'],
    userId: string,
    userRole: string
  ): Promise<IFoodRequest | null> {
    const request = await FoodRequest.findById(requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      pending: ['accepted', 'cancelled'],
      accepted: ['purchased', 'cancelled'],
      purchased: ['delivering', 'cancelled'],
      delivering: ['delivered'],
      delivered: ['completed'],
    };

    if (!validTransitions[request.status]?.includes(status)) {
      throw new Error(`Invalid status transition from ${request.status} to ${status}`);
    }

    // Check permissions
    if (status === 'cancelled') {
      // Both requester and helper can cancel
      if (
        request.requesterId.toString() !== userId &&
        (!request.helperId || request.helperId.toString() !== userId)
      ) {
        throw new Error('Unauthorized to cancel this request');
      }
    } else {
      // Only helper can update other statuses (except cancel)
      if (!request.helperId || request.helperId.toString() !== userId) {
        throw new Error('Unauthorized to update this request');
      }
    }

    request.status = status;
    return await request.save();
  }

  async updatePaymentStatus(
    requestId: string,
    paymentStatus: 'unpaid' | 'paid',
    paymentMethod?: 'cash' | 'online'
  ): Promise<IFoodRequest | null> {
    const updateData: any = { paymentStatus };
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    return await FoodRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );
  }

  async addFeedback(
    requestId: string,
    requesterId: string,
    rating: number,
    feedback: string
  ): Promise<IFoodRequest | null> {
    const request = await FoodRequest.findById(requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.requesterId.toString() !== requesterId) {
      throw new Error('Unauthorized: Not your request');
    }

    if (request.status !== 'completed') {
      throw new Error('Can only provide feedback for completed requests');
    }

    request.rating = rating;
    request.feedback = feedback;
    
    return await request.save();
  }

  async updateEstimatedCost(
    requestId: string,
    helperId: string,
    estimatedCost: number
  ): Promise<IFoodRequest | null> {
    const request = await FoodRequest.findById(requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }

    if (!request.helperId || request.helperId.toString() !== helperId) {
      throw new Error('Unauthorized: Not your assigned request');
    }

    request.estimatedCost = estimatedCost;
    request.totalCost = estimatedCost + request.serviceCharge;
    
    return await request.save();
  }
}

export default new FoodAssistanceService();
