import { Router } from 'express';
import * as FoodAssistanceController from '../controllers/food-assistance.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Food Request routes
router.post('/requests', protect, FoodAssistanceController.createRequest);
router.get('/requests/pending', protect, FoodAssistanceController.getPendingRequests);
router.get('/requests', protect, FoodAssistanceController.getAllRequests);
router.get('/requests/my-requests', protect, FoodAssistanceController.getMyRequests);
router.get('/requests/my-helper-requests', protect, FoodAssistanceController.getMyHelperRequests);
router.get('/requests/:requestId', protect, FoodAssistanceController.getRequestById);

// Request actions
router.post('/requests/:requestId/accept', protect, FoodAssistanceController.acceptRequest);
router.patch('/requests/:requestId/status', protect, FoodAssistanceController.updateRequestStatus);
router.patch('/requests/:requestId/payment', protect, FoodAssistanceController.updatePaymentStatus);
router.patch('/requests/:requestId/estimated-cost', protect, FoodAssistanceController.updateEstimatedCost);
router.post('/requests/:requestId/feedback', protect, FoodAssistanceController.addFeedback);

export default router;
