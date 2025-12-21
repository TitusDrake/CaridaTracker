# CaridaTracker Development Environment Setup

Complete guide to setting up the CaridaTracker development environment for both frontend (mobile app) and backend (API).

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

## Prerequisites

### Required Software

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
     - Download from App Store (iOS) or Google Play Store (Android)
   - **Option 2:** Android Studio (Android emulator)
     - Download: https://developer.android.com/studio
   - **Option 3:** Xcode (iOS simulator - macOS only)
     - Download from Mac App Store

---

## Initial Setup

### 1. Clone Repositories

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

### 2. Database Setup

#### Create PostgreSQL Database

**Option 1: Using createdb command**
```bash
createdb caridatracker
```

**Option 2: Using psql**
```bash
psql -U postgres
CREATE DATABASE caridatracker;
\q
```

#### Verify Database Connection

```bash
psql -U postgres -h localhost -d caridatracker
# You should see the psql prompt
# Type \q to exit
```

### 3. Configure Environment Variables

#### Backend (.env)

```bash
cd CaridaTracker-api
cp .env.example .env
# Edit .env with your settings
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgres://username:password@localhost:5432/caridatracker`
- `JWT_SECRET` - Secret key for JWT tokens (generate a strong random string)
- `PORT` - API server port (default: 3000)
- `CORS_ORIGIN` - Frontend URL for CORS (default: http://localhost:8081)

**Example .env:**
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=caridatracker
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgres://postgres:your_password@localhost:5432/caridatracker

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:8081
```

### 4. Run Database Migrations

```bash
cd CaridaTracker-api
npm run migrate:up
```

This will create all necessary database tables:
- `users` - User accounts
- `organizations` - Parent organizations (501st, Rebel Legion, etc.)
- `clubs` - Local chapters
- `club_members` - User memberships in clubs
- `troops` - Events/troops
- `troop_clubs` - Troop visibility per club
- `troop_attendees` - User attendance records

### 5. Start Development Servers

#### Backend API

```bash
cd CaridaTracker-api
npm run dev
# Server runs on http://localhost:3000
# You should see: "Server running on port 3000"
```

#### Frontend Mobile App

```bash
cd CaridaTracker
npm start
# Opens Expo DevTools in browser
# Scan QR code with Expo Go app or press 'a' for Android, 'i' for iOS
```

---

## Development Workflow

### Backend Development

1. **Code Changes**
   - Files automatically reload with nodemon
   - Changes are reflected immediately

2. **API Testing**
   - API available at `http://localhost:3000`
   - Test endpoints with:
     - curl
     - Postman
     - VS Code REST Client extension
     - Thunder Client (VS Code extension)

3. **Database Changes**
   - Create migration: `npm run migrate:create <name>`
   - Apply migrations: `npm run migrate:up`
   - Rollback: `npm run migrate:down`

### Frontend Development

1. **Code Changes**
   - Hot reload enabled by default
   - Changes appear instantly in Expo Go app

2. **Testing on Device**
   - Physical device via Expo Go app (scan QR code)
   - iOS Simulator (macOS only, press 'i')
   - Android Emulator (press 'a')

3. **Debugging**
   - Press 'j' to open debugger
   - Shake device to open developer menu
   - Remote debugging available through Chrome DevTools

### Database Changes

1. **Create a New Migration**
   ```bash
   cd CaridaTracker-api
   npm run migrate:create add-new-feature
   ```

2. **Edit Migration File**
   - Located in `migrations/` directory
   - Implement `exports.up` (apply changes)
   - Implement `exports.down` (revert changes)

3. **Apply Migration**
   ```bash
   npm run migrate:up
   ```

4. **Rollback if Needed**
   ```bash
   npm run migrate:down
   ```

---

## Port Configuration

- **API Server:** 3000 (configurable in .env)
- **Expo DevTools:** 19000
- **Expo Metro Bundler:** 8081
- **PostgreSQL:** 5432

---

## Useful Commands

### Backend (API)

```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Database migrations
npm run migrate:create <name>  # Create new migration
npm run migrate:up             # Apply migrations
npm run migrate:down           # Rollback migration
```

### Frontend (Mobile App)

```bash
# Start Expo dev server
npm start

# Start with cleared cache
npm start --clear

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test
```

### Database

```bash
# Connect to database
psql -U postgres -h localhost -d caridatracker

# List all tables
\dt

# Describe table structure
\d table_name

# Run SQL file
psql -U postgres -h localhost -d caridatracker -f database/schema.sql

# Exit psql
\q
```

---

## Common Issues & Solutions

### PostgreSQL Connection Issues

**Problem:** Can't connect to PostgreSQL database

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # On macOS/Linux
   sudo service postgresql status

   # On Windows (PowerShell as admin)
   Get-Service postgresql*
   ```

2. Check DATABASE_URL in .env matches your PostgreSQL credentials

3. Ensure database exists:
   ```bash
   psql -U postgres -l
   ```

### Expo Go App Issues

**Problem:** Can't connect to Metro bundler

**Solutions:**
1. Ensure your phone and computer are on the same WiFi network
2. Try using tunnel mode: `npm start --tunnel`
3. Check firewall settings allow connections on port 8081

### Port Already in Use

**Problem:** Port 3000 or 8081 already in use

**Solutions:**
1. Change PORT in API's .env file
2. Kill existing process using the port:
   ```bash
   # Find process
   lsof -i :3000

   # Kill process
   kill -9 <PID>
   ```

### Migration Errors

**Problem:** Migration fails to apply

**Solutions:**
1. Check PostgreSQL connection
2. Rollback failed migration: `npm run migrate:down`
3. Fix migration file
4. Re-apply: `npm run migrate:up`

---

## Next Steps

After completing setup:

1. **Test API Endpoints**
   - Try registering a user: `POST /api/auth/register`
   - Test login: `POST /api/auth/login`

2. **Explore Mobile App**
   - View login screen
   - Navigate to home dashboard

3. **Review Documentation**
   - API README: `CaridaTracker-api/README.md`
   - Session notes: `SESSION_NOTES_2025-12-20.md`

4. **Start Development**
   - Build new features
   - Create database migrations as needed
   - Test changes on mobile device

---

## Resources

- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **Expo Docs:** https://docs.expo.dev/
- **Express.js Docs:** https://expressjs.com/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **node-pg-migrate:** https://salsita.github.io/node-pg-migrate/

---

## Support

For issues or questions:
- Check session notes: `SESSION_NOTES_2025-12-20.md`
- Review API README: `CaridaTracker-api/README.md`
- GitHub Issues: https://github.com/TitusDrake/CaridaTracker/issues
