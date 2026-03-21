import SecondHandItem, { ISecondHandItem } from '../models/SecondHandItem';

export class SecondHandMarketplaceService {
  // Item Management
  async createItem(itemData: Partial<ISecondHandItem>): Promise<ISecondHandItem> {
    const item = new SecondHandItem({
      ...itemData,
      status: 'available',
      isActive: true,
      views: 0,
    });

    return await item.save();
  }

  async getItems(filters: any = {}): Promise<ISecondHandItem[]> {
    const query: any = { isActive: true };
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.status) {
      query.status = filters.status;
    } else {
      // By default, show only available items
      query.status = 'available';
    }
    
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }
    
    if (filters.condition) {
      query.condition = filters.condition;
    }
    
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    return await SecondHandItem.find(query)
      .populate('sellerId', 'name email')
      .sort({ [sortBy]: sortOrder });
  }

  async getItemById(itemId: string): Promise<ISecondHandItem | null> {
    const item = await SecondHandItem.findById(itemId)
      .populate('sellerId', 'name email contactNumber')
      .populate('buyerId', 'name email contactNumber');

    if (item) {
      // Increment view count
      await SecondHandItem.findByIdAndUpdate(itemId, { $inc: { views: 1 } });
    }

    return item;
  }

  async getMyItems(sellerId: string): Promise<ISecondHandItem[]> {
    return await SecondHandItem.find({ sellerId, isActive: true })
      .populate('buyerId', 'name email contactNumber')
      .sort({ createdAt: -1 });
  }

  async updateItem(
    itemId: string,
    sellerId: string,
    updateData: Partial<ISecondHandItem>
  ): Promise<ISecondHandItem | null> {
    const item = await SecondHandItem.findById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.sellerId.toString() !== sellerId) {
      throw new Error('Unauthorized: Not your item');
    }

    if (item.status !== 'available') {
      throw new Error('Cannot update reserved or sold items');
    }

    // Don't allow changing certain fields
    const { sellerId: _, status: __, buyerId: ___, ...allowedUpdates } = updateData as any;

    return await SecondHandItem.findByIdAndUpdate(
      itemId,
      allowedUpdates,
      { new: true, runValidators: true }
    );
  }

  async deleteItem(itemId: string, sellerId: string): Promise<void> {
    const item = await SecondHandItem.findById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.sellerId.toString() !== sellerId) {
      throw new Error('Unauthorized: Not your item');
    }

    if (item.status !== 'available') {
      throw new Error('Cannot delete reserved or sold items');
    }

    // Soft delete
    await SecondHandItem.findByIdAndUpdate(itemId, { isActive: false });
  }

  async reserveItem(
    itemId: string,
    buyerId: string,
    buyerName: string,
    buyerContact: string
  ): Promise<ISecondHandItem | null> {
    const item = await SecondHandItem.findById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (!item.isActive) {
      throw new Error('Item is no longer available');
    }

    if (item.status !== 'available') {
      throw new Error('Item is already reserved or sold');
    }

    if (item.sellerId.toString() === buyerId) {
      throw new Error('Cannot reserve your own item');
    }

    item.status = 'reserved';
    item.buyerId = buyerId as any;
    item.buyerName = buyerName;
    item.buyerContact = buyerContact;
    item.reservedAt = new Date();

    return await item.save();
  }

  async cancelReservation(itemId: string, userId: string): Promise<ISecondHandItem | null> {
    const item = await SecondHandItem.findById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.status !== 'reserved') {
      throw new Error('Item is not reserved');
    }

    // Both buyer and seller can cancel reservation
    if (
      item.sellerId.toString() !== userId &&
      (!item.buyerId || item.buyerId.toString() !== userId)
    ) {
      throw new Error('Unauthorized to cancel this reservation');
    }

    item.status = 'available';
    item.buyerId = undefined;
    item.buyerName = undefined;
    item.buyerContact = undefined;
    item.reservedAt = undefined;

    return await item.save();
  }

  async markAsSold(itemId: string, sellerId: string): Promise<ISecondHandItem | null> {
    const item = await SecondHandItem.findById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.sellerId.toString() !== sellerId) {
      throw new Error('Unauthorized: Not your item');
    }

    if (item.status === 'sold') {
      throw new Error('Item is already sold');
    }

    if (item.status === 'available') {
      throw new Error('Item must be reserved before marking as sold');
    }

    item.status = 'sold';
    item.soldAt = new Date();

    return await item.save();
  }

  async getStats(sellerId: string): Promise<any> {
    const items = await SecondHandItem.find({ sellerId });

    const stats = {
      totalItems: items.length,
      available: items.filter(i => i.status === 'available' && i.isActive).length,
      reserved: items.filter(i => i.status === 'reserved').length,
      sold: items.filter(i => i.status === 'sold').length,
      totalViews: items.reduce((sum, i) => sum + i.views, 0),
      totalRevenue: items.filter(i => i.status === 'sold').reduce((sum, i) => sum + i.price, 0),
    };

    return stats;
  }
}

export default new SecondHandMarketplaceService();
