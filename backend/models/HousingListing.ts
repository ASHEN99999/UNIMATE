import { Schema, model, Document, Types } from 'mongoose';

export type ListingStatus = 'pending_approval' | 'active' | 'inactive' | 'rejected';
export type PropertyType = 'boarding' | 'room' | 'annex' | 'apartment';
export type RoomType = 'single' | 'shared' | 'full-house';

export interface ILocation {
    address: string;
    city: string;
    district?: string;
    distance: number;
}

export interface IHousingListing extends Document {
    title: string;
    description: string;
    price: number;
    location: ILocation;
    propertyType: PropertyType;
    roomType: RoomType;
    amenities?: string[];
    images?: string[];
    contactPhone: string;
    rulesAndRegulations?: string;
    availability: boolean;
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
        address: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String },
        distance: { type: Number, default: 0 }
    },
    propertyType: {
        type: String,
        enum: ['boarding', 'room', 'annex', 'apartment'],
        required: [true, 'Property type is required']
    },
    roomType: {
        type: String,
        enum: ['single', 'shared', 'full-house'],
        required: [true, 'Room type is required']
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    contactPhone: {
        type: String,
        required: [true, 'Contact phone is required']
    },
    rulesAndRegulations: {
        type: String
    },
    availability: {
        type: Boolean,
        default: true
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
housingListingSchema.index({ 'location.city': 1 });
housingListingSchema.index({ propertyType: 1, roomType: 1 });

export default model<IHousingListing>('HousingListing', housingListingSchema);
