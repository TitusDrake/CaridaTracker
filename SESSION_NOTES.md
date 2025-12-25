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
- **Development Platform:** Expo
- **Language:** TypeScript
- **UI Components:** React Native Paper + custom themed components
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React hooks (useState, useContext, etc.)
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

### Connection Info for VS Code
```
Connection name: CaridaTracker
Server Address: localhost
Port: 5432
Database: caridatracker
Username: postgres
Password: password
SSL: Disabled
```

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

1. **users**
   - id, email, username, password_hash
   - first_name, last_name, phone_number, tkid (nullable)
   - is_super_admin (boolean)
   - created_at, updated_at

2. **organizations**
   - Parent organizations (501st Legion, Rebel Legion, Mandalorian Mercs, etc.)
   - id, name, description, created_at, updated_at

3. **clubs**
   - Local chapters within organizations
   - id, organization_id (FK), name, description, location, created_at, updated_at
   - Examples: Garrison Carida, Kyber Base, Mav Oya'la Clan

4. **club_members**
   - Users belong to clubs with roles
   - id, club_id (FK), user_id (FK), role, joined_at
   - **Roles:** super_admin, admin, member, cadet
   - UNIQUE(club_id, user_id) - user can only have one role per club
   - Users can belong to MULTIPLE clubs

5. **troops**
   - Event details (name, date, venue, address, times, amenities, etc.)
   - id, event_name, event_date, venue_name, address, city, state, zip_code
   - start_time, arrival_time, end_time
   - prop_weapons_allowed, share_with_sister_groups, secure_changing_area
   - changing_area_description, amenities, description
   - signup_link, policies_link
   - created_by (FK to users), created_by_club_id (FK to clubs)
   - created_at, updated_at

6. **troop_clubs**
   - Controls which clubs can see/access each troop
   - id, troop_id (FK), club_id (FK), enabled (boolean), created_at
   - UNIQUE(troop_id, club_id)
   - If a club isn't in this table for a troop, they can't see it

7. **troop_attendees**
   - User attendance records
   - id, troop_id (FK), user_id (FK), club_id (FK), status, notes, signed_up_at
   - **CRITICAL:** UNIQUE(troop_id, user_id, club_id)
   - Users can attend same troop multiple times (once per club)

8. **pgmigrations**
   - Tracks applied migrations (managed by node-pg-migrate)

---

## Multi-Tenancy Architecture

### How It Works
- **One shared database** for all clubs in a deployment
- **One deployment per geographic region** (e.g., PA, USA instance)
- You manage only YOUR clubs/instance
- Other regions deploy their own separate instances

### Organizations in PA Instance
- 501st Legion → Garrison Carida, Starkiller
- Rebel Legion → Kyber Base, Ghost Base
- Mandalorian Mercs → Mav Oya'la Clan
- Droid Builders → Mid Atlantic Droid and Prop Builders
- Jedi Sith Alliance → Central PA Jedi Sith Alliance

### Permission Structure
- **super_admin** - Can manage all clubs in deployment
- **admin** - Can manage specific club(s) they're assigned to
- **member** - Regular club member
- **cadet** - Limited access member

### Troop Visibility Example
1. Admin for Garrison Carida creates "Troop A"
2. Admin enables it for: Garrison Carida only (adds entry to `troop_clubs`)
3. Kyber Base members cannot see this troop in search
4. If enabled for both clubs, members from both can see and attend

### Multi-Club Attendance Example
- User "Jane" is member of Garrison Carida AND Kyber Base
- "Star Wars Day" troop is enabled for both clubs
- Jane signs up to attend as Garrison Carida member → troop_attendees entry (troop_id=1, user_id=5, club_id=1)
- Jane also signs up to attend as Kyber Base member → troop_attendees entry (troop_id=1, user_id=5, club_id=2)
- Jane's stats page shows: Garrison Carida troops: 1, Kyber Base troops: 1

---

## Development Environment

### Port Configuration
- **API Server:** 3000 (configurable in .env)
- **Expo DevTools:** 19000
- **Expo Metro Bundler:** 8081
- **PostgreSQL:** 5432

### Starting Development Servers

**Option 1: VS Code Tasks (Recommended)**
- Press `Ctrl+Shift+P` → "Tasks: Run Task"
- Select "Start All (Frontend + Backend)" to run both
- Or run individually: "Start Frontend (Expo)" / "Start Backend (API)"
- Use "Lint → Test → Start" tasks to run quality checks before starting

**Option 2: Manual**

**Backend API (run in WSL):**
```bash
cd ~/Development/CaridaTracker-api
npm run dev
# Server runs on http://localhost:3000
```

**Frontend Mobile App (run in Windows PowerShell):**
```bash
cd C:\Users\riche\Development\CaridaTracker
npm start
# Opens Expo DevTools
# Press 'a' for Android emulator
```

### WSL to Android Emulator Networking

The Android emulator cannot directly reach WSL2's network. Port forwarding is required:

**Setup (run in Windows PowerShell as Administrator):**
```powershell
# Get current WSL IP
wsl hostname -I

# Add port forwarding rule (replace IP if changed)
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL_IP>

# Allow through firewall (if needed)
netsh advfirewall firewall add rule name="CaridaTracker API" dir=in action=allow protocol=TCP localport=3000

# Verify port forwarding is set up
netsh interface portproxy show all

# Remove port forwarding (if needed)
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0
```

**Note:** The WSL IP may change on restart. Check with `wsl hostname -I` and update the port forwarding rule.

### Environment Variables (Backend .env)
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=caridatracker
DB_USER=postgres
DB_PASSWORD=password
DATABASE_URL=postgres://postgres:password@localhost:5432/caridatracker

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:8081
```

### Frontend API Configuration
- **Development (Android Emulator):** `http://10.0.2.2:3000/api`
- **Development (iOS/Web):** `http://localhost:3000/api`
- **Production:** Configure in `services/api.ts`

---

## Key Decisions & Architecture

1. **Multi-tenancy approach:** One shared database per region, not per club
2. **Permissions:** Simple roles (super_admin, admin, member, cadet) scoped per club
3. **Troop visibility:** Controlled via `troop_clubs` junction table with enabled flag
4. **Multi-club attendance:** Users can attend same troop for multiple clubs, gets credit for each
5. **Migration tool:** node-pg-migrate for database changes (like Gradle)
6. **Stats tracking:** Per-club stats (not just global user stats)
7. **Testing:** Jest for both frontend and backend, with comprehensive test coverage

---

## Important Notes

### Commits
- User handles all commits - AI should not attempt commits

### Database Migration Strategy
- NEVER modify existing migrations that have been applied
- Always create NEW migrations for schema changes
- Test migrations in dev before production
- Keep migrations small and focused

### Multi-Instance Deployment
- Each geographic region deploys their own instance
- Separate databases per region
- You manage PA instance only
- Other clubs can adopt and deploy their own

---

## Current API Endpoints

### Authentication
- `GET /health` - Health check
- `POST /api/auth/register` - Register new user (requires organizationId, clubId)
- `POST /api/auth/login` - Login with email or username
- `GET /api/auth/me` - Get current user (authenticated)

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID

### Clubs
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/organization/:organizationId` - Get clubs by organization
- `GET /api/clubs/:id` - Get club by ID
- `GET /api/clubs/:id/members` - Get club members (authenticated, must be member)

### Troops
- `GET /api/troops` - List troops (filtered by user's clubs)
- `GET /api/troops/:id` - Get troop details
- `POST /api/troops` - Create troop (admin only)
- `PUT /api/troops/:id` - Update troop (admin only)
- `DELETE /api/troops/:id` - Delete troop (admin only)

### Attendance
- `POST /api/troops/:id/attend` - Sign up for troop (requires club_id in body)
- `DELETE /api/troops/:id/attend` - Cancel attendance (requires club_id in body)
- `GET /api/troops/:id/attendees` - List all attendees (admin/member access)

---

## Current Features Implemented

### Frontend
- ✅ Login screen (username or email)
- ✅ Registration screen with organization/club selection
- ✅ Forgot password screen (UI only, backend pending)
- ✅ Home dashboard with stats cards
- ✅ Star Wars themes (Light Side, Dark Side, Bounty Hunter)
- ✅ User-specific theme persistence
- ✅ Authentication context and JWT token storage
- ✅ Authentication guard (redirects based on auth state)
- ✅ "Fill Test Data" button for registration (dev mode only)
- ✅ Bottom tab navigation (Home, Troops, My Clubs, Profile)
- ✅ Search screen with troops/people toggle
- ✅ Troop Details screen (placeholder)
- ✅ Club Details screen (placeholder)
- ✅ Search icon in header (left side, on tab screens only)
- ✅ Theme selector on Profile screen
- ✅ Jest testing infrastructure setup
- ✅ Initial test files (components, contexts, services)
- ✅ Frontend API services (troopApi, userApi, searchApi, clubApi.getMembers)

### Backend
- ✅ JWT authentication
- ✅ User registration with profile fields
- ✅ Login with username or email
- ✅ Organizations and Clubs API endpoints
- ✅ Club membership creation on registration
- ✅ Seed data migration for organizations and clubs
- ✅ ESLint configuration
- ✅ CORS configuration (allows all origins in dev)
- ✅ Troops CRUD endpoints
- ✅ Attendance endpoints (sign up, cancel, list attendees)
- ✅ Jest + Supertest testing infrastructure
- ✅ Complete test coverage (6 test suites, 44 tests passing)
- ✅ VS Code tasks and launch configurations

---

## Current Session Work

> **Session-specific work goes here**
>
> Document what was accomplished in this session, files changed, issues encountered, etc.

---

## Next Session Priorities

### Phase 1: Unit Testing

#### Backend API Testing (Jest + Supertest) ✅ SETUP COMPLETE
Testing infrastructure is in place. Continue adding tests for each feature.

**Setup Completed:**
- [x] Install Jest, ts-jest, @types/jest, supertest, @types/supertest
- [x] Create jest.config.js
- [x] Create test setup file (src/__tests__/setup.ts)
- [x] Create test helpers (src/__tests__/helpers.ts)
- [x] Add test scripts to package.json

**Test Files to Create/Expand:**
- [x] src/__tests__/health.test.ts - Health check endpoint ✅
- [x] src/__tests__/troops.test.ts - Troops CRUD (19 tests passing) ✅
- [x] src/__tests__/attendance.test.ts - Attendance endpoints (fixed TypeScript errors) ✅
- [x] src/__tests__/auth.test.ts - Authentication (login, register, me) ✅
- [x] src/__tests__/clubs.test.ts - Club endpoints ✅
- [x] src/__tests__/organizations.test.ts - Organization endpoints ✅
- [ ] src/__tests__/users.test.ts - User endpoints (stats, clubs) - Not implemented yet
- [ ] src/__tests__/search.test.ts - Search endpoints - Not implemented yet

**Commands:**
```bash
cd /mnt/c/Users/riche/Development/CaridaTracker-api
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

---

#### Frontend Testing (React Native Testing Library)
Testing framework options for React Native with Expo.

**Recommended Setup:**
- [ ] Install @testing-library/react-native
- [ ] Install jest-expo (Expo's Jest preset)
- [ ] Install @testing-library/jest-native (custom matchers)
- [ ] Configure Jest for Expo in package.json or jest.config.js
- [ ] Create test setup file

**Installation Commands:**
```bash
cd /mnt/c/Users/riche/Development/CaridaTracker
npm install --save-dev jest @testing-library/react-native jest-expo @testing-library/jest-native
```

**Jest Configuration (in package.json):**
```json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ],
    "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"]
  }
}
```

**Test Files to Create:**
- [ ] __tests__/components/ThemedView.test.tsx
- [ ] __tests__/components/ThemedText.test.tsx
- [ ] __tests__/screens/LoginScreen.test.tsx
- [ ] __tests__/screens/RegisterScreen.test.tsx
- [ ] __tests__/screens/HomeScreen.test.tsx
- [ ] __tests__/contexts/AuthContext.test.tsx
- [ ] __tests__/contexts/ThemeContext.test.tsx
- [ ] __tests__/services/api.test.ts
- [ ] __tests__/hooks/useColorScheme.test.ts

**Test Coverage Goals:**
- [ ] Authentication flows (login, logout, token refresh)
- [ ] Form validation (registration, login forms)
- [ ] Navigation flows (auth guard, tab navigation)
- [ ] API service functions (mocking fetch)
- [ ] Theme switching functionality
- [ ] Error handling UI

---

**Session Date:** 2025-12-23 (Updated: 2025-12-24)
**Session Status:** In Progress

### Phase 2: API Endpoints (Backend) ✅ COMPLETED
Build the missing API endpoints before wiring up frontend screens.

- [x] **Troops CRUD** ✅ COMPLETED
  - [x] GET /api/troops - List troops (filtered by user's clubs)
  - [x] GET /api/troops/:id - Get troop details
  - [x] POST /api/troops - Create troop (admin only)
  - [x] PUT /api/troops/:id - Update troop (admin only)
  - [x] DELETE /api/troops/:id - Delete troop (admin only)

- [x] **Attendance** ✅ COMPLETED
  - [x] POST /api/troops/:id/attend - Sign up for troop
  - [x] DELETE /api/troops/:id/attend - Cancel attendance
  - [x] GET /api/troops/:id/attendees - List attendees (admin/member)

- [x] **User Clubs/Memberships** ✅ COMPLETED
  - [x] GET /api/users/me/clubs - Get current user's club memberships
  - [x] GET /api/clubs/:id/members - Get club members (authenticated, must be member)

- [x] **Stats** ✅ COMPLETED
  - [x] GET /api/users/me/stats - Global stats for current user
  - [x] GET /api/users/me/clubs/:clubId/stats - Per-club stats

- [x] **Search** ✅ COMPLETED
  - [x] GET /api/search/troops?q=... - Search troops
  - [x] GET /api/search/users?q=... - Search members

---

### Phase 3: Frontend Services ✅ COMPLETED
Add API service layer to call the new endpoints.

- [x] Add `troopsApi` to services/api.ts ✅ COMPLETED
  - [x] getAll() - List troops
  - [x] getById(id) - Get troop details
  - [x] create(data) - Create troop
  - [x] update(id, data) - Update troop
  - [x] delete(id) - Delete troop
  - [x] attend(id, clubId) - Sign up for troop
  - [x] cancelAttendance(id, clubId) - Cancel attendance
  - [x] getAttendees(id) - Get troop attendees

- [x] Add `userApi` to services/api.ts ✅ COMPLETED
  - [x] getMyClubs() - Get user's club memberships
  - [x] getMyStats() - Get user's global stats
  - [x] getClubStats(clubId) - Get per-club stats

- [x] Add `searchApi` to services/api.ts ✅ COMPLETED
  - [x] searchTroops(query) - Search troops
  - [x] searchUsers(query) - Search members

- [x] Add `clubApi.getMembers()` to services/api.ts ✅ COMPLETED
  - [x] getMembers(clubId) - Get club members

**New TypeScript Interfaces Added:**
- `Troop`, `TroopCreateData`, `TroopUpdateData`
- `ClubMembership`, `ClubMember`
- `UserGlobalStats`, `UserClubStats`
- `UserSearchResult`

---

### Phase 4: State Management
Add contexts for managing app state.

- [ ] **TroopsContext**
  - [ ] Troops list cache
  - [ ] Current troop details
  - [ ] User's attendance records
  - [ ] Loading/error states

- [ ] **ClubsContext** (or expand AuthContext)
  - [ ] User's club memberships
  - [ ] Current active club context
  - [ ] Per-club stats

---

### Phase 5: Wire Up Screens
Connect the UI to real data.

- [ ] **Troops Tab**
  - [ ] Fetch and display troops list
  - [ ] Navigate to troop details on tap
  - [ ] Pull-to-refresh

- [ ] **Troop Details Screen**
  - [ ] Fetch troop by ID
  - [ ] Display all troop info
  - [ ] Sign up / cancel attendance buttons

- [ ] **My Clubs Tab**
  - [ ] Fetch user's club memberships
  - [ ] Display per-club stats
  - [ ] Navigate to club details on tap

- [ ] **Club Details Screen**
  - [ ] Fetch club by ID
  - [ ] Display club info and stats

- [ ] **Search Screen**
  - [ ] Wire up search API calls
  - [ ] Display search results
  - [ ] Navigate to troop/user details on tap

- [ ] **Home Dashboard**
  - [ ] Fetch and display real stats
  - [ ] Show upcoming troops
  - [ ] Show recent activity

---

### Phase 6: Security & Validation (Deferred)
Address after core features work.

- [ ] Input Validation & Security
- [ ] Password Security
- [ ] Username/Email Uniqueness
- [ ] Field-Specific Validation
- [ ] Email Verification
- [ ] Forgot Password Functionality
- [ ] Spam Prevention

---



---

**Session Date:** [DATE]
**Session Status:** [In Progress / Completed]
