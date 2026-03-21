import mongoose, { Schema, Document } from 'mongoose';

export interface IClothesCategory {
  name: string;
  pricePerItem: number;
}

export interface IServiceType {
  name: string;
  price: number;
}

export interface IServiceDuration {
  duration: string;
  hours: number;
  price: number;
}

export interface ILaundryProvider extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  location: string;
  contactNumber: string;
  description?: string;
  clothesCategories: IClothesCategory[];
  serviceTypes: IServiceType[];
  serviceDurations: IServiceDuration[];
  isActive: boolean;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const LaundryProviderSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    clothesCategories: [
      {
        name: {
          type: String,
          enum: ['Regular/Daily Wear', 'Delicate Clothes', 'Heavy Clothes', 'Formal Wear', 'Other'],
          required: true,
        },
        pricePerItem: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    serviceTypes: [
      {
        name: {
          type: String,
          enum: ['Wash & Dry', 'Iron', 'Wash Only', 'Dry Only', 'Other'],
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    serviceDurations: [
      {
        duration: {
          type: String,
          enum: ['12-hour', '24-hour', '48-hour', 'Weekly'],
          required: true,
        },
        hours: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILaundryProvider>('LaundryProvider', LaundryProviderSchema);
