# Golf Coach AI 🏌️

A professional Progressive Web App for golf instructors to manage students, record lessons with AI-powered transcription, and track progress over time.

## Features

- 🎤 **AI-Powered Lesson Recording**: Record audio during lessons and automatically generate structured notes using OpenAI Whisper + GPT-4o-mini
- 📸 **Media Management**: Upload photos, videos, and PDFs to student training spaces
- 👥 **Student Management**: Track all students with thumbnails, lesson history, and progress
- 📱 **Progressive Web App**: Install on mobile devices for native app experience
- 🔐 **Secure Authentication**: Clerk authentication with email/password and Google sign-in
- 💾 **Reliable Storage**: Supabase Postgres database and file storage
- 🎨 **Beautiful Golf Theme**: Professional dark blue/green color scheme optimized for outdoor use

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (Postgres)
- **File Storage**: Supabase Storage
- **AI**: OpenAI (Whisper + GPT-4o-mini)
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Prerequisites

Before you begin, you'll need accounts for:
1. **Clerk** (authentication) - https://clerk.com
2. **Supabase** (database & storage) - https://supabase.com
3. **OpenAI** (AI transcription) - https://platform.openai.com

All have generous free tiers suitable for development and small-scale production use.

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd golf-coach-ai
npm install
```

### 2. Set Up Clerk Authentication

1. Go to https://clerk.com and create a new application
2. Choose "Email" and "Google" as authentication methods
3. Copy your API keys from the Clerk dashboard
4. In Clerk dashboard, configure:
   - **Redirect URLs**: Add your domain (e.g., `http://localhost:3000` for development)
   - **Sign-in/Sign-up URLs**: `/sign-in` and `/sign-up`

### 3. Set Up Supabase

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** and run the entire `supabase-schema.sql` file
3. Go to **Storage** and create a bucket called `golf-coach-media`
4. Set the bucket to **Public** (for easy media access)
5. Copy your Supabase URL and keys from **Project Settings > API**

### 4. Set Up OpenAI

1. Go to https://platform.openai.com
2. Create an API key
3. Add credits to your account (Whisper is very affordable: ~$0.006/minute)

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# App URL (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/golf-coach-ai)

### Manual Deploy

1. Push your code to GitHub
2. Go to https://vercel.com and import your repository
3. Add all environment variables from `.env.local` to Vercel:
   - Go to **Project Settings > Environment Variables**
   - Add each variable from your `.env.local` file
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
4. Deploy!

Vercel will automatically:
- Install dependencies
- Build the Next.js app
- Deploy to a production URL

### Post-Deployment

After deploying, update your Clerk dashboard:
1. Add your Vercel URL to **Allowed Origins**
2. Update redirect URLs to use your production domain

## Database Schema

The app uses the following tables:

- **users**: Coaches synced from Clerk
- **students**: Student profiles with contact info
- **lessons**: Lesson records with AI-generated notes
- **media**: Photos, videos, and documents

All tables have proper indexes and Row-Level Security (RLS) policies to ensure data privacy.

## API Routes

- `POST /api/sync-user`: Sync Clerk user to Supabase
- `POST /api/students`: Create new student
- `POST /api/transcribe`: Transcribe audio and generate lesson notes
- `POST /api/upload`: Upload media files to Supabase Storage

## AI Lesson Note Format

The AI generates structured lesson notes in this exact format:

```markdown
## TECHNICAL GOALS
• Goal 1
• Goal 2

## DRILLS
1. **Drill Name** – X minutes
   • Instructions
   • Focus points
   • Reps

## NOTES
• Key observations
• Progress updates

## NEXT SESSION
Brief summary of next steps (1-2 sentences).
```

## PWA Installation

Users can install the app on their devices:

**iOS (Safari)**:
1. Tap the Share button
2. Scroll down and tap "Add to Home Screen"

**Android (Chrome)**:
1. Tap the three-dot menu
2. Tap "Add to Home screen"

## Customization

### Colors

Edit `app/globals.css` to customize the golf-themed colors:

```css
:root {
  --background: 210 30% 8%;
  --primary: 150 60% 45%;
  /* ... */
}
```

### AI Prompt

Edit `app/api/transcribe/route.ts` to customize the AI lesson note format:

```typescript
{
  role: 'system',
  content: `Your custom prompt here...`
}
```

## Troubleshooting

### Audio Recording Not Working
- Ensure HTTPS (required for microphone access)
- Check browser permissions for microphone

### Files Not Uploading
- Verify Supabase storage bucket is public
- Check storage bucket name matches `golf-coach-media`
- Ensure file size limits in Supabase settings

### Authentication Issues
- Verify Clerk API keys are correct
- Check that redirect URLs match in Clerk dashboard
- Ensure middleware.ts is properly configured

## Cost Estimation

For a coach with 20 students recording 2 lessons/week:

- **Clerk**: Free (up to 5,000 MAUs)
- **Supabase**: Free (up to 500MB storage, 2GB bandwidth)
- **OpenAI**: ~$5-10/month (Whisper + GPT-4o-mini)
- **Vercel**: Free (Hobby plan)

Total: ~$5-10/month for active use

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase logs in dashboard
3. Check Vercel deployment logs

## License

MIT License - feel free to use and modify for your coaching business!
