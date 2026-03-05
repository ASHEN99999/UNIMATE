import { Schema, model, Document, Types } from 'mongoose';

export type ListingStatus = 'pending_approval' | 'active' | 'inactive' | 'rejected';

export interface IHousingListing extends Document {
    title: string;
    description: string;
    price: number;
    location: string;
    address?: string;
    rooms?: number;
    bathrooms?: number;
    amenities?: string[];
    images?: string[];
    contactNumber: string;
    availableFrom?: Date;
    createdBy: Types.ObjectId;
    status: ListingStatus;
    rejectionReason?: string;
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const housingListingSchema = new Schema<IHousingListing>({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    rooms: {
        type: Number,
        min: [1, 'Must have at least 1 room']
    },
    bathrooms: {
        type: Number,
        min: [1, 'Must have at least 1 bathroom']
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required']
    },
    availableFrom: {
        type: Date
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending_approval', 'active', 'inactive', 'rejected'],
        default: 'pending_approval'
    },
    rejectionReason: {
        type: String
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
housingListingSchema.index({ status: 1, createdBy: 1 });
housingListingSchema.index({ location: 1 });

export default model<IHousingListing>('HousingListing', housingListingSchema);
