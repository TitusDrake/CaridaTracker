# CaridaTracker Development Session - [DATE]

> **CRITICAL: Copy this section to every new session file**
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

5. **troops** - Events with capacity limits
   - Core: name, date, venue, address, times, amenities, description
   - **Capacity:** max_troopers, max_squires, admin_approval_required, waitlist_enabled

6. **troop_clubs** - Controls which clubs can see/access each troop

7. **troop_attendees** - User attendance records
   - Core: troop_id, user_id, club_id, status, notes, signed_up_at
   - **Costume:** costume_id, costume_name, backup_costume_id, backup_costume_name
   - **Status:** attendance_status ('confirmed'|'tentative'), signup_status ('confirmed'|'waitlisted'|'pending_approval'|'rejected')
   - **Type:** attendee_type ('trooper'|'squire')
   - **Waitlist:** waitlist_position, approved_by, approved_at
   - **Shifts:** shift_id (FK to troop_shifts)

8. **troop_shifts** - Time slots for multi-shift events
   - id, troop_id, name, start_time, end_time
   - max_attendees, max_troopers, max_squires

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
- `POST /api/troops/:id/attend` - Sign up for troop (with costume, shift, attendee_type)
- `DELETE /api/troops/:id/attend` - Cancel attendance
- `GET /api/troops/:id/attendees` - List attendees (returns { attendees, counts })
- `GET /api/troops/:id/capacity` - Get capacity info for troop/shift
- `GET /api/troops/:id/pending-approvals` - Get pending signups (admin)
- `POST /api/troops/:id/approve/:attendeeId` - Approve signup (admin)
- `POST /api/troops/:id/reject/:attendeeId` - Reject signup (admin)

### Shifts
- `GET /api/troops/:id/shifts` - Get shifts for troop
- `POST /api/troops/:id/shifts` - Create shift (admin)
- `PUT /api/troops/:id/shifts/:shiftId` - Update shift (admin)
- `DELETE /api/troops/:id/shifts/:shiftId` - Delete shift (admin)

### Costumes
- `GET /api/costumes/my-costumes` - Get current user's 501st costumes (via 501st API)
- `GET /api/costumes/501st/:legionId` - Get costumes by Legion ID

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
- Login/Registration screens with organization/club selection
- Star Wars themes (Light Side, Dark Side, Bounty Hunter)
- Authentication context and JWT token storage
- Bottom tab navigation (Home, Troops, My Clubs, Profile)
- TroopsContext and ClubsContext for state management
- Home dashboard with real stats and upcoming troops
- Troops list with upcoming/past separation
- Troop details with attend/cancel functionality
- My Clubs with membership list and stats
- Club details with member list
- Search screen with debounced troops/people search
- Pull-to-refresh on all main screens
- **Enhanced signup wizard with:**
  - Attendee type selection (trooper vs squire/handler)
  - 501st API costume selection (for 501st orgs)
  - Free-text costume input (for non-501st orgs)
  - Backup costume selection
  - Attendance status (confirmed/tentative)
  - Shift selection (when shifts configured)
  - Capacity display with waitlist indicators
  - Admin approval notices
- Calendar integration (Google, Outlook, Yahoo)
- Jest testing infrastructure (11 tests passing)

### Backend
- JWT authentication
- Complete CRUD for Troops
- Attendance with capacity limits and waitlist
- Trooper vs squire attendee types
- Waitlist queue with automatic promotion
- Admin approval workflow for signups
- Costume and backup costume fields
- Shift management
- 501st Legion costume API proxy
- User stats and clubs endpoints
- Search endpoints
- Club members endpoint
- Seed data for organizations, clubs, and test troops
- Jest + Supertest testing (106 tests passing)

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

### Session Date: 2025-12-27

#### Completed: Phase 1 - Admin UI for Troop Management
- [x] Updated backend troop model and controller to handle capacity fields (max_troopers, max_squires, admin_approval_required, waitlist_enabled)
- [x] Created `/app/troop/create.tsx` - Full troop create/edit form with:
  - Event details (name, date, venue, address, city/state/zip)
  - Time settings (arrival, start, end)
  - Description and amenities
  - Venue options (prop weapons, secure changing area, share with sister groups)
  - Capacity limits (max troopers, max squires)
  - Waitlist toggle
  - Admin approval toggle
  - **Shift management UI** (add/edit/delete shifts with capacity per shift)
- [x] Created `/app/troop/edit.tsx` - Wrapper for edit mode
- [x] Added FAB button to troops list for admins to create new troops
- [x] Added Edit button to troop detail page for admins
- [x] All lint checks passing

#### Completed: Phase 2 - Attendee List Display
- [x] Split attendee list into two separate cards: "Costumed Troopers" and "Squires / Handlers"
- [x] Each list has its own waitlist section
- [x] Show waitlist position for waitlisted users
- [x] Pending approval section with approve/reject buttons (admin only)
- [x] Tentative attendance status indicator
- [x] Costume display for troopers
- [x] All lint checks passing

#### Completed: Signup Restrictions
- [x] Cadets can only sign up as Squire (Costumed Trooper option disabled for cadets)
- [x] Members or higher can choose either Trooper or Squire
- [x] Users can sign up for multiple shifts within a troop
- [x] Users can only sign up once per shift (prevents both Trooper AND Squire signup for same shift)
- [x] Backend enforces single signup per user per shift with clear error message
- [x] All backend tests passing (106 tests)

---

## Next Session Priorities

### 1. Waitlist Notifications (Phase 3)
- [ ] Notify users when promoted from waitlist
- [ ] Email/push notification system

### 4. Profile Screen
- [ ] Add TKID field for 501st members
- [ ] Show club memberships
- [ ] Edit profile functionality

### Phase 6: Security & Validation (Lower Priority)
- [ ] Input Validation & Security
- [ ] Password Security
- [ ] Username/Email Uniqueness
- [ ] Email Verification
- [ ] Forgot Password Functionality

---

**Session Date:** [DATE]
**Session Status:** [In Progress / Completed]
