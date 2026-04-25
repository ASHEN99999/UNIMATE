import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface RegisterUserDto {
    name: string;
    universityEmail: string;
    password: string;
    role?: string;
    providerType?: string;
}

export interface LoginUserDto {
    universityEmail: string;
    password: string;
}

export class AuthService {
    /**
     * Register a new user
     */
    async registerUser(userData: RegisterUserDto) {
        const { name, universityEmail, password, role, providerType } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ universityEmail });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

       // Validate provider type if role is provider
        if (role === 'provider' && !providerType) {
            throw new Error('Provider type is required for provider accounts');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            universityEmail,
            passwordHash,
            role: role || 'student',
            providerType: role === 'provider' ? providerType : undefined,
            isApproved: role === 'provider' ? false : true
        });

        return {
            id: user._id,
            name: user.name,
            universityEmail: user.universityEmail,
            role: user.role,
            providerType: user.providerType
        };
    }

    /**
     * Login user and generate JWT token
     */
    async loginUser(credentials: LoginUserDto) {
        const { universityEmail, password } = credentials;

        // Check if user exists
        const user = await User.findOne({ universityEmail });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Your account has been deactivated');
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                universityEmail: user.universityEmail,
                role: user.role,
                providerType: user.providerType,
                isApproved: user.isApproved,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        };
    }

    /**
     * Get user profile by ID
     */
    async getUserProfile(userId: string) {
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user._id,
            name: user.name,
            universityEmail: user.universityEmail,
            role: user.role,
            providerType: user.providerType,
            contactNumber: user.contactNumber,
            isActive: user.isActive,
            isApproved: user.isApproved,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    /**
     * Get all pending providers (Admin only)
     */
    async getPendingProviders() {
        const providers = await User.find({
            role: 'provider',
            isApproved: false,
            isActive: true
        }).select('-passwordHash').sort({ createdAt: -1 });
        
        return providers.map(provider => ({
            id: provider._id,
            name: provider.name,
            universityEmail: provider.universityEmail,
            role: provider.role,
            providerType: provider.providerType,
            contactNumber: provider.contactNumber,
            isActive: provider.isActive,
            isApproved: provider.isApproved,
            createdAt: provider.createdAt,
            updatedAt: provider.updatedAt
        }));
    }

    /**
     * Approve a provider (Admin only)
     */
    async approveProvider(providerId: string, adminId: string) {
        const provider = await User.findById(providerId);
        
        if (!provider) {
            throw new Error('Provider not found');
        }

        if (provider.role !== 'provider') {
            throw new Error('User is not a provider');
        }

        if (provider.isApproved) {
            throw new Error('Provider is already approved');
        }

        provider.isApproved = true;
        provider.approvedBy = adminId as any;
        provider.approvedAt = new Date();
        provider.rejectionReason = undefined;
        await provider.save();

        return {
            id: provider._id,
            name: provider.name,
            universityEmail: provider.universityEmail,
            role: provider.role,
            providerType: provider.providerType,
            isApproved: provider.isApproved,
            isActive: provider.isActive
        };
    }

    /**
     * Reject a provider (Admin only)
     */
    async rejectProvider(providerId: string, adminId: string, reason?: string) {
        const provider = await User.findById(providerId);
        
        if (!provider) {
            throw new Error('Provider not found');
        }

        if (provider.role !== 'provider') {
            throw new Error('User is not a provider');
        }

        provider.isApproved = false;
        provider.rejectionReason = reason;
        await provider.save();

        return {
            id: provider._id,
            name: provider.name,
            universityEmail: provider.universityEmail,
            role: provider.role,
            providerType: provider.providerType,
            isApproved: provider.isApproved,
            isActive: provider.isActive
        };
    }

    /**
     * Get all providers (Admin only)
     */
    async getAllProviders(filter?: { isApproved?: boolean }) {
        const query: any = { role: 'provider' };
        
        if (filter?.isApproved !== undefined) {
            query.isApproved = filter.isApproved;
        }

        const providers = await User.find(query)
            .select('-passwordHash')
            .sort({ createdAt: -1 });
        
        return providers;
    }

    /**
     * Get all users with filters (Admin only)
     */
    async getAllUsers(filter?: { role?: string; isActive?: boolean }) {
        const query: any = {};
        
        if (filter?.role) {
            query.role = filter.role;
        }
        
        if (filter?.isActive !== undefined) {
            query.isActive = filter.isActive;
        }

        const users = await User.find(query)
            .select('-passwordHash')
            .sort({ createdAt: -1 });
        
        return users;
    }

    /**
     * Get user by ID (Admin only)
     */
    async getUserById(userId: string) {
        const user = await User.findById(userId).select('-passwordHash');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    /**
     * Deactivate a user (Admin only)
     */
    async deactivateUser(userId: string, adminId: string) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        if (user.role === 'admin') {
            throw new Error('Cannot deactivate admin users');
        }

        if (!user.isActive) {
            throw new Error('User is already deactivated');
        }

        user.isActive = false;
        await user.save();

        return user;
    }

    /**
     * Activate a user (Admin only)
     */
    async activateUser(userId: string, adminId: string) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        if (user.isActive) {
            throw new Error('User is already active');
        }

        user.isActive = true;
        await user.save();

        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, data: { name?: string; contactNumber?: string }) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        if (data.name) {
            user.name = data.name;
        }
        
        if (data.contactNumber !== undefined) {
            user.contactNumber = data.contactNumber;
        }

        await user.save();
        
        return await User.findById(userId).select('-passwordHash');
    }

    /**
     * Change password
     */
    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        return { message: 'Password changed successfully' };
    }
}

export default new AuthService();
