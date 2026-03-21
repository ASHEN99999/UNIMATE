import { Request, Response } from 'express';
import SecondHandMarketplaceService from '../services/secondhand.service';

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
