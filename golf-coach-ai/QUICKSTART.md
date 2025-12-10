# ⚡ GOLF COACH AI - INSTANT SETUP

## Get Running in 10 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Get API Keys (5 min)

**Clerk** → https://dashboard.clerk.com
- Create app → Enable Email & Google
- Copy keys

**Supabase** → https://supabase.com/dashboard
- New project → SQL Editor → Run `supabase-schema.sql`
- Storage → Create buckets: `lesson-audio`, `media`, `avatars`
- Copy keys

**OpenAI** → https://platform.openai.com/api-keys
- Create key

### 3. Create `.env.local`
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

OPENAI_API_KEY=sk-xxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run
```bash
npm run dev
```

Open http://localhost:3000 → Sign up → Add students → Record lessons!

## Deploy to Production

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Deploy on Vercel
vercel --prod
```

Add same env variables in Vercel dashboard.

Done! 🎉

See `DEPLOYMENT-GUIDE.md` for detailed instructions.
