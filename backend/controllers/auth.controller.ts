import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import authService from '../services/auth.service';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📥 Request body:', req.body);
        console.log('📥 Content-Type:', req.headers['content-type']);
        
        const { name, universityEmail, password, role, providerType } = req.body;

        // Validation
        if (!name || !universityEmail || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
            return;
        }

        // Call service method
        const user = await authService.registerUser({
            name,
            universityEmail,
            password,
            role,
            providerType
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        const statusCode = errorMessage === 'User with this email already exists' ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { universityEmail, password } = req.body;

        // Validation
        if (!universityEmail || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }

        // Call service method
        const result = await authService.loginUser({
            universityEmail,
            password
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            ...result
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        const statusCode = errorMessage === 'Invalid credentials' || 
                          errorMessage === 'Your account has been deactivated' ? 401 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await authService.getUserProfile(req.user?.userId!);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        const statusCode = errorMessage === 'User not found' ? 404 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Get all pending providers
// @route   GET /api/auth/pending-providers
// @access  Private (Admin)
export const getPendingProviders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const providers = await authService.getPendingProviders();

        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

// @desc    Approve a provider
// @route   PUT /api/auth/approve-provider/:id
// @access  Private (Admin)
export const approveProvider = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const provider = await authService.approveProvider(
            req.params.id,
            req.user?.userId!
        );

        res.status(200).json({
            success: true,
            message: 'Provider approved successfully',
            data: provider
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Provider not found') statusCode = 404;
        if (errorMessage === 'User is not a provider' || 
            errorMessage === 'Provider is already approved') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Reject a provider
// @route   PUT /api/auth/reject-provider/:id
// @access  Private (Admin)
export const rejectProvider = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { reason } = req.body;
        
        const provider = await authService.rejectProvider(
            req.params.id,
            req.user?.userId!,
            reason
        );

        res.status(200).json({
            success: true,
            message: 'Provider rejected',
            data: provider
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'Provider not found') statusCode = 404;
        if (errorMessage === 'User is not a provider') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Get all providers
// @route   GET /api/auth/providers
// @access  Private (Admin)
export const getAllProviders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { isApproved } = req.query;
        
        const filter: any = {};
        if (isApproved !== undefined) {
            filter.isApproved = isApproved === 'true';
        }

        const providers = await authService.getAllProviders(filter);

        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { role, isActive } = req.query;
        
        const filter: any = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const users = await authService.getAllUsers(filter);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
// @access  Private (Admin)
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await authService.getUserById(req.params.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        const statusCode = errorMessage === 'User not found' ? 404 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Deactivate a user
// @route   PUT /api/auth/users/:id/deactivate
// @access  Private (Admin)
export const deactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await authService.deactivateUser(
            req.params.id,
            req.user?.userId!
        );

        res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            data: user
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'User not found') statusCode = 404;
        if (errorMessage === 'Cannot deactivate admin users' || 
            errorMessage === 'User is already deactivated') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Activate a user
// @route   PUT /api/auth/users/:id/activate
// @access  Private (Admin)
export const activateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await authService.activateUser(
            req.params.id,
            req.user?.userId!
        );

        res.status(200).json({
            success: true,
            message: 'User activated successfully',
            data: user
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'User not found') statusCode = 404;
        if (errorMessage === 'User is already active') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, contactNumber } = req.body;
        
        const user = await authService.updateProfile(req.user?.userId!, {
            name,
            contactNumber
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        const statusCode = errorMessage === 'User not found' ? 404 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Please provide both old and new passwords'
            });
            return;
        }

        const result = await authService.changePassword(
            req.user?.userId!,
            oldPassword,
            newPassword
        );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        let statusCode = 500;
        if (errorMessage === 'User not found') statusCode = 404;
        if (errorMessage === 'Current password is incorrect') statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

