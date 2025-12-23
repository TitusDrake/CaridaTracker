# CaridaTracker Development Session - December 23, 2025

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

**Key Dependencies:**
- `expo` - Development platform and toolchain
- `expo-router` - File-based routing system
- `react-native` - Core mobile framework
- `react-native-paper` - UI component library
- `@react-native-async-storage/async-storage` - Local storage
- `typescript` - Type safety

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
# Add port forwarding rule
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.28.199.187

# Allow through firewall (if needed)
netsh advfirewall firewall add rule name="CaridaTracker API" dir=in action=allow protocol=TCP localport=3000

# Verify port forwarding is set up
netsh interface portproxy show all
```

**Note:** The WSL IP (172.28.199.187) may change on restart. Check with `wsl hostname -I`.

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
- ✅ **Bottom tab navigation (Home, Troops, My Clubs, Profile)**
- ✅ **Search screen with troops/people toggle**
- ✅ **Troop Details screen (placeholder)**
- ✅ **Club Details screen (placeholder)**
- ✅ **Search icon in header (left side, on tab screens only)**
- ✅ **Theme selector moved to Profile screen**

### Backend
- ✅ JWT authentication
- ✅ User registration with profile fields
- ✅ Login with username or email
- ✅ Organizations and Clubs API endpoints
- ✅ Club membership creation on registration
- ✅ Seed data migration for organizations and clubs
- ✅ ESLint configuration
- ✅ CORS configuration (allows all origins in dev)

---

## Current Session Work (December 23, 2025)

### Completed This Session

1. **Created Walking Skeleton UI**
   - Added 4 bottom tabs: Home, Troops, My Clubs, Profile
   - Created placeholder screens for each tab
   - Updated `app/(tabs)/_layout.tsx` with new tab configuration
   - Added new icon mappings in `components/ui/icon-symbol.tsx`

2. **New Screen Files Created:**
   - `app/(tabs)/troops.tsx` - Troops list (no FAB, troop creation is admin-only)
   - `app/(tabs)/my-clubs.tsx` - User's club memberships
   - `app/(tabs)/profile.tsx` - Profile info + theme selector + logout
   - `app/search.tsx` - Search for troops or people
   - `app/troop/[id].tsx` - Troop details screen
   - `app/club/[id].tsx` - Club details screen

3. **UI Improvements:**
   - Moved theme selector from Home to Profile screen
   - Cleaned up Home screen (removed logout, simplified layout)
   - Added search icon to header (left side) on tab screens
   - Search icon navigates to dedicated search screen

4. **VS Code Configuration:**
   - Created `.vscode/tasks.json` with tasks for starting frontend/backend
   - Created `.vscode/launch.json` for debugging
   - Tasks: "Start Frontend (Expo)", "Start Backend (API)", "Start All"

5. **Networking Setup for Android Emulator:**
   - Updated `services/api.ts` to use `10.0.2.2` for Android emulator
   - Documented port forwarding setup for WSL → Windows → Android

### Known Issues (Carry to Next Session)

**Android Emulator Network Connectivity:**
- The Android emulator cannot reach the API running in WSL
- Port forwarding was set up: `netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.28.199.187`
- Firewall rule may also be needed
- Still getting "Network request failed" errors when app tries to fetch organizations
- Need to troubleshoot further next session

### Files Modified This Session
- `app/(tabs)/_layout.tsx` - Updated tabs, added search button in header
- `app/(tabs)/index.tsx` - Cleaned up, removed theme selector
- `components/ui/icon-symbol.tsx` - Added new icon mappings
- `services/api.ts` - Updated to use 10.0.2.2 for Android

### Files Created This Session
- `app/(tabs)/troops.tsx`
- `app/(tabs)/my-clubs.tsx`
- `app/(tabs)/profile.tsx`
- `app/search.tsx`
- `app/troop/[id].tsx`
- `app/club/[id].tsx`
- `.vscode/tasks.json`
- `.vscode/launch.json`

---

## Next Session Priorities

### IMMEDIATE: Fix Android Emulator Connectivity
1. Verify port forwarding is still active after restart
2. Check Windows Firewall settings for port 3000
3. Test API is accessible from Windows: `curl http://localhost:3000/health`
4. Consider alternative: Run API on Windows instead of WSL for dev

### Walking Skeleton Completion
1. Wire up navigation between screens (e.g., tap troop → go to details)
2. Add mock data to screens for visual testing

### Security & Validation (Original Priority)
1. Input Validation & Security
2. Password Security
3. Username/Email Uniqueness
4. Field-Specific Validation
5. Email Verification
6. Forgot Password Functionality
7. Spam Prevention

---

**Session Date:** December 23, 2025
**Session Status:** Completed (with networking issue outstanding)
