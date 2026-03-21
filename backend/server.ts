import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import housingRoutes from './routes/housing.routes';
import laundryRoutes from './routes/laundry.routes';
import foodAssistanceRoutes from './routes/food-assistance.routes';
import secondhandRoutes from './routes/secondhand.routes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('API is running...');
});

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'success',
        message: 'CampusNest API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/housing', housingRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/food-assistance', foodAssistanceRoutes);
app.use('/api/secondhand', secondhandRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});
