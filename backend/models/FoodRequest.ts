import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface IFoodRequest extends Document {
  requestNumber: string;
  requesterId: mongoose.Types.ObjectId;
  requesterName: string;
  requesterContact: string;
  requesterLocation: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodItems: IFoodItem[];
  requiredTime: Date;
  estimatedCost?: number;
  serviceCharge: number;
  totalCost: number;
  helperId?: mongoose.Types.ObjectId;
  helperName?: string;
  helperContact?: string;
  status: 'pending' | 'accepted' | 'purchased' | 'delivering' | 'delivered' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: 'cash' | 'online';
  rating?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FoodRequestSchema: Schema = new Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
    },
    requesterContact: {
      type: String,
      required: true,
      trim: true,
    },
    requesterLocation: {
      type: String,
      required: true,
      trim: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: true,
    },
    foodItems: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    requiredTime: {
      type: Date,
      required: true,
    },
    estimatedCost: {
      type: Number,
      min: 0,
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    helperId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    helperName: {
      type: String,
      trim: true,
    },
    helperContact: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'purchased', 'delivering', 'delivered', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique request number
FoodRequestSchema.pre('save', async function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.requestNumber = `FOOD-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.model<IFoodRequest>('FoodRequest', FoodRequestSchema);
