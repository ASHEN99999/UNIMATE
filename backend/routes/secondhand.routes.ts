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

// Offer / Negotiation routes
router.post('/items/:itemId/offers', protect, SecondHandMarketplaceController.createOffer);
router.get('/items/:itemId/offers', protect, SecondHandMarketplaceController.getItemOffers);
router.get('/offers/my-offers', protect, SecondHandMarketplaceController.getMyOffers);
router.put('/offers/:offerId/respond', protect, SecondHandMarketplaceController.respondToOffer);
router.put('/offers/:offerId/withdraw', protect, SecondHandMarketplaceController.withdrawOffer);

export default router;
