import mongoose, { Schema, Document } from 'mongoose';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';

export interface IOffer extends Document {
    itemId: mongoose.Types.ObjectId;
    buyerId: mongoose.Types.ObjectId;
    buyerName: string;
    buyerContact: string;
    offerPrice: number;
    message?: string;
    status: OfferStatus;
    counterPrice?: number;
    counterMessage?: string;
    respondedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OfferSchema: Schema = new Schema(
    {
        itemId: {
            type: Schema.Types.ObjectId,
            ref: 'SecondHandItem',
            required: true,
        },
        buyerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        buyerName: {
            type: String,
            required: true,
            trim: true,
        },
        buyerContact: {
            type: String,
            required: true,
            trim: true,
        },
        offerPrice: {
            type: Number,
            required: true,
            min: 1,
        },
        message: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'countered', 'withdrawn'],
            default: 'pending',
        },
        counterPrice: {
            type: Number,
            min: 1,
        },
        counterMessage: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        respondedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// One pending offer per buyer per item
OfferSchema.index({ itemId: 1, buyerId: 1, status: 1 });

export default mongoose.model<IOffer>('Offer', OfferSchema);
