import mongoose, { Schema, Document } from 'mongoose';

export interface IClothesItem {
  category: string;
  quantity: number;
  pricePerItem: number;
  subtotal: number;
}

export interface ILaundryBooking extends Document {
  orderNumber: string;
  studentId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  studentName: string;
  studentContact: string;
  clothesItems: IClothesItem[];
  selectedServices: {
    name: string;
    price: number;
  }[];
  serviceDuration: {
    duration: string;
    hours: number;
    price: number;
  };
  totalPrice: number;
  collectionDate: Date;
  status: 'requested' | 'handover_pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LaundryBookingSchema: Schema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'LaundryProvider',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentContact: {
      type: String,
      required: true,
      trim: true,
    },
    clothesItems: [
      {
        category: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        pricePerItem: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    selectedServices: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    serviceDuration: {
      duration: {
        type: String,
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
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    collectionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['requested', 'handover_pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'],
      default: 'requested',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique order number
LaundryBookingSchema.pre('save', async function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `LND-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.model<ILaundryBooking>('LaundryBooking', LaundryBookingSchema);
