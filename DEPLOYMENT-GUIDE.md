# 🚀 GOLF COACH AI - COMPLETE DEPLOYMENT GUIDE

## Quick Start (5 Minutes)

### Step 1: Get Your API Keys

1. **Clerk** (Authentication):
   - Go to https://dashboard.clerk.com
   - Create Application → Enable Email & Google
   - Copy: Publishable Key & Secret Key

2. **Supabase** (Database & Storage):
   - Go to https://supabase.com/dashboard  
   - New Project → Wait 2 minutes for setup
   - SQL Editor → Paste `supabase-schema.sql` → Run
   - Storage → Create 3 buckets: `lesson-audio`, `media`, `avatars`
   - Settings → API → Copy: URL & anon key & service_role key

3. **OpenAI** (AI):
   - Go to https://platform.openai.com/api-keys
   - Create key → Copy (starts with `sk-`)

### Step 2: Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com → New Project
3. Import repository
4. Add Environment Variables:

```
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

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

5. Click Deploy → Done in 2 minutes!

### Step 3: Post-Deploy

1. Update `NEXT_PUBLIC_APP_URL` in Vercel to your actual URL
2. In Clerk dashboard → Add your Vercel URL to allowed origins
3. Test: Sign up → Add student → Record lesson

## Features You Get

✅ AI lesson transcription (Whisper + GPT-4)
✅ Student management dashboard  
✅ Media uploads (photos, videos, PDFs)
✅ Mobile PWA (install on any device)
✅ Professional golf theme
✅ Secure authentication

## Supabase Storage Setup

After running the SQL schema, configure storage buckets:

1. Go to Storage in Supabase dashboard
2. Create three buckets:
   - `lesson-audio` (Private) - For audio recordings
   - `media` (Public) - For photos/videos
   - `avatars` (Public) - For profile pictures

3. For each bucket, add this policy:
   - Name: "Authenticated uploads"
   - Allowed operations: INSERT, UPDATE, SELECT
   - Policy: `(auth.role() = 'authenticated')`

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local` with same variables as Vercel.

## Troubleshooting

**Can't sign in?**
- Check Clerk keys are correct
- Verify allowed origins in Clerk dashboard

**Upload fails?**
- Verify Supabase buckets exist
- Check storage policies are set
- Ensure service role key is correct

**AI not working?**
- Verify OpenAI key is valid
- Check you have API credits
- Audio must be m4a, mp3, or wav

## Cost Estimate

- Clerk: FREE (10,000 users)
- Supabase: FREE (500MB database, 1GB storage)
- OpenAI: ~$0.01 per lesson (Whisper + GPT-4o-mini)
- Vercel: FREE (hobby plan)

**Total: FREE for first ~100 lessons/month!**

## Support

Issues? Check:
1. Vercel deployment logs
2. Supabase logs  
3. Browser console
4. All environment variables are set

## What's Included

- ✅ Complete Next.js 14 app
- ✅ All components and pages
- ✅ Database schema
- ✅ API routes
- ✅ PWA configuration
- ✅ Mobile-responsive design
- ✅ Production-ready code

Ready to coach! 🏌️‍♂️
