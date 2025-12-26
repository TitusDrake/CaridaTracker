# CaridaTracker Development Session - [DATE]

> **⚠️ CRITICAL: Copy this section to every new session file**
>
> This template contains essential context that helps AI assistants quickly understand the project structure, architecture, and current state. Always include this section at the top of each new session file.

---

## Project Overview

**What is CaridaTracker?**
A mobile app for tracking volunteer costuming events ("troops") for multiple Star Wars costuming organizations. Users can belong to multiple clubs and get credit for attending troops under each club membership.

**Example:** John is a member of both Garrison Carida (501st) AND Kyber Base (Rebel Legion). He attends "Star Wars Day at Cades School" as both clubs → his stats show: 501st troops: 1, Rebel Legion troops: 1

---

## Technology Stack

### CaridaTracker (Mobile Frontend)
- **Framework:** React Native (cross-platform mobile development)
- **Development Platform:** Expo (SDK 54)
- **Language:** TypeScript
- **UI Components:** React Native Paper + custom themed components
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React Context (AuthContext, ThemeContext, TroopsContext, ClubsContext)
- **Styling:** StyleSheet API (React Native)
- **Package Manager:** npm
- **Testing:** Jest + React Native Testing Library

**Key Dependencies:**
- `expo` - Development platform and toolchain
- `expo-router` - File-based routing system
- `react-native` - Core mobile framework
- `react-native-paper` - UI component library
- `@react-native-async-storage/async-storage` - Local storage
- `typescript` - Type safety
- `jest`, `jest-expo` - Testing framework
- `@testing-library/react-native` - Component testing

### CaridaTracker-api (Backend API)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v5.2.1)
- **Language:** TypeScript
- **Database:** PostgreSQL (v14+)
- **ORM/Query Builder:** Raw SQL with `pg` (node-postgres)
- **Database Migrations:** node-pg-migrate
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Validation:** express-validator
- **Security:** Helmet.js, CORS, express-rate-limit
- **Package Manager:** npm
- **Testing:** Jest + Supertest

**Key Dependencies:**
- `express` - Web framework
- `pg` - PostgreSQL client
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `express-validator` - Input validation
- `helmet` - Security headers
- `cors` - Cross-origin resource sharing
- `express-rate-limit` - API rate limiting
- `node-pg-migrate` - Database migrations
- `typescript` - Type safety
- `ts-node` - TypeScript execution for development
- `nodemon` - Auto-restart on file changes
- `jest`, `supertest` - Testing framework

---

## Project Locations & Repositories

### 1. CaridaTracker (Frontend - Mobile App)
- **Location (Windows):** `C:\Users\riche\Development\CaridaTracker`
- **Location (WSL):** `/mnt/c/Users/riche/Development/CaridaTracker`
- **GitHub:** https://github.com/TitusDrake/CaridaTracker
- **Tech:** React Native + Expo
- **Branch:** `development`

### 2. CaridaTracker-api (Backend API)
- **Location (Windows):** `C:\Users\riche\Development\CaridaTracker-api`
- **Location (WSL):** `/mnt/c/Users/riche/Development/CaridaTracker-api`
- **GitHub:** https://github.com/TitusDrake/CaridaTracker-api
- **Tech:** Node.js + Express + TypeScript + PostgreSQL
- **Branch:** `development` (also has `master` branch)

**GitHub Username:** TitusDrake

---

## Database Setup

### PostgreSQL Database
- **Database Name:** `caridatracker`
- **User:** `postgres`
- **Password:** `password` (from .env - change in production)
- **Port:** `5432`
- **Host:** `localhost`

### Migration Commands
```bash
# Create a new migration
npm run migrate:create <migration-name>

# Apply all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down
```

**Migration Files Location:** `CaridaTracker-api/migrations/`

---

## Database Schema (Current State)

### Tables

1. **users** - id, email, username, password_hash, first_name, last_name, phone_number, tkid, is_super_admin, created_at, updated_at

2. **organizations** - Parent orgs (501st Legion, Rebel Legion, Mandalorian Mercs, etc.)

3. **clubs** - Local chapters (Garrison Carida, Kyber Base, Mav Oya'la Clan, etc.)

4. **club_members** - Users belong to clubs with roles (super_admin, admin, member, cadet)

5. **troops** - Events (name, date, venue, address, times, amenities, description, etc.)

6. **troop_clubs** - Controls which clubs can see/access each troop

7. **troop_attendees** - User attendance records (UNIQUE per troop/user/club combo)

---

## Current API Endpoints

### Authentication
- `GET /health` - Health check
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email or username
- `GET /api/auth/me` - Get current user (authenticated)

### Organizations & Clubs
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/organization/:organizationId` - Get clubs by organization
- `GET /api/clubs/:id` - Get club by ID
- `GET /api/clubs/:id/members` - Get club members (authenticated)

### Troops
- `GET /api/troops` - List troops (filtered by user's clubs)
- `GET /api/troops/:id` - Get troop details
- `POST /api/troops` - Create troop (admin only)
- `PUT /api/troops/:id` - Update troop (admin only)
- `DELETE /api/troops/:id` - Delete troop (admin only)

### Attendance
- `POST /api/troops/:id/attend` - Sign up for troop
- `DELETE /api/troops/:id/attend` - Cancel attendance
- `GET /api/troops/:id/attendees` - List attendees

### Users
- `GET /api/users/me/clubs` - Get user's club memberships
- `GET /api/users/me/stats` - Get user's global stats
- `GET /api/users/me/clubs/:clubId/stats` - Get per-club stats

### Search
- `GET /api/search/troops?q=...` - Search troops
- `GET /api/search/users?q=...` - Search members

---

## Current Features Implemented

### Frontend
- ✅ Login/Registration screens with organization/club selection
- ✅ Star Wars themes (Light Side, Dark Side, Bounty Hunter)
- ✅ Authentication context and JWT token storage
- ✅ Bottom tab navigation (Home, Troops, My Clubs, Profile)
- ✅ TroopsContext and ClubsContext for state management
- ✅ Home dashboard with real stats and upcoming troops
- ✅ Troops list with upcoming/past separation
- ✅ Troop details with attend/cancel functionality
- ✅ My Clubs with membership list and stats
- ✅ Club details with member list
- ✅ Search screen with debounced troops/people search
- ✅ Pull-to-refresh on all main screens
- ✅ Jest testing infrastructure (11 tests passing)

### Backend
- ✅ JWT authentication
- ✅ Complete CRUD for Troops
- ✅ Attendance endpoints
- ✅ User stats and clubs endpoints
- ✅ Search endpoints
- ✅ Club members endpoint
- ✅ Seed data for organizations, clubs, and 5 test troops
- ✅ Jest + Supertest testing (106 tests passing)

---

## Test Data

**5 Test Troops Seeded:**
1. Harrisburg Hospital Visit (Dec 18, 2025 - past)
2. Star Wars Day at Hersheypark (Jan 8, 2026 - upcoming)
3. Reading Phillies Game (Jan 24, 2026 - upcoming)
4. Lancaster Comic Con (Feb 8, 2026 - upcoming)
5. York Revolution Game (Feb 23, 2026 - upcoming)

All enabled for Garrison Carida (club 1), 3 also enabled for Kyber Base (club 2).

---

## Development Environment

### Starting Development Servers

**Backend API (run in WSL):**
```bash
cd /mnt/c/Users/riche/Development/CaridaTracker-api
npm run dev
# Server runs on http://localhost:3000
```

**Frontend Mobile App (run in Windows PowerShell):**
```bash
cd C:\Users\riche\Development\CaridaTracker
npm start
# Opens Expo DevTools - Press 'a' for Android emulator
```

### Running Tests
```bash
# Backend tests
cd /mnt/c/Users/riche/Development/CaridaTracker-api
npm test

# Frontend tests
cd /mnt/c/Users/riche/Development/CaridaTracker
npm test
```

---

## Current Session Work

> **Session-specific work goes here**

---

## Next Session Priorities

### Phase 6: Security & Validation
- [ ] Input Validation & Security
- [ ] Password Security
- [ ] Username/Email Uniqueness
- [ ] Email Verification
- [ ] Forgot Password Functionality

### UI Fine-tuning
- [ ] Any UI/UX improvements requested
- [ ] Error handling improvements
- [ ] Loading state improvements

---

**Session Date:** [DATE]
**Session Status:** [In Progress / Completed]
