# LifeLink AI — Project Context (claude.md)

> **Purpose of this file:** This is the master context document for the LifeLink AI codebase. It tells Claude (and any developer/agent) everything needed to navigate, contribute to, and extend the project consistently. Read this fully before generating or modifying code.

---

## 1. Project Overview

**LifeLink AI** is an AI-powered emergency healthcare and donation ecosystem that connects **patients, donors, hospitals, and admins** in real time. The platform reduces emergency response time using smart donor matching, AI verification, and instant communication.

> ⚠️ **Ambulance/Driver module has been fully removed from this project.** Any references to ambulance, driver, trip, or vehicle functionality are out of scope and must not be added back.

### Core Value Propositions
- **Speed** — Match donors in seconds, not hours.
- **Safety** — AI face + document verification prevents fake donors.
- **Coordination** — A single ecosystem for patients, donors, hospitals, and admins.
- **Intelligence** — AI chatbot, smart matching, OCR parsing, emergency prediction.

### Primary User Roles
| Role | Description |
|---|---|
| **Admin** | Verifies users/hospitals, monitors emergencies, runs analytics |
| **Patient** | Requests blood and organs; uses AI assistant |
| **Donor** | Receives requests, accepts/rejects, shares location |
| **Hospital** | Manages requests, verifies donors, manages blood stock |

> Note: A single user can switch between **Patient** and **Donor** modes (Role Switch Page).

---

## 2. Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 18+**
- **Tailwind CSS**
- **Redux Toolkit** + **RTK Query**
- **Socket.IO Client**
- **React Hook Form** + **Zod**
- **Framer Motion**
- **Lucide React**

### Backend
- **Node.js 20+**
- **Express.js**
- **Socket.IO**
- **JWT** + **bcrypt**
- **Multer** → Cloudinary
- **Zod** (server-side validation)

### Database
- **MongoDB** + **Mongoose**
- **Redis** (optional — caching, Socket.IO pub/sub scaling)

### AI / ML
- **face-api.js** + **TensorFlow.js** — face verification
- **Tesseract.js** or cloud OCR — document parsing

### Maps & Location
- **Google Maps JavaScript API** — map rendering
- **Geolocation API** (browser) — donor location

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

```
lifelink-ai/
├── client/
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── models/                  # face-api.js models
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── verify/
│   │   │   ├── (user)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── profile/
│   │   │   │   ├── notifications/
│   │   │   │   ├── chat/
│   │   │   │   ├── role-switch/
│   │   │   │   ├── patient/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── sos/
│   │   │   │   │   ├── request-blood/
│   │   │   │   │   ├── request-organ/
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
│   │   │   │   └── hospital/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── blood-requests/
│   │   │   │       ├── blood-stock/
│   │   │   │       ├── donation-monitor/
│   │   │   │       ├── emergencies/
│   │   │   │       ├── organ-requests/
│   │   │   │       └── donor-verification/
│   │   │   ├── (admin)/
│   │   │   │   └── admin/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── users/
│   │   │   │       ├── donors/
│   │   │   │       ├── hospitals/
│   │   │   │       ├── verifications/
│   │   │   │       ├── emergencies/
│   │   │   │       ├── blood-requests/
│   │   │   │       ├── organ-requests/
│   │   │   │       ├── reports/
│   │   │   │       ├── analytics/
│   │   │   │       ├── settings/
│   │   │   │       └── notifications/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── globals.css
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── forms/
│   │   │   ├── layouts/
│   │   │   │   ├── HospitalSidebar.tsx
│   │   │   │   ├── HospitalTopBar.tsx
│   │   │   │   ├── PatientSidebar.tsx
│   │   │   │   └── PatientTopBar.tsx
│   │   │   ├── navigation/
│   │   │   ├── maps/
│   │   │   ├── chat/
│   │   │   ├── notifications/
│   │   │   ├── verification/
│   │   │   ├── ai/
│   │   │   └── shared/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── donor/
│   │   │   ├── patient/
│   │   │   ├── hospital/
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
│   │   │   ├── socket.ts
│   │   │   ├── axios.ts
│   │   │   ├── firebase.ts
│   │   │   ├── faceapi.ts
│   │   │   └── utils.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── apiSlice.ts
│   │   │   └── hooks.ts
│   │   └── middleware.ts
│   ├── .env.local
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   ├── env.ts
│   │   │   ├── cloudinary.ts
│   │   │   ├── firebase-admin.ts
│   │   │   └── socket.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Donor.ts
│   │   │   ├── Patient.ts
│   │   │   ├── Hospital.ts
│   │   │   ├── BloodRequest.ts
│   │   │   ├── OrganRequest.ts
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
│   │   │   ├── blood.controller.ts
│   │   │   ├── organ.controller.ts
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
│   │   │   ├── blood.routes.ts
│   │   │   ├── organ.routes.ts
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
│   │   │   │   └── donor-match.ts
│   │   │   ├── notifications/
│   │   │   │   ├── fcm.service.ts
│   │   │   │   └── socket-notify.ts
│   │   │   ├── geo/
│   │   │   │   └── distance.ts
│   │   │   ├── verification/
│   │   │   │   ├── face.service.ts
│   │   │   │   └── document.service.ts
│   │   │   └── upload.service.ts
│   │   ├── sockets/
│   │   │   ├── index.ts
│   │   │   ├── handlers/
│   │   │   │   ├── chat.handler.ts
│   │   │   │   ├── emergency.handler.ts
│   │   │   │   └── notification.handler.ts
│   │   │   └── events.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── logger.ts
│   │   │   ├── asyncHandler.ts
│   │   │   ├── ApiError.ts
│   │   │   ├── ApiResponse.ts
│   │   │   └── validators.ts
│   │   ├── validators/
│   │   │   ├── auth.schema.ts
│   │   │   ├── donor.schema.ts
│   │   │   ├── blood.schema.ts
│   │   │   └── organ.schema.ts
│   │   ├── jobs/
│   │   │   ├── cleanup.job.ts
│   │   │   └── reminder.job.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
├── shared/
│   ├── types/
│   │   ├── user.ts
│   │   ├── donor.ts
│   │   ├── request.ts
│   │   └── api.ts
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── statuses.ts
│   │   ├── socketEvents.ts
│   │   └── bloodGroups.ts
│   └── package.json
│
├── docs/
├── .gitignore
├── README.md
├── claude.md
└── package.json
```

---

## 4. Database Schema (Mongoose Models)

### `User`
```ts
{
  _id, name, email, phone, password,
  role: 'user' | 'hospital' | 'admin',
  activeMode: 'patient' | 'donor',
  avatar, isVerified, isActive,
  fcmToken,
  location: { type: 'Point', coordinates: [lng, lat] },
  createdAt, updatedAt
}
```

### `Donor`
```ts
{
  userId,
  bloodGroup, organsWillingToDonate: [String],
  isAvailable, lastDonationDate,
  totalDonations, rewardPoints, badges: [String],
  medicalHistory, verificationStatus
}
```

### `Patient`
```ts
{
  userId,
  bloodGroup, medicalConditions: [String],
  emergencyContacts: [{ name, phone, relation }],
  medicalHistory: [{ date, diagnosis, notes }]
}
```

### `Hospital`
```ts
{
  userId,
  hospitalName, licenseNumber, address,
  location: { type: 'Point', coordinates },
  bloodStock: { 'A+': Number, ... },
  isVerified, specialties: [String],
  contact: { phone, email, emergencyHotline }
}
```

### `BloodRequest`
```ts
{
  patientId, bloodGroup, unitsNeeded,
  urgency: 'low'|'medium'|'critical',
  hospitalId, location,
  status: 'PENDING'|'MATCHING'|'DONOR_FOUND'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED',
  matchedDonors: [{ donorId, status, respondedAt }],
  acceptedDonorId, completedAt, createdAt
}
```

### `OrganRequest`
```ts
{
  patientId, organType, bloodGroup, urgency,
  hospitalId,
  status: 'PENDING'|'MATCHING'|'DONOR_FOUND'|'UNDER_VERIFICATION'|'APPROVED'|'SURGERY_SCHEDULED'|'COMPLETED'|'CANCELLED',
  matchedDonorId, surgeryDate, medicalReports: [String]
}
```

### `Verification`
```ts
{
  userId, type: 'identity'|'medical'|'hospital',
  documents: [{ url, type }],
  selfieUrl, faceMatchScore,
  status: 'PENDING'|'APPROVED'|'REJECTED',
  reviewedBy, reviewNotes, submittedAt
}
```

### `Notification`, `ChatRoom`, `Message`
Same as original — no changes needed.

---

## 5. API Conventions

### Base URL
```
Development: http://localhost:5000/api/v1
Production:  https://api.lifelink-ai.com/api/v1
```

### Standard Response Envelope
```ts
{ success: true, data: <payload>, message: string }
{ success: false, error: { code, message, details? } }
```

### Route Patterns
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
PATCH  /blood-requests/:id/accept
PATCH  /blood-requests/:id/complete

POST   /organ-requests
GET    /organ-requests
PATCH  /organ-requests/:id/status

POST   /verification/submit
GET    /verification/status
PATCH  /verification/:id/review

GET    /chat/rooms
POST   /chat/rooms
GET    /chat/rooms/:id/messages

POST   /ai/chat
POST   /ai/parse-document

GET    /admin/dashboard
GET    /admin/analytics
```

---

## 6. Socket.IO Event Catalog

All event names live in `shared/constants/socketEvents.ts`.

### Client → Server
```ts
'user:join'              { userId, role }
'user:location:update'   { lat, lng }
'donor:availability'     { isAvailable }
'chat:message:send'      { roomId, content }
'chat:typing'            { roomId }
'emergency:sos'          { location, type }
```

### Server → Client
```ts
'request:new'
'request:accepted'
'request:status:update'
'chat:message:receive'
'notification:new'
'emergency:alert'
'verification:result'
```

### Rooms
- `user:<userId>` — personal notifications
- `role:donor` — broadcast to all donors
- `hospital:<hospitalId>` — hospital staff
- `chat:<roomId>` — chat participants

---

## 7. AI Smart Matching Algorithm

### Blood Donor Matching (`donor-match.ts`)
```
Inputs: bloodGroup, urgency, patientLocation, hospitalId

Steps:
1. Filter by compatible blood group (compatibility matrix)
2. Filter by isAvailable=true & isVerified=true
3. Filter by lastDonationDate >= 3 months ago
4. Geo-query: $near patientLocation, maxDistance=15km
5. Score each candidate:
   score = (distanceWeight * 0.4) +
           (reliabilityScore * 0.3) +
           (rewardTier * 0.2) +
           (responseRate * 0.1)
6. Return top 10, notify in waves of 3
```

---

## 8. Current Frontend Build State

> This section documents what is actually built and committed as of the last update.

### What's Complete
**Hospital module** — `client/src/app/(hospital)/hospital/` — 7 pages, all HTTP 200, zero TS errors:
- `dashboard/page.tsx` — stat cards, blood bank bars, activity timeline *(remove fleet map section)*
- `blood-requests/page.tsx`
- `blood-stock/page.tsx`
- `donation-monitor/page.tsx`
- `emergencies/page.tsx`
- `organ-requests/page.tsx`
- `donor-verification/page.tsx`

**Patient module** — `client/src/app/(user)/patient/` — 7 pages complete, 1 pending cleanup:
- `dashboard/page.tsx` *(remove ambulance quick action)*
- `sos/page.tsx` *(remove ambulance emergency type + 108 quick dial)*
- `request-blood/page.tsx`
- `request-organ/page.tsx`
- `request-status/page.tsx` *(remove AMB-312 sample data)*
- `nearby-hospitals/page.tsx` *(remove Request Ambulance buttons)*
- `medical-history/page.tsx`

**Foundation files** — all built:
- `shared/constants/` — roles, statuses *(remove AMBULANCE_TRIP_STATUS)*, bloodGroups, socketEvents *(remove ambulance/driver events)*
- `client/src/lib/` — axios, socket, utils
- `client/src/store/` — index, apiSlice, hooks
- `client/src/features/` — auth, hospital, notifications slices
- `client/src/hooks/` — useAuth, useSocket, useGeolocation, useNotifications
- `client/src/app/providers.tsx`, `layout.tsx`
- `client/src/components/layouts/` — HospitalSidebar, HospitalTopBar, PatientSidebar, PatientTopBar

### What's NOT Built Yet
- Backend (everything)
- Admin module frontend
- Donor module frontend
- Auth pages (only placeholder)
- Real API connections (all data is hardcoded static)
- Socket.IO real-time integration

### Pending Cleanup (ambulance removal)
These files need edits before next PR:
1. `PatientSidebar.tsx` — remove Request Ambulance nav item
2. `patient/sos/page.tsx` — remove ambulance type + 108 dial
3. `patient/dashboard/page.tsx` — remove ambulance quick action
4. `patient/request-status/page.tsx` — remove AMB-312
5. `patient/nearby-hospitals/page.tsx` — remove ambulance buttons
6. `shared/constants/statuses.ts` — remove AMBULANCE_TRIP_STATUS
7. `shared/constants/socketEvents.ts` — remove ambulance/driver events
8. `hospital/dashboard/page.tsx` — remove fleet map section

---

## 9. Design System

```
Hospital sidebar:  bg-[#1a2e0a], active: bg-[#7AB648]
Patient sidebar:   bg-[#1a0a0a], active: bg-red-700
Content bg:        #F5F2E8 (bg-cream)
Cards:             bg-white, border border-[#E8E4D8], rounded-xl
Primary text:      #1a2e0a
Secondary:         #6B7A5A
Muted:             #8A9A7A
Primary button:    bg-[#1a2e0a]
Alert button:      bg-red-600
Tailwind tokens:   brand-900/800/600/400/50, cream (portal)
                   brand-green, brand-olive, font-syne (landing page)
Page pattern:      header → 4 stat cards → filters → expandable rows
URL structure:     /hospital/* and /patient/* (route groups invisible)
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

Status transitions enforced in services only, never controllers.

---

## 11. Coding Standards

- TypeScript strict mode everywhere
- ES Modules only
- No `any` without justification comment
- Files: `kebab-case.ts`, Components: `PascalCase.tsx`, Variables: `camelCase`, Constants: `SCREAMING_SNAKE_CASE`
- Server Components by default; `'use client'` only when needed
- Controllers thin → delegate to services
- All async controllers wrapped in `asyncHandler`
- Throw `ApiError` for known failures
- Validate every endpoint with Zod before controller

---

## 12. Security Checklist

- Passwords hashed with bcrypt (cost 12)
- JWT short access tokens + httpOnly refresh tokens
- Rate limiting on `/auth/*` and `/ai/*`
- CORS whitelisted to `CLIENT_URL`
- Helmet.js for security headers
- Input validation on every endpoint (Zod)
- File upload size/type limits (5MB images, PDF only for docs)
- Face verification confidence threshold ≥ 0.6
- RBAC middleware on every protected route
- No PII in logs
- HTTPS only in production
- Never trust client-sent `userId` — derive from JWT always

---

## 13. Environment Variables

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

## 14. Git Workflow

- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- Commits: Conventional Commits (`feat:`, `fix:`, `refactor:`)
- PRs require review + green CI before merge to `main`
- CRLF warnings on Windows are harmless — ignore
- Always run `npm run type-check -w client` before pushing
- Merge conflict rules: `globals.css` → Accept Both Changes; `tailwind.config.ts` → manual merge keeping both portal and landing page tokens; `page.tsx` (root) → keep landing page version

---

## 15. MVP Page Priority (updated — no ambulance)

**Auth (3)**
1. Register
2. Login
3. Verification (face + document)

**Patient (4)**
4. Patient Dashboard
5. SOS Emergency
6. Blood Request
7. Organ Request

**Donor (3)**
8. Donor Dashboard
9. Incoming Donation Requests
10. Donation History

**Hospital (4)**
11. Hospital Dashboard
12. Blood Request Management
13. Organ Request Management
14. Donor Verification

**Admin (2)**
15. Admin Dashboard
16. User & Donor Management

**Shared (2)**
17. Chat
18. Notifications

---

## 16. Things to NEVER Do

- Don't add ambulance, driver, or trip functionality — this module is permanently removed
- Don't store secrets in code or commit `.env` files
- Don't bypass `auth` or `role` middleware for testing
- Don't trust client-sent `userId` — always derive from JWT
- Don't perform donor matching client-side
- Don't emit raw user data over sockets — sanitize first
- Don't introduce libraries outside the approved stack

---

## 17. Glossary

| Term | Meaning |
|---|---|
| **SOS** | One-tap emergency that broadcasts location and alerts hospitals/contacts |
| **Match wave** | Batch of 3 donors notified at once; next wave if no response in 90s |
| **Reliability score** | Donor metric: completed / accepted donations |
| **Reward tier** | Bronze/Silver/Gold/Platinum based on totalDonations |
| **Critical urgency** | Bypasses distance filter; alerts all compatible donors in city |

---

**End of claude.md** — Keep this updated as the project evolves.
