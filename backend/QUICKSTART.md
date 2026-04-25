# Backend Quick Start Guide

This guide will help you get the backend server up and running after cloning the repository.

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)

## Setup Instructions

### 1. Navigate to the Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Express, MongoDB, TypeScript, and other dependencies.

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Environment Variables Explained:**
- `PORT`: The port on which the server will run (default: 5000)
- `MONGO_URI`: Your MongoDB connection string
  - For local MongoDB: `mongodb://localhost:27017/unimate`
  - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/unimate`
- `JWT_SECRET`: A secret key for JWT token generation (use a strong random string)

### 4. Run the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port you specified in `.env`)

You should see output like:
```
✅ MongoDB Connected: ...
📊 Database Name: ...
🚀 Server running on port 5000
📍 http://localhost:5000
```

### 5. Verify the Server is Running

Open your browser or API client (like Postman) and visit:
- **Health Check**: `http://localhost:5000/api/health`
- **Root**: `http://localhost:5000/`

## Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Compile TypeScript to JavaScript
- **`npm start`** - Run the compiled production build
- **`npm run prod`** - Build and run production server

## API Endpoints

The backend provides the following API routes:
- `/api/auth` - Authentication (login, register)
- `/api/housing` - Housing listings and reservations
- `/api/laundry` - Laundry services and bookings
- `/api/food-assistance` - Food assistance requests
- `/api/secondhand` - Second-hand item marketplace

For detailed API documentation, refer to:
- [API Testing Guide](./API_TESTING_GUIDE.md)
- [Housing API Guide](./HOUSING_API_GUIDE.md)
- [Postman Collection](./postman_collection.json)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if using local installation)
- Verify your `MONGO_URI` is correct
- Check if your IP is whitelisted (if using MongoDB Atlas)

### Port Already in Use
- Change the `PORT` in your `.env` file to a different port
- Or stop the process using the port: `npx kill-port 5000`

### TypeScript Errors
- Make sure all dependencies are installed: `npm install`
- Try removing `node_modules` and reinstalling: `rm -rf node_modules && npm install`

## Development Tips

- The development server uses `ts-node-dev` for automatic restarts on file changes
- Check the console for helpful debugging information
- Use the Postman collection provided for API testing

## Need Help?

If you encounter any issues, refer to:
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Complete System README](../COMPLETE_SYSTEM_README.md)
