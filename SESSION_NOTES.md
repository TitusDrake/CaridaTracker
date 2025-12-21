# CaridaTracker Development Session - December 20, 2025

## Session Summary
Tonight we set up the database infrastructure and multi-tenancy architecture for CaridaTracker, a troop management system for Star Wars costuming clubs (501st Legion, Rebel Legion, Mandalorian Mercs, etc.).

---

## Technology Stack Overview

### CaridaTracker (Mobile Frontend)
- **Framework:** React Native (cross-platform mobile development)
- **Development Platform:** Expo
- **Language:** TypeScript
- **UI Components:** React Native core components + custom themed components
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React hooks (useState, useContext, etc.)
- **Styling:** StyleSheet API (React Native)
- **Package Manager:** npm

**Key Dependencies:**
- `expo` - Development platform and toolchain
- `expo-router` - File-based routing system
- `react-native` - Core mobile framework
- `typescript` - Type safety and development experience

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

### Database
- **DBMS:** PostgreSQL 14+
- **Client:** node-postgres (`pg`)
- **Migration Tool:** node-pg-migrate (Gradle-like migration system)
- **Schema Management:** Versioned migrations in `migrations/` directory

---

## Development Environment Setup

### Prerequisites
1. **Node.js** - v18 or higher
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** - Comes with Node.js
   - Verify: `npm --version`

3. **PostgreSQL** - v14 or higher
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

4. **Git** - For version control
   - Download: https://git-scm.com/
   - Verify: `git --version`

5. **VS Code** (recommended IDE)
   - Download: https://code.visualstudio.com/
   - Recommended Extensions:
     - ESLint
     - TypeScript and JavaScript Language Features
     - PostgreSQL (for database management)
     - React Native Tools

6. **Expo CLI** (for mobile development)
   - Install globally: `npm install -g expo-cli`
   - Verify: `expo --version`

7. **Mobile Device or Emulator**
   - **Option 1:** Expo Go app on physical device (iOS/Android)
   - **Option 2:** Android Studio (Android emulator)
   - **Option 3:** Xcode (iOS simulator - macOS only)

### Initial Setup Steps

#### 1. Clone Repositories
```bash
# Backend API
git clone https://github.com/TitusDrake/CaridaTracker-api.git
cd CaridaTracker-api
npm install

# Frontend Mobile App
git clone https://github.com/TitusDrake/CaridaTracker.git
cd CaridaTracker
npm install
```

#### 2. Database Setup
```bash
# Create PostgreSQL database
createdb caridatracker

# OR using psql
psql -U postgres
CREATE DATABASE caridatracker;
\q
```

#### 3. Configure Environment Variables

**Backend (.env):**
```bash
cd CaridaTracker-api
cp .env.example .env
# Edit .env with your settings
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (generate a strong random string)
- `PORT` - API server port (default: 3000)
- `CORS_ORIGIN` - Frontend URL for CORS (default: http://localhost:8081)

#### 4. Run Database Migrations
```bash
cd CaridaTracker-api
npm run migrate:up
```

#### 5. Start Development Servers

**Backend API:**
```bash
cd CaridaTracker-api
npm run dev
# Server runs on http://localhost:3000
```

**Frontend Mobile App:**
```bash
cd CaridaTracker
npm start
# Opens Expo DevTools
# Scan QR code with Expo Go app or press 'a' for Android, 'i' for iOS
```

### Development Workflow

1. **Backend Development:**
   - Code changes auto-reload with nodemon
   - API available at `http://localhost:3000`
   - Test endpoints with curl, Postman, or VS Code REST Client

2. **Frontend Development:**
   - Code changes hot-reload in Expo
   - View app on physical device via Expo Go
   - Or use iOS Simulator / Android Emulator

3. **Database Changes:**
   - Create migration: `npm run migrate:create <name>`
   - Apply migrations: `npm run migrate:up`
   - Rollback: `npm run migrate:down`

### Port Configuration
- **API Server:** 3000 (configurable in .env)
- **Expo DevTools:** 19000
- **Expo Metro Bundler:** 8081
- **PostgreSQL:** 5432

---

## What is CaridaTracker?
A mobile app for tracking volunteer costuming events ("troops") for multiple Star Wars costuming organizations. Users can belong to multiple clubs and get credit for attending troops under each club membership.

**Example:** John is a member of both Garrison Carida (501st) AND Kyber Base (Rebel Legion). He attends "Star Wars Day at Cades School" as both clubs → his stats show: 501st troops: 1, Rebel Legion troops: 1

---

## Projects & Repositories

### 1. CaridaTracker (Frontend - Mobile App)
- **Location:** `/mnt/c/Users/riche/Development/CaridaTracker`
- **GitHub:** https://github.com/TitusDrake/CaridaTracker
- **Tech:** React Native + Expo
- **Branch:** `development`
- **Status:** Login screen and home dashboard UI created

### 2. CaridaTracker-api (Backend API)
- **Location:** `/mnt/c/Users/riche/Development/CAridaTracker-api`
- **GitHub:** https://github.com/TitusDrake/CaridaTracker-api
- **Tech:** Node.js + Express + TypeScript + PostgreSQL
- **Branch:** `development` (also has `master` branch)
- **Status:** Authentication working, multi-tenancy schema complete

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

---

## Database Schema (Current State)

### Tables Created

1. **users**
   - id, email, username, password_hash
   - created_at, updated_at
   - **is_super_admin** (boolean) - NEW: super admin flag

2. **organizations** - NEW
   - Parent organizations (501st Legion, Rebel Legion, Mandalorian Mercs, etc.)
   - id, name, description, created_at, updated_at

3. **clubs** - NEW
   - Local chapters within organizations
   - id, organization_id (FK), name, description, location, created_at, updated_at
   - Examples: Garrison Carida, Kyber Base, Mav Oya'la Clan

4. **club_members** - NEW
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
   - created_by (FK to users), **created_by_club_id** (FK to clubs) - NEW
   - created_at, updated_at

6. **troop_clubs** - NEW
   - Controls which clubs can see/access each troop
   - id, troop_id (FK), club_id (FK), enabled (boolean), created_at
   - UNIQUE(troop_id, club_id)
   - If a club isn't in this table for a troop, they can't see it

7. **troop_attendees** - MODIFIED
   - User attendance records
   - id, troop_id (FK), user_id (FK), **club_id (FK)** - NEW, status, notes, signed_up_at
   - **CRITICAL:** UNIQUE(troop_id, user_id, club_id)
   - Old constraint was UNIQUE(troop_id, user_id)
   - **Now users can attend same troop multiple times (once per club)**

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
- 501st Legion → Garrison Carida
- Rebel Legion → Kyber Base
- Mandalorian Mercs → Mav Oya'la Clan
- Mid Atlantic Droid and Prop Builders
- Jedi Sith Alliance

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

## Migrations Setup

### Tool: node-pg-migrate
We set up a Gradle-like migration system for database schema changes.

### Commands
```bash
# Create a new migration
npm run migrate:create <migration-name>

# Apply all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Rollback multiple migrations
npm run migrate:down 2
```

### Migrations Applied
1. **1766290092106_create-troops-tables.js**
   - Created troops and troop_attendees tables

2. **1766292578474_add-organizations-and-clubs.js**
   - Created organizations, clubs, club_members, troop_clubs tables
   - Added is_super_admin to users
   - Added created_by_club_id to troops
   - Modified troop_attendees to include club_id
   - Changed unique constraint to support multi-club attendance

### Migration Files Location
`/mnt/c/Users/riche/Development/CAridaTracker-api/migrations/`

---

## API Endpoints (Currently Working)

### Authentication
All endpoints tested and working:

```bash
# Health Check
GET /health

# Register
POST /api/auth/register
Body: { "email": "test@example.com", "username": "testuser123", "password": "TestPassword123" }

# Login
POST /api/auth/login
Body: { "email": "test@example.com", "password": "TestPassword123" }

# Get Current User (authenticated)
GET /api/auth/me
Header: Authorization: Bearer <token>
```

### Test User Created
- Email: test@example.com
- Username: testuser123
- Password: TestPassword123
- User ID: 1

---

## Frontend App (Mobile)

### Files Modified
1. **app/login.tsx** - NEW
   - Login screen with email/password inputs
   - Navigation to home after login (auth not integrated yet)

2. **app/(tabs)/index.tsx** - MODIFIED
   - Home dashboard with CaridaTracker branding
   - Statistics cards (Total Tracks: 0, This Week: 0)
   - Recent Activity section (empty state)
   - Logout button (navigates to login)

3. **app/_layout.tsx** - Minor formatting change

4. **.gitignore** - Added `.idea/` (JetBrains IDE files)

5. **.vscode/settings.json** - Added Claude Code permissions

### TODO in Frontend
- Connect login to backend API
- Implement actual authentication (JWT token storage)
- Implement logout logic (clear tokens)
- Build troop listing screens
- Build troop detail screens
- Build user stats/profile page

---

## Backend API Next Steps

### Needed: Models
Create TypeScript models for:
- Organization
- Club
- ClubMember
- TroopClub

### Needed: Controllers
- OrganizationsController (CRUD)
- ClubsController (CRUD)
- ClubMembersController (manage memberships and roles)
- TroopsController (CRUD with club visibility)
- TroopAttendeesController (manage signups per club)

### Needed: Routes
- /api/organizations
- /api/clubs
- /api/clubs/:id/members
- /api/troops (with club filtering)
- /api/troops/:id/attendees

### Needed: Middleware
- Check if user is super_admin
- Check if user is admin of specific club
- Check if user is member of club
- Check if troop is enabled for user's club(s)

---

## Environment Variables

### API .env
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

---

## Running the Projects

### Backend API
```bash
cd /mnt/c/Users/riche/Development/CAridaTracker-api

# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start

# Database migrations
npm run migrate:up
```

### Frontend App
```bash
cd /mnt/c/Users/riche/Development/CaridaTracker

# Start Expo dev server
npm start
```

---

## Important Notes

### Commits
- You (user) will handle all commits yourself
- Don't let Claude attempt commits

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

### Default Value in Migration
- `troop_attendees.club_id` has default value of `1` for now
- This is temporary for the migration to work
- You may want to remove this default later or handle data migration

---

## Key Decisions Made Tonight

1. **Multi-tenancy approach:** One shared database per region, not per club
2. **Permissions:** Simple roles (super_admin, admin, member, cadet) scoped per club
3. **Troop visibility:** Controlled via `troop_clubs` junction table with enabled flag
4. **Multi-club attendance:** Users can attend same troop for multiple clubs, gets credit for each
5. **Migration tool:** node-pg-migrate for database changes (like Gradle)
6. **Stats tracking:** Per-club stats (not just global user stats)

---

## Questions/Considerations for Tomorrow

1. **Data seeding:** Should we create a seed script to populate initial organizations and clubs?
2. **Default club:** For existing test user, which club(s) should they belong to?
3. **Super admin setup:** How do you want to promote the first user to super_admin?
4. **API authentication flow:** Connect frontend login to backend
5. **Troop creation:** UI flow for creating troops and selecting which clubs can see them

---

## Useful Commands Reference

### PostgreSQL
```bash
# Connect to database
psql -U postgres -h localhost -d caridatracker

# With password
PGPASSWORD=password psql -U postgres -h localhost -d caridatracker

# List tables
\dt

# Describe table
\d table_name

# Run SQL file
psql -U postgres -h localhost -d caridatracker -f database/schema.sql
```

### Git
```bash
# Check status
git status

# View branches
git branch -a

# Switch branch
git checkout development
```

---

## GitHub Repos
- Frontend: https://github.com/TitusDrake/CaridaTracker
- Backend: https://github.com/TitusDrake/CaridaTracker-api

---

## Your GitHub Username
**TitusDrake**

---

## Next Session Plan

### Phase 1: Frontend Authentication (PRIORITY)
1. Create "Create New User" (Register) screen in mobile app
2. Create "Forgot Password" screen/component in mobile app
3. Connect frontend login to backend API
   - Implement JWT token storage (AsyncStorage)
   - Add authentication context/state management
   - Update login screen to call backend API
4. Implement logout logic (clear tokens, redirect to login)
5. Test end-to-end authentication flow

### Phase 2: Backend Data & API
6. Create seed data migration for organizations and clubs
   - 501st Legion → Garrison Carida
   - Rebel Legion → Kyber Base
   - Mandalorian Mercs → Mav Oya'la Clan
   - Mid Atlantic Droid and Prop Builders
   - Jedi Sith Alliance
7. Promote test user to super_admin
8. Create TypeScript models (Organization, Club, ClubMember, TroopClub)
9. Build Organizations API endpoints (CRUD)
10. Build Clubs API endpoints (CRUD)
11. Build ClubMembers API endpoints (manage memberships/roles)
12. Build Troops API endpoints with club visibility filtering
13. Build TroopAttendees API endpoints (signup per club)

### Phase 3: Security & Permissions
14. Create permission middleware
    - super_admin check
    - admin check (scoped to club)
    - member check (scoped to club)
    - troop visibility check (is troop enabled for user's clubs)

### Phase 4: Mobile App Features
15. Build troop listing screen
16. Build troop detail screen
17. Build user stats/profile page (per-club stats)
18. Build club selection/switching UI

---

## Documentation Updated
- README.md in API project includes comprehensive migration guide
- Database setup instructions
- Project structure
- Migration commands and best practices
- DEVELOPMENT_SETUP.md created in CaridaTracker project
- SESSION_NOTES.md moved to CaridaTracker project (central tracking)

---

## Current Todos (Active Session)
**Updated: December 21, 2025 - 1:10 AM**
1. ⏳ Create "Create New User" (Register) screen
2. ⏳ Create "Forgot Password" screen
3. ⏳ Hook up frontend to backend authentication
4. ⏳ Implement JWT token storage
5. ⏳ Test authentication flow end-to-end

---

*Session in progress. Focus: Frontend authentication before backend API development.*
