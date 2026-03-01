# 🚀 Lovable.dev Deployment Guide - AI Paper Assessment

## 📋 Important: Lovable Cloud Setup

Since you're using **Lovable.dev**, the deployment process is different from standard Supabase. Lovable manages the backend infrastructure for you.

## ⚡ Quick Setup (5 Minutes)

### Step 1: Add Groq API Key to .env (Already Done! ✅)

Your `.env` file should have:
```env
GROQ_API_KEY="your_actual_groq_api_key_here"
```

**Replace `your_groq_api_key_here` with your actual Groq API key from https://console.groq.com**

### Step 2: Push to GitHub

```bash
# Navigate to your project directory
cd mind-ranker-main

# Initialize git if not already done
git init

# Add remote (your GitHub repo)
git remote add origin https://github.com/aryantyagi2211/mind-ranker.git

# Stage all files
git add .

# Commit changes
git commit -m "Add AI Paper Assessment System with Groq integration"

# Push to GitHub
git push -u origin main
```

### Step 3: Lovable Auto-Deploy ✨

Lovable will automatically:
1. Detect the new edge functions in `supabase/functions/`
2. Deploy them to Lovable Cloud
3. Set up the environment variables from your `.env`
4. Make the functions available at your Supabase URL

**Wait 2-3 minutes for deployment to complete.**

### Step 4: Verify Deployment

1. Open your Lovable dashboard
2. Check the deployment logs
3. Verify edge functions are deployed:
   - `generate-questions`
   - `score-answers`

### Step 5: Test the System

```bash
# Start development server
npm run dev

# Navigate to
http://localhost:5173/test/setup
```

1. Select **High School**
2. Select **Standard** difficulty  
3. Choose a subject (or "All Subjects")
4. Click **ASSESSMENT PAPER**
5. Watch the AI generate questions! 🎉

## 🔧 Lovable-Specific Configuration

### Environment Variables

Lovable reads from `.env` file automatically. Make sure you have:

```env
# Supabase (Lovable Cloud)
VITE_SUPABASE_PROJECT_ID="vertjjkacwtfjliwckrf"
VITE_SUPABASE_PUBLISHABLE_KEY="your_key"
VITE_SUPABASE_URL="https://vertjjkacwtfjliwckrf.supabase.co"

# Groq API (for AI)
GROQ_API_KEY="your_groq_api_key_here"  # ⚠️ REPLACE THIS!

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
VITE_GOOGLE_SECRET_KEY="your_google_secret"
```

### Edge Functions Location

Lovable automatically detects edge functions in:
```
supabase/functions/
├── generate-questions/
│   └── index.ts
└── score-answers/
    └── index.ts
```

## 🐛 Troubleshooting

### Issue: "Failed to generate questions"

**Solution 1: Check Groq API Key**
```bash
# Make sure GROQ_API_KEY in .env is correct
# Get your key from: https://console.groq.com/keys
```

**Solution 2: Check Lovable Deployment**
- Go to Lovable dashboard
- Check deployment logs
- Verify functions are deployed successfully

**Solution 3: Check Function Logs**
- In Lovable dashboard, go to Functions
- Click on `generate-questions`
- Check the logs for errors

### Issue: Functions not found (404)

**Solution:**
- Wait 2-3 minutes after pushing to GitHub
- Lovable needs time to deploy
- Refresh your browser
- Check Lovable dashboard for deployment status

### Issue: CORS errors

**Solution:**
- Edge functions already include CORS headers
- Clear browser cache
- Try in incognito mode
- Check browser console for specific error

### Issue: "No content received from AI"

**Solution:**
- Verify Groq API key is valid
- Check Groq dashboard for API usage/limits
- Ensure you have credits in Groq account
- Check function logs in Lovable dashboard

## 📊 Monitoring

### Check Function Logs in Lovable

1. Go to Lovable dashboard
2. Navigate to **Functions** section
3. Select function (`generate-questions` or `score-answers`)
4. View real-time logs
5. Check for errors or warnings

### Monitor Groq Usage

1. Go to https://console.groq.com
2. Check **Usage** section
3. Monitor API calls and token usage
4. Set up billing alerts if needed

## 🔐 Security Notes

### ⚠️ Important: .env File

**DO NOT commit your actual API keys to GitHub!**

The `.env` file should be in `.gitignore`. If you need to share the project:

1. Create `.env.example` with placeholder values:
```env
GROQ_API_KEY="your_groq_api_key_here"
VITE_SUPABASE_URL="your_supabase_url"
```

2. Keep your actual `.env` file local only

3. In Lovable dashboard, set environment variables securely

### Lovable Environment Variables

For production, set environment variables in Lovable dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add `GROQ_API_KEY` securely
4. This overrides `.env` file in production

## 🎯 Deployment Checklist

- [x] Edge functions created in `supabase/functions/`
- [ ] Groq API key added to `.env` (replace placeholder!)
- [ ] Code pushed to GitHub
- [ ] Lovable auto-deployment completed (wait 2-3 min)
- [ ] Functions verified in Lovable dashboard
- [ ] Test question generation works
- [ ] Test scoring works
- [ ] No console errors in browser
- [ ] No function errors in Lovable logs

## 💰 Cost Estimate

### Groq API
- **Free Tier**: Generous free credits to start
- **Paid**: ~$0.59 per 1M tokens
- **Per Test**: ~$0.002 (very affordable!)

### Lovable Cloud
- Includes Supabase backend
- Edge functions included
- Database included
- Check your Lovable plan for limits

## 🚀 Going Live

### Before Production Launch:

1. **Test thoroughly**
   - Generate questions for all qualification levels
   - Test all difficulty modes
   - Verify scoring accuracy
   - Check mobile responsiveness

2. **Set production environment variables**
   - Use Lovable dashboard (not .env)
   - Secure API keys
   - Enable rate limiting if needed

3. **Monitor performance**
   - Check function execution times
   - Monitor Groq API usage
   - Watch for errors in logs

4. **Set up alerts**
   - Groq API usage alerts
   - Function error alerts
   - Database usage alerts

## 📞 Need Help?

### Lovable Support
- Check Lovable documentation
- Contact Lovable support team
- Check Lovable community forums

### Groq Support
- Visit https://console.groq.com/docs
- Check API status page
- Contact Groq support

### Project Issues
- Check function logs in Lovable dashboard
- Review browser console errors
- Verify environment variables
- Test with different configurations

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Push to GitHub completes
- ✅ Lovable shows successful deployment
- ✅ Functions appear in Lovable dashboard
- ✅ Questions generate in under 5 seconds
- ✅ All 15 questions have proper scenarios
- ✅ Scoring completes in under 6 seconds
- ✅ Results display correctly
- ✅ No errors in browser console
- ✅ No errors in Lovable function logs

## 🎉 You're Ready!

Once you've:
1. ✅ Added your Groq API key to `.env`
2. ✅ Pushed to GitHub
3. ✅ Waited for Lovable deployment
4. ✅ Tested the system

Your AI Paper Assessment is **LIVE** and ready to rank minds! 🧠⚡

---

**GitHub Repo**: https://github.com/aryantyagi2211/mind-ranker.git
**Deployment**: Lovable Cloud (Auto)
**Status**: Ready for Production 🚀
