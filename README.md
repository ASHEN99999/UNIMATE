<!-- # UNIMATE
UNI_PROJECT 
This is structured as:

📌 Executive Summary

🏗 System Architecture

🔐 Roles & Access Control

🧩 Modules & Workflows

🗄 Database Design Overview

⚙️ Technical Stack

🚀 Development Phases

💬 Cursor Starter Prompt

📌 CampusNest – Development Summary
1️⃣ Project Overview

CampusNest is a university-only MERN stack web platform designed to centralize essential student services near campus.

It provides a secure, role-based system where students can:

Find boarding places

Buy/sell home-cooked meals

Book laundry services

Buy/sell second-hand items

The system replaces informal WhatsApp-based communication with a structured, moderated, and workflow-based platform.

🏗 2️⃣ System Architecture

Architecture Type:

MERN Stack (MongoDB, Express, React, Node.js)

Backend: REST API

Frontend: React + TypeScript

Authentication: JWT

Role-Based Access Control (RBAC)

Status-based workflows for each module

Repository Structure:

campusnest/
 ├── server/ (Node + Express + MongoDB)
 └── client/ (React + TypeScript)
🔐 3️⃣ User Roles
👨‍🎓 Student

Register/Login

Browse listings

Create reservations/orders/bookings

Sell items or meals

Manage own activity

🏪 Provider

Create housing listings

Create meal posts

Accept/reject orders

Manage laundry bookings

👑 Admin

Approve providers

Approve/reject listings

Deactivate users

Moderate system content

🧩 4️⃣ Modules & Core Workflows
🏠 1. Housing Marketplace

Purpose: Help students find safe boarding places.

Workflow:

Provider creates listing → Status: pending_approval

Admin approves → Status: active

Student sends reservation request → pending

Provider accepts/rejects → accepted or rejected

Key Rules:

Only approved providers can create active listings.

Only students can reserve.

Cannot reserve inactive listing.

🍱 2. Student Meals Marketplace

Purpose: Students sell/buy home-cooked meals.

Workflow:

Seller posts meal → active

Student places order → pending

Seller accepts → accepted

Order progresses → ready → completed

Rules:

Pickup time must be future date.

Price must be > 0.

Only seller can update status.

🧺 3. Laundry Service

Purpose: Structured laundry booking.

Workflow:

Student creates booking → pending

Provider confirms → confirmed

Process: pickedup → washing → delivered → completed

Rules:

Pickup date must be future.

Student cannot edit after confirmation.

Only provider can update service status.

🛍 4. Second-Hand Marketplace

Purpose: Safe buying/selling within campus.

Workflow:

Student lists item → available

Buyer reserves → reserved

Seller confirms sale → sold

Rules:

Cannot sell item twice.

Only owner can mark sold.

🗄 5️⃣ Core Database Collections
Users

name

universityEmail

passwordHash

role (student | provider | admin)

isActive

HousingListings

title

description

price

location

createdBy

status

Reservations

listingId

studentId

status

Meals

title

description

price

pickupTime

createdBy

MealOrders

mealId

buyerId

status

LaundryBookings

studentId

providerId

pickupDate

weight

status

MarketplaceItems

title

price

sellerId

status

⚙️ 6️⃣ Technical Stack

Backend:

Node.js

Express

MongoDB + Mongoose

JWT Authentication

bcrypt password hashing

Role middleware

Frontend:

React

TypeScript

Axios (API layer)

React Router

Protected Routes

Form validation

Testing:

Playwright or Cypress (for final submission)

🚀 7️⃣ Development Phases
Phase 1 – Core Setup

Backend project setup

Database connection

Auth (register/login)

JWT middleware

Role middleware

Phase 2 – Housing Module

CRUD Listings

Reservation system

Admin approval

Phase 3 – Meals Module
Phase 4 – Laundry Module
Phase 5 – Second-Hand Module
Phase 6 – Admin Panel
Phase 7 – Frontend Integration
Phase 8 – Automated Testing
💬 8️⃣ Cursor Starter Prompt (Copy This)

Paste this into Cursor to begin development:

Build a full MERN stack web application named "CampusNest".

SYSTEM OVERVIEW:
CampusNest is a university-only platform that centralizes housing, meals, laundry services, and second-hand marketplace for students.

TECH STACK:
- Backend: Node.js + Express + MongoDB + TypeScript
- Frontend: React + TypeScript
- Authentication: JWT
- Password hashing: bcrypt
- Role-Based Access Control (student, provider, admin)

REQUIREMENTS:

1. Authentication
- Register with university email validation
- Login with JWT
- Role-based middleware

2. Housing Marketplace
- Provider creates listing (pending approval)
- Admin approves listing
- Student reserves listing
- Reservation workflow: pending → accepted/rejected

3. Meals Marketplace
- Provider posts meal
- Student orders
- Status: pending → accepted → ready → completed

4. Laundry Service
- Student creates booking
- Provider confirms
- Status flow: pending → confirmed → pickedup → washing → delivered → completed

5. Second-Hand Marketplace
- Student lists item
- Buyer reserves
- Seller marks sold
- Prevent double selling

6. Admin Panel
- Approve providers
- Approve listings
- Deactivate users

STRUCTURE:
Create separate /server and /client folders.
Use clean architecture (models, controllers, routes, middleware).
Return JSON responses.
Implement validation and business rules.
Provide README with setup instructions.

Start by building the backend first.
🎯 Final Advice for Success (Very Important)

To make your project “Best 30” level:

Use clean UI (not default bootstrap look)

Show full workflow transitions in demo

Add loading states and error messages

Add at least 3 automated test cases

Prepare clean Git commit history

Make responsibility matrix clear

If you want next:
I can now:

🔥 Give you backend step-by-step build guide

🎨 Design a professional UI layout plan

📊 Create your Responsibility Matrix

🧠 Help you prepare proposal + progress 1 documents

Tell me what you want to do next 👌

Give you backend step-by-step build guide

Perfect Ashen 👨‍💻🔥
We’ll now build CampusNest Backend properly, step-by-step, clean and professional — like a real production project.

We’ll use:

✅ Node.js

✅ Express

✅ TypeScript

✅ MongoDB + Mongoose

✅ JWT Authentication

✅ Role-Based Access Control

We will build in clear phases so you don’t get confused.

🚀 PHASE 1 — Backend Project Setup
Step 1️⃣ Create Backend Folder
mkdir campusnest
cd campusnest
mkdir server
cd server
npm init -y
Step 2️⃣ Install Dependencies
Install Production Dependencies
npm install express mongoose cors helmet morgan bcryptjs jsonwebtoken dotenv
Install Dev Dependencies
npm install -D typescript ts-node-dev @types/node @types/express @types/jsonwebtoken @types/bcryptjs
Step 3️⃣ Setup TypeScript
npx tsc --init

Edit tsconfig.json:

{
  "target": "ES2020",
  "module": "commonjs",
  "rootDir": "./src",
  "outDir": "./dist",
  "strict": true,
  "esModuleInterop": true
}
Step 4️⃣ Setup Folder Structure

Create this structure:

server/
 ├── src/
 │   ├── config/
 │   ├── models/
 │   ├── routes/
 │   ├── controllers/
 │   ├── middleware/
 │   ├── services/
 │   ├── utils/
 │   ├── app.ts
 │   └── server.ts
 ├── .env
 └── package.json
Step 5️⃣ Add Scripts in package.json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
Step 6️⃣ Setup Environment Variables

Create .env

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/campusnest
JWT_SECRET=supersecretkey
🚀 PHASE 2 — Core Server Setup
Step 7️⃣ Create config/env.ts
import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI!,
  JWT_SECRET: process.env.JWT_SECRET!
};
Step 8️⃣ Create app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ message: "CampusNest API running" });
});
Step 9️⃣ Create server.ts
import mongoose from "mongoose";
import { app } from "./app";
import { env } from "./config/env";

async function start() {
  await mongoose.connect(env.MONGO_URI);
  console.log("MongoDB Connected");

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start();
Step 🔟 Test Server
npm run dev

Visit:

http://localhost:4000/health

If you see:

CampusNest API running

✅ Phase 1 & 2 complete.

🚀 PHASE 3 — Authentication System (VERY IMPORTANT)

This is the heart of your backend.

Step 11️⃣ Create User Model

src/models/User.ts

import { Schema, model } from "mongoose";

export type Role = "student" | "provider" | "admin";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    universityEmail: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "provider", "admin"], default: "student" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
Step 12️⃣ Create Auth Controller

src/controllers/auth.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";

export async function register(req: Request, res: Response) {
  const { name, universityEmail, password } = req.body;

  const existing = await User.findOne({ universityEmail });
  if (existing) return res.status(400).json({ message: "Email already used" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    universityEmail,
    passwordHash
  });

  res.status(201).json({ message: "User created" });
}

export async function login(req: Request, res: Response) {
  const { universityEmail, password } = req.body;

  const user = await User.findOne({ universityEmail });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, role: user.role });
}
Step 13️⃣ Create Auth Routes

src/routes/auth.routes.ts

import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
Step 14️⃣ Connect Routes in app.ts

Add:

import { authRoutes } from "./routes/auth.routes";
app.use("/api/auth", authRoutes);
Step 15️⃣ Test Authentication

POST:

http://localhost:4000/api/auth/register

Body:

{
  "name": "Test User",
  "universityEmail": "test@university.lk",
  "password": "123456"
}

Then login.

If you receive JWT token:

✅ Authentication complete.

🚀 PHASE 4 — Role-Based Middleware

Create:

middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function requireAuth(req: any, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(role: string) {
  return (req: any, res: Response, next: NextFunction) => {
    if (req.user.role !== role)
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
🚀 PHASE 5 — Build First Module (Housing)

Now we start real system logic.

Create:

models/HousingListing.ts
controllers/housing.controller.ts
routes/housing.routes.ts

Workflow:

Provider create listing

Admin approve listing

Student reserve listing -->