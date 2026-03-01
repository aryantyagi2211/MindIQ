# 🚀 Quick Start Guide - MindIQ AI Paper Assessment

## ⚡ Get Running in 5 Minutes

### Step 1: Get Your Groq API Key (2 minutes)
1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `gsk_...`)

### Step 2: Configure Supabase (1 minute)
1. Go to https://supabase.com/dashboard/project/vertjjkacwtfjliwckrf/settings/functions
2. Click on **Edge Functions** → **Secrets**
3. Add new secret:
   - Name: `GROQ_API_KEY`
   - Value: Paste your Groq API key
4. Click **Save**

### Step 3: Deploy Functions (2 minutes)

#### Option A: Push to GitHub (Easiest)
```bash
git add .
git commit -m "Add AI paper assessment system"
git push origin main
```
Lovable will auto-deploy! ✨

#### Option B: Use Supabase CLI
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref vertjjkacwtfjliwckrf

# Deploy
supabase functions deploy generate-questions
supabase functions deploy score-answers
```

### Step 4: Test It! (30 seconds)
```bash
# Start dev server
npm run dev

# Open browser
# Go to: http://localhost:5173/test/setup
```

1. Select **High School**
2. Select **Standard** difficulty
3. Choose **Physics** (or any subject)
4. Click **ASSESSMENT PAPER**
5. Watch the magic happen! ✨

## 🎉 What You'll See

### 1. Beautiful Loading Screen
- Animated brain icon
- "AI is Compiling Your Paper..."
- Your configuration displayed
- Progress indicators

### 2. Case Study Questions
- Real-world scenario (3-5 sentences)
- Clear question based on scenario
- 4 multiple choice options
- Timer with color coding
- Auto-advance on selection

### 3. AI-Powered Results
- 5 cognitive dimension scores
- Percentile ranking
- Famous mind match
- Deep archetype report
- Share & challenge options

## 🐛 Troubleshooting

### "Failed to generate questions"
**Fix:** Check if GROQ_API_KEY is set in Supabase secrets

### Functions not found
**Fix:** Wait 1-2 minutes after deployment, then refresh

### Questions not loading
**Fix:** Check browser console for errors, verify API key is valid

## 📊 What's Included

✅ **2 Edge Functions:**
- `generate-questions` - Creates 15 unique MCQs
- `score-answers` - Evaluates 5 cognitive dimensions

✅ **3 Updated Pages:**
- `TestSetup.tsx` - Configuration with preview
- `TestTake.tsx` - Beautiful question interface
- `TestResult.tsx` - AI-powered insights

✅ **Documentation:**
- `AI_PAPER_IMPLEMENTATION.md` - Complete implementation details
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `supabase/functions/README.md` - Edge function documentation

## 💡 Pro Tips

1. **Test with different configurations:**
   - Try all qualification levels
   - Test each difficulty mode
   - Experiment with different subjects

2. **Monitor your usage:**
   - Check Groq dashboard for API calls
   - Each test costs ~$0.002 (very cheap!)
   - Free tier is generous

3. **Customize the prompts:**
   - Edit `generate-questions/index.ts` for different question styles
   - Modify `score-answers/index.ts` for different scoring criteria
   - Adjust temperature for more/less creativity

## 🎯 Next Steps

1. ✅ Deploy and test the system
2. 📊 Monitor initial usage
3. 🎨 Customize UI to your brand
4. 🚀 Launch to users!
5. 📈 Gather feedback and iterate

## 📞 Need Help?

- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- Review `AI_PAPER_IMPLEMENTATION.md` for technical details
- Check Supabase function logs for errors
- Verify Groq API status

## 🎊 You're Ready!

Your AI Paper Assessment System is now fully functional and ready to rank minds! 🧠⚡

**Estimated Setup Time:** 5 minutes
**Cost per Test:** ~$0.002
**Questions per Test:** 15 unique MCQs
**Cognitive Dimensions:** 5 (Logic, Creativity, Intuition, EQ, Systems Thinking)

Happy testing! 🚀
