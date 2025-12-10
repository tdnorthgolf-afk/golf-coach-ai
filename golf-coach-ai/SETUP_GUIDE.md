# Golf Coach AI - Complete Setup Guide

## 🚀 Quick Start Checklist

- [ ] Create Clerk account and get API keys
- [ ] Create Supabase project and run schema
- [ ] Create OpenAI account and get API key
- [ ] Configure environment variables
- [ ] Run development server
- [ ] Deploy to Vercel

---

## Step 1: Clerk Authentication Setup (5 minutes)

### 1.1 Create Clerk Account
1. Go to https://clerk.com
2. Click "Start building for free"
3. Sign up with your email

### 1.2 Create Application
1. Click "Add application"
2. Name it "Golf Coach AI"
3. Select authentication methods:
   - ✅ Email
   - ✅ Google
4. Click "Create application"

### 1.3 Get API Keys
1. In your new app dashboard, click "API Keys"
2. Copy these values:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
3. Save these for your `.env.local` file

### 1.4 Configure URLs
1. Go to "Paths" in the sidebar
2. Set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

---

## Step 2: Supabase Setup (10 minutes)

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New project"
5. Fill in:
   - Name: `golf-coach-ai`
   - Database Password: (generate strong password and save it)
   - Region: Choose closest to you
6. Click "Create new project" (takes 1-2 minutes)

### 2.2 Run Database Schema
1. Wait for project to finish setting up
2. Go to "SQL Editor" in the sidebar
3. Click "New query"
4. Copy the ENTIRE contents of `supabase-schema.sql`
5. Paste into the SQL editor
6. Click "Run" or press Cmd/Ctrl + Enter
7. You should see "Success. No rows returned"

### 2.3 Create Storage Bucket
1. Go to "Storage" in the sidebar
2. Click "Create a new bucket"
3. Name: `golf-coach-media`
4. ✅ Check "Public bucket"
5. Click "Create bucket"

### 2.4 Get API Keys
1. Go to "Project Settings" (gear icon in sidebar)
2. Click "API" in the left menu
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys") - Click "Reveal" first
4. Save these for your `.env.local` file

---

## Step 3: OpenAI Setup (5 minutes)

### 3.1 Create OpenAI Account
1. Go to https://platform.openai.com
2. Sign up or log in

### 3.2 Add Billing
1. Go to "Settings" > "Billing"
2. Click "Add payment method"
3. Add a credit card
4. Add at least $5 in credits (this will last a LONG time)

### 3.3 Create API Key
1. Go to "API keys" in the sidebar
2. Click "Create new secret key"
3. Name it "Golf Coach AI"
4. Copy the key (starts with `sk-`)
5. **IMPORTANT**: Save this immediately - you can't see it again!

---

## Step 4: Local Development Setup (5 minutes)

### 4.1 Install Dependencies
```bash
cd golf-coach-ai
npm install
```

### 4.2 Create Environment File
Create a file named `.env.local` in the root directory with this content:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_PASTE_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://PASTE_YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_YOUR_SERVICE_ROLE_KEY_HERE

# OpenAI
OPENAI_API_KEY=sk-PASTE_YOUR_KEY_HERE

# App URL (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace all the `PASTE_YOUR_KEY_HERE` values with your actual keys from Steps 1-3.

### 4.3 Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## Step 5: Testing Everything Works

### 5.1 Test Sign Up
1. Go to http://localhost:3000
2. Click "Sign up"
3. Create an account with email or Google
4. You should be redirected to `/dashboard`

### 5.2 Test Student Creation
1. Click "Add Student"
2. Fill in a student name
3. Click "Create Student"
4. You should see the student appear in the grid

### 5.3 Test Lesson Recording
1. Click on a student
2. Click "Record Lesson"
3. Allow microphone access
4. Click "Start Recording"
5. Say something like "Today we worked on putting. The student needs to focus on tempo and distance control."
6. Click "Stop Recording"
7. Click "Save Lesson"
8. Wait for AI processing (10-30 seconds)
9. You should see structured lesson notes appear!

### 5.4 Test Media Upload
1. On a student page, click "Add Media"
2. Select a photo or video
3. Add a caption (optional)
4. Click "Upload"
5. You should see the media appear in the timeline

---

## Step 6: Deploy to Vercel (10 minutes)

### 6.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/golf-coach-ai.git
git push -u origin main
```

### 6.2 Deploy on Vercel
1. Go to https://vercel.com
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Click "Deploy"

### 6.3 Add Environment Variables
1. After initial deploy, go to "Settings" > "Environment Variables"
2. Add ALL the variables from your `.env.local` file
3. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)
4. Click "Redeploy" to apply the changes

### 6.4 Update Clerk Settings
1. Go back to your Clerk dashboard
2. Go to "Domains" and add your Vercel URL
3. Go to "Paths" and verify the URLs still point to `/sign-in`, `/dashboard`, etc.

---

## Step 7: PWA Icons (Optional)

The app needs icon files for PWA installation. Create two square images:
- `public/icon-192.png` - 192x192 pixels
- `public/icon-512.png` - 512x512 pixels

Use a golf-themed icon (golf ball, club, tee, etc.) with a dark green background.

You can use tools like:
- Canva (free)
- Figma (free)
- DALL-E / Midjourney (AI-generated)

---

## Troubleshooting

### "Unauthorized" error
- Check that your Clerk keys are correct in `.env.local`
- Make sure you're signed in

### "Failed to upload file"
- Verify your Supabase storage bucket is named `golf-coach-media`
- Check that the bucket is set to "Public"
- Confirm your Supabase keys are correct

### "Failed to process audio"
- Ensure your OpenAI API key is correct
- Check that you have credits in your OpenAI account
- Verify microphone permissions in your browser

### Database errors
- Re-run the `supabase-schema.sql` file
- Check Supabase logs in the dashboard
- Ensure you're using the service role key for admin operations

### Can't install as PWA
- PWAs require HTTPS (works automatically on Vercel)
- Make sure manifest.json is accessible at `/manifest.json`
- Check browser console for PWA-related errors

---

## Next Steps

1. **Customize AI Prompt**: Edit `app/api/transcribe/route.ts` to match your teaching style
2. **Add More Students**: Build your student roster
3. **Record Lessons**: Start using the AI transcription feature
4. **Share with Students**: Students can access their training space via a shared link (future feature)
5. **Monitor Costs**: Check your OpenAI and Supabase usage in their dashboards

---

## Getting Help

If you run into issues:
1. Check the troubleshooting section above
2. Review the main README.md file
3. Check Supabase logs: Dashboard > Logs
4. Check Vercel logs: Project > Deployments > Click on deployment > Logs
5. Check browser console for client-side errors

---

## Success! 🎉

You now have a fully functional Golf Coach AI app that can:
- Manage unlimited students
- Record and transcribe lessons automatically
- Generate professional lesson notes with AI
- Store photos, videos, and documents
- Work as a Progressive Web App on mobile devices

Time to start coaching! ⛳
