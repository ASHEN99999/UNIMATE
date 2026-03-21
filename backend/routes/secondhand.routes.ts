import { Router } from 'express';
import * as SecondHandMarketplaceController from '../controllers/secondhand.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Item routes
router.post('/items', protect, SecondHandMarketplaceController.createItem);
router.get('/items', protect, SecondHandMarketplaceController.getItems);
router.get('/items/my-items', protect, SecondHandMarketplaceController.getMyItems);
router.get('/items/stats', protect, SecondHandMarketplaceController.getMyStats);
router.get('/items/:itemId', protect, SecondHandMarketplaceController.getItemById);
router.put('/items/:itemId', protect, SecondHandMarketplaceController.updateItem);
router.delete('/items/:itemId', protect, SecondHandMarketplaceController.deleteItem);

// Item actions
router.post('/items/:itemId/reserve', protect, SecondHandMarketplaceController.reserveItem);
router.post('/items/:itemId/cancel-reservation', protect, SecondHandMarketplaceController.cancelReservation);
router.post('/items/:itemId/mark-sold', protect, SecondHandMarketplaceController.markAsSold);

export default router;
