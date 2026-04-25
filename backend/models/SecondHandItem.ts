import mongoose, { Schema, Document } from 'mongoose';

export interface ISecondHandItem extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  condition: 'Like New' | 'Good' | 'Fair' | 'Poor';
  sellerName: string;
  sellerContact: string;
  sellerLocation: string;
  status: 'available' | 'reserved' | 'sold';
  buyerId?: mongoose.Types.ObjectId;
  buyerName?: string;
  buyerContact?: string;
  reservedAt?: Date;
  soldAt?: Date;
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SecondHandItemSchema: Schema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Electronics',
        'Books & Notes',
        'Furniture',
        'Clothing',
        'Sports Equipment',
        'Household Items',
        'Stationery',
        'Other'
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length > 0 && v.length <= 5;
        },
        message: 'Must have between 1 and 5 images',
      },
    },
    condition: {
      type: String,
      enum: ['Like New', 'Good', 'Fair', 'Poor'],
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
      trim: true,
    },
    sellerContact: {
      type: String,
      required: true,
      trim: true,
    },
    sellerLocation: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    buyerName: {
      type: String,
      trim: true,
    },
    buyerContact: {
      type: String,
      trim: true,
    },
    reservedAt: {
      type: Date,
    },
    soldAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
SecondHandItemSchema.index({ category: 1, status: 1, isActive: 1 });
SecondHandItemSchema.index({ sellerId: 1 });
SecondHandItemSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ISecondHandItem>('SecondHandItem', SecondHandItemSchema);
