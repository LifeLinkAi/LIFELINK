# LifeLink AI — Project Context (claude.md)

> **Purpose of this file:** This is the master context document for the LifeLink AI codebase. It tells Claude (and any developer/agent) everything needed to navigate, contribute to, and extend the project consistently. Read this fully before generating or modifying code.

---

## 1. Project Overview

**LifeLink AI** is an AI-powered emergency healthcare and donation ecosystem that connects **patients, donors, hospitals, and ambulance drivers** in real time. The platform reduces emergency response time using smart donor matching, live ambulance tracking, AI verification, and instant communication.

### Core Value Propositions
- **Speed** — Match donors and dispatch ambulances in seconds, not hours.
- **Safety** — AI face + document verification prevents fake donors.
- **Coordination** — A single ecosystem for patients, donors, hospitals, drivers, and admins.
- **Intelligence** — AI chatbot, smart matching, OCR parsing, emergency prediction.

### Primary User Roles
| Role | Description |
|---|---|
| **Admin** | Verifies users/hospitals, monitors emergencies, runs analytics |
| **Patient** | Requests blood, organs, ambulance; uses AI assistant |
| **Donor** | Receives requests, accepts/rejects, shares location |
| **Hospital** | Manages requests, verifies donors, manages blood stock |
| **Ambulance Driver** | Receives trips, navigates, updates status live |

> Note: A single user can switch between **Patient** and **Donor** modes (Role Switch Page).

---

## 2. Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **React 18+**
- **Tailwind CSS** (utility-first styling)
- **Redux Toolkit** (global state) + **RTK Query** (API caching)
- **Socket.IO Client** (real-time)
- **React Hook Form** + **Zod** (forms & validation)
- **Framer Motion** (animations)
- **Lucide React** (icons)

### Backend
- **Node.js 20+**
- **Express.js** (REST APIs)
- **Socket.IO** (real-time server)
- **JWT** (authentication) + **bcrypt** (password hashing)
- **Multer** (file uploads) → forwarded to Cloudinary
- **Joi** or **Zod** (server-side validation)

### Database
- **MongoDB** (primary database)
- **Mongoose** (ODM)
- **Redis** (optional — caching, pub/sub for scaling Socket.IO)

### AI / ML
- **Groq API** / **OpenAI API** — chatbot, health assistant
- **face-api.js** + **TensorFlow.js** — face verification
- **Tesseract.js** or cloud OCR — document parsing

### Maps & Location
- **Google Maps JavaScript API** — map rendering, navigation
- **Geolocation API** (browser) — donor/driver location
- **Google Directions API** — ETA calculations

### Storage & Notifications
- **Cloudinary** — image/document storage
- **Firebase Cloud Messaging (FCM)** — push notifications
- **Nodemailer** (optional) — transactional emails

### DevOps
- **Vercel** — frontend hosting
- **Render / Railway / AWS EC2** — backend hosting
- **MongoDB Atlas** — managed database
- **GitHub Actions** — CI/CD

---

## 3. Folder Structure

The project is a **monorepo** with three top-level apps: `client`, `server`, and `shared`.

```
lifelink-ai/
├── client/                          # Next.js frontend
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── models/                  # face-api.js models
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── verify/
│   │   │   ├── (user)/              # Patient + Donor unified
│   │   │   │   ├── dashboard/
│   │   │   │   ├── profile/
│   │   │   │   ├── notifications/
│   │   │   │   ├── chat/
│   │   │   │   ├── role-switch/
│   │   │   │   ├── patient/
│   │   │   │   │   ├── sos/
│   │   │   │   │   ├── request-blood/
│   │   │   │   │   ├── request-organ/
│   │   │   │   │   ├── request-ambulance/
│   │   │   │   │   ├── request-status/
│   │   │   │   │   ├── nearby-hospitals/
│   │   │   │   │   └── medical-history/
│   │   │   │   └── donor/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── availability/
│   │   │   │       ├── incoming-requests/
│   │   │   │       ├── donate-blood/
│   │   │   │       ├── donate-organ/
│   │   │   │       ├── history/
│   │   │   │       └── rewards/
│   │   │   ├── (hospital)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── profile/
│   │   │   │   ├── blood-stock/
│   │   │   │   ├── patient-requests/
│   │   │   │   ├── blood-requests/
│   │   │   │   ├── organ-requests/
│   │   │   │   ├── donor-verification/
│   │   │   │   ├── emergencies/
│   │   │   │   ├── surgeries/
│   │   │   │   ├── ambulance-coordination/
│   │   │   │   ├── chat/
│   │   │   │   └── reports/
│   │   │   ├── (driver)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── profile/
│   │   │   │   ├── status/
│   │   │   │   ├── trip-requests/
│   │   │   │   ├── active-trip/
│   │   │   │   ├── tracking/
│   │   │   │   ├── pickup/
│   │   │   │   ├── history/
│   │   │   │   ├── emergency-contacts/
│   │   │   │   └── notifications/
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/
│   │   │   │   ├── donors/
│   │   │   │   ├── hospitals/
│   │   │   │   ├── drivers/
│   │   │   │   ├── verifications/
│   │   │   │   ├── emergencies/
│   │   │   │   ├── blood-requests/
│   │   │   │   ├── organ-requests/
│   │   │   │   ├── reports/
│   │   │   │   ├── analytics/
│   │   │   │   ├── settings/
│   │   │   │   └── notifications/
│   │   │   ├── api/                 # Next.js route handlers (proxy if needed)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── globals.css
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable primitives (Button, Card, Modal)
│   │   │   ├── forms/               # Form components
│   │   │   ├── layouts/             # DashboardLayout, AuthLayout
│   │   │   ├── navigation/          # Sidebar, Navbar, MobileNav
│   │   │   ├── maps/                # GoogleMap, AmbulanceTracker, DonorMap
│   │   │   ├── chat/                # ChatWindow, MessageBubble
│   │   │   ├── notifications/       # NotificationBell, Toast
│   │   │   ├── verification/        # FaceCapture, DocumentUpload
│   │   │   ├── ai/                  # AIChatbot, HealthAssistant
│   │   │   └── shared/              # StatCard, LoadingSpinner, EmptyState
│   │   ├── features/                # Redux slices + RTK Query
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── donor/
│   │   │   ├── patient/
│   │   │   ├── hospital/
│   │   │   ├── ambulance/
│   │   │   ├── admin/
│   │   │   ├── chat/
│   │   │   ├── notifications/
│   │   │   └── verification/
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   ├── useGeolocation.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useFaceVerification.ts
│   │   ├── lib/
│   │   │   ├── socket.ts            # Socket.IO client singleton
│   │   │   ├── axios.ts             # Axios instance with interceptors
│   │   │   ├── firebase.ts          # FCM setup
│   │   │   ├── maps.ts              # Google Maps loader
│   │   │   ├── faceapi.ts           # face-api.js loader
│   │   │   └── utils.ts             # cn(), formatters, helpers
│   │   ├── store/
│   │   │   ├── index.ts             # Redux store config
│   │   │   ├── rootReducer.ts
│   │   │   └── middleware.ts
│   │   ├── types/                   # TS types (mirror shared/)
│   │   ├── constants/
│   │   │   ├── routes.ts
│   │   │   ├── roles.ts
│   │   │   ├── bloodGroups.ts
│   │   │   └── statuses.ts
│   │   └── middleware.ts            # Next.js auth middleware
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                # MongoDB connection
│   │   │   ├── env.ts                # Env validation
│   │   │   ├── cloudinary.ts
│   │   │   ├── firebase-admin.ts
│   │   │   └── socket.ts            # Socket.IO server setup
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Donor.ts
│   │   │   ├── Patient.ts
│   │   │   ├── Hospital.ts
│   │   │   ├── Driver.ts
│   │   │   ├── BloodRequest.ts
│   │   │   ├── OrganRequest.ts
│   │   │   ├── AmbulanceTrip.ts
│   │   │   ├── BloodStock.ts
│   │   │   ├── Donation.ts
│   │   │   ├── Verification.ts
│   │   │   ├── Notification.ts
│   │   │   ├── ChatRoom.ts
│   │   │   ├── Message.ts
│   │   │   └── Report.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── donor.controller.ts
│   │   │   ├── patient.controller.ts
│   │   │   ├── hospital.controller.ts
│   │   │   ├── driver.controller.ts
│   │   │   ├── blood.controller.ts
│   │   │   ├── organ.controller.ts
│   │   │   ├── ambulance.controller.ts
│   │   │   ├── verification.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── ai.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── donor.routes.ts
│   │   │   ├── patient.routes.ts
│   │   │   ├── hospital.routes.ts
│   │   │   ├── driver.routes.ts
│   │   │   ├── blood.routes.ts
│   │   │   ├── organ.routes.ts
│   │   │   ├── ambulance.routes.ts
│   │   │   ├── verification.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── index.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── verify.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── chatbot.service.ts
│   │   │   │   ├── ocr.service.ts
│   │   │   │   └── matching.service.ts
│   │   │   ├── matching/
│   │   │   │   ├── donor-match.ts   # Smart donor matching algo
│   │   │   │   └── ambulance-match.ts
│   │   │   ├── notifications/
│   │   │   │   ├── fcm.service.ts
│   │   │   │   └── socket-notify.ts
│   │   │   ├── geo/
│   │   │   │   ├── distance.ts      # Haversine
│   │   │   │   └── maps.service.ts
│   │   │   ├── verification/
│   │   │   │   ├── face.service.ts
│   │   │   │   └── document.service.ts
│   │   │   └── upload.service.ts
│   │   ├── sockets/
│   │   │   ├── index.ts             # Main socket initializer
│   │   │   ├── handlers/
│   │   │   │   ├── chat.handler.ts
│   │   │   │   ├── tracking.handler.ts
│   │   │   │   ├── emergency.handler.ts
│   │   │   │   └── notification.handler.ts
│   │   │   └── events.ts            # Centralized event names
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── logger.ts
│   │   │   ├── asyncHandler.ts
│   │   │   ├── ApiError.ts
│   │   │   ├── ApiResponse.ts
│   │   │   └── validators.ts
│   │   ├── validators/              # Zod/Joi schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── donor.schema.ts
│   │   │   ├── blood.schema.ts
│   │   │   ├── organ.schema.ts
│   │   │   └── ambulance.schema.ts
│   │   ├── jobs/                    # Cron / background jobs
│   │   │   ├── cleanup.job.ts
│   │   │   └── reminder.job.ts
│   │   ├── app.ts                   # Express app
│   │   └── server.ts                # Entry point
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                          # Shared types & constants
│   ├── types/
│   │   ├── user.ts
│   │   ├── donor.ts
│   │   ├── request.ts
│   │   ├── ambulance.ts
│   │   └── api.ts
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── statuses.ts
│   │   ├── socketEvents.ts
│   │   └── bloodGroups.ts
│   └── package.json
│
├── docs/                            # Project documentation
│   ├── api.md
│   ├── socket-events.md
│   ├── database-schema.md
│   └── deployment.md
│
├── .gitignore
├── README.md
├── claude.md                        # This file
└── package.json                     # Root (workspaces)
```

---

## 4. Database Schema (Mongoose Models)

### `User` (base auth model)
```ts
{
  _id, name, email, phone, password (hashed),
  role: 'user' | 'hospital' | 'driver' | 'admin',
  activeMode: 'patient' | 'donor',     // for role='user' only
  avatar, isVerified, isActive,
  fcmToken,                             // for push notifications
  location: { type: 'Point', coordinates: [lng, lat] },
  createdAt, updatedAt
}
```

### `Donor` (extends User profile)
```ts
{
  userId (ref User),
  bloodGroup, organsWillingToDonate: [String],
  isAvailable: Boolean,
  lastDonationDate,
  totalDonations, rewardPoints, badges: [String],
  medicalHistory, verificationStatus
}
```

### `Patient`
```ts
{
  userId (ref User),
  bloodGroup, medicalConditions: [String],
  emergencyContacts: [{ name, phone, relation }],
  medicalHistory: [{ date, diagnosis, notes }]
}
```

### `Hospital`
```ts
{
  userId (ref User),
  hospitalName, licenseNumber, address,
  location: { type: 'Point', coordinates },
  bloodStock: { 'A+': Number, 'A-': Number, ... },
  isVerified, specialties: [String],
  contact: { phone, email, emergencyHotline }
}
```

### `Driver`
```ts
{
  userId (ref User),
  licenseNumber, vehicleNumber, vehicleType,
  hospitalId (ref Hospital, optional),
  isOnline, currentLocation: { coordinates },
  totalTrips, rating
}
```

### `BloodRequest`
```ts
{
  patientId, bloodGroup, unitsNeeded, urgency: 'low'|'medium'|'critical',
  hospitalId, location, status: 'PENDING'|'MATCHING'|'DONOR_FOUND'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED',
  matchedDonors: [{ donorId, status, respondedAt }],
  acceptedDonorId, completedAt, createdAt
}
```

### `OrganRequest`
```ts
{
  patientId, organType, bloodGroup, urgency,
  hospitalId, status: 'PENDING'|'MATCHING'|'DONOR_FOUND'|'UNDER_VERIFICATION'|'APPROVED'|'SURGERY_SCHEDULED'|'COMPLETED',
  matchedDonorId, surgeryDate, medicalReports: [String]
}
```

### `AmbulanceTrip`
```ts
{
  patientId, driverId, hospitalId,
  pickupLocation, dropLocation,
  status: 'REQUESTED'|'ASSIGNED'|'ON_THE_WAY'|'PICKED_UP'|'ARRIVED'|'COMPLETED'|'CANCELLED',
  liveLocation: { coordinates, updatedAt },
  estimatedArrival, actualArrival, distance, cost
}
```

### `Verification`
```ts
{
  userId, type: 'identity'|'medical'|'hospital'|'driver',
  documents: [{ url, type }],
  selfieUrl, faceMatchScore,
  status: 'PENDING'|'APPROVED'|'REJECTED',
  reviewedBy (admin), reviewNotes, submittedAt
}
```

### `Notification`
```ts
{
  userId, type, title, body, data: Object,
  isRead, priority: 'low'|'medium'|'high'|'critical',
  createdAt
}
```

### `ChatRoom` & `Message`
```ts
ChatRoom: { participants: [userId], type, lastMessage, createdAt }
Message: { roomId, senderId, content, attachments, readBy: [userId], sentAt }
```

> **Geospatial:** All `location` fields use GeoJSON `Point` with a `2dsphere` index for `$near` queries.

---

## 5. API Conventions

### Base URL
```
Development: http://localhost:5000/api/v1
Production:  https://api.lifelink-ai.com/api/v1
```

### Standard Response Envelope
```ts
// Success
{ success: true, data: <payload>, message: string }
// Error
{ success: false, error: { code, message, details? } }
```

### Auth
- **JWT** in `Authorization: Bearer <token>` header.
- Refresh tokens stored in **httpOnly cookies**.
- All protected routes pass through `auth.middleware.ts`.

### Route Patterns (REST)
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /users/me
PATCH  /users/me
POST   /users/switch-mode

GET    /donors/nearby?lat=&lng=&bloodGroup=
PATCH  /donors/availability
GET    /donors/:id/history

POST   /blood-requests
GET    /blood-requests?status=
GET    /blood-requests/:id
PATCH  /blood-requests/:id/accept   (donor)
PATCH  /blood-requests/:id/complete (hospital)

POST   /organ-requests
GET    /organ-requests
PATCH  /organ-requests/:id/status

POST   /ambulance/request
GET    /ambulance/trips
PATCH  /ambulance/trips/:id/accept  (driver)
PATCH  /ambulance/trips/:id/location

POST   /verification/submit
GET    /verification/status
PATCH  /verification/:id/review     (admin)

GET    /chat/rooms
POST   /chat/rooms
GET    /chat/rooms/:id/messages

POST   /ai/chat
POST   /ai/parse-document

GET    /admin/dashboard
GET    /admin/analytics
... (all admin routes prefixed /admin)
```

---

## 6. Socket.IO Event Catalog

All event names live in `shared/constants/socketEvents.ts` — **never hardcode event strings**.

### Client → Server
```ts
'user:join'              { userId, role }
'user:location:update'   { lat, lng }
'donor:availability'     { isAvailable }
'chat:message:send'      { roomId, content }
'chat:typing'            { roomId }
'ambulance:location'     { tripId, coordinates }
'emergency:sos'          { location, type }
```

### Server → Client
```ts
'request:new'            // donor receives blood/organ request
'request:accepted'       // patient notified
'request:status:update'
'ambulance:assigned'
'ambulance:location:update'
'chat:message:receive'
'notification:new'
'emergency:alert'
'verification:result'
```

### Rooms (server-side)
- `user:<userId>` — personal notifications
- `role:donor` — broadcast to all donors
- `hospital:<hospitalId>` — hospital staff
- `trip:<tripId>` — patient + driver + hospital
- `chat:<roomId>` — chat participants

---

## 7. AI Smart Matching Algorithm

### Blood Donor Matching (`donor-match.ts`)
```
Inputs: bloodGroup, urgency, patientLocation, hospitalId

Steps:
1. Filter donors by compatible blood group (compatibility matrix)
2. Filter by isAvailable=true & isVerified=true
3. Filter by lastDonationDate (>= 3 months ago for blood)
4. Geo-query: $near patientLocation, maxDistance=15km (escalate if no results)
5. Score each candidate:
   score = (distanceWeight * 0.4) +
           (reliabilityScore * 0.3) +
           (rewardTier * 0.2) +
           (responseRate * 0.1)
6. Return top N (default 10), notify in waves of 3
```

### Ambulance Matching (`ambulance-match.ts`)
```
1. Find online drivers within 10km of pickup
2. Sort by ETA (Google Directions API)
3. Notify nearest 1 driver; on rejection/timeout (60s), notify next
```

---

## 8. Coding Standards

### General
- **TypeScript everywhere** (strict mode).
- **ES Modules** (`import`/`export`) on both client and server.
- **Prettier + ESLint** enforced via pre-commit (Husky + lint-staged).
- No `any` unless justified with a comment.

### Naming
- **Files:** `kebab-case.ts` (e.g. `donor-match.service.ts`)
- **Components:** `PascalCase.tsx` (e.g. `AmbulanceTracker.tsx`)
- **Variables/functions:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase` (prefix interfaces with `I` only if disambiguating)

### React/Next.js
- Server Components by default; mark `'use client'` only when needed.
- Co-locate styles via Tailwind; no separate CSS files except `globals.css`.
- One component per file; named exports preferred.
- Forms: React Hook Form + Zod, never uncontrolled refs for production forms.

### Backend
- Controllers stay thin → delegate to services.
- All async controllers wrapped in `asyncHandler`.
- Throw `ApiError` for known failures; let `error.middleware` handle.
- Validate every body/query with Zod before reaching the controller.

### Git
- **Branch naming:** `feat/`, `fix/`, `chore/`, `docs/` prefix (e.g. `feat/donor-matching`)
- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`)
- **PRs:** Require review + green CI before merge to `main`.

---

## 9. Environment Variables

### `client/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
NEXT_PUBLIC_FIREBASE_CONFIG=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

### `server/.env`
```
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GROQ_API_KEY=
OPENAI_API_KEY=
GOOGLE_MAPS_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
CLIENT_URL=http://localhost:3000
REDIS_URL=
```

---

## 10. Status State Machines

### Blood Request
```
PENDING → MATCHING → DONOR_FOUND → IN_PROGRESS → COMPLETED
                                              ↘ CANCELLED
```

### Organ Request
```
PENDING → MATCHING → DONOR_FOUND → UNDER_VERIFICATION
       → APPROVED → SURGERY_SCHEDULED → COMPLETED
                                     ↘ CANCELLED
```

### Ambulance Trip
```
REQUESTED → ASSIGNED → ON_THE_WAY → PICKED_UP → ARRIVED → COMPLETED
                                                       ↘ CANCELLED
```

Status transitions are enforced in **services**, never directly in controllers. Invalid transitions throw `ApiError`.

---

## 11. Security Checklist

- [x] Passwords hashed with `bcrypt` (cost 12)
- [x] JWT with short access tokens + httpOnly refresh tokens
- [x] Rate limiting on `/auth/*` and `/ai/*` (express-rate-limit)
- [x] CORS whitelisted to `CLIENT_URL`
- [x] Helmet.js for security headers
- [x] Input validation on every endpoint (Zod)
- [x] MongoDB injection prevented via Mongoose schemas
- [x] File upload size/type limits (5MB images, PDF only for docs)
- [x] Face verification confidence threshold ≥ 0.6 to accept
- [x] Role-based access (RBAC) middleware on every protected route
- [x] No PII in logs; medical data encrypted at rest (MongoDB encryption)
- [x] HTTPS only in production
- [x] FCM tokens rotated on logout

---

## 12. First-Version Page Priority (15–20 pages)

Focus on these for MVP:

**Auth & Onboarding (3)**
1. Register
2. Login
3. Verification Page (face + document)

**User / Patient (5)**
4. User Dashboard (overview)
5. SOS Emergency Page
6. Blood Request Page
7. Ambulance Request Page
8. Request Status Page

**Donor (3)**
9. Donor Dashboard
10. Incoming Donation Requests
11. Donation History

**Hospital (3)**
12. Hospital Dashboard
13. Blood Request Management
14. Donor Verification

**Driver (2)**
15. Driver Dashboard
16. Active Trip + Live Tracking

**Admin (2)**
17. Admin Dashboard / Overview
18. User & Donor Management

**Shared (2)**
19. Chat Page
20. Notifications Page

---

## 13. Testing Strategy

- **Unit:** Vitest (services, utils, matching algorithms)
- **Integration:** Supertest (API routes)
- **E2E:** Playwright (critical flows: SOS → donor match → completion)
- **Socket tests:** `socket.io-client` mocks
- Target ≥ 70% coverage on services & matching logic.

---

## 14. Deployment

- **Client:** Vercel — auto-deploy from `main` branch.
- **Server:** Render / Railway — Dockerfile included.
- **Database:** MongoDB Atlas (M10+ for production, geospatial enabled).
- **Cron jobs:** Node-cron in-process for MVP; migrate to BullMQ + Redis for scale.
- **Monitoring:** Sentry (errors), Better Stack (uptime), MongoDB Atlas charts.

---

## 15. How Claude Should Work in This Codebase

When asked to add/modify a feature, Claude should:

1. **Locate** — Use the folder structure above to find the right files (model → service → controller → route → frontend feature → component).
2. **Follow conventions** — Match existing naming, error handling, validation patterns.
3. **Update shared types** — If adding fields, update `shared/types/` first so client + server stay in sync.
4. **Wire sockets when real-time** — Emit events through `socket-notify.ts`; never call `io.emit` directly from controllers.
5. **Enforce status state machines** — Never let a status skip stages.
6. **Validate inputs** — Add a Zod schema in `validators/` before touching controllers.
7. **Test critical paths** — Matching, status transitions, and auth must have tests.
8. **Update docs** — If adding endpoints or socket events, update `docs/api.md` or `docs/socket-events.md`.

### Things to NEVER do
- Don't store secrets in code or commit `.env` files.
- Don't bypass the `auth` or `role` middleware "just for testing".
- Don't trust client-sent `userId` — always derive from JWT.
- Don't perform donor matching client-side (security + consistency).
- Don't emit raw user data over sockets — sanitize first.
- Don't introduce a new library without checking against the stack above.

---

## 16. Glossary

| Term | Meaning |
|---|---|
| **SOS** | One-tap emergency button that broadcasts location + alerts hospitals/contacts |
| **Match wave** | A batch of 3 donors notified at once; next wave if no response in 90s |
| **Reliability score** | Donor metric: completed donations / accepted requests |
| **Reward tier** | Bronze/Silver/Gold/Platinum based on totalDonations |
| **Critical urgency** | Bypasses distance filter; alerts all compatible donors in city |

---

**End of claude.md** — Keep this document updated as the project evolves. Treat it as the single source of truth for architecture decisions.
