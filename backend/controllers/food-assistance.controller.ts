import { Request, Response } from 'express';
import FoodAssistanceService from '../services/food-assistance.service';

// Food Request endpoints
export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterId = (req as any).user.userId;
    const requestData = {
      ...req.body,
      requesterId,
    };

    const foodRequest = await FoodAssistanceService.createFoodRequest(requestData);
    res.status(201).json({
      success: true,
      data: foodRequest,
      message: 'Food request created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create food request',
    });
  }
};

export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location } = req.query;
    const requests = await FoodAssistanceService.getPendingRequests(location as string);
    
    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pending requests',
    });
  }
};

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, mealType, location } = req.query;
    const filters = {
      status: status as string,
      mealType: mealType as string,
      location: location as string,
    };

    const requests = await FoodAssistanceService.getAllRequests(filters);
    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch requests',
    });
  }
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const request = await FoodAssistanceService.getRequestById(requestId);
    
    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Request not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch request',
    });
  }
};

export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const requests = await FoodAssistanceService.getMyRequests(userId);
    
    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your requests',
    });
  }
};

export const getMyHelperRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const helperId = (req as any).user.userId;
    const requests = await FoodAssistanceService.getMyHelperRequests(helperId);
    
    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch helper requests',
    });
  }
};

export const acceptRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const helperId = (req as any).user.userId;
    const { helperName, helperContact } = req.body;

    const request = await FoodAssistanceService.acceptRequest(
      requestId,
      helperId,
      helperName,
      helperContact
    );

    res.status(200).json({
      success: true,
      data: request,
      message: 'Request accepted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to accept request',
    });
  }
};

export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const request = await FoodAssistanceService.updateRequestStatus(
      requestId,
      status,
      userId,
      userRole
    );

    res.status(200).json({
      success: true,
      data: request,
      message: 'Request status updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update request status',
    });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { paymentStatus, paymentMethod } = req.body;

    const request = await FoodAssistanceService.updatePaymentStatus(
      requestId,
      paymentStatus,
      paymentMethod
    );
    
    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Request not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: request,
      message: 'Payment status updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update payment status',
    });
  }
};

export const addFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { rating, feedback } = req.body;
    const requesterId = (req as any).user.userId;

    const request = await FoodAssistanceService.addFeedback(
      requestId,
      requesterId,
      rating,
      feedback
    );

    res.status(200).json({
      success: true,
      data: request,
      message: 'Feedback added successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add feedback',
    });
  }
};

export const updateEstimatedCost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { estimatedCost } = req.body;
    const helperId = (req as any).user.userId;

    const request = await FoodAssistanceService.updateEstimatedCost(
      requestId,
      helperId,
      estimatedCost
    );

    res.status(200).json({
      success: true,
      data: request,
      message: 'Estimated cost updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update estimated cost',
    });
  }
};

