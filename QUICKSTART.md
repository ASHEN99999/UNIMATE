# UniMate - Quick Start Guide

Complete setup guide for running the UniMate application (frontend + backend).

## Prerequisites

- **Node.js** (v14+)
- **npm** (comes with Node.js)
- **MongoDB** (local or MongoDB Atlas)

## Project Structure

```
UNIMATE/
├── backend/          # Express + TypeScript API server
└── frontend1/        # Next.js + TypeScript + shadcn/ui
```

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd UNIMATE
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/unimate
JWT_SECRET=your_super_secret_jwt_key_here_change_this
EOF

# Note: For MongoDB Atlas, use your connection string:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/unimate

# Start backend server
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: ...
📊 Database Name: unimate
🚀 Server running on port 5000
📍 http://localhost:5000
```

### Step 3: Setup Frontend (New Terminal)

```bash
# Navigate to frontend (from project root)
cd frontend1

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=UniMate
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Start frontend server
npm run dev
```

**Expected output:**
```
▲ Next.js 16.2.0
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

### Step 4: Open Application

Open your browser and go to: **http://localhost:3000**

---

## 📋 Detailed Setup Instructions

### Backend Setup

See [backend/QUICKSTART.md](backend/QUICKSTART.md) for detailed backend setup including:
- Environment variables configuration
- MongoDB setup (local & Atlas)
- Available API endpoints
- Troubleshooting

### Frontend Setup

See [frontend1/QUICKSTART.md](frontend1/QUICKSTART.md) for detailed frontend setup including:
- Environment configuration
- Application structure
- API integration
- Troubleshooting

---

## 🔧 Available Scripts

### Backend
```bash
cd backend
npm run dev      # Development server with hot reload
npm run build    # Compile TypeScript
npm start        # Run production build
```

### Frontend
```bash
cd frontend1
npm run dev      # Development server with hot reload
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Check code quality
```

---

## 🎯 Testing the Application

### 1. Register a New User

1. Go to http://localhost:3000/register
2. Fill in the registration form:
   - Name
   - University Email (e.g., `student@university.lk`)
   - Password
   - Role (Student/Provider/Admin)
3. Click "Register"

### 2. Login

1. Go to http://localhost:3000/login
2. Enter your credentials
3. Click "Login"

### 3. Explore Features

- **Dashboard**: Overview and quick access to all features
- **Housing**: Browse housing listings, create reservations
- **Laundry**: Find laundry services, book appointments
- **Food Assistance**: Request food assistance
- **Marketplace**: Buy/sell second-hand items

---

## 🌐 API Endpoints

The backend provides the following API routes:

- `/api/auth` - Authentication (login, register, profile)
- `/api/housing` - Housing listings and reservations
- `/api/laundry` - Laundry services and bookings
- `/api/food-assistance` - Food assistance requests
- `/api/secondhand` - Second-hand marketplace items

**API Documentation**: See [backend/API_TESTING_GUIDE.md](backend/API_TESTING_GUIDE.md)

---

## 🔍 Verification Checklist

- [ ] Backend server running on http://localhost:5000
- [ ] Frontend server running on http://localhost:3000
- [ ] MongoDB connected successfully
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] Can access dashboard after login
- [ ] API calls working (check browser Network tab)

---

## ⚠️ Common Issues & Solutions

### Backend won't start
- **Issue**: MongoDB connection error
- **Solution**: Check MongoDB is running or verify MONGO_URI in `.env`

### Frontend can't connect to backend
- **Issue**: "Failed to fetch" errors
- **Solution**: 
  - Ensure backend is running on port 5000
  - Check `NEXT_PUBLIC_API_URL` in `.env.local`
  - Verify CORS is enabled in backend

### Port already in use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Authentication issues
- Clear browser localStorage and cookies
- Check JWT_SECRET is set in backend `.env`
- Verify user exists in MongoDB

---

## 📁 Environment Variables Reference

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/unimate
JWT_SECRET=your_super_secret_key_change_this
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=UniMate
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎓 For Your Friend

Hey! Welcome to the project. Here's what you need to do:

1. **Install Node.js** if you don't have it
2. **Install MongoDB** (or use MongoDB Atlas - free cloud database)
3. **Follow the Quick Setup** above (should take ~5 minutes)
4. **Run both servers** (backend first, then frontend)
5. **Open the browser** and start exploring!

If you get stuck, check the troubleshooting sections or the detailed guides in each folder.

---

## 📚 Additional Documentation

- [Complete System README](COMPLETE_SYSTEM_README.md)
- [Backend Quick Start](backend/QUICKSTART.md)
- [Frontend Quick Start](frontend1/QUICKSTART.md)
- [API Testing Guide](backend/API_TESTING_GUIDE.md)
- [Housing API Guide](backend/HOUSING_API_GUIDE.md)

---

## 🚢 Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend1
npm run build
npm start
```

For cloud deployment (Vercel, Railway, Render, etc.), refer to their respective documentation.

---

## 💡 Development Tips

1. Keep both servers running in separate terminal windows
2. Backend changes auto-reload with `ts-node-dev`
3. Frontend changes auto-reload with Next.js Fast Refresh
4. Use browser DevTools to debug API calls
5. Check console logs in both frontend and backend for errors

---

## 🤝 Need Help?

If something isn't working:
1. Check both servers are running
2. Verify all environment variables are set
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Try clearing `node_modules` and reinstalling

Happy coding! 🎉
