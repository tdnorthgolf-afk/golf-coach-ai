# 🚀 Deployment Checklist for Golf Coach AI

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment

### Clerk Setup
- [ ] Created Clerk application
- [ ] Enabled Email authentication
- [ ] Enabled Google authentication
- [ ] Configured sign-in/sign-up paths
- [ ] Copied publishable key
- [ ] Copied secret key

### Supabase Setup
- [ ] Created Supabase project
- [ ] Ran complete `supabase-schema.sql`
- [ ] Created `golf-coach-media` storage bucket
- [ ] Set bucket to Public
- [ ] Copied project URL
- [ ] Copied anon/public key
- [ ] Copied service_role key

### OpenAI Setup
- [ ] Created OpenAI account
- [ ] Added billing/credits
- [ ] Created API key
- [ ] Saved API key securely

### Local Testing
- [ ] All environment variables in `.env.local`
- [ ] `npm install` completed successfully
- [ ] `npm run dev` runs without errors
- [ ] Can sign up with email
- [ ] Can sign in with Google
- [ ] Can create student
- [ ] Can record lesson (audio + AI processing)
- [ ] Can upload media files
- [ ] Media displays correctly in timeline

## Vercel Deployment

### Repository Setup
- [ ] Code pushed to GitHub
- [ ] Repository is public or Vercel has access

### Vercel Configuration
- [ ] Imported project in Vercel
- [ ] All environment variables added
- [ ] Updated `NEXT_PUBLIC_APP_URL` to Vercel URL
- [ ] Initial deployment successful
- [ ] Redeployed after adding env vars

### Post-Deployment Configuration
- [ ] Updated Clerk allowed domains with Vercel URL
- [ ] Updated Clerk redirect URLs if needed
- [ ] Tested sign-up on production
- [ ] Tested sign-in on production
- [ ] Tested student creation on production
- [ ] Tested lesson recording on production
- [ ] Tested media upload on production

## PWA Setup

### Icons
- [ ] Created or generated `icon-192.png`
- [ ] Created or generated `icon-512.png`
- [ ] Icons placed in `/public` directory
- [ ] Icons visible at `/icon-192.png` and `/icon-512.png`

### Testing PWA
- [ ] Tested "Add to Home Screen" on iOS
- [ ] Tested "Add to Home Screen" on Android
- [ ] App installs correctly
- [ ] App opens without browser UI
- [ ] App works offline (basic functionality)

## Security Checklist

- [ ] `.env.local` is in `.gitignore` (NOT committed to git)
- [ ] No API keys exposed in client-side code
- [ ] Supabase RLS policies are active
- [ ] Only authenticated users can access data
- [ ] Storage bucket permissions are correct

## Performance Checklist

- [ ] Images load efficiently
- [ ] Videos play smoothly
- [ ] Audio recording works reliably
- [ ] AI processing completes in reasonable time (30s max)
- [ ] Dashboard loads quickly with many students

## Monitoring Setup

### Vercel
- [ ] Check deployment logs for errors
- [ ] Monitor function execution times
- [ ] Set up alerts for failed deployments

### Supabase
- [ ] Check database logs
- [ ] Monitor storage usage
- [ ] Monitor API request usage
- [ ] Set up alerts for quota limits

### OpenAI
- [ ] Monitor API usage
- [ ] Set up spending limits
- [ ] Check for failed requests

## Launch Preparation

- [ ] Test with 2-3 real students
- [ ] Record 5-10 actual lessons
- [ ] Upload various media types
- [ ] Verify AI-generated notes are high quality
- [ ] Get feedback from beta users
- [ ] Fix any bugs or issues
- [ ] Update AI prompts if needed

## Post-Launch

- [ ] Monitor error rates daily for first week
- [ ] Check user feedback
- [ ] Monitor costs (OpenAI, Supabase)
- [ ] Scale resources if needed
- [ ] Plan feature improvements

## Emergency Contacts

- Vercel Status: https://vercel-status.com
- Supabase Status: https://status.supabase.com
- OpenAI Status: https://status.openai.com
- Clerk Status: https://status.clerk.com

## Rollback Plan

If something goes wrong:

1. Check Vercel deployment logs
2. Revert to previous deployment in Vercel dashboard
3. Check Supabase logs for database errors
4. Verify all environment variables are correct
5. Test locally with production env vars
6. Redeploy after fixing issue

## Success Criteria

Your deployment is successful when:

✅ Users can sign up and sign in
✅ Users can create students
✅ Users can record lessons with AI transcription
✅ Users can upload media files
✅ All media displays correctly
✅ App works on mobile devices
✅ App can be installed as PWA
✅ No console errors in production
✅ All API calls complete successfully

---

**Congratulations! Your Golf Coach AI is live! 🎉⛳**
