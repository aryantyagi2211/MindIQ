# 🚀 MindIQ AI Paper Assessment - Deployment Guide

## 📋 Prerequisites

1. **Groq API Key**
   - Sign up at https://console.groq.com
   - Navigate to API Keys section
   - Create a new API key
   - Copy and save it securely

2. **Supabase Project**
   - Project ID: `vertjjkacwtfjliwckrf`
   - Already configured in `.env` file

## 🔧 Setup Steps

### Step 1: Configure Groq API Key in Supabase

#### Via Supabase Dashboard (Easiest):
1. Go to https://supabase.com/dashboard/project/vertjjkacwtfjliwckrf
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add new secret:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key
4. Click **Save**

#### Via Supabase CLI:
```bash
supabase secrets set GROQ_API_KEY=your_groq_api_key_here --project-ref vertjjkacwtfjliwckrf
```

### Step 2: Deploy Edge Functions

#### Option A: Via Lovable (Recommended)
Since this project is managed by Lovable:
1. Commit and push changes to GitHub:
   ```bash
   git add .
   git commit -m "Add AI paper assessment edge functions"
   git push origin main
   ```
2. Lovable will automatically detect and deploy the functions
3. Check deployment status in Lovable dashboard

#### Option B: Via Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref vertjjkacwtfjliwckrf

# Deploy both functions
supabase functions deploy generate-questions
supabase functions deploy score-answers
```

### Step 3: Verify Deployment

Test the functions using curl or Postman:

```bash
# Test generate-questions
curl -X POST https://vertjjkacwtfjliwckrf.supabase.co/functions/v1/generate-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "qualification": "High School",
    "stream": "Physics",
    "difficulty": "Standard"
  }'

# Test score-answers
curl -X POST https://vertjjkacwtfjliwckrf.supabase.co/functions/v1/score-answers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "questions": [],
    "answers": [],
    "timeData": []
  }'
```

Replace `YOUR_SUPABASE_ANON_KEY` with the value from `.env` file (`VITE_SUPABASE_PUBLISHABLE_KEY`).

## 🧪 Testing the Complete Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Test Setup:**
   - Go to http://localhost:5173/test/setup
   - Select qualification, difficulty, and stream
   - Click "ASSESSMENT PAPER"

3. **Verify Question Generation:**
   - Should see beautiful loading screen
   - Questions should load in 3-5 seconds
   - Each question should have a scenario section

4. **Complete the Test:**
   - Answer all 15 questions
   - Verify timer works correctly
   - Check auto-advance on answer selection

5. **Verify Results:**
   - Should see AI scoring in progress
   - Results should display with 5 dimension scores
   - Archetype report should be generated

## 🐛 Troubleshooting

### Issue: "Failed to generate questions"
**Solutions:**
- Check if GROQ_API_KEY is set correctly in Supabase secrets
- Verify Groq API key is valid and has credits
- Check Supabase function logs for detailed errors

### Issue: "No content received from AI"
**Solutions:**
- Groq API might be rate-limited
- Check Groq dashboard for API usage
- Verify the model name is correct: `llama-3.3-70b-versatile`

### Issue: Functions not deploying
**Solutions:**
- Ensure you're logged into Supabase CLI
- Check project reference is correct
- Verify you have deployment permissions

### Issue: CORS errors
**Solutions:**
- Functions already include CORS headers
- Check browser console for specific error
- Verify Supabase URL in `.env` is correct

## 📊 Monitoring

### Check Function Logs:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **Logs**
3. Select the function to view logs
4. Filter by time range and log level

### Monitor Groq Usage:
1. Go to https://console.groq.com
2. Check **Usage** section
3. Monitor API calls and token usage
4. Set up billing alerts if needed

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate API keys** periodically
4. **Monitor usage** to detect anomalies
5. **Set rate limits** in Groq dashboard

## 💰 Cost Estimation

### Groq Pricing (as of 2024):
- LLaMA 3.3 70B: ~$0.59 per 1M tokens
- Average question generation: ~2,000 tokens
- Average scoring: ~1,500 tokens
- **Cost per test**: ~$0.002 (very affordable!)

### Supabase:
- Edge Functions: Free tier includes 500K invocations/month
- Database: Free tier includes 500MB storage
- Should be sufficient for initial launch

## 🚀 Production Checklist

- [ ] Groq API key configured in Supabase
- [ ] Both edge functions deployed successfully
- [ ] Functions tested with sample data
- [ ] Error handling verified
- [ ] Loading states working correctly
- [ ] Results page displaying correctly
- [ ] Database schema matches expectations
- [ ] Monitoring and logging set up
- [ ] Rate limiting considered
- [ ] Backup strategy in place

## 📈 Scaling Considerations

When you reach higher traffic:
1. **Upgrade Groq plan** for higher rate limits
2. **Implement caching** for common question sets
3. **Add queue system** for peak load handling
4. **Monitor response times** and optimize prompts
5. **Consider CDN** for static assets

## 🆘 Support

If you encounter issues:
1. Check Supabase function logs
2. Check Groq API status page
3. Review this deployment guide
4. Check GitHub issues for similar problems
5. Contact support if needed

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Questions generate in under 5 seconds
- ✅ All 15 questions have proper scenarios
- ✅ Scoring completes in under 6 seconds
- ✅ 5 dimension scores are calculated
- ✅ Archetype report is generated
- ✅ Results save to database correctly
- ✅ No console errors in browser
- ✅ No function errors in Supabase logs

---

**Ready to launch!** 🚀 Follow these steps and your AI Paper Assessment System will be live and ready to rank minds!
