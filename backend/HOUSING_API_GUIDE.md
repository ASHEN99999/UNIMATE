# 🏠 Housing Marketplace API - Testing Guide

## ✅ Setup Complete!

Your Housing Marketplace backend is now ready with:
- ✅ MongoDB Connection
- ✅ User Authentication (JWT)
- ✅ Housing Listing Management
- ✅ Reservation System
- ✅ Role-Based Access Control

---

## 📋 Prerequisites

1. **MongoDB Compass**: Make sure MongoDB is running
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - Database name: `campusnest` will be created automatically

2. **API Testing Tool**: Use Postman, Thunder Client, or any REST client

3. **Server Running**: Your server is at `http://localhost:5000`

---

## 🧪 Testing Steps

### **Step 1: Register Users**

#### Register a Provider
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Provider",
  "universityEmail": "provider@university.lk",
  "password": "password123",
  "role": "provider"
}
```

#### Register a Student
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Jane Student",
  "universityEmail": "student@university.lk",
  "password": "password123",
  "role": "student"
}
```

#### Register an Admin
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "universityEmail": "admin@university.lk",
  "password": "password123",
  "role": "admin"
}
```

---

### **Step 2: Login and Get Tokens**

#### Login as Provider
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "universityEmail": "provider@university.lk",
  "password": "password123"
}
```

**Save the token from response!** You'll need it for authenticated requests.

#### Login as Student
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "universityEmail": "student@university.lk",
  "password": "password123"
}
```

#### Login as Admin
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "universityEmail": "admin@university.lk",
  "password": "password123"
}
```

---

### **Step 3: Create Housing Listing (Provider Only)**

```
POST http://localhost:5000/api/housing
Authorization: Bearer YOUR_PROVIDER_TOKEN
Content-Type: application/json

{
  "title": "Cozy 2BR Apartment Near Campus",
  "description": "Fully furnished apartment with WiFi, close to university. Safe neighborhood with 24/7 security.",
  "price": 25000,
  "location": "Colombo 7",
  "address": "123 Reid Avenue, Colombo 7",
  "rooms": 2,
  "bathrooms": 1,
  "amenities": ["WiFi", "Security", "Parking", "Water 24/7"],
  "contactNumber": "0771234567",
  "availableFrom": "2026-04-01"
}
```

**Expected Response:**
- Status: `pending_approval` (Waiting for admin approval)

---

### **Step 4: Admin Approves Listing**

First, get all pending listings as admin:

```
GET http://localhost:5000/api/housing?status=pending_approval
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Then approve a listing (use the listing ID from the response):

```
PUT http://localhost:5000/api/housing/LISTING_ID_HERE/approve
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected Response:**
- Status changes to: `active`

---

### **Step 5: Student Views Active Listings**

```
GET http://localhost:5000/api/housing
```

Or with location filter:
```
GET http://localhost:5000/api/housing?location=Colombo
```

---

### **Step 6: Student Creates Reservation**

```
POST http://localhost:5000/api/housing/LISTING_ID_HERE/reserve
Authorization: Bearer YOUR_STUDENT_TOKEN
Content-Type: application/json

{
  "message": "Hi, I'm interested in this place. Is it still available?",
  "moveInDate": "2026-04-15"
}
```

**Expected Response:**
- Reservation created with status: `pending`

---

### **Step 7: Provider Views Reservations**

```
GET http://localhost:5000/api/housing/LISTING_ID_HERE/reservations
Authorization: Bearer YOUR_PROVIDER_TOKEN
```

---

### **Step 8: Provider Accepts/Rejects Reservation**

#### Accept Reservation
```
PUT http://localhost:5000/api/housing/reservations/RESERVATION_ID_HERE/accept
Authorization: Bearer YOUR_PROVIDER_TOKEN
Content-Type: application/json

{
  "responseMessage": "Great! The place is yours. Let's arrange a viewing."
}
```

#### Reject Reservation
```
PUT http://localhost:5000/api/housing/reservations/RESERVATION_ID_HERE/reject
Authorization: Bearer YOUR_PROVIDER_TOKEN
Content-Type: application/json

{
  "responseMessage": "Sorry, this place is no longer available."
}
```

---

### **Step 9: Student Views Their Reservations**

```
GET http://localhost:5000/api/housing/my/reservations
Authorization: Bearer YOUR_STUDENT_TOKEN
```

---

## 📊 Complete API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Housing Listings
- `GET /api/housing` - Get all listings (Public)
- `GET /api/housing/:id` - Get single listing (Public)
- `POST /api/housing` - Create listing (Provider only)
- `PUT /api/housing/:id` - Update listing (Provider only)
- `DELETE /api/housing/:id` - Delete listing (Provider only)

### Admin Actions
- `PUT /api/housing/:id/approve` - Approve listing (Admin only)
- `PUT /api/housing/:id/reject` - Reject listing (Admin only)

### Reservations
- `POST /api/housing/:id/reserve` - Create reservation (Student only)
- `GET /api/housing/:id/reservations` - Get listing reservations (Provider only)
- `PUT /api/housing/reservations/:id/:action` - Accept/Reject reservation (Provider only)
- `GET /api/housing/my/reservations` - Get my reservations (Student only)

---

## 🔐 Role-Based Access Control

### Student
- ✅ View active listings
- ✅ Create reservations
- ✅ View their own reservations
- ❌ Cannot create listings
- ❌ Cannot approve listings

### Provider
- ✅ Create housing listings
- ✅ View their own listings
- ✅ Update/delete their listings
- ✅ View reservations for their listings
- ✅ Accept/reject reservations
- ❌ Cannot approve own listings
- ❌ Cannot reserve listings

### Admin
- ✅ View all listings
- ✅ Approve/reject listings
- ✅ Moderate content
- ❌ Cannot create listings (unless also a provider)

---

## 🎯 Workflow Summary

1. **Provider** creates a housing listing → Status: `pending_approval`
2. **Admin** reviews and approves listing → Status: `active`
3. **Student** views active listings and creates reservation → Status: `pending`
4. **Provider** receives reservation and accepts/rejects it → Status: `accepted` or `rejected`
5. **Student** can view status of their reservations

---

## 🛠 MongoDB Compass - View Data

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select database: `campusnest`
4. View collections:
   - `users` - All registered users
   - `housinglistings` - All housing listings
   - `reservations` - All reservations

---

## 🚀 Next Steps

✅ **Your Housing Marketplace is complete!**

You can now:
1. **Test all APIs** using Postman/Thunder Client
2. **View data** in MongoDB Compass
3. **Start building Frontend** (React components)
4. **Add more features**:
   - Image upload for listings
   - Search and filters
   - Reviews and ratings
   - Email notifications

---

## 📞 Need Help?

If you encounter any errors:
1. Check MongoDB is running
2. Check server console for error messages
3. Verify JWT token is correct
4. Ensure user has correct role for the action

---

**🎉 Great job! Your Housing Marketplace backend is production-ready!**
