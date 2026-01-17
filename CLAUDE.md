# CaridaTracker

Mobile app for tracking volunteer costuming events ("troops") for Star Wars costuming organizations. Users can belong to multiple clubs and get credit for attending troops under each club membership.

## Quick Start

```bash
# Backend API (WSL)
cd /mnt/c/Users/riche/Development/CaridaTracker-api
npm run dev  # http://localhost:3000

# Frontend (Windows PowerShell)
cd C:\Users\riche\Development\CaridaTracker
npm start  # Press 'a' for Android
```

## Project Structure

| Project | Location | Tech |
|---------|----------|------|
| Frontend | `/mnt/c/Users/riche/Development/CaridaTracker` | React Native + Expo + TypeScript |
| Backend | `/mnt/c/Users/riche/Development/CaridaTracker-api` | Express.js + TypeScript + PostgreSQL |

**GitHub:** TitusDrake
**Branch:** `development` (PR to `master`)

## Tech Stack

### Frontend
- React Native + Expo (SDK 54)
- TypeScript
- React Native Paper (UI)
- Expo Router (file-based routing)
- React Context (AuthContext, ThemeContext, TroopsContext, ClubsContext)
- Jest + React Native Testing Library

### Backend
- Node.js + Express.js v5
- TypeScript
- PostgreSQL + raw SQL (pg)
- node-pg-migrate (migrations)
- JWT + bcrypt (auth)
- nodemailer (email)
- Jest + Supertest (106 tests)

## Database

```
Host: localhost:5432
Database: caridatracker
User: postgres
Password: password
```

### Schema

```
users           - id, email, username, password_hash, first_name, last_name, tkid
organizations   - Parent orgs (501st Legion, Rebel Legion, etc.)
clubs           - Local chapters (Garrison Carida, Kyber Base, etc.)
club_members    - user_id, club_id, role (super_admin|admin|member|cadet)
troops          - Events with capacity (max_troopers, max_squires, waitlist_enabled)
troop_clubs     - Which clubs can see each troop
troop_attendees - Signups (attendee_type: trooper|squire, signup_status, shift_id)
troop_shifts    - Time slots for multi-shift events
```

### Migrations

```bash
npm run migrate:create <name>  # Create migration
npm run migrate:up             # Apply migrations
npm run migrate:down           # Rollback
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register (requires organizationId, clubId)
- `POST /api/auth/login` - Login with email or username
- `GET /api/auth/me` - Current user

### Troops
- `GET /api/troops` - List (filtered by user's clubs)
- `GET /api/troops/:id` - Details
- `POST /api/troops` - Create (admin)
- `PUT /api/troops/:id` - Update (admin)
- `DELETE /api/troops/:id` - Delete (admin)

### Attendance
- `POST /api/troops/:id/attend` - Sign up (club_id, attendee_type, shift_id, costume)
- `DELETE /api/troops/:id/attend` - Cancel
- `GET /api/troops/:id/attendees` - List attendees
- `GET /api/troops/:id/capacity` - Capacity info

### Shifts
- `GET /api/troops/:id/shifts` - List shifts
- `POST /api/troops/:id/shifts` - Create (admin)
- `PUT /api/troops/:id/shifts/:shiftId` - Update (admin)
- `DELETE /api/troops/:id/shifts/:shiftId` - Delete (admin)

### Other
- `GET /api/organizations` / `GET /api/clubs`
- `GET /api/users/me/clubs` / `GET /api/users/me/stats`
- `GET /api/search/troops?q=` / `GET /api/search/users?q=`
- `GET /api/costumes/my-costumes` - 501st API proxy

## Key Business Rules

1. **Multi-club attendance**: Users can attend same troop representing different clubs
2. **Per-shift per-club signup**: Can only sign up once per shift per club
3. **Attendee types**: Trooper (costumed) or Squire (handler)
4. **Cadet restriction**: Cadets can only sign up as Squire
5. **Capacity**: max_troopers/max_squires with waitlist support
6. **Visibility**: Troops only visible to clubs in troop_clubs table

## Test Users

| Username | Password | Role | Club |
|----------|----------|------|------|
| superadmin | password | super_admin | Garrison Carida |
| test501admin | password | admin | Garrison Carida |

## Email (Local Dev)

Email service uses Ethereal when `SMTP_HOST` is empty (auto-creates test account).
View sent emails at: https://ethereal.email/login

For Mailpit (requires Docker):
```bash
cd CaridaTracker-api
docker compose up -d  # Web UI at http://localhost:8025
```

## Current Status

### Implemented
- Full auth flow (register/login/JWT)
- Troop CRUD with capacity/waitlist
- Signup wizard (type, costume, shift, status)
- Split attendee lists (Troopers vs Squires)
- Admin approval workflow
- Shift management
- Email service (Ethereal/Mailpit)

### In Progress
- Password reset flow
- Email verification flow

### Planned
- Resend integration (production email)
- Waitlist notifications
- Profile editing
- Push notifications
