# 🔧 Troubleshooting Guide

## Tell Me Your Error!

Please provide these details so I can help:

### 1. What error message do you see?
```
[Paste the exact error message here]
```

### 2. Where do you see it?
- [ ] VS Code (red squiggly lines)
- [ ] Terminal when running `npm run dev`
- [ ] Terminal when running `npm run lint`
- [ ] Browser console (F12)
- [ ] Lovable dashboard

### 3. Which file has the error?
```
[File name and line number]
```

### 4. Have you done these steps?
- [ ] Added real Groq API key to `.env` file
- [ ] Ran `npm install`
- [ ] Pushed code to GitHub
- [ ] Waited for Lovable deployment (2-3 min)

## Quick Fixes

### If you see: "Cannot find module 'https://deno.land...'"
**This is NORMAL!** These are Deno edge functions. Ignore these errors - they work when deployed to Lovable Cloud.

### If you see: "GROQ_API_KEY is not defined"
1. Open `.env` file
2. Replace `gsk_your_actual_groq_api_key_here` with your real key
3. Get key from: https://console.groq.com/keys

### If you see: "Failed to generate questions"
1. Check Groq API key in `.env`
2. Push to GitHub: `git push origin main`
3. Wait 2-3 minutes for Lovable deployment
4. Try again

### If you see: "Unexpected any" or TypeScript errors
Run this to see only critical errors:
```bash
npm run lint 2>&1 | grep "Error:" | grep -E "(TestTake|TestResult|TestSetup|generate-questions|score-answers)"
```

## Run These Commands

```bash
# Check if Node modules are installed
ls node_modules | wc -l

# Should show a number > 100

# Check if files exist
ls supabase/functions/generate-questions/index.ts
ls supabase/functions/score-answers/index.ts

# Should show the files

# Try to start dev server
npm run dev
```

## Common Scenarios

### Scenario A: Linting Errors (npm run lint)
If you see many errors from `npm run lint`, most are pre-existing in other files. The AI Paper Assessment files (TestTake, TestResult, TestSetup, generate-questions, score-answers) should have minimal errors.

**Deno errors are expected and can be ignored.**

### Scenario B: Runtime Errors (Browser Console)
1. Start dev server: `npm run dev`
2. Open browser: http://localhost:5173/test/setup
3. Open console: Press F12
4. Look for red errors
5. Copy the error message

### Scenario C: Build Errors
If `npm run dev` won't start:
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Scenario D: Function Errors
If questions won't generate:
1. Check `.env` has real Groq API key
2. Push to GitHub
3. Check Lovable dashboard for deployment
4. Check Lovable function logs for errors

## Still Stuck?

Please provide:
1. **Exact error message** (copy/paste)
2. **File name** where error occurs
3. **What you were doing** when error appeared
4. **Screenshot** if possible

I'll help you fix it immediately! 🚀

## Quick Test

Run this to test if everything is set up:

```bash
# Should show your Groq API key (not the placeholder)
cat .env | grep GROQ_API_KEY

# Should start without errors
npm run dev
```

If both work, you're ready to test in browser!
