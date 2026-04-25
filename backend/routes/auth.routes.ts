import { Router } from 'express';
import { 
    register, 
    login, 
    getMe,
    getPendingProviders,
    approveProvider,
    rejectProvider,
    getAllProviders,
    getAllUsers,
    getUserById,
    deactivateUser,
    activateUser,
    updateProfile,
    changePassword
} from '../controllers/auth.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Authenticated routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes - Provider management
router.get('/pending-providers', protect, authorize('admin'), getPendingProviders);
router.put('/approve-provider/:id', protect, authorize('admin'), approveProvider);
router.put('/reject-provider/:id', protect, authorize('admin'), rejectProvider);
router.get('/providers', protect, authorize('admin'), getAllProviders);

// Admin routes - User management
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id/deactivate', protect, authorize('admin'), deactivateUser);
router.put('/users/:id/activate', protect, authorize('admin'), activateUser);

export default router;
