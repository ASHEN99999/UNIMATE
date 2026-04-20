# Frontend Quick Start Guide

This guide will help you get the frontend application up and running after cloning the repository.

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Backend server** running (see [backend/QUICKSTART.md](../backend/QUICKSTART.md))

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API

## Setup Instructions

### 1. Navigate to the Frontend Directory

```bash
cd frontend1
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, Radix UI components, and other dependencies.

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend1` directory (or copy from `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=UniMate
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Environment Variables Explained:**
- `NEXT_PUBLIC_API_URL`: URL of your backend API (default: `http://localhost:5000/api`)
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_URL`: Frontend application URL

> **Note**: Make sure the backend server is running before starting the frontend!

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

You should see output like:
```
  ▲ Next.js 16.2.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

### 5. Open the Application

Open your browser and navigate to:
- **Application**: `http://localhost:3000`
- **Login Page**: `http://localhost:3000/login`
- **Register Page**: `http://localhost:3000/register`

## Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build the application for production
- **`npm start`** - Run the production build
- **`npm run lint`** - Run ESLint to check code quality

## Application Structure

```
frontend1/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (main)/            # Main app pages (dashboard, housing, etc.)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── [other components]
├── context/              # React Context providers
│   └── auth-context.tsx  # Authentication context
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
│   ├── services/         # API service layer
│   │   ├── auth.service.ts
│   │   ├── housing.service.ts
│   │   ├── laundry.service.ts
│   │   ├── food.service.ts
│   │   └── secondhand.service.ts
│   ├── api-client.ts     # HTTP client with auth
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── styles/               # Global styles
```

## Features & Pages

### Authentication
- **Login**: `/login` - User authentication
- **Register**: `/register` - New user registration (student/provider/admin)

### Main Features
- **Dashboard**: `/(main)/dashboard` - Overview and quick access
- **Housing**: `/(main)/housing` - Browse and manage housing listings
- **Laundry**: `/(main)/laundry` - Find laundry services and manage bookings
- **Food Assistance**: `/(main)/food` - Request food assistance
- **Marketplace**: `/(main)/marketplace` - Second-hand items marketplace

## API Integration

The frontend is fully integrated with the backend API. All services are located in `lib/services/`:

- `auth.service.ts` - Authentication (login, register, profile)
- `housing.service.ts` - Housing listings and reservations
- `laundry.service.ts` - Laundry providers and bookings
- `food.service.ts` - Food assistance requests
- `secondhand.service.ts` - Second-hand marketplace items

### Using Services in Components

```tsx
import { housingService } from '@/lib/services';

// Fetch all housing listings
const listings = await housingService.getAllListings();

// Create a new listing
const newListing = await housingService.createListing({
  title: "Cozy Room",
  description: "...",
  price: 15000,
  // ... other fields
});
```

## Authentication Flow

1. User logs in via `/login`
2. Backend returns JWT token and user data
3. Token is stored in localStorage
4. All API requests include the token in Authorization header
5. User data is persisted across page refreshes
6. On logout, token is cleared

## Troubleshooting

### Backend Connection Issues
- Ensure the backend server is running on `http://localhost:5000`
- Check if `NEXT_PUBLIC_API_URL` in `.env.local` is correct
- Verify CORS is enabled in the backend

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
PORT=3001 npm run dev
```

### Authentication Errors
- Clear browser localStorage and cookies
- Check if backend JWT_SECRET is set correctly
- Verify user exists in the database

### Module Not Found Errors
- Delete `node_modules` and `.next` folders
- Reinstall dependencies: `rm -rf node_modules .next && npm install`

### TypeScript Errors
- Make sure all types match between frontend and backend
- Run `npm run lint` to check for issues

## Development Tips

1. **Hot Reload**: The dev server automatically reloads when you make changes
2. **Path Aliases**: Use `@/` to import from the root (e.g., `@/components/ui/button`)
3. **Type Safety**: All API responses are typed for better development experience
4. **Error Handling**: API errors are automatically caught and displayed to users
5. **Authentication**: Use `useAuth()` hook to access user state in any component

## Testing the Integration

1. Start the backend server (see backend/QUICKSTART.md)
2. Start the frontend dev server
3. Register a new user
4. Log in with your credentials
5. Test creating listings, bookings, etc.

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

The production build will be optimized and ready for deployment.

## Need Help?

If you encounter any issues:
1. Check that both backend and frontend are running
2. Verify environment variables are set correctly
3. Check browser console for detailed error messages
4. Review backend logs for API errors

## Next Steps

- Customize the UI components in `components/`
- Add new features or pages in `app/`
- Modify API services in `lib/services/`
- Update types in `lib/types.ts` as needed
