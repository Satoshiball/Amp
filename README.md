# HOTNOTCLUB

> "You're either a hottie or a nottie."

A weekly photo competition app where users compete to be crowned the ultimate hottie or nottie, with real cash prizes.

## Overview

HOTNOTCLUB is a mobile-first social competition platform where users:
- Enter weekly photo competitions
- Vote on other entries (Hottie or Nottie)
- Climb leaderboards in 4 categories (Male/Female × Hottie/Nottie)
- Win cash prizes (USDC) distributed to weekly winners

## Architecture

This is a monorepo containing three main packages:

```
Amp/
├── backend/          # Node.js + Express API
├── mobile/           # React Native + Expo app
└── shared/           # Shared TypeScript types & Drizzle schema
```

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (Supabase-managed)
- Drizzle ORM
- Supabase Auth (JWT validation)
- Stripe (payments & subscriptions)
- Node-cron (weekly competition lifecycle)

**Mobile:**
- React Native + Expo (SDK 54)
- Expo Router (file-based navigation)
- TanStack Query (server state)
- Supabase JS (auth client)
- React Context (global state)

**Database:**
- 11 tables covering users, competitions, entries, votes, boosts, payments, etc.
- See `shared/src/schema.ts` for full schema

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Supabase project (for auth & storage)
- Stripe account (for payments)
- Expo CLI: `npm install -g expo-cli`

### Environment Variables

#### Backend (.env)

Create `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Storage
SUPABASE_STORAGE_BUCKET=competition-photos

# App URLs
FRONTEND_URL=http://localhost:8081
BACKEND_URL=http://localhost:3000

# Competition Settings
ENTRY_PRICE_ONE_TIME=1.99
ENTRY_PRICE_SUBSCRIPTION=1.50
JACKPOT_PERCENTAGE=0.5
```

#### Mobile (.env)

Create `mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Installation

1. **Install root dependencies:**
```bash
npm install
```

2. **Install workspace dependencies:**
```bash
npm run setup
```

Or manually:
```bash
cd shared && npm install
cd ../backend && npm install
cd ../mobile && npm install
```

3. **Set up database:**
```bash
cd backend
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
```

4. **Start development servers:**

**Backend:**
```bash
cd backend
npm run dev
```

**Mobile:**
```bash
cd mobile
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

## Database Schema

11 tables managed by Drizzle ORM:

1. **users** - User accounts and profiles
2. **competitions** - Weekly competition cycles
3. **competition_entries** - User submissions per competition
4. **votes** - Hottie/Nottie votes on entries
5. **boost_purchases** - Boost pack purchases
6. **boost_usages** - Boost applications to entries
7. **entry_payments** - Entry fee payments
8. **subscriptions** - Recurring entry subscriptions
9. **referrals** - User referral tracking
10. **reports** - Content moderation reports
11. **payouts** - Winner prize distributions

## Competition Lifecycle

### Weekly Cycle (Monday to Sunday UTC)

- **Entry Phase**: Week N+1 (next competition accepting entries)
- **Voting Phase**: Week N (current competition, users voting)
- **Ended Phase**: Week N-1+ (past competitions, winners announced)

### Automated Jobs

Cron jobs (runs in production only):

- **Every Monday 00:00 UTC**: Transition competitions
  - End current competition
  - Determine winners
  - Create payouts
  - Move next competition to voting
  - Create new upcoming competition

- **Every Hour**: Update jackpots based on revenue

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user profile after Supabase signup
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `GET /api/auth/me/history` - Get user's competition history

### Competitions
- `GET /api/competitions/current` - Current competition (voting)
- `GET /api/competitions/upcoming` - Upcoming competition (entry)
- `GET /api/competitions/:id` - Get competition details
- `POST /api/competitions/:id/entry` - Submit entry
- `GET /api/competitions/:id/entries/next` - Get next entry for voting
- `GET /api/competitions/:id/winners` - Get competition winners

### Voting
- `POST /api/entries/:entryId/vote` - Vote on entry (hottie/nottie)

### Boosts
- `GET /api/boosts/balance` - Get user's boost balance
- `POST /api/boosts/purchase` - Purchase boost pack (Stripe checkout)
- `POST /api/boosts/apply` - Apply boost to entry

### Leaderboard
- `GET /api/leaderboard/current` - Current competition leaderboard
- `GET /api/leaderboard/:competitionId` - Historical leaderboard

### Referrals
- `GET /api/referrals/code` - Get user's referral code
- `GET /api/referrals/list` - Get user's referrals

### Reports
- `POST /api/reports` - Report entry for moderation

### Payments
- `POST /api/payments/entries/checkout` - Create entry payment checkout
- `POST /api/payments/stripe/webhook` - Stripe webhook handler

### Admin (requires admin role)
- `GET /api/admin/reports` - List all reports
- `PATCH /api/admin/reports/:id` - Update report status
- `POST /api/admin/entries/:id/remove` - Remove entry
- `POST /api/admin/users/:id/ban` - Ban user
- `POST /api/admin/users/:id/unban` - Unban user
- `GET /api/admin/payouts` - List all payouts
- `PATCH /api/admin/payouts/:id` - Update payout status

## Mobile App Screens

### Auth Flow
- Sign In
- Sign Up (with referral code support)

### Main Tabs
1. **Compete** - Swipe to vote on entries (Hottie/Nottie)
2. **Leaderboard** - View rankings with filters
3. **Upload** - Submit entry for upcoming competition
4. **History** - View past competition results
5. **Profile** - Manage profile, wallet, referrals, boosts

## Monetization

### Entry Fees
- One-time: $1.99 per competition
- Subscription: $1.50/week (auto-entry)

### Boost Packs
- Small: $4.99 → 5 boosts
- Medium: $9.99 → 15 boosts
- Large: $24.99 → 50 boosts

### Jackpot
- 50% of all entry + boost revenue goes to jackpot
- Split equally among 4 category winners
- Paid out in USDC to winner's wallet

### Referral Rewards
- Referrer gets 1 free boost when referee makes first entry payment

## Scoring System

```
score = hottie_votes - nottie_votes + boost_count
```

- Each Hottie vote: +1
- Each Nottie vote: -1
- Each boost applied: +1

## Deployment

### Backend (Replit)
1. Create Replit project
2. Set environment variables
3. Deploy

### Mobile (EAS Build)
1. Configure EAS: `eas build:configure`
2. Build iOS: `eas build --platform ios`
3. Build Android: `eas build --platform android`
4. Submit to stores: `eas submit`

## Development Notes

### TODO for Production

1. **Image Upload**: Implement actual image upload to Supabase Storage or GCS
   - Currently using local URIs (won't work in production)
   - See `mobile/app/(tabs)/upload.tsx`

2. **Push Notifications**: Implement Expo push notification triggers
   - Competition start/end
   - Ranking updates
   - Winner announcements

3. **Content Moderation**: Integrate NSFW detection API
   - Google Vision API
   - AWS Rekognition
   - Or similar

4. **Admin Dashboard**: Build web UI for admin endpoints
   - Report moderation
   - User management
   - Payout processing

5. **USDC Payouts**: Implement automated crypto transfers
   - Currently manual via payout records
   - Integrate with USDC wallet API

6. **Rate Limiting**: Add rate limiting to API endpoints

7. **Analytics**: Wire up analytics events to backend
   - PostHog, Amplitude, or Firebase

8. **Email Service**: Set up transactional emails
   - Welcome emails
   - Weekly results
   - Payment receipts

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
