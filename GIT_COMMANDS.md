# 🔧 Git Commands for Deployment

## 📝 Before You Start

1. **Add your Groq API key to `.env` file**
   ```env
   GROQ_API_KEY="your_actual_groq_api_key_here"
   ```
   Get it from: https://console.groq.com/keys

2. **Make sure you're in the project directory**
   ```bash
   cd mind-ranker-main
   ```

## 🚀 Push to GitHub (First Time)

```bash
# Initialize git (if not already done)
git init

# Add your GitHub remote
git remote add origin https://github.com/aryantyagi2211/mind-ranker.git

# Check current branch
git branch

# If not on main, create and switch to main
git checkout -b main

# Stage all files
git add .

# Commit with message
git commit -m "Add AI Paper Assessment System with Groq integration"

# Push to GitHub
git push -u origin main
```

## 🔄 Update After Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Update AI paper assessment features"

# Push to GitHub
git push origin main
```

## 📥 Pull Latest Changes

```bash
# Pull latest from GitHub
git pull origin main
```

## 🔍 Check Status

```bash
# See what files changed
git status

# See commit history
git log --oneline

# See remote URL
git remote -v
```

## ⚠️ Common Issues & Solutions

### Issue: "fatal: remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add it again
git remote add origin https://github.com/aryantyagi2211/mind-ranker.git
```

### Issue: "Updates were rejected"
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue: "Please tell me who you are"
```bash
# Set your git identity
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### Issue: Merge conflicts
```bash
# See conflicted files
git status

# After fixing conflicts manually
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

## 🎯 Quick Deploy Workflow

```bash
# 1. Make sure you're in the right directory
cd mind-ranker-main

# 2. Check what changed
git status

# 3. Stage everything
git add .

# 4. Commit
git commit -m "Deploy AI Paper Assessment System"

# 5. Push to GitHub (Lovable auto-deploys!)
git push origin main

# 6. Wait 2-3 minutes for Lovable to deploy

# 7. Test at http://localhost:5173/test/setup
npm run dev
```

## 📋 Deployment Checklist

Before pushing:
- [ ] Groq API key added to `.env`
- [ ] All files saved
- [ ] No syntax errors
- [ ] Tested locally with `npm run dev`

After pushing:
- [ ] Check GitHub repo for new commits
- [ ] Wait 2-3 minutes for Lovable deployment
- [ ] Check Lovable dashboard for deployment status
- [ ] Test the live application
- [ ] Check function logs for errors

## 🔐 Security Reminder

**NEVER commit sensitive data!**

Make sure `.gitignore` includes:
```
.env
.env.local
.env.production
node_modules/
dist/
```

If you accidentally committed `.env`:
```bash
# Remove from git but keep locally
git rm --cached .env

# Add to .gitignore
echo ".env" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove .env from git"
git push origin main

# Rotate your API keys immediately!
```

## 🎉 Success!

Once pushed, Lovable will:
1. ✅ Detect your changes
2. ✅ Deploy edge functions automatically
3. ✅ Set up environment variables
4. ✅ Make your app live

Check Lovable dashboard to confirm deployment! 🚀

---

**GitHub Repo**: https://github.com/aryantyagi2211/mind-ranker.git
**Branch**: main
**Auto-Deploy**: Lovable Cloud ✨
