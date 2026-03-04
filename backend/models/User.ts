import { Schema, model, Document } from 'mongoose';

export type UserRole = 'student' | 'provider' | 'admin';

export interface IUser extends Document {
    name: string;
    universityEmail: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    universityEmail: {
        type: String,
        required: [true, 'University email is required'],
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['student', 'provider', 'admin'],
        default: 'student'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default model<IUser>('User', userSchema);
