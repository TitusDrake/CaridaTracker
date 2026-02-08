# CaridaTracker

Mobile app for tracking volunteer costuming events ("troops") for Star Wars costuming organizations (501st Legion, Rebel Legion, etc.).

## Prerequisites

- Node.js 20+
- Android SDK (via Android Studio)
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL 14+ (for backend API — separate repo)

## Getting Started

```bash
# Frontend (run from Windows PowerShell)
cd C:\Users\riche\Development\CaridaTracker
npm install
npm start                      # Press 'a' for Android

# Backend API (run from WSL — separate repo)
cd /mnt/c/Users/riche/Development/CaridaTracker-api
npm install
npm run dev                    # http://localhost:3000
```

## Development

```bash
# Run frontend
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint
npm run lint:fix

# Build APK (from Windows PowerShell)
cd android && .\gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# Database migrations (backend repo)
npm run migrate:up
npm run migrate:create <name>
```

## Project Structure

```
CaridaTracker/               # Frontend (React Native + Expo)
├── src/
│   ├── screens/             # App screens
│   ├── components/          # Reusable UI components
│   ├── contexts/            # Auth, Theme, Troops, Clubs contexts
│   └── types/               # TypeScript interfaces

CaridaTracker-api/           # Backend (separate repo)
├── src/
│   ├── routes/              # Express route handlers
│   ├── middleware/           # Auth, validation
│   ├── services/            # Business logic
│   └── db/                  # Queries, migrations
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Token signing key |
| SMTP_HOST | Email server (empty = Ethereal auto-config) |

## License

Private
