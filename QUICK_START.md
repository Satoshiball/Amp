# Quick Start Guide - HOTNOTCLUB Development

This guide will help you get HOTNOTCLUB running locally in about 15 minutes.

## Prerequisites ✅

- [x] Node.js 18+ installed
- [x] npm installed
- [x] Dependencies installed (`npm run setup` - already done!)

## Option 1: Quick Start with Supabase (Recommended)

### Step 1: Create Supabase Project (5 minutes)

1. **Go to Supabase**: https://supabase.com/dashboard
2. **Sign up or log in**
3. **Create New Project:**
   - Project name: `hotnotclub-dev`
   - Database password: Choose a strong password (save it!)
   - Region: Choose closest to you
   - Wait 2-3 minutes for project to be ready

4. **Get Your Credentials:**

   **A. API Keys** (Settings > API):
   - `SUPABASE_URL`: Project URL (e.g., `https://xxxxx.supabase.co`)
   - `SUPABASE_ANON_KEY`: `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY`: `service_role` `secret` key

   **B. Database URL** (Settings > Database):
   - Connection string: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - Or build manually: `postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

### Step 2: Update Environment Files (2 minutes)

**Edit `backend/.env`:**
```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
```

**Edit `mobile/.env`:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

### Step 3: Set Up Stripe Test Mode (3 minutes)

1. **Create Stripe Account**: https://dashboard.stripe.com/register
2. **Toggle to Test Mode** (top right toggle)
3. **Get API Keys** (Developers > API keys):
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...` (click "Reveal")

4. **Update `backend/.env`:**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

5. **Set up Webhook** (for later):
   - We'll use Stripe CLI for local testing
   - Or skip for now (payments won't work but everything else will)

### Step 4: Initialize Database (1 minute)

```bash
cd backend
npm run db:push
```

This will create all 11 tables in your Supabase database.

### Step 5: Start Development Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 HOTNOTCLUB API server running on port 3000
📍 Environment: development
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npm start
```

This will open Expo DevTools in your browser.

### Step 6: Run the App

**For iOS Simulator:**
- Press `i` in the terminal
- Or scan QR code with Expo Go app

**For Android Emulator:**
- Press `a` in the terminal
- Or scan QR code with Expo Go app

**For Web (testing only):**
- Press `w` in the terminal

## Option 2: Local PostgreSQL with Docker (Alternative)

If you prefer not to use Supabase immediately, you can run PostgreSQL locally:

### Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: hotnotclub
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: hotnotclub_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Start Database:
```bash
docker-compose up -d
```

### Update `backend/.env`:
```env
DATABASE_URL=postgresql://hotnotclub:dev_password_123@localhost:5432/hotnotclub_dev
```

**Note:** With this option, you'll still need Supabase for authentication OR implement a custom auth solution.

## Testing the App

### 1. Create a Test User

**In the mobile app:**
1. Tap "Sign Up"
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `password123`
   - Username: `testuser`
   - Fill in other required fields
3. Check email for verification link (if Supabase email is configured)

### 2. Create First Competition

**Option A - Via Backend API (Recommended for testing):**

```bash
# Create current competition (voting phase)
curl -X POST http://localhost:3000/api/admin/competitions/create \
  -H "Content-Type: application/json"
```

**Option B - Wait for Monday 00:00 UTC:**
- The cron job will automatically create competitions

**Option C - Manually insert via SQL:**

In Supabase Dashboard > SQL Editor:

```sql
INSERT INTO competitions (
  week_label,
  start_date,
  end_date,
  entry_start_date,
  entry_end_date,
  phase
) VALUES (
  '2025-12-01',
  '2025-12-01 00:00:00+00',
  '2025-12-07 23:59:59+00',
  '2025-11-24 00:00:00+00',
  '2025-11-30 23:59:59+00',
  'voting'
);

-- Create upcoming competition
INSERT INTO competitions (
  week_label,
  start_date,
  end_date,
  entry_start_date,
  entry_end_date,
  phase
) VALUES (
  '2025-12-08',
  '2025-12-08 00:00:00+00',
  '2025-12-14 23:59:59+00',
  '2025-12-01 00:00:00+00',
  '2025-12-07 23:59:59+00',
  'entry'
);
```

### 3. Test Features

1. **Upload Tab**: Submit an entry (note: image upload needs implementation)
2. **Compete Tab**: Vote on entries (once you have multiple entries)
3. **Leaderboard**: View rankings
4. **Profile**: Edit profile, view referral code

## Troubleshooting

### Backend won't start

**Error: "DATABASE_URL is not set"**
- Check `backend/.env` exists and has correct values
- Make sure there are no quotes around values

**Error: "connect ECONNREFUSED"**
- Database isn't running or connection string is wrong
- Test connection: `psql $DATABASE_URL`

### Mobile app errors

**Error: "Network request failed"**
- Backend isn't running
- Check `EXPO_PUBLIC_API_URL` in `mobile/.env`
- If using Android emulator, use `http://10.0.2.2:3000/api`

**Error: "Supabase client failed"**
- Check Supabase credentials in `mobile/.env`
- Make sure project is active in Supabase dashboard

### Database schema issues

**Reset database:**
```bash
cd backend
npm run db:push
```

## Next Steps

### For Development:

1. **Enable Supabase Email**:
   - Settings > Authentication > Email Templates
   - Configure SMTP (or use Supabase's email service)

2. **Set up Stripe Webhook locally:**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
   ```

3. **Implement Image Upload:**
   - See `mobile/app/(tabs)/upload.tsx`
   - Use Supabase Storage or Google Cloud Storage

4. **Test Payments:**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

### For Production:

See `README.md` for production deployment guide.

## Useful Commands

```bash
# Backend
cd backend
npm run dev              # Start dev server
npm run build            # Build for production
npm run db:generate      # Generate migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio (DB GUI)

# Mobile
cd mobile
npm start                # Start Expo dev server
npm run android          # Run on Android
npm run ios              # Run on iOS

# Root
npm run setup            # Install all dependencies
npm run backend          # Start backend (from root)
npm run mobile           # Start mobile (from root)
```

## Support

- Check `README.md` for full documentation
- Review API endpoints in `README.md`
- Database schema in `shared/src/schema.ts`

---

**You're all set! 🔥**

If you've completed all steps, you should now have HOTNOTCLUB running locally!
