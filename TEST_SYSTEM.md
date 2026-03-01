# 🧪 Test Your AI Paper Assessment System

## Quick Test Guide

### Step 1: Check Your Groq API Key

Open `.env` file and verify you have your actual Groq API key:
```env
GROQ_API_KEY=gsk_your_actual_key_here
```

If it still says `gsk_your_actual_groq_api_key_here`, you need to replace it with your real key from https://console.groq.com/keys

### Step 2: Start Development Server

```bash
cd mind-ranker-main
npm run dev
```

The server should start at `http://localhost:5173`

### Step 3: Test the Flow

1. **Open browser**: Go to `http://localhost:5173/test/setup`

2. **Configure test**:
   - Select: High School
   - Select: Standard
   - Select: Physics (or any subject)

3. **Click**: "ASSESSMENT PAPER" button

4. **Expected behavior**:
   - Should show beautiful loading screen
   - "AI is Compiling Your Paper..."
   - After 3-5 seconds, questions should appear

### What Errors Are You Seeing?

Please tell me which of these you're experiencing:

#### A. TypeScript/Linting Errors in IDE
**Symptoms**: Red squiggly lines in VS Code, errors in terminal when running `npm run lint`

**Solution**: 
- If errors are in `supabase/functions/*.ts` files → These are expected Deno errors, ignore them
- If errors are in other files (BattleArena, etc.) → These are pre-existing, not related to new features
- If errors are in TestTake.tsx or TestResult.tsx → Let me know the specific error

#### B. Runtime Errors in Browser
**Symptoms**: Errors in browser console, app crashes, blank screen

**Common causes**:
1. **Groq API key not set** → Check `.env` file
2. **Functions not deployed** → Need to push to GitHub first
3. **Network error** → Check browser console for details

**To check**:
- Open browser console (F12)
- Look for red error messages
- Tell me what the error says

#### C. Function Deployment Errors
**Symptoms**: "Failed to generate questions", "Function not found"

**Solution**:
1. Push code to GitHub
2. Wait 2-3 minutes for Lovable to deploy
3. Check Lovable dashboard for deployment status

#### D. Build Errors
**Symptoms**: `npm run dev` fails to start, build errors

**To check**:
```bash
npm run dev
```

Copy and paste the error message you see.

## 🔍 Diagnostic Commands

Run these to help me understand the issue:

### Check if files exist:
```bash
ls supabase/functions/generate-questions/
ls supabase/functions/score-answers/
```

### Check TypeScript compilation:
```bash
npx tsc --noEmit
```

### Check for syntax errors:
```bash
npm run lint -- --max-warnings=999
```

## 📋 Common Issues & Solutions

### Issue 1: "Cannot find module 'https://deno.land...'"
**This is NOT an error!** 
- These are Deno edge functions
- They run on Lovable Cloud, not locally
- Your IDE shows this because it uses Node.js TypeScript
- **Solution**: Ignore these, they work when deployed

### Issue 2: "Failed to generate questions"
**Cause**: Groq API key not set or functions not deployed

**Solution**:
1. Check `.env` has real Groq API key
2. Push to GitHub: `git push origin main`
3. Wait for Lovable deployment
4. Try again

### Issue 3: "Unexpected any" errors
**Cause**: ESLint strict mode

**Solution**: These are warnings, not blocking errors. The code will still work.

### Issue 4: React Hooks warnings
**Cause**: Missing dependencies in useEffect

**Solution**: Already fixed in the code. If you still see them, they're in other files (not AI Paper Assessment).

## 🎯 What to Tell Me

To help you better, please provide:

1. **What command are you running?**
   - `npm run dev`?
   - `npm run lint`?
   - `npm run build`?

2. **What error message do you see?**
   - Copy the exact error text
   - Include the file name and line number

3. **Where do you see the error?**
   - In VS Code (red squiggles)?
   - In terminal?
   - In browser console?
   - In Lovable dashboard?

4. **Have you added your Groq API key?**
   - Yes, added to `.env`
   - No, still using placeholder
   - Not sure

5. **Have you pushed to GitHub?**
   - Yes, pushed and Lovable deployed
   - Yes, pushed but waiting for deployment
   - No, not pushed yet

## ✅ Expected Behavior

When everything works correctly:

1. **npm run dev** → Starts without errors
2. **Browser** → No console errors
3. **Test Setup page** → Loads correctly
4. **Click button** → Shows loading screen
5. **After 3-5 sec** → Questions appear
6. **Answer questions** → Auto-advances
7. **After 15 questions** → Results page shows

## 🆘 Still Having Issues?

Please provide:
- Screenshot of the error
- Copy of error message
- Which step is failing
- What you've tried so far

I'll help you fix it! 💪
