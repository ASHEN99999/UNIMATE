import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

// Protect routes - verify JWT token
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
                role: string;
            };

            // Add user info to request
            req.user = {
                userId: decoded.userId,
                role: decoded.role
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
            return;
        }
    }

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
        return;
    }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `User role '${req.user?.role}' is not authorized to access this route`
            });
            return;
        }
        next();
    };
};

// Optional authentication (for routes that work with or without auth)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
                role: string;
            };
            req.user = {
                userId: decoded.userId,
                role: decoded.role
            };
        } catch (error) {
            // Token invalid, but continue without auth
            req.user = undefined;
        }
    }

    next();
};
