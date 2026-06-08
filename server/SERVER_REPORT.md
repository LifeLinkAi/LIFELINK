# LifeLink Server Report

## 1. Overview

The LifeLink server is a Node.js + Express backend written in TypeScript. It is designed to serve the API for the LifeLink application and currently implements authentication, resource management for donors, hospitals, campaigns, and requests, plus a health endpoint.

The server uses MongoDB via Mongoose for persistence, and it has a structured route/controller/model organization.

## 2. Project Structure

`server/`
- `package.json` — server dependencies and scripts
- `tsconfig.json` — TypeScript config
- `src/`
  - `app.ts` — main Express application setup
  - `server.ts` — entry point, database connect, graceful shutdown
  - `config/`
    - `db.ts` — MongoDB connection logic
  - `controllers/`
    - `auth.controller.ts`
    - `campaign.controller.ts`
    - `donor.controller.ts`
    - `hospital.controller.ts`
    - `request.controller.ts`
  - `middlewares/`
    - `auth.middleware.ts`
    - `error.middleware.ts`
  - `models/`
    - `User.ts`
    - `Campaign.ts`
    - `DonorProfile.ts`
    - `HospitalProfile.ts`
    - `Request.ts`
  - `routes/`
    - `auth.routes.ts`
    - `campaign.routes.ts`
    - `donor.routes.ts`
    - `hospital.routes.ts`
    - `health.routes.ts`
    - `request.routes.ts`
    - `index.ts`
  - `services/` — placeholder directories for `ai`, `geo`, `matching`, `notifications`, `verification`
  - `sockets/` — currently stubbed directory with `handlers/`
  - `utils/` — logger utilities
  - `validators/` — directory exists but currently empty or placeholder

## 3. Dependencies

### Runtime
- `express` — HTTP framework
- `mongoose` — MongoDB ODM
- `socket.io` — socket support dependency installed but not wired yet
- `jsonwebtoken` — JWT creation and verification
- `bcrypt` — password hashing
- `cors` — CORS handling
- `helmet` — security header middleware
- `express-rate-limit` — rate limiting
- `cookie-parser` — cookie parsing for auth tokens
- `compression` — gzip response compression
- `dotenv` — environment variable loading
- `morgan` — HTTP request logging
- `winston` — logging transport
- `cloudinary`, `openai`, `firebase-admin`, `ioredis`, `node-cron`, `nodemailer` — installed but not yet in active server flow

### Dev
- `typescript`, `ts-node-dev`, `vitest`, `supertest`, `eslint`, `prettier`, `husky`, `lint-staged`

## 4. Entry Points

### `src/app.ts`
- Configures Express middleware
- Enables security headers with `helmet`
- Sets CORS allowed origins to `http://localhost:3000` and the production Vercel URL
- Enables JSON and URL-encoded body parsing with 10MB limits
- Uses `cookie-parser` to read cookies
- Adds request logging to Winston through `morgan`
- Applies a rate limiter on `/api` routes
- Mounts the API router under `/api`
- Adds a fallback 404 error via `ApiError`
- Uses global `errorHandler`

### `src/server.ts`
- Loads environment variables using `dotenv`
- Connects to MongoDB via `connectDB()`
- Starts the HTTP server on `process.env.PORT || 5000`
- Implements graceful shutdown on `SIGTERM` / `SIGINT`
- Logs unhandled promise rejections and uncaught exceptions

## 5. Database Connection

### `src/config/db.ts`
- Connects to `process.env.MONGO_URI` or default `mongodb://localhost:27017/lifelink`
- Logs connection host on success
- Terminates process on connection failure
- Listens for Mongoose `disconnected` and `error` events

## 6. Middleware

### Authentication: `src/middlewares/auth.middleware.ts`
- `authenticate` extracts JWT from either:
  - `req.cookies.token`
  - `Authorization: Bearer <token>` header
- Verifies JWT using `process.env.JWT_SECRET`
- Attaches `req.user = { id, email, role }`
- Returns `401` if missing/invalid

### Authorization: `authorize(...)`
- Verifies that `req.user.role` is allowed
- Returns `401` if unauthenticated
- Returns `403` if the role is not authorized

### Error Handling: `src/middlewares/error.middleware.ts`
- Custom `ApiError` class with `statusCode` and optional `errors`
- `errorHandler` returns standardized JSON:
  - `success: false`
  - `message`
  - `errors` when present
  - `stack` only in development
- Logs error details via Winston

## 7. API Routes

Mounted under `/api` via `src/routes/index.ts`.

### `/api/health`
- Method: `GET`
- Returns server health, uptime, database status, timestamp, and memory usage

### `/api/auth`
- `POST /register` — create a user account
- `POST /login` — authenticate user and issue JWT cookie
- `GET /me` — fetch current authenticated user
- `POST /logout` — clear auth cookie

### `/api/campaigns`
- `GET /` — list campaigns (authenticated)
- `POST /` — create campaign (Admin)
- `PUT /:id` — update campaign (Admin)
- `DELETE /:id` — delete campaign (Admin)

### `/api/donors`
- `GET /` — list donors (authenticated)
- `POST /` — create donor (Admin)
- `POST /bulk` — bulk create donors (Admin)
- `PUT /:id` — update donor (Admin)
- `DELETE /:id` — delete donor (Admin)

### `/api/hospitals`
- `GET /` — list hospitals (authenticated)
- `POST /` — create hospital (Admin)
- `POST /bulk` — bulk create hospitals (Admin)
- `PUT /:id` — update hospital (Admin)
- `DELETE /:id` — delete hospital (Admin)

### `/api/requests`
- `GET /` — list requests with optional `type` filter (authenticated)
- `POST /` — create request (Admin)
- `PUT /:id` — update request (Admin)
- `DELETE /:id` — delete request (Admin)

## 8. Controller Behavior

### Authentication Controller
- `register` validates required fields, checks duplicate email, hashes password, creates User, signs JWT, stores cookie
- `login` validates credentials, compares password, signs JWT, stores cookie
- `me` loads current user by JWT identity and returns non-sensitive profile
- `logout` clears cookie

### Resource Controllers
- `donor.controller.ts` and `hospital.controller.ts` both maintain a `User` record plus a separate profile record:
  - `DonorProfile` for donor-specific metadata
  - `HospitalProfile` for hospital-specific metadata
- Both controllers support bulk creation with default fallback passwords
- `request.controller.ts` manages `Request` documents with fields like `type`, `bloodGroup`, `urgency`, `status`, `registeredDate`, `matchPercentage`, `distance`, `facilityType`, and notes
- `campaign.controller.ts` manages campaign lifecycle data and supports admin creation/edit/delete

## 9. Data Models

### `User`
Fields:
- `name`, `email`, `password`, `role`
- `role` enum: `Admin`, `Patient`, `Donor`, `Hospital`, `Driver`
- timestamps enabled

### `DonorProfile`
Fields:
- `userId`, `location`, `bloodType`, `tier`, `status`, `phone`, `lastDonation`, `totalDonated`, `details`, `avatar`
- `tier` enum: `Gold`, `Silver`, `Platinum`, `Bronze`
- `status` enum: `Verified`, `Pending`, `Available`, `Blocked`

### `HospitalProfile`
Fields:
- `userId`, `licenseId`, `city`, `location`, `logo`, `specialties`, `status`, `patientCount`, `rating`, `bloodHealthStatus`
- `status` enum: `Active`, `Pending`, `Suspended`, `Verified`
- `bloodHealthStatus` enum: `Optimal`, `Stable`, `Critical`

### `Request`
Fields:
- `patientName`, `facility`, `age`, `gender`, `organType`, `bloodGroup`, `units`, `urgency`, `status`, `matchPercentage`, `registeredDate`, `distance`, `facilityType`, `time`, `notes`, `type`
- `type` enum: `Organ`, `Blood`

### `Campaign`
Fields:
- `title`, `type`, `status`, `hospital`, `startDate`, `endDate`, `bloodGroups`, `donorsRegistered`, `donorsTarget`, `donationsCollected`, `engagement`, `imageUrl`, `description`
- `type` enum: `EMERGENCY DRIVE`, `ROUTINE DRIVE`, `AWARENESS`
- `status` enum: `ACTIVE`, `UPCOMING`, `DRAFT`, `ENDED`

## 10. Logging

- Uses `morgan` to capture request logs
- Request logs are forwarded to Winston via `logger.http()` in `app.ts`
- Error logs are written inside `errorHandler`

## 11. Security and auth

- JWT-based authentication
- Cookie-based token support plus Bearer header fallback
- `helmet`, `cors`, `compression` enabled
- Rate limiting applied to `/api` requests (100 requests per 15 minutes)
- Role-based authorization enforced on administrative routes

## 12. Current Implementation Status

### Implemented
- Basic user auth (register/login/logout/me)
- Admin-managed donor and hospital CRUD
- Campaign management
- Request management for blood/organ demand
- Health endpoint
- Global error handling
- DB connection and graceful shutdown

### Incomplete / placeholders
- `services/` subdirectories exist but contain no active implementation
- `sockets/` folder is stubbed and not wired into `server.ts`
- No dedicated `Request` state machine or matching algorithm yet
- No explicit refresh token flow or multi-role user switching logic
- No full ambulance/driver endpoint implementation in current server code

## 13. Recommended next server milestones

1. Implement socket server integration and event handlers
2. Add actual matching services under `services/matching`
3. Add validation layer under `validators/` and integrate with controllers
4. Implement driver and ambulance flows
5. Add tests for auth controllers and resource endpoints
6. Wire cloud/AI services only when needed, since many related packages are installed but not used

## 14. File locations of key server areas

- API entry point: `server/src/app.ts`
- HTTP server: `server/src/server.ts`
- Auth routes: `server/src/routes/auth.routes.ts`
- Resource routes: `server/src/routes/{donor,hospital,request,campaign}.routes.ts`
- Models: `server/src/models/{User,DonorProfile,HospitalProfile,Request,Campaign}.ts`
- Middleware: `server/src/middlewares/{auth,error.middleware.ts}`

---

This report describes the current server-side implementation inside `server/` as of the repository snapshot. It can be used as a reference for server architecture, API coverage, and next development steps.
