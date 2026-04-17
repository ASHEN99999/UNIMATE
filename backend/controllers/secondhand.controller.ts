import { Request, Response } from 'express';
import SecondHandMarketplaceService from '../services/secondhand.service';
import Offer from '../models/Offer';
import SecondHandItem from '../models/SecondHandItem';

// Item Management
export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = (req as any).user.userId;
    const itemData = {
      ...req.body,
      sellerId,
    };

    const item = await SecondHandMarketplaceService.createItem(itemData);
    res.status(201).json({
      success: true,
      data: item,
      message: 'Item listed successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create item',
    });
  }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      condition: req.query.condition,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const items = await SecondHandMarketplaceService.getItems(filters);
    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch items',
    });
  }
};

export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const item = await SecondHandMarketplaceService.getItemById(itemId);
    
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch item',
    });
  }
};

export const getMyItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = (req as any).user.userId;
    const items = await SecondHandMarketplaceService.getMyItems(sellerId);
    
    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your items',
    });
  }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const sellerId = (req as any).user.userId;
    
    const item = await SecondHandMarketplaceService.updateItem(
      itemId,
      sellerId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: item,
      message: 'Item updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update item',
    });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const sellerId = (req as any).user.userId;
    
    await SecondHandMarketplaceService.deleteItem(itemId, sellerId);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete item',
    });
  }
};

export const reserveItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const buyerId = (req as any).user.userId;
    const { buyerName, buyerContact } = req.body;

    const item = await SecondHandMarketplaceService.reserveItem(
      itemId,
      buyerId,
      buyerName,
      buyerContact
    );

    res.status(200).json({
      success: true,
      data: item,
      message: 'Item reserved successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reserve item',
    });
  }
};

export const cancelReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const userId = (req as any).user.userId;

    const item = await SecondHandMarketplaceService.cancelReservation(itemId, userId);

    res.status(200).json({
      success: true,
      data: item,
      message: 'Reservation cancelled successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel reservation',
    });
  }
};

export const markAsSold = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const sellerId = (req as any).user.userId;

    const item = await SecondHandMarketplaceService.markAsSold(itemId, sellerId);

    res.status(200).json({
      success: true,
      data: item,
      message: 'Item marked as sold successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark item as sold',
    });
  }
};

export const getMyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = (req as any).user.userId;
    const stats = await SecondHandMarketplaceService.getStats(sellerId);
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stats',
    });
  }
};

// ── Offer / Negotiation Endpoints ────────────────────────────────────────────

// @desc    Submit a price offer on an item (buyer)
// @route   POST /api/secondhand/items/:itemId/offers
// @access  Private
export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const buyerId = (req as any).user.userId;
    const { offerPrice, message, buyerName, buyerContact } = req.body;

    if (!offerPrice || offerPrice <= 0) {
      res.status(400).json({ success: false, message: 'Offer price must be greater than 0' });
      return;
    }

    const item = await SecondHandItem.findById(itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    if (item.status !== 'available') {
      res.status(400).json({ success: false, message: 'Item is no longer available' });
      return;
    }
    if (item.sellerId.toString() === buyerId) {
      res.status(400).json({ success: false, message: 'You cannot make an offer on your own item' });
      return;
    }

    // Only one active (pending/countered) offer per buyer per item
    const existing = await Offer.findOne({ itemId, buyerId, status: { $in: ['pending', 'countered'] } });
    if (existing) {
      res.status(400).json({ success: false, message: 'You already have an active offer on this item' });
      return;
    }

    const offer = await Offer.create({ itemId, buyerId, buyerName, buyerContact, offerPrice, message });

    res.status(201).json({ success: true, data: offer, message: 'Offer submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit offer' });
  }
};

// @desc    Get all offers for an item (seller only)
// @route   GET /api/secondhand/items/:itemId/offers
// @access  Private (seller)
export const getItemOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const sellerId = (req as any).user.userId;

    const item = await SecondHandItem.findById(itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    if (item.sellerId.toString() !== sellerId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const offers = await Offer.find({ itemId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: offers, count: offers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch offers' });
  }
};

// @desc    Get buyer's own offers
// @route   GET /api/secondhand/offers/my-offers
// @access  Private (buyer)
export const getMyOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const buyerId = (req as any).user.userId;
    const offers = await Offer.find({ buyerId })
      .populate('itemId', 'title price images status sellerName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: offers, count: offers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch offers' });
  }
};

// @desc    Seller responds: accept / reject / counter
// @route   PUT /api/secondhand/offers/:offerId/respond
// @access  Private (seller)
export const respondToOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { offerId } = req.params;
    const { action, counterPrice, counterMessage } = req.body;
    const sellerId = (req as any).user.userId;

    if (!['accept', 'reject', 'counter'].includes(action)) {
      res.status(400).json({ success: false, message: 'action must be accept, reject or counter' });
      return;
    }
    if (action === 'counter' && (!counterPrice || counterPrice <= 0)) {
      res.status(400).json({ success: false, message: 'counterPrice required for counter action' });
      return;
    }

    const offer = await Offer.findById(offerId).populate<{ itemId: any }>('itemId');
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
      return;
    }
    if (offer.itemId.sellerId.toString() !== sellerId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
    if (!['pending', 'countered'].includes(offer.status)) {
      res.status(400).json({ success: false, message: 'Offer is no longer active' });
      return;
    }

    offer.respondedAt = new Date();

    if (action === 'accept') {
      offer.status = 'accepted';
    } else if (action === 'reject') {
      offer.status = 'rejected';
    } else {
      offer.status = 'countered';
      offer.counterPrice = counterPrice;
      offer.counterMessage = counterMessage;
    }

    await offer.save();

    const label = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'countered with Rs. ' + counterPrice;
    res.status(200).json({ success: true, data: offer, message: `Offer ${label} successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to respond to offer' });
  }
};

// @desc    Buyer withdraws a pending offer
// @route   PUT /api/secondhand/offers/:offerId/withdraw
// @access  Private (buyer)
export const withdrawOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { offerId } = req.params;
    const buyerId = (req as any).user.userId;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
      return;
    }
    if (offer.buyerId.toString() !== buyerId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
    if (!['pending', 'countered'].includes(offer.status)) {
      res.status(400).json({ success: false, message: 'Cannot withdraw a processed offer' });
      return;
    }

    offer.status = 'withdrawn';
    await offer.save();

    res.status(200).json({ success: true, data: offer, message: 'Offer withdrawn' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to withdraw offer' });
  }
};
