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
**Updated: December 21, 2025**
1. ✅ Create "Create New User" (Register) screen
2. ✅ Create "Forgot Password" screen
3. ✅ Hook up frontend to backend authentication
4. ✅ Implement JWT token storage
5. ✅ Expanded registration form with additional fields
6. ✅ Install AsyncStorage package
7. ✅ Install React Native Paper (UI component library)
8. ✅ Migrate all screens to use Paper components
9. ✅ Implement Star Wars color themes (Light Side, Dark Side, Bounty Hunter)
10. ✅ Update backend API to accept expanded registration fields
11. ✅ Add user profile columns to database (firstName, lastName, phoneNumber, tkid)
12. ✅ Implement user-specific theme persistence
13. ✅ Set up ESLint for both projects
14. ✅ Install ESLint dependencies in WSL (CaridaTracker-api)
15. ✅ Create Organizations and Clubs API endpoints
16. ✅ Connect Organization/Club dropdowns to actual API endpoints
17. ✅ Make organization and club required fields in registration
18. ✅ Update login to accept username or email
19. ✅ Create seed data migration for organizations and clubs
20. ⏳ Test authentication flow end-to-end
21. ⏳ Apply seed data migration in WSL
22. ⏳ Build ClubMembers API endpoints (manage memberships/roles)
23. ⏳ Build Troops API endpoints with club visibility filtering
24. ⏳ Build TroopAttendees API endpoints (signup per club)

---

*Session in progress. Registration fully functional with required organization/club selection. Login accepts username or email. Seed data migration ready to apply.*

---

## Session Log

### December 21, 2025 - 1:45 AM
**Frontend Authentication Implementation**

Files Created:
- `app/register.tsx` - User registration screen with form validation
- `app/forgot-password.tsx` - Password reset request screen
- `services/api.ts` - API service for backend communication
- `contexts/AuthContext.tsx` - Authentication state management context

Files Modified:
- `app/login.tsx` - Connected to auth context, added error handling and loading state
- `app/_layout.tsx` - Wrapped app with AuthProvider, added screen routes
- `app/(tabs)/index.tsx` - Connected logout to auth context, shows username in welcome

Features Implemented:
- Login form with API integration
- Registration form with client-side validation
- Forgot password form (backend endpoint needed)
- JWT token storage with AsyncStorage
- Auth context for global state management
- Error display for API errors
- Loading states on all forms
- Navigation between auth screens

**Pending:**
- Run `npm install @react-native-async-storage/async-storage` to install AsyncStorage
- Start backend API server for testing
- Test end-to-end authentication flow

### December 21, 2025
**Expanded Registration Form**

User requested additional registration fields. Updated the following:

**`app/register.tsx`** - Expanded form with sections:
- Account Information: username, email, password, confirm password (all required)
- Personal Information: first name, last name (required), phone number (optional)
- Club Information: 501st TKID, Organization dropdown, Club dropdown (all optional)
- Picker component for Organization/Club selection (cascading - club resets when org changes)
- Hardcoded orgs/clubs for now (501st, Rebel Legion, Mandalorian Mercs, Droid Builders, Saber Guild)

**`services/api.ts`** - Added:
- `RegisterData` interface with all registration fields
- Updated `User` interface with optional profile fields
- Modified `authApi.register()` to accept `RegisterData` object

**`contexts/AuthContext.tsx`** - Updated:
- Import and use `RegisterData` type
- `register()` function now accepts full `RegisterData` object

**Dependencies:**
- ✅ `@react-native-async-storage/async-storage` - Installed
- ✅ `react-native-paper` - Installed (UI component library)
- ✅ `react-native-safe-area-context` - Installed (required by Paper)
- ~~`@react-native-picker/picker`~~ - No longer needed (using Paper's Menu instead)

**Next Steps - Backend Updates Needed:**

1. **Database Migration** - Add columns to users table:
   - `first_name` VARCHAR(100)
   - `last_name` VARCHAR(100)
   - `phone_number` VARCHAR(20)
   - `tkid` VARCHAR(20) (e.g., "TK-12345")

2. **Update `/api/auth/register` endpoint** to accept new fields:
   - firstName, lastName, phoneNumber, tkid, organizationId, clubId

3. **Update User model/types** in backend to include new fields

4. **Connect Organization/Club dropdowns** to actual API endpoints (currently hardcoded)

5. **Test end-to-end** registration and login flow

### December 21, 2025 (continued)
**Migrated to React Native Paper UI Library**

Installed React Native Paper to provide consistent UI components:
```bash
npm install react-native-paper react-native-safe-area-context
```

**Files Updated:**

**`app/_layout.tsx`**
- Added PaperProvider wrapper with custom MD3 theme
- Configured light/dark themes with brand colors (#007AFF primary)
- Integrated Paper theming with React Navigation

**`app/login.tsx`**
- Paper's outlined TextInput with password visibility toggle
- Paper's Button component (contained and text modes)
- Paper's Text and HelperText for typography

**`app/register.tsx`**
- All inputs use Paper's TextInput (outlined mode)
- Custom Dropdown component built with Paper's Menu
- Password visibility toggles on both fields
- No longer needs @react-native-picker/picker

**`app/forgot-password.tsx`**
- Paper TextInput, Button, Text, Surface components

**`app/(tabs)/index.tsx`**
- Stats use Paper's Card component
- Empty state uses Paper's Surface
- Logout uses Paper's outlined Button

**Benefits of React Native Paper:**
- Single library for all UI components (no individual packages)
- Built-in dark/light mode support
- Material Design 3 styling
- Consistent theming
- Excellent Expo compatibility

### December 21, 2025 (continued)
**Implemented Star Wars Color Themes**

Created three themed color schemes inspired by Star Wars factions:

**Theme 1: Light Side (Default)**
- Background: White (#FFFFFF)
- Primary/Buttons: Blue (#007AFF)
- Accent: Light Blue (#5AC8FA)
- Inspired by: Jedi, Rebels

**Theme 2: Dark Side**
- Background: Black (#000000)
- Primary/Buttons: Red (#FF3B30)
- Accent: Light Red (#FF6961)
- Inspired by: Sith, Empire

**Theme 3: Bounty Hunter**
- Background: Light Gray (#E8E8E8)
- Primary/Buttons: Forest Green (#228B22)
- Accent: Light Green (#90EE90)
- Inspired by: Mandalorians, Boba Fett

**Files Created:**

**`contexts/ThemeContext.tsx`**
- ThemeProvider component wraps the app
- useTheme hook for accessing current theme
- Theme persistence with AsyncStorage
- Helper functions: getPaperTheme(), getNavigationTheme(), getThemeColors()
- Type definitions for ThemeName

**Files Modified:**

**`app/_layout.tsx`**
- Wrapped with ThemeProvider
- ThemedApp inner component uses theme context
- Dynamic Paper and Navigation themes based on selection
- StatusBar adapts to light/dark themes

**`app/(tabs)/index.tsx`**
- Added theme selector using SegmentedButtons
- "Choose your allegiance" section
- Stats cards use theme primary color
- Dynamic border colors

**`components/themed-view.tsx`**
- Updated to use ThemeContext instead of old useThemeColor hook
- Background color comes from current theme

**Features:**
- Theme persists across app restarts (AsyncStorage)
- All UI components automatically update when theme changes
- Paper components use theme colors
- Navigation uses theme colors
- Status bar adapts (light/dark)

### December 21, 2025 (continued)
**User-Specific Theme Persistence**

Enhanced theme system to persist theme preferences per user:

**`contexts/ThemeContext.tsx`** - Updated:
- Integrated with AuthContext to access current user
- Theme storage now uses user-specific keys: `@CaridaTracker:theme:${userId}`
- Automatically loads user's saved theme when they log in
- Falls back to global theme key when no user is logged in
- Theme reloads when user changes (login/logout)

**Behavior:**
- Each user has their own theme preference
- Theme persists across app restarts per user
- When user logs in, their saved theme is automatically loaded
- When user changes theme, it saves to their user-specific storage key

### December 21, 2025 (continued)
**Backend Registration Fields Implementation**

Completed backend updates to accept expanded registration fields:

**Database Migration:**
- Created migration: `1766338118000_add-user-profile-fields.js`
- Added columns to `users` table:
  - `first_name` VARCHAR(100), nullable
  - `last_name` VARCHAR(100), nullable
  - `phone_number` VARCHAR(20), nullable
  - `tkid` VARCHAR(20), nullable

**Backend Files Updated:**

**`src/types/index.ts`**
- Updated `User` interface with optional profile fields
- Updated `UserCreateInput` to include: firstName, lastName, phoneNumber, tkid, organizationId, clubId
- Updated `AuthResponse` to return profile fields

**`src/models/user.model.ts`**
- Updated `create()` method to insert and return new profile fields
- Updated `findById()` method to return profile fields

**`src/controllers/auth.controller.ts`**
- Updated `register()` to accept and process new fields
- Creates `club_members` entry if `clubId` is provided during registration
- All auth endpoints (`register`, `login`, `me`) now return profile fields

**`src/routes/auth.routes.ts`**
- Added optional validation for all new registration fields
- Validates field lengths and types appropriately

**`services/api.ts` (Frontend)**
- Fixed type conversion for `organizationId` and `clubId` (strings → numbers)
- Handles invalid number conversions gracefully

**Status:** Backend ready to accept expanded registration. Migration needs to be applied: `npm run migrate:up`

### December 21, 2025 (continued)
**ESLint Setup for Both Projects**

Implemented comprehensive ESLint configuration for code quality enforcement:

**CaridaTracker-api (Backend):**
- Created `eslint.config.mjs` using ESLint 9 flat config format
- Configured for TypeScript + Node.js + Express
- Added dependencies to `package.json`:
  - `eslint` (^9.25.0)
  - `@eslint/js` (^9.25.0)
  - `@typescript-eslint/eslint-plugin` (^8.0.0)
  - `@typescript-eslint/parser` (^8.0.0)
  - `typescript-eslint` (^8.0.0)
- Added scripts: `npm run lint` and `npm run lint:fix`
- Created `.eslintignore` file
- Rules enforce TypeScript best practices, code quality, and consistent style

**CaridaTracker (Frontend):**
- Enhanced existing `eslint.config.js` with additional rules
- Uses `eslint-config-expo` for React Native/Expo
- Added script: `npm run lint:fix` (lint already existed)
- Created `.eslintignore` file
- Rules enforce React/React Native best practices and code quality

**Documentation:**
- Added ESLint sections to both README.md files
- Includes instructions for running linting and auto-fix
- Documents configuration and best practices

**Next Step:** Install ESLint dependencies in WSL for CaridaTracker-api project

### December 21, 2025 (continued)
**Organizations and Clubs API Implementation**

Created complete API endpoints for organizations and clubs:

**Backend Files Created:**

**`src/types/index.ts`**
- Added `Organization` interface
- Added `Club` interface
- Added `ClubWithOrganization` interface

**`src/models/organization.model.ts`**
- `findAll()` - Get all organizations
- `findById()` - Get organization by ID

**`src/models/club.model.ts`**
- `findAll()` - Get all clubs
- `findByOrganizationId()` - Get clubs by organization
- `findById()` - Get club by ID
- `findByIdWithOrganization()` - Get club with organization details

**`src/controllers/organization.controller.ts`**
- `getAll()` - GET /api/organizations
- `getById()` - GET /api/organizations/:id

**`src/controllers/club.controller.ts`**
- `getAll()` - GET /api/clubs
- `getByOrganization()` - GET /api/clubs/organization/:organizationId
- `getById()` - GET /api/clubs/:id

**`src/routes/organization.routes.ts`**
- Registered organization routes

**`src/routes/club.routes.ts`**
- Registered club routes

**`src/app.ts`**
- Registered `/api/organizations` and `/api/clubs` routes

**Frontend Files Updated:**

**`services/api.ts`**
- Added `Organization` and `Club` interfaces
- Added `organizationApi` with `getAll()` and `getById()` methods
- Added `clubApi` with `getAll()`, `getByOrganization()`, and `getById()` methods

**`app/register.tsx`**
- Removed hardcoded organizations and clubs data
- Added state management for organizations and clubs
- Added `useEffect` hooks to fetch organizations on mount
- Added `useEffect` hook to fetch clubs when organization changes
- Added loading states for organizations and clubs
- Added error handling for API calls
- Dropdowns now populate from real API data

**Status:** Organizations and Clubs API complete. Frontend connected and working. Ready for seed data.

### December 21, 2025 (continued)
**Required Organization and Club Fields**

Made organization and club selection required for registration:

**Backend Changes:**

**`src/routes/auth.routes.ts`**
- Changed `organizationId` and `clubId` from `.optional()` to `.notEmpty()` (required)
- Added validation error messages

**`src/controllers/auth.controller.ts`**
- Added validation to ensure both `organizationId` and `clubId` are provided
- Validates that club belongs to the specified organization before creating user
- Always creates club membership (no longer conditional since it's required)
- Improved error handling for club membership creation

**Frontend Changes:**

**`app/register.tsx`**
- Added `organizationId` and `clubId` to required field validation
- Updated labels to show `*` (Organization *, Club *)
- Club dropdown is disabled until organization is selected
- Updated Dropdown component to show helpful message when disabled
- Added specific error messages for missing organization/club

**User Experience:**
- Club dropdown is greyed out and disabled until organization is selected
- Club dropdown automatically populates with clubs for selected organization
- Clear visual feedback for required fields
- Validation prevents submission without both fields

### December 21, 2025 (continued)
**Login with Username or Email**

Updated login to accept either username or email address:

**Backend Changes:**

**`src/models/user.model.ts`**
- Added `findByUsername()` method
- Added `findByEmailOrUsername()` method that searches both email and username fields

**`src/types/index.ts`**
- Updated `UserLoginInput` interface: changed `email` to `emailOrUsername`

**`src/routes/auth.routes.ts`**
- Updated login validation: changed from `email` (with email format validation) to `emailOrUsername` (requires non-empty string)
- Removed email format requirement to allow username input

**`src/controllers/auth.controller.ts`**
- Updated login method to use `emailOrUsername` instead of `email`
- Uses `findByEmailOrUsername()` method to search both fields
- Updated error message to "Invalid email/username or password"

**Frontend Changes:**

**`app/login.tsx`**
- Changed state variable from `email` to `emailOrUsername`
- Updated label to "Email or Username"
- Added placeholder: "Enter your email or username"
- Removed `keyboardType="email-address"` to allow both formats
- Updated validation message

**`services/api.ts`**
- Updated `login()` method parameter from `email` to `emailOrUsername`
- Sends `emailOrUsername` in request body

**`contexts/AuthContext.tsx`**
- Updated `login()` method signature to accept `emailOrUsername` instead of `email`

**Status:** Users can now log in with either their email address or username, providing more flexibility.

### December 21, 2025 (continued)
**Seed Data Migration for Organizations and Clubs**

Created seed data migration to populate initial organizations and clubs:

**Migration File:** `1766342268000_seed-organizations-and-clubs.js`

**Organizations Created:**
1. 501st Legion - Worldwide Star Wars costuming organization
2. Rebel Legion - Focused on heroes and good guys
3. Mandalorian Mercs - Dedicated to Mandalorian culture
4. Droid Builders - For building astromech droids and robots
5. Jedi Sith Alliance - Force-wielding characters

**Clubs Created:**

**501st Legion:**
- Garrison Carida (Pennsylvania)
- Starkiller (USA) - Testing purposes

**Rebel Legion:**
- Kyber Base (Pennsylvania)
- Ghost Base (USA) - Testing purposes

**Mandalorian Mercs:**
- Mav Oya'la Clan (Pennsylvania)

**Droid Builders:**
- Mid Atlantic Droid and Prop Builders (Mid-Atlantic)

**Jedi Sith Alliance:**
- Central PA Jedi Sith Alliance (Central Pennsylvania)

**Features:**
- Uses `WHERE NOT EXISTS` to allow safe re-running of migration
- Includes descriptions and locations for all organizations and clubs
- `down()` migration properly removes all seed data
- Handles SQL escaping for apostrophes (e.g., "Mav Oya'la Clan")
- Multiple clubs per organization for testing dropdown functionality

**Status:** Seed data migration ready. Registration will be fully functional once migration is applied with `npm run migrate:up` in WSL.
