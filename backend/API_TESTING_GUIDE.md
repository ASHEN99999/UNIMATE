# 🧪 Housing Marketplace - API Testing Guide

Quick reference for testing all endpoints using Postman, Thunder Client, or curl.

## 🔧 Setup

1. Make sure your server is running: `npm run dev`
2. Base URL: `http://localhost:5000` (or your configured port)
3. Create an admin user in MongoDB manually or through registration

---

## 1️⃣ Authentication Tests

### Register Users
```bash
# Register Student
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Student User",
  "universityEmail": "student@university.lk",
  "password": "password123",
  "role": "student"
}

# Register Provider
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Provider User",
  "universityEmail": "provider@university.lk",
  "password": "password123",
  "role": "provider"
}

# Register Admin
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "universityEmail": "admin@university.lk",
  "password": "password123",
  "role": "admin"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "universityEmail": "admin@university.lk",
  "password": "password123"
}

# Save the token from response
```

### Get Current User
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your_token>
```

---

## 2️⃣ Provider Approval Tests (Admin)

### Get Pending Providers
```bash
GET http://localhost:5000/api/auth/pending-providers
Authorization: Bearer <admin_token>
```

### Approve Provider
```bash
PUT http://localhost:5000/api/auth/approve-provider/<provider_id>
Authorization: Bearer <admin_token>
```

### Reject Provider
```bash
PUT http://localhost:5000/api/auth/reject-provider/<provider_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Invalid credentials or documents"
}
```

### Get All Providers
```bash
# Get all providers
GET http://localhost:5000/api/auth/providers
Authorization: Bearer <admin_token>

# Get only approved providers
GET http://localhost:5000/api/auth/providers?isApproved=true
Authorization: Bearer <admin_token>

# Get only unapproved providers
GET http://localhost:5000/api/auth/providers?isApproved=false
Authorization: Bearer <admin_token>
```

---

## 3️⃣ User Management Tests (Admin)

### Get All Users
```bash
# Get all users
GET http://localhost:5000/api/auth/users
Authorization: Bearer <admin_token>

# Filter by role
GET http://localhost:5000/api/auth/users?role=student
Authorization: Bearer <admin_token>

# Filter by active status
GET http://localhost:5000/api/auth/users?isActive=true
Authorization: Bearer <admin_token>

# Combine filters
GET http://localhost:5000/api/auth/users?role=provider&isActive=false
Authorization: Bearer <admin_token>
```

### Get User by ID
```bash
GET http://localhost:5000/api/auth/users/<user_id>
Authorization: Bearer <admin_token>
```

### Deactivate User
```bash
PUT http://localhost:5000/api/auth/users/<user_id>/deactivate
Authorization: Bearer <admin_token>
```

### Activate User
```bash
PUT http://localhost:5000/api/auth/users/<user_id>/activate
Authorization: Bearer <admin_token>
```

---

## 4️⃣ Profile Management Tests

### Update Profile
```bash
PUT http://localhost:5000/api/auth/profile
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "contactNumber": "+94771234567"
}
```

### Change Password
```bash
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## 5️⃣ Housing Listing Tests

### Create Listing (Provider - Must be Approved)
```bash
POST http://localhost:5000/api/housing
Authorization: Bearer <approved_provider_token>
Content-Type: application/json

{
  "title": "Cozy Room Near Campus",
  "description": "A comfortable room with all amenities",
  "price": 15000,
  "location": "Colombo 7",
  "address": "123 Main Street",
  "rooms": 2,
  "bathrooms": 1,
  "amenities": ["WiFi", "AC", "Parking"],
  "contactNumber": "+94771234567",
  "availableFrom": "2026-04-01"
}
```

### Get All Listings (Public)
```bash
# Get all active listings
GET http://localhost:5000/api/housing

# Filter by location
GET http://localhost:5000/api/housing?location=Colombo

# Filter by status (requires auth)
GET http://localhost:5000/api/housing?status=active
Authorization: Bearer <admin_token>
```

### Get Listing by ID
```bash
GET http://localhost:5000/api/housing/<listing_id>
```

### Update Listing (Provider)
```bash
PUT http://localhost:5000/api/housing/<listing_id>
Authorization: Bearer <provider_token>
Content-Type: application/json

{
  "price": 16000,
  "description": "Updated description"
}
```

### Delete Listing (Provider)
```bash
DELETE http://localhost:5000/api/housing/<listing_id>
Authorization: Bearer <provider_token>
```

### Toggle Listing Status (Provider)
```bash
# Toggle between active ↔ inactive
PUT http://localhost:5000/api/housing/<listing_id>/toggle-status
Authorization: Bearer <provider_token>
```

---

## 6️⃣ Admin Listing Management Tests

### Approve Listing
```bash
PUT http://localhost:5000/api/housing/<listing_id>/approve
Authorization: Bearer <admin_token>
```

### Reject Listing
```bash
PUT http://localhost:5000/api/housing/<listing_id>/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "Inappropriate content or misleading information"
}
```

---

## 7️⃣ Reservation Tests (Student)

### Create Reservation
```bash
POST http://localhost:5000/api/housing/<listing_id>/reserve
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "message": "I'm interested in this property. When can I visit?",
  "moveInDate": "2026-05-01"
}
```

### Get My Reservations
```bash
GET http://localhost:5000/api/housing/my/reservations
Authorization: Bearer <student_token>
```

### Cancel Reservation
```bash
PUT http://localhost:5000/api/housing/reservations/<reservation_id>/cancel
Authorization: Bearer <student_token>
```

---

## 8️⃣ Provider Reservation Management

### Get Reservations for Specific Listing
```bash
GET http://localhost:5000/api/housing/<listing_id>/reservations
Authorization: Bearer <provider_token>
```

### Get All Provider Reservations
```bash
# Get all reservations
GET http://localhost:5000/api/housing/provider/reservations
Authorization: Bearer <provider_token>

# Filter by status
GET http://localhost:5000/api/housing/provider/reservations?status=pending
Authorization: Bearer <provider_token>
```

### Accept Reservation
```bash
PUT http://localhost:5000/api/housing/reservations/<reservation_id>/accept
Authorization: Bearer <provider_token>
Content-Type: application/json

{
  "responseMessage": "Your reservation is confirmed. Please contact me to arrange viewing."
}
```

### Reject Reservation
```bash
PUT http://localhost:5000/api/housing/reservations/<reservation_id>/reject
Authorization: Bearer <provider_token>
Content-Type: application/json

{
  "responseMessage": "Sorry, this property has already been booked."
}
```

---

## 9️⃣ Dashboard Tests

### Provider Dashboard
```bash
GET http://localhost:5000/api/housing/provider/dashboard
Authorization: Bearer <provider_token>

# Expected Response:
{
  "success": true,
  "data": {
    "totalListings": 10,
    "activeListings": 6,
    "pendingListings": 2,
    "rejectedListings": 2,
    "totalReservations": 25,
    "pendingReservations": 5,
    "acceptedReservations": 15
  }
}
```

### Admin Dashboard
```bash
GET http://localhost:5000/api/housing/admin/dashboard
Authorization: Bearer <admin_token>

# Expected Response:
{
  "success": true,
  "data": {
    "totalListings": 50,
    "pendingApprovalListings": 8,
    "activeListings": 35,
    "rejectedListings": 7,
    "totalReservations": 120,
    "totalUsers": 200,
    "pendingProviders": 5
  }
}
```

---

## 🧪 Complete Test Scenario

### Scenario: Complete Provider-Student Workflow

```bash
# Step 1: Register Provider
POST /api/auth/register
Body: { "name": "John", "universityEmail": "john@uni.lk", "password": "123", "role": "provider" }
→ Save provider_id

# Step 2: Login Provider (will have token but isApproved=false)
POST /api/auth/login
Body: { "universityEmail": "john@uni.lk", "password": "123" }
→ Save provider_token

# Step 3: Try to create listing (SHOULD FAIL)
POST /api/housing
Headers: { Authorization: Bearer <provider_token> }
→ Expected: 403 - "Your provider account must be approved before creating listings"

# Step 4: Admin approves provider
PUT /api/auth/approve-provider/<provider_id>
Headers: { Authorization: Bearer <admin_token> }
→ Expected: 200 - Provider approved

# Step 5: Provider creates listing (SHOULD SUCCEED)
POST /api/housing
Headers: { Authorization: Bearer <provider_token> }
Body: { listing details... }
→ Save listing_id
→ Status: pending_approval

# Step 6: Admin approves listing
PUT /api/housing/<listing_id>/approve
Headers: { Authorization: Bearer <admin_token> }
→ Status: active

# Step 7: Student creates reservation
POST /api/housing/<listing_id>/reserve
Headers: { Authorization: Bearer <student_token> }
Body: { "message": "Interested!", "moveInDate": "2026-05-01" }
→ Save reservation_id

# Step 8: Student cancels reservation
PUT /api/housing/reservations/<reservation_id>/cancel
Headers: { Authorization: Bearer <student_token> }
→ Expected: 200 - Cancelled

# Step 9: Student creates new reservation
POST /api/housing/<listing_id>/reserve
Headers: { Authorization: Bearer <student_token> }
→ Save new reservation_id

# Step 10: Provider accepts reservation
PUT /api/housing/reservations/<new_reservation_id>/accept
Headers: { Authorization: Bearer <provider_token> }
Body: { "responseMessage": "Confirmed!" }
→ Expected: 200 - Accepted

# Step 11: Provider toggles listing to inactive
PUT /api/housing/<listing_id>/toggle-status
Headers: { Authorization: Bearer <provider_token> }
→ Status: inactive

# Step 12: View dashboards
GET /api/housing/provider/dashboard
Headers: { Authorization: Bearer <provider_token> }

GET /api/housing/admin/dashboard
Headers: { Authorization: Bearer <admin_token> }
```

---

## ✅ Expected Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, business rule violation |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

---

## 📝 Common Error Messages

### Authentication Errors
- `"Please provide all required fields"` - Missing registration data
- `"Email already used"` - Duplicate email during registration
- `"Invalid credentials"` - Wrong email/password
- `"Your account has been deactivated"` - User is deactivated
- `"Unauthorized"` - Missing token
- `"Invalid token"` - Expired or malformed token
- `"Forbidden"` - Insufficient permissions

### Provider Approval Errors
- `"Your provider account must be approved before creating listings"`
- `"Provider not found"`
- `"User is not a provider"`
- `"Provider is already approved"`

### Listing Errors
- `"Only providers can create housing listings"`
- `"Listing not found"`
- `"Not authorized to update this listing"`
- `"Cannot change status of pending listings"`
- `"Cannot reactivate rejected listings"`
- `"Only pending listings can be approved"`

### Reservation Errors
- `"Cannot reserve inactive listing"`
- `"You already have a pending reservation for this listing"`
- `"Reservation not found"`
- `"Not authorized to cancel this reservation"`
- `"Only pending reservations can be cancelled"`
- `"Reservation has already been processed"`

### User Management Errors
- `"User not found"`
- `"Cannot deactivate admin users"`
- `"User is already deactivated"`
- `"User is already active"`
- `"Current password is incorrect"`

---

## 🎯 Quick Testing Checklist

- [ ] Register users (student, provider, admin)
- [ ] Login all user types
- [ ] Admin views pending providers
- [ ] Admin approves provider
- [ ] Unapproved provider tries to create listing (fails)
- [ ] Approved provider creates listing
- [ ] Admin approves listing
- [ ] Student creates reservation
- [ ] Student cancels reservation
- [ ] Student creates new reservation
- [ ] Provider accepts/rejects reservation
- [ ] Provider toggles listing status
- [ ] Provider views dashboard
- [ ] Admin views dashboard
- [ ] Admin deactivates user
- [ ] Deactivated user tries to login (fails)
- [ ] Admin reactivates user
- [ ] User updates profile
- [ ] User changes password

---

Happy Testing! 🚀
