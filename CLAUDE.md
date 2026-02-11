# CaridaTracker — CLAUDE.md

## 1. Project Overview

- **What it is:** Mobile app for tracking volunteer costuming events ("troops") for Star Wars costuming organizations
- **Who it's for:** Members of the 501st Legion, Rebel Legion, and similar Star Wars costuming clubs
- **Current status:** Core features implemented; password reset and email verification in progress
- **Architecture:** Two-repo split: React Native frontend + Express.js REST API + PostgreSQL
- **Repository:** TitusDrake, branch `development` (PR to `master`)

## 2. Tech Stack and Project Structure

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native + Expo SDK 54, TypeScript, React Native Paper, Expo Router |
| Backend | Node.js + Express.js v5, TypeScript, PostgreSQL + raw SQL (pg) |
| Auth | JWT + bcrypt |
| Email | nodemailer (Ethereal for dev, Mailpit via Docker optional) |
| Testing | Jest + React Native Testing Library (frontend), Jest + Supertest (backend) |
| Migrations | node-pg-migrate |

### Directory Structure

```
CaridaTracker/               # Frontend (React Native)
├── src/
│   ├── screens/             # App screens
│   ├── components/          # Reusable UI components
│   ├── contexts/            # AuthContext, ThemeContext, TroopsContext, ClubsContext
│   └── types/               # TypeScript interfaces

CaridaTracker-api/           # Backend (Express.js) — separate repo
├── src/
│   ├── routes/              # Express route handlers
│   ├── middleware/           # Auth, validation middleware
│   ├── services/            # Business logic
│   └── db/                  # Database queries, migrations
```

### Database Schema

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

### Key Types / Domain Model

- **User** — belongs to one or more clubs via `club_members` with a role per club
- **Troop** — an event scoped to specific clubs via `troop_clubs`; has capacity limits and optional shifts
- **Attendee** — a signup to a troop as either Trooper (costumed) or Squire (handler)

## 3. Development Commands

```bash
# Backend API (run from WSL)
cd /mnt/c/Users/riche/Development/CaridaTracker-api
npm install
npm run dev                    # http://localhost:3000

# Frontend (run from Windows PowerShell)
cd C:\Users\riche\Development\CaridaTracker
npm install
npm start                      # Press 'a' for Android

# Tests
npm test                       # Run all tests (either repo)
npm run test:watch             # Watch mode
npm run test:coverage          # With coverage report

# Database migrations (backend repo)
npm run migrate:create <name>  # Create migration
npm run migrate:up             # Apply migrations
npm run migrate:down           # Rollback

# Email (optional Mailpit via Docker)
cd CaridaTracker-api
docker compose up -d           # Web UI at http://localhost:8025
```

### Environment Variables

Reference `.env.example` for required variables. Key variables:

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | PostgreSQL connection (default: localhost:5432/caridatracker) |
| JWT_SECRET | Token signing key |
| SMTP_HOST | Email server (empty = Ethereal auto-config) |

### Test Users

| Username | Password | Role | Club |
|----------|----------|------|------|
| superadmin | password | super_admin | Garrison Carida |
| test501admin | password | admin | Garrison Carida |

## 4. Project Context (Master)

This project follows all rules defined in the master CLAUDE.md located at ~/Development/CLAUDE.md. Key inherited policies:

- **Safety** — no unauthorized deletes, commits, pushes, or destructive operations
- **Security & Privacy** — proper auth, encryption, secrets management, no PII in logs
- **Architecture** — multi-tenant, stateless, horizontally scalable, max performance for min cost
- **Code Quality** — TDD, type safety, linting, reusable code, use existing solutions before custom
- **Infrastructure** — AWS deployment, cost awareness, IaC only
- **Documentation** — CLAUDE.md + AGENTS.md + README.md + setup script + .env.example; no doc sprawl
- **Dependencies** — no new tech without approval, vet packages, commit lock files
- **Accessibility** — semantic HTML, labels, alt text, contrast, keyboard nav, touch targets
- **CI/CD** — all checks pass before merging development to main
- **Error Handling** — global handler, consistent error format, log for devs, return for clients
- **Database Migrations** — backward-compatible, timestamped, tested, never hand-edit applied migrations
- **Project Planning** — GitHub Projects CLI (`gh project`) is available; preferred to break planning into GitHub Issues to track work

Do not duplicate these rules in this file. Refer to the master for full details.

## 5. Project Context (Local)

### Business Rules

1. **Multi-club attendance** — users can attend the same troop representing different clubs
2. **Per-shift per-club signup** — a user can only sign up once per shift per club
3. **Attendee types** — Trooper (costumed member) or Squire (handler/support)
4. **Cadet restriction** — users with cadet role can only sign up as Squire
5. **Capacity** — troops have max_troopers and max_squires limits with waitlist support
6. **Visibility** — troops are only visible to clubs listed in the troop_clubs table

### API Endpoints

**Auth:**
- `POST /api/auth/register` — register (requires organizationId, clubId)
- `POST /api/auth/login` — login with email or username
- `GET /api/auth/me` — current user

**Troops:**
- `GET /api/troops` — list (filtered by user's clubs)
- `GET /api/troops/:id` — details
- `POST /api/troops` — create (admin)
- `PUT /api/troops/:id` — update (admin)
- `DELETE /api/troops/:id` — delete (admin)

**Attendance:**
- `POST /api/troops/:id/attend` — sign up (club_id, attendee_type, shift_id, costume)
- `DELETE /api/troops/:id/attend` — cancel
- `GET /api/troops/:id/attendees` — list attendees
- `GET /api/troops/:id/capacity` — capacity info

**Shifts:**
- `GET /api/troops/:id/shifts` — list shifts
- `POST /api/troops/:id/shifts` — create (admin)
- `PUT /api/troops/:id/shifts/:shiftId` — update (admin)
- `DELETE /api/troops/:id/shifts/:shiftId` — delete (admin)

**Other:**
- `GET /api/organizations` / `GET /api/clubs`
- `GET /api/users/me/clubs` / `GET /api/users/me/stats`
- `GET /api/search/troops?q=` / `GET /api/search/users?q=`
- `GET /api/costumes/my-costumes` — 501st API proxy

### Known Issues / Gotchas

- **WSL vs Windows** — run `npm install` and `npm start` from Windows PowerShell where Android SDK is configured; tests can run from WSL
- **Two separate repos** — frontend and backend are in different repositories; changes often span both
- **Email in dev** — email service auto-creates an Ethereal test account when `SMTP_HOST` is empty; view sent emails at https://ethereal.email/login

### Project-Specific Rules

- TypeScript only — no `.js`/`.jsx` files in either repo
- Raw SQL via `pg` — no ORM; all queries are handwritten parameterized SQL
- React Context for state — AuthContext, ThemeContext, TroopsContext, ClubsContext (not Redux)

### Current Status

**Implemented:** Full auth flow, troop CRUD with capacity/waitlist, signup wizard, split attendee lists, admin approval workflow, shift management, email service

**In Progress:** Password reset flow, email verification flow

**Planned:** Resend integration (production email), waitlist notifications, profile editing, push notifications
