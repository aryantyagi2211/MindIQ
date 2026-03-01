# 🔍 Troubleshooting: Blank Screen Issue

## 🐛 Problem
When clicking "ASSESSMENT PAPER", only the background shows (blank screen).

## 🔎 Likely Causes

### 1. Edge Functions Not Deployed Yet ⏳
**Most Likely Cause**: Lovable is still deploying the edge functions.

**Why**: 
- You just pushed to GitHub
- Lovable needs 2-3 minutes to deploy
- Edge functions (`generate-questions`) not available yet

**Solution**: Wait 2-3 minutes and try again

### 2. Edge Function Error 🚫
The `generate-questions` function might be failing.

**Check**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### 3. Groq API Key Issue 🔑
The API key might not be accessible to edge functions.

**Why**: 
- Edge functions run on Lovable Cloud
- They need the GROQ_API_KEY from Lovable environment
- Local .env file doesn't affect deployed functions

## ✅ Quick Fixes

### Fix 1: Check Browser Console

1. Open your browser
2. Press F12 (DevTools)
3. Go to Console tab
4. Click "ASSESSMENT PAPER" again
5. Look for error messages

**Common errors:**
- `Failed to generate questions` - Edge function not deployed
- `404 Not Found` - Function not available yet
- `CORS error` - Function configuration issue
- `No content received` - Groq API issue

### Fix 2: Check Lovable Dashboard

1. Go to your Lovable dashboard
2. Check deployment status
3. Look for edge functions:
   - `generate-questions` should be listed
   - `score-answers` should be listed
4. Check deployment logs for errors

### Fix 3: Set Groq API Key in Lovable

**IMPORTANT**: The `.env` file only works locally!

For production (Lovable Cloud), you need to:

1. Go to Lovable Dashboard
2. Navigate to Project Settings
3. Go to Environment Variables
4. Add: `GROQ_API_KEY` = your_key
5. Save and redeploy

### Fix 4: Test Locally First

Since edge functions need to be deployed, let's test if the issue is local or deployment:

**Check if it's a local issue:**
```
1. Is the dev server running? ✅
2. Can you access http://localhost:8080/test/setup? ✅
3. Does the setup page load correctly? ✅
4. When you click the button, what happens?
```

## 🧪 Debug Steps

### Step 1: Open Browser Console
```
1. Open http://localhost:8080/test/setup
2. Press F12
3. Go to Console tab
4. Click "ASSESSMENT PAPER"
5. Read the error message
```

### Step 2: Check Network Tab
```
1. In DevTools, go to Network tab
2. Click "ASSESSMENT PAPER"
3. Look for failed requests (red)
4. Click on the failed request
5. Check the error response
```

### Step 3: Check Function Logs
```
1. Go to Lovable Dashboard
2. Navigate to Functions
3. Click on "generate-questions"
4. View logs
5. Look for errors
```

## 🔧 Expected Behavior

### What Should Happen:
1. Click "ASSESSMENT PAPER"
2. Navigate to `/test/take`
3. Show loading screen:
   - Animated brain icon
   - "AI is Compiling Your Paper..."
   - Progress bar
4. After 3-5 seconds, show first question

### What's Happening Now:
1. Click "ASSESSMENT PAPER"
2. Navigate to `/test/take`
3. Blank screen (only background)
4. No loading screen
5. No error message visible

## 💡 Most Likely Solution

**The edge functions aren't deployed yet!**

### What to do:
1. **Wait 2-3 minutes** for Lovable deployment
2. **Check Lovable dashboard** for deployment status
3. **Try again** once deployment completes

### How to verify deployment:
```
1. Go to Lovable Dashboard
2. Check "Deployments" section
3. Look for latest deployment
4. Status should be "Success"
5. Edge functions should be listed
```

## 🚨 If Still Not Working

### Check 1: Groq API Key in Lovable
The key in your local `.env` file doesn't work for deployed functions!

**Set it in Lovable:**
1. Lovable Dashboard → Settings
2. Environment Variables
3. Add `GROQ_API_KEY`
4. Paste your key
5. Save

### Check 2: Function Deployment
```bash
# Check if functions are deployed
# In Lovable Dashboard:
- Functions → generate-questions → Status
- Functions → score-answers → Status
```

### Check 3: Test with Mock Data
Let me create a test version that shows what's happening...

## 📞 Get Error Details

To help debug, please:

1. **Open browser console** (F12)
2. **Click "ASSESSMENT PAPER"**
3. **Copy any error messages**
4. **Check Network tab** for failed requests
5. **Share the error message**

Common error patterns:

**Error: "Failed to generate questions"**
→ Edge function not deployed or failing

**Error: "404 Not Found"**
→ Edge function not deployed yet

**Error: "CORS error"**
→ Function configuration issue

**Error: "No content received from AI"**
→ Groq API key issue

## ⏰ Timeline

- **0 min**: Pushed to GitHub ✅
- **0-2 min**: Lovable detecting changes ⏳
- **2-3 min**: Lovable deploying functions ⏳
- **3+ min**: Functions available ✅

**Current status**: Probably still deploying!

## 🎯 Action Plan

1. **Wait 2-3 minutes** from when you pushed
2. **Check Lovable dashboard** for deployment status
3. **Open browser console** to see errors
4. **Try again** once deployed
5. **Set GROQ_API_KEY in Lovable** if not already done

---

**Most likely**: Just need to wait for Lovable deployment! ⏳

Let me know what error you see in the browser console and I can help fix it! 🔧
