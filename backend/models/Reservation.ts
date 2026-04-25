import { Schema, model, Document, Types } from 'mongoose';

export type ReservationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface IReservation extends Document {
    listingId: Types.ObjectId;
    studentId: Types.ObjectId;
    status: ReservationStatus;
    message?: string;
    responseMessage?: string;
    respondedAt?: Date;
    moveInDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>({
    listingId: {
        type: Schema.Types.ObjectId,
        ref: 'HousingListing',
        required: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    responseMessage: {
        type: String,
        maxlength: [500, 'Response message cannot exceed 500 characters']
    },
    respondedAt: {
        type: Date
    },
    moveInDate: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Virtual for id field
reservationSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Prevent duplicate pending reservations
reservationSchema.index({ listingId: 1, studentId: 1, status: 1 });

export default model<IReservation>('Reservation', reservationSchema);
