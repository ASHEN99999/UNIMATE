# 🎓 UNIMATE - University Campus Services Hub

## Complete System Documentation

**Version:** 1.0.0  
**Last Updated:** March 20, 2026  
**Tech Stack:** MERN (MongoDB, Express.js, React, Node.js + TypeScript)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Modules Overview](#modules-overview)
5. [Complete API Reference](#complete-api-reference)
6. [Database Schema](#database-schema)
7. [User Workflows & Scenarios](#user-workflows--scenarios)
8. [Setup Instructions](#setup-instructions)
9. [Environment Configuration](#environment-configuration)
10. [Testing Guide](#testing-guide)

---

## 📌 Executive Summary

**UNIMATE** is a comprehensive university-only MERN stack web platform designed to centralize essential student services near campus. It provides a secure, role-based system where students can:

- 🏠 **Find boarding places** (Housing Marketplace)
- 👔 **Book laundry services** (Laundry Service Management)
- 🍽️ **Request food assistance** (Student Food Delivery)
- 🛒 **Buy/sell second-hand items** (Campus Marketplace)

The system replaces informal WhatsApp-based communication with a structured, moderated, and workflow-based platform with JWT authentication and role-based access control.

---

## 🏗 System Architecture

### Architecture Type
- **Backend:** REST API (Node.js + Express + TypeScript)
- **Frontend:** React + TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Authorization:** Role-Based Access Control (RBAC)
- **Deployment:** Dockerizable, Cloud-ready

### Repository Structure
```
UNIMATE/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic layer
│   ├── utils/            # Helper functions
│   └── server.ts         # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context (state management)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   └── services/     # API service calls
│   └── public/           # Static assets
└── documentation/        # API docs, guides, Figma prompts
```

### Technology Stack
```json
{
  "backend": {
    "runtime": "Node.js 20.x",
    "framework": "Express.js 4.x",
    "language": "TypeScript 5.9.x",
    "database": "MongoDB 7.x",
    "ODM": "Mongoose 8.x",
    "authentication": "jsonwebtoken",
    "environment": "dotenv",
    "dev-tools": "ts-node-dev"
  },
  "frontend": {
    "framework": "React 18.x",
    "language": "TypeScript",
    "build": "Vite 6.x",
    "routing": "React Router v7",
    "styling": "CSS3 + Tailwind"
  }
}
```

---

## 🔐 User Roles & Permissions

### 1. 👨‍🎓 Student Role
**Capabilities:**
- Register/Login with university email
- Browse all listings (housing, laundry, food, marketplace)
- Create food requests
- Book laundry services
- Make housing reservations
- Buy/sell second-hand items
- Provide ratings and feedback
- Manage personal profile

**Restrictions:**
- Cannot create housing listings
- Cannot create laundry provider profiles
- Cannot access admin dashboard

### 2. 🏪 Provider Role
**Capabilities:**
- All student capabilities
- Create housing listings
- Create laundry service profiles
- Set prices and service options
- Accept/reject bookings and reservations
- View provider dashboard
- Manage their listings/services

**Restrictions:**
- Must be approved by admin before active
- Cannot access admin functions
- Cannot moderate other providers

### 3. 👑 Admin Role
**Capabilities:**
- Full system access
- Approve/reject provider registrations
- Approve/reject housing listings
- Deactivate/activate users
- View all system statistics
- Moderate content
- Manage user roles

**Restrictions:**
- Cannot impersonate users (audit trail maintained)

---

## 🧩 Modules Overview

### Module 1: 🏠 Housing Marketplace

**Purpose:** Help students find safe, verified boarding places near campus.

**Key Features:**
- Multi-image property listings
- Location-based search and filtering
- Price range filtering
- Amenities filtering (WiFi, AC, Attached Bathroom, etc.)
- Admin approval workflow
- Reservation system with status tracking
- Provider dashboard with analytics

**Status Flow:**
```
pending_approval → approved/rejected → active/inactive
```

**Reservation Flow:**
```
pending → approved/rejected → confirmed → cancelled/completed
```

---

### Module 2: 👔 Laundry Service Management

**Purpose:** Streamline laundry booking with transparent pricing and service tracking.

**Key Features:**
- Multiple providers with ratings
- Categorized clothing types (Regular, Delicate, Heavy, Formal)
- Service types (Wash & Dry, Iron)
- Service durations (12hr, 24hr, 48hr, Weekly)
- Auto-calculated pricing based on:
  - Clothes category × quantity
  - Service type
  - Service duration
- Unique order numbers (LND-XXXXX)
- Multi-status workflow tracking
- Review and rating system

**Booking Status Flow:**
```
requested → handover_pending → confirmed → processing → ready → completed
```

**Service Categories:**
| Category | Example Items |
|----------|--------------|
| Regular/Daily Wear | T-shirts, jeans, casual wear |
| Delicate | Silk, wool, special fabrics |
| Heavy | Jackets, blankets, curtains |
| Formal | Suits, dress shirts, formal wear |

---

### Module 3: 🍽️ Student Food Assistance System

**Purpose:** Help students who cannot leave campus to get food through peer-to-peer delivery.

**Key Features:**
- Meal type selection (Breakfast, Lunch, Dinner, Snack)
- Location-based helper matching
- Real-time request notifications
- Estimated cost tracking
- Service charge calculation
- Contact sharing between requester and helper
- Rating and feedback system
- Unique request numbers (FOOD-XXXXX)

**Request Status Flow:**
```
pending → accepted → purchased → delivering → delivered → completed
```

**User Scenarios:**
- Student in hostel requests breakfast
- Nearby student accepts and delivers
- Payment on delivery (cash/online)
- Both rate each other

---

### Module 4: 🛒 Second-Hand Marketplace

**Purpose:** Enable students to buy/sell used items within campus community.

**Key Features:**
- 8 item categories (Electronics, Books, Furniture, Clothing, Sports, Household, Stationery, Other)
- Multiple image uploads (1-5 images)
- Condition levels (Like New, Good, Fair, Poor)
- Price range filtering
- Full-text search
- Reservation system (48-hour hold)
- View counter tracking
- Seller statistics dashboard
- Soft delete (items can be recovered)

**Item Status Flow:**
```
available → reserved → sold
```

**Categories:**
```javascript
[
  "Electronics",      // Laptops, phones, calculators
  "Books & Notes",    // Textbooks, study materials
  "Furniture",        // Desks, chairs, storage
  "Clothing",         // Apparel, shoes, accessories
  "Sports Equipment", // Gym gear, sports items
  "Household Items",  // Kitchen, decor, utilities
  "Stationery",       // Pens, notebooks, supplies
  "Other"             // Miscellaneous items
]
```

---

## 🔌 Complete API Reference

**Base URL:** `http://localhost:5000/api`

### Authentication Endpoints

Authentication is required for most endpoints. Include JWT token in header:
```http
Authorization: Bearer <your_jwt_token>
```

#### 🔓 Public Routes

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/auth/register` | Register new user | `{ name, universityEmail, password, role }` |
| `POST` | `/auth/login` | Login user | `{ universityEmail, password }` |

**Register Request Example:**
```json
{
  "name": "John Doe",
  "universityEmail": "john.doe@university.lk",
  "password": "securePass123",
  "role": "student"
}
```

**Login Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john.doe@university.lk",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 🔒 Protected Routes

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET` | `/auth/me` | Get current user profile | Any authenticated |
| `PUT` | `/auth/profile` | Update user profile | Any authenticated |
| `PUT` | `/auth/change-password` | Change password | Any authenticated |

#### 👑 Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/pending-providers` | Get pending provider approvals |
| `PUT` | `/auth/approve-provider/:id` | Approve provider registration |
| `PUT` | `/auth/reject-provider/:id` | Reject provider registration |
| `GET` | `/auth/providers` | Get all providers |
| `GET` | `/auth/users` | Get all users |
| `GET` | `/auth/users/:id` | Get user by ID |
| `PUT` | `/auth/users/:id/deactivate` | Deactivate user |
| `PUT` | `/auth/users/:id/activate` | Activate user |

---

### 🏠 Housing Marketplace API

**Base Path:** `/api/housing`

#### Public Routes (Optional Auth)

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `GET` | `/housing` | Get all listings | `?city=&minPrice=&maxPrice=&propertyType=&amenities=` |
| `GET` | `/housing/:id` | Get listing by ID | - |

**Get All Listings Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "listing_id",
      "title": "Comfortable Single Room Near Campus",
      "description": "Fully furnished room with WiFi and AC",
      "price": 15000,
      "location": {
        "address": "123 University Road",
        "city": "Colombo",
        "distance": 0.5
      },
      "propertyType": "boarding",
      "amenities": ["WiFi", "AC", "Attached Bathroom"],
      "images": ["url1", "url2"],
      "availability": true,
      "provider": {
        "name": "Provider Name",
        "contact": "077XXXXXXX"
      },
      "status": "approved"
    }
  ]
}
```

#### 🏪 Provider Routes

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/housing/provider/dashboard` | Provider dashboard stats | - |
| `GET` | `/housing/provider/reservations` | All provider reservations | - |
| `POST` | `/housing` | Create new listing | Listing details |
| `PUT` | `/housing/:id` | Update listing | Updated fields |
| `DELETE` | `/housing/:id` | Delete listing | - |
| `PUT` | `/housing/:id/toggle-status` | Toggle active/inactive | - |
| `GET` | `/housing/:id/reservations` | Get listing reservations | - |
| `PUT` | `/housing/reservations/:id/:action` | Respond to reservation | `action: approve/reject` |

**Create Listing Request:**
```json
{
  "title": "Spacious Room with Balcony",
  "description": "Perfect for students, close to university",
  "price": 18000,
  "location": {
    "address": "456 Campus Lane",
    "city": "Kandy",
    "district": "Kandy",
    "distance": 0.3
  },
  "propertyType": "boarding",
  "roomType": "single",
  "amenities": ["WiFi", "Hot Water", "Parking"],
  "images": ["image_url_1", "image_url_2"],
  "contactPhone": "0771234567",
  "rulesAndRegulations": "No smoking, No pets"
}
```

#### 👨‍🎓 Student Routes

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/housing/:id/reserve` | Create reservation | `{ checkInDate, duration, message }` |
| `GET` | `/housing/my/reservations` | Get my reservations | - |
| `PUT` | `/housing/reservations/:id/cancel` | Cancel reservation | - |

**Create Reservation Request:**
```json
{
  "checkInDate": "2026-04-01",
  "duration": 12,
  "message": "Looking forward to staying here for my studies"
}
```

#### 👑 Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/housing/admin/dashboard` | Admin dashboard statistics |
| `PUT` | `/housing/:id/approve` | Approve listing |
| `PUT` | `/housing/:id/reject` | Reject listing |

---

### 👔 Laundry Service API

**Base Path:** `/api/laundry`

#### Provider Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/laundry/providers` | Create laundry provider | Provider details |
| `GET` | `/laundry/providers` | Get all providers | `?location=&rating=` |
| `GET` | `/laundry/providers/my-provider` | Get my provider profile | - |
| `GET` | `/laundry/providers/:providerId` | Get provider by ID | - |
| `PUT` | `/laundry/providers/:providerId` | Update provider | Updated fields |

**Create Provider Request:**
```json
{
  "businessName": "QuickWash Laundry",
  "location": "Near University Gate 2",
  "contactNumber": "0771234567",
  "operatingHours": {
    "open": "08:00",
    "close": "20:00"
  },
  "clothesCategories": [
    {
      "name": "Regular / Daily Wear",
      "pricePerPiece": 50
    },
    {
      "name": "Delicate",
      "pricePerPiece": 80
    },
    {
      "name": "Heavy",
      "pricePerPiece": 100
    },
    {
      "name": "Formal",
      "pricePerPiece": 70
    }
  ],
  "serviceTypes": [
    {
      "name": "Wash & Dry",
      "price": 200
    },
    {
      "name": "Iron",
      "price": 150
    }
  ],
  "serviceDurations": [
    {
      "name": "12-hour service",
      "price": 100
    },
    {
      "name": "24-hour service",
      "price": 50
    },
    {
      "name": "48-hour service",
      "price": 0
    },
    {
      "name": "Weekly service",
      "price": 0
    }
  ]
}
```

#### Booking Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/laundry/bookings` | Create booking | Booking details |
| `GET` | `/laundry/bookings` | Get my bookings | `?status=` |
| `GET` | `/laundry/bookings/:bookingId` | Get booking by ID | - |
| `PATCH` | `/laundry/bookings/:bookingId/status` | Update booking status | `{ status }` |
| `PATCH` | `/laundry/bookings/:bookingId/payment` | Update payment status | `{ paymentStatus, paymentMethod }` |
| `POST` | `/laundry/bookings/:bookingId/review` | Add review | `{ rating, review }` |

**Create Booking Request:**
```json
{
  "providerId": "provider_id_here",
  "studentName": "John Doe",
  "studentContact": "0771234567",
  "clothesItems": [
    {
      "category": "Regular / Daily Wear",
      "quantity": 10
    },
    {
      "category": "Formal",
      "quantity": 3
    }
  ],
  "selectedServices": ["Wash & Dry", "Iron"],
  "serviceDuration": "24-hour service",
  "collectionDate": "2026-03-22"
}
```

**Booking Response (with auto-calculated price):**
```json
{
  "success": true,
  "data": {
    "orderNumber": "LND-00123",
    "totalPrice": 1210,
    "breakdown": {
      "clothesPrice": 710,
      "servicePrice": 350,
      "durationPrice": 50,
      "serviceCharge": 100
    },
    "status": "requested",
    "collectionDate": "2026-03-22",
    "message": "Booking created successfully. Please hand over clothes to confirm order."
  }
}
```

**Booking Status Updates:**
```json
{
  "status": "handover_pending"  // Student must hand over clothes
}
{
  "status": "confirmed"          // Provider confirmed receipt
}
{
  "status": "processing"         // Laundry in progress
}
{
  "status": "ready"              // Ready for collection
}
{
  "status": "completed"          // Student collected & paid
}
```

---

### 🍽️ Food Assistance API

**Base Path:** `/api/food-assistance`

#### Request Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/food-assistance/requests` | Create food request | Request details |
| `GET` | `/food-assistance/requests/pending` | Get pending requests | `?location=` |
| `GET` | `/food-assistance/requests` | Get all requests | `?status=&mealType=` |
| `GET` | `/food-assistance/requests/my-requests` | Get my requests | - |
| `GET` | `/food-assistance/requests/my-helper-requests` | Get requests I'm helping with | - |
| `GET` | `/food-assistance/requests/:requestId` | Get request by ID | - |

**Create Request:**
```json
{
  "mealType": "Lunch",
  "foodItems": [
    {
      "item": "Rice and Curry",
      "quantity": 1
    },
    {
      "item": "Orange Juice",
      "quantity": 1
    }
  ],
  "requiredTime": "2026-03-20T13:00:00Z",
  "deliveryLocation": {
    "type": "Hostel",
    "details": "Block A, Room 305"
  },
  "requesterName": "John Doe",
  "requesterContact": "0771234567",
  "specialInstructions": "Extra spicy please"
}
```

**Request Response:**
```json
{
  "success": true,
  "data": {
    "requestNumber": "FOOD-00456",
    "status": "pending",
    "mealType": "Lunch",
    "foodItems": [...],
    "deliveryLocation": {...},
    "requiredTime": "2026-03-20T13:00:00Z",
    "message": "Request created successfully. Nearby helpers will be notified."
  }
}
```

#### Helper Actions

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/food-assistance/requests/:requestId/accept` | Accept request | `{ helperName, helperContact }` |
| `PATCH` | `/food-assistance/requests/:requestId/status` | Update status | `{ status }` |
| `PATCH` | `/food-assistance/requests/:requestId/estimated-cost` | Update cost | `{ estimatedCost }` |
| `PATCH` | `/food-assistance/requests/:requestId/payment` | Update payment | `{ paymentStatus, paymentMethod }` |
| `POST` | `/food-assistance/requests/:requestId/feedback` | Add feedback | `{ rating, feedback }` |

**Accept Request:**
```json
{
  "helperName": "Jane Smith",
  "helperContact": "0777654321"
}
```

**Status Update Flow:**
```json
{ "status": "accepted" }     // Helper accepted request
{ "status": "purchased" }    // Helper bought the food
{ "status": "delivering" }   // On the way to deliver
{ "status": "delivered" }    // Food delivered
{ "status": "completed" }    // Payment done, request closed
```

**Add Feedback:**
```json
{
  "rating": 5,
  "feedback": "Very helpful! Food delivered on time and hot."
}
```

---

### 🛒 Second-Hand Marketplace API

**Base Path:** `/api/secondhand`

#### Item Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/secondhand/items` | Create item listing | Item details |
| `GET` | `/secondhand/items` | Get all items | `?category=&minPrice=&maxPrice=&condition=&search=` |
| `GET` | `/secondhand/items/my-items` | Get my items | - |
| `GET` | `/secondhand/items/stats` | Get seller statistics | - |
| `GET` | `/secondhand/items/:itemId` | Get item by ID | - |
| `PUT` | `/secondhand/items/:itemId` | Update item | Updated fields |
| `DELETE` | `/secondhand/items/:itemId` | Delete item (soft delete) | - |

**Create Item Listing:**
```json
{
  "title": "iPhone 13 - Excellent Condition",
  "description": "Used for 1 year, no scratches, with original box and charger",
  "category": "Electronics",
  "price": 85000,
  "condition": "Like New",
  "images": [
    "image_url_1",
    "image_url_2",
    "image_url_3"
  ],
  "sellerName": "John Doe",
  "sellerContact": "0771234567",
  "location": "Colombo Campus"
}
```

**Get Items with Filters:**
```http
GET /api/secondhand/items?category=Electronics&minPrice=50000&maxPrice=100000&condition=Like New&search=iPhone
```

**Item Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "item_id",
      "title": "iPhone 13 - Excellent Condition",
      "description": "Used for 1 year...",
      "category": "Electronics",
      "price": 85000,
      "condition": "Like New",
      "images": ["url1", "url2", "url3"],
      "sellerId": "user_id",
      "sellerName": "John Doe",
      "sellerContact": "0771234567",
      "location": "Colombo Campus",
      "status": "available",
      "views": 45,
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ]
}
```

#### Item Actions

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/secondhand/items/:itemId/reserve` | Reserve item | `{ buyerName, buyerContact }` |
| `POST` | `/secondhand/items/:itemId/cancel-reservation` | Cancel reservation | - |
| `POST` | `/secondhand/items/:itemId/mark-sold` | Mark as sold | - |

**Reserve Item:**
```json
{
  "buyerName": "Jane Smith",
  "buyerContact": "0777654321"
}
```

**Reservation Response:**
```json
{
  "success": true,
  "data": {
    "status": "reserved",
    "buyerInfo": {
      "name": "Jane Smith",
      "contact": "0777654321"
    },
    "reservationExpiry": "2026-03-22T10:00:00Z",
    "message": "Item reserved for 48 hours. Please complete purchase before expiry."
  }
}
```

**Seller Statistics:**
```json
{
  "success": true,
  "data": {
    "totalItems": 12,
    "availableItems": 5,
    "reservedItems": 2,
    "soldItems": 5,
    "totalRevenue": 245000,
    "totalViews": 342,
    "averagePrice": 20417
  }
}
```

---

## 🗄 Database Schema

### User Model
```javascript
{
  name: String,
  universityEmail: String (unique),
  password: String (hashed),
  role: Enum ['student', 'provider', 'admin'],
  contactPhone: String,
  profilePicture: String,
  isActive: Boolean,
  isApproved: Boolean (for providers),
  createdAt: Date,
  updatedAt: Date
}
```

### Housing Listing Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  location: {
    address: String,
    city: String,
    district: String,
    distance: Number
  },
  propertyType: Enum ['boarding', 'room', 'annex', 'apartment'],
  roomType: Enum ['single', 'shared', 'full-house'],
  amenities: [String],
  images: [String],
  providerId: ObjectId (ref: User),
  contactPhone: String,
  availability: Boolean,
  status: Enum ['pending_approval', 'approved', 'rejected'],
  isActive: Boolean,
  rulesAndRegulations: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Reservation Model
```javascript
{
  listingId: ObjectId (ref: HousingListing),
  studentId: ObjectId (ref: User),
  checkInDate: Date,
  duration: Number,
  totalPrice: Number,
  status: Enum ['pending', 'approved', 'rejected', 'confirmed', 'cancelled', 'completed'],
  message: String,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Laundry Provider Model
```javascript
{
  businessName: String,
  userId: ObjectId (ref: User),
  location: String,
  contactNumber: String,
  operatingHours: {
    open: String,
    close: String
  },
  clothesCategories: [{
    name: String,
    pricePerPiece: Number
  }],
  serviceTypes: [{
    name: String,
    price: Number
  }],
  serviceDurations: [{
    name: String,
    price: Number
  }],
  rating: Number,
  totalReviews: Number,
  isActive: Boolean,
  createdAt: Date
}
```

### Laundry Booking Model
```javascript
{
  orderNumber: String (unique, auto-generated),
  providerId: ObjectId (ref: LaundryProvider),
  studentId: ObjectId (ref: User),
  studentName: String,
  studentContact: String,
  clothesItems: [{
    category: String,
    quantity: Number,
    price: Number
  }],
  selectedServices: [String],
  serviceDuration: String,
  totalPrice: Number,
  collectionDate: Date,
  status: Enum ['requested', 'handover_pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'],
  paymentStatus: Enum ['pending', 'paid'],
  paymentMethod: String,
  review: {
    rating: Number,
    comment: String
  },
  createdAt: Date
}
```

### Food Request Model
```javascript
{
  requestNumber: String (unique, auto-generated),
  requesterId: ObjectId (ref: User),
  requesterName: String,
  requesterContact: String,
  mealType: Enum ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
  foodItems: [{
    item: String,
    quantity: Number
  }],
  deliveryLocation: {
    type: String,
    details: String
  },
  requiredTime: Date,
  helperId: ObjectId (ref: User),
  helperName: String,
  helperContact: String,
  status: Enum ['pending', 'accepted', 'purchased', 'delivering', 'delivered', 'completed', 'cancelled'],
  estimatedCost: Number,
  serviceCharge: Number,
  totalCost: Number,
  paymentStatus: Enum ['pending', 'paid'],
  paymentMethod: String,
  feedback: {
    rating: Number,
    comment: String
  },
  specialInstructions: String,
  createdAt: Date
}
```

### Second-Hand Item Model
```javascript
{
  title: String,
  description: String,
  category: Enum ['Electronics', 'Books & Notes', 'Furniture', 'Clothing', 'Sports Equipment', 'Household Items', 'Stationery', 'Other'],
  price: Number,
  condition: Enum ['Like New', 'Good', 'Fair', 'Poor'],
  images: [String] (1-5 images),
  sellerId: ObjectId (ref: User),
  sellerName: String,
  sellerContact: String,
  location: String,
  status: Enum ['available', 'reserved', 'sold'],
  buyerId: ObjectId (ref: User),
  buyerName: String,
  buyerContact: String,
  reservationExpiry: Date,
  views: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📖 User Workflows & Scenarios

### Scenario 1: Student Finds Housing

1. **Browse Listings:**
   ```http
   GET /api/housing?city=Colombo&maxPrice=20000&amenities=WiFi,AC
   ```

2. **View Details:**
   ```http
   GET /api/housing/:listingId
   ```

3. **Create Reservation:**
   ```http
   POST /api/housing/:listingId/reserve
   {
     "checkInDate": "2026-04-01",
     "duration": 12,
     "message": "I'm interested in this property"
   }
   ```

4. **Track Reservation Status:**
   ```http
   GET /api/housing/my/reservations
   ```

5. **Provider Responds:**
   - Provider approves: Status becomes `approved`
   - Student confirms: Status becomes `confirmed`

---

### Scenario 2: Student Books Laundry Service

1. **Browse Providers:**
   ```http
   GET /api/laundry/providers?location=Campus Area
   ```

2. **View Provider Details:**
   ```http
   GET /api/laundry/providers/:providerId
   ```

3. **Create Booking:**
   ```http
   POST /api/laundry/bookings
   {
     "providerId": "...",
     "clothesItems": [
       { "category": "Regular / Daily Wear", "quantity": 10 },
       { "category": "Formal", "quantity": 2 }
     ],
     "selectedServices": ["Wash & Dry", "Iron"],
     "serviceDuration": "24-hour service",
     "collectionDate": "2026-03-22"
   }
   ```
   **System auto-calculates total price**

4. **Hand Over Clothes:**
   - Student physically gives clothes to provider
   - Provider updates status to `confirmed`

5. **Track Progress:**
   ```http
   GET /api/laundry/bookings/:bookingId
   ```

6. **Collect Clothes:**
   - Provider marks as `ready`
   - Student collects and pays
   - Status becomes `completed`

7. **Leave Review:**
   ```http
   POST /api/laundry/bookings/:bookingId/review
   {
     "rating": 5,
     "review": "Excellent service!"
   }
   ```

---

### Scenario 3: Student Requests Food

1. **Create Request:**
   ```http
   POST /api/food-assistance/requests
   {
     "mealType": "Lunch",
     "foodItems": [
       { "item": "Rice and Curry", "quantity": 1 }
     ],
     "deliveryLocation": {
       "type": "Hostel",
       "details": "Block A, Room 305"
     },
     "requiredTime": "2026-03-20T13:00:00Z"
   }
   ```

2. **System Notifies Nearby Helpers** (automatic)

3. **Helper Accepts:**
   ```http
   POST /api/food-assistance/requests/:requestId/accept
   {
     "helperName": "Jane Smith",
     "helperContact": "0777654321"
   }
   ```

4. **Helper Updates Cost:**
   ```http
   PATCH /api/food-assistance/requests/:requestId/estimated-cost
   {
     "estimatedCost": 450
   }
   ```

5. **Helper Purchases Food:**
   ```http
   PATCH /api/food-assistance/requests/:requestId/status
   { "status": "purchased" }
   ```

6. **Delivery in Progress:**
   ```http
   PATCH /api/food-assistance/requests/:requestId/status
   { "status": "delivering" }
   ```

7. **Food Delivered:**
   ```http
   PATCH /api/food-assistance/requests/:requestId/status
   { "status": "delivered" }
   ```

8. **Payment & Feedback:**
   ```http
   POST /api/food-assistance/requests/:requestId/feedback
   {
     "rating": 5,
     "feedback": "Great helper! Very punctual."
   }
   ```

---

### Scenario 4: Student Sells Item

1. **Create Listing:**
   ```http
   POST /api/secondhand/items
   {
     "title": "Scientific Calculator",
     "description": "Casio FX-991, barely used",
     "category": "Stationery",
     "price": 3500,
     "condition": "Like New",
     "images": ["url1", "url2"]
   }
   ```

2. **Buyer Browses:**
   ```http
   GET /api/secondhand/items?category=Stationery&maxPrice=5000&search=calculator
   ```

3. **Buyer Reserves:**
   ```http
   POST /api/secondhand/items/:itemId/reserve
   {
     "buyerName": "Mike Johnson",
     "buyerContact": "0771112233"
   }
   ```
   **Item reserved for 48 hours**

4. **Meet & Transaction:**
   - Both parties meet on campus
   - Buyer inspects item
   - Payment completed

5. **Seller Marks as Sold:**
   ```http
   POST /api/secondhand/items/:itemId/mark-sold
   ```

6. **View Statistics:**
   ```http
   GET /api/secondhand/items/stats
   ```

---

### Scenario 5: Provider Creates Housing Listing

1. **Register as Provider:**
   ```http
   POST /api/auth/register
   {
     "role": "provider",
     ...
   }
   ```
   **Status:** `pending_approval`

2. **Admin Approves:**
   ```http
   PUT /api/auth/approve-provider/:providerId
   ```

3. **Create Listing:**
   ```http
   POST /api/housing
   {
     "title": "Comfortable Room Near Campus",
     "price": 15000,
     "location": {...},
     "amenities": ["WiFi", "AC"],
     "images": [...]
   }
   ```
   **Status:** `pending_approval`

4. **Admin Approves Listing:**
   ```http
   PUT /api/housing/:listingId/approve
   ```

5. **View Dashboard:**
   ```http
   GET /api/housing/provider/dashboard
   ```
   Returns: Total listings, reservations, revenue stats

6. **Manage Reservations:**
   ```http
   GET /api/housing/provider/reservations
   ```

7. **Respond to Reservation:**
   ```http
   PUT /api/housing/reservations/:reservationId/approve
   ```

---

### Scenario 6: Admin Moderation

1. **View Pending Providers:**
   ```http
   GET /api/auth/pending-providers
   ```

2. **Approve/Reject Provider:**
   ```http
   PUT /api/auth/approve-provider/:providerId
   ```
   OR
   ```http
   PUT /api/auth/reject-provider/:providerId
   ```

3. **View Housing Dashboard:**
   ```http
   GET /api/housing/admin/dashboard
   ```

4. **Moderate Listings:**
   ```http
   GET /api/housing?status=pending_approval
   PUT /api/housing/:listingId/approve
   PUT /api/housing/:listingId/reject
   ```

5. **Manage Users:**
   ```http
   GET /api/auth/users
   PUT /api/auth/users/:userId/deactivate
   ```

---

## 🚀 Setup Instructions

### Prerequisites
```bash
Node.js >= 20.x
npm >= 10.x
MongoDB >= 7.x (local or MongoDB Atlas)
Git
```

### Backend Setup

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd UNIMATE/backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create Environment File:**
   ```bash
   cp .env.example .env
   ```

4. **Configure Environment Variables:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/unimate?retryWrites=true&w=majority
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

   Server runs on: `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend:**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure API Base URL:**
   ```javascript
   // src/services/api.js
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

   Frontend runs on: `http://localhost:5173`

### Database Setup

1. **MongoDB Atlas (Recommended for Production):**
   - Create account at mongodb.com
   - Create cluster
   - Get connection string
   - Add to `.env` as `MONGO_URI`

2. **Local MongoDB:**
   ```bash
   # Install MongoDB locally
   # Start MongoDB service
   mongod --dbpath /path/to/data

   # Update .env
   MONGO_URI=mongodb://localhost:27017/unimate
   ```

---

## 🔒 Environment Configuration

### Backend `.env` File
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/unimate?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=30d

# CORS (if frontend on different domain)
CLIENT_URL=http://localhost:5173

# Optional: File Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env` File
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=UNIMATE
```

---

## 🧪 Testing Guide

### Using Postman

1. **Import Collection:**
   - Import `postman_collection.json` from backend directory
   - Set environment variable: `base_url = http://localhost:5000`

2. **Authentication Flow:**
   - Run "Register Student" → Saves `student_id`
   - Run "Login Student" → Saves `auth_token`
   - All subsequent requests use `{{auth_token}}` automatically

3. **Test Complete Workflows:**
   - Housing: Register → Login → Browse Listings → Create Reservation
   - Laundry: Browse Providers → Create Booking → Update Status
   - Food: Create Request → Accept (different user) → Deliver → Complete
   - Marketplace: Create Item → Browse → Reserve → Mark Sold

### Manual Testing

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "universityEmail": "test@university.lk",
    "password": "password123",
    "role": "student"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "universityEmail": "test@university.lk",
    "password": "password123"
  }'
```

**Get Profile (with token):**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Status Workflows

### Housing Listing Status
```
pending_approval → [Admin Review] → approved/rejected
approved → [Provider Toggle] → active/inactive
```

### Reservation Status
```
pending → [Provider Review] → approved/rejected
approved → [Student Confirms] → confirmed
confirmed → [Time Passes] → completed
any → [Cancel] → cancelled
```

### Laundry Booking Status
```
requested → [Student Handover] → handover_pending
handover_pending → [Provider Confirms] → confirmed
confirmed → [Provider Processes] → processing
processing → [Clean & Ready] → ready
ready → [Student Collects] → completed
any → [Cancel] → cancelled
```

### Food Request Status
```
pending → [Helper Accepts] → accepted
accepted → [Helper Buys] → purchased
purchased → [On The Way] → delivering
delivering → [Food Given] → delivered
delivered → [Payment Done] → completed
any → [Cancel] → cancelled
```

### Marketplace Item Status
```
available → [Buyer Reserves] → reserved (48hr hold)
reserved → [Payment Done] → sold
reserved → [48hr Expires] → available (auto)
```

---

## 🎯 Key Features Summary

### ✅ Implemented Features

**Authentication & Security:**
- ✓ JWT-based authentication
- ✓ Password hashing (bcrypt)
- ✓ Role-based access control
- ✓ Protected routes
- ✓ Token expiry handling

**Housing Marketplace:**
- ✓ Multi-image listings
- ✓ Advanced filtering (location, price, amenities)
- ✓ Reservation system
- ✓ Provider dashboard
- ✓ Admin approval workflow
- ✓ Active/inactive toggle

**Laundry Service:**
- ✓ Provider profiles with custom pricing
- ✓ Auto-calculated pricing engine
- ✓ Unique order numbers (LND-XXXXX)
- ✓ Multi-status workflow
- ✓ Review and rating system
- ✓ Service categories and durations

**Food Assistance:**
- ✓ Location-based helper matching
- ✓ Unique request numbers (FOOD-XXXXX)
- ✓ Real-time status tracking
- ✓ Cost estimation
- ✓ Feedback system
- ✓ Multiple meal types

**Second-Hand Marketplace:**
- ✓ 8 item categories
- ✓ Multi-image support (1-5 images)
- ✓ Condition levels
- ✓ Full-text search
- ✓ Reservation system (48hr hold)
- ✓ Seller statistics
- ✓ View counter
- ✓ Soft delete

**Admin Panel:**
- ✓ Provider approval system
- ✓ Listing moderation
- ✓ User management (activate/deactivate)
- ✓ Dashboard with statistics
- ✓ Full system oversight

---

## 🔗 Quick Links

- **API Base URL:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`
- **Postman Collection:** `backend/postman_collection.json`
- **API Documentation:** `backend/THREE_COMPONENTS_API_GUIDE.md`
- **Housing API Guide:** `backend/HOUSING_API_GUIDE.md`
- **Figma Design Prompts:** `backend/FIGMA_AI_PROMPTS.md`

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes
- `200` - OK (successful GET, PUT, PATCH)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server-side error)

---

## 👥 Development Team

**Project:** UNIMATE - University Campus Services Hub  
**Institution:** University Project  
**Tech Stack:** MERN (MongoDB, Express, React, Node.js + TypeScript)  
**Version:** 1.0.0  
**Last Updated:** March 20, 2026

---

## 📄 License

This project is developed for educational purposes as part of university coursework.

---

## 🆘 Support & Contact

For issues, questions, or contributions:
- Check existing documentation files
- Review API endpoints in Postman collection
- Test with provided scenarios
- Check MongoDB connection and environment variables

---

## 🎉 System is Ready!

All five modules are fully implemented and tested:
1. ✅ Authentication & User Management
2. ✅ Housing Marketplace
3. ✅ Laundry Service Management
4. ✅ Student Food Assistance
5. ✅ Second-Hand Marketplace

**Start the backend:** `npm run dev` in `backend/` directory  
**Start the frontend:** `npm run dev` in `frontend/` directory  
**Test APIs:** Import Postman collection and start testing!

---

**Built with ❤️ for University Students**
