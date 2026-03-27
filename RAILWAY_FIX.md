# 🔧 Railway Deployment Fix

## Problem
Railway wasn't installing backend dependencies, causing `ERR_MODULE_NOT_FOUND` errors.

## Solution Applied

I've updated the configuration files. Now follow these steps:

---

## Step 1: Commit and Push Changes

```bash
git add .
git commit -m "Fix Railway build configuration"
git push
```

Railway will automatically redeploy with the new configuration.

---

## Step 2: Manual Railway Configuration (Important!)

Go to your Railway project and configure these settings:

### In Railway Dashboard:

1. Click on your **main service** (not MongoDB)
2. Go to **"Settings"** tab
3. Scroll to **"Build"** section
4. Set these values:

**Root Directory:**
```
/
```

**Build Command:**
```
cd backend && npm install
```

**Start Command:**
```
cd backend && npm start
```

4. Click **"Save"** or the changes will apply automatically

---

## Step 3: Redeploy

After saving settings:

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
   
   OR
   
   Just push your code changes and Railway will auto-deploy

---

## Step 4: Verify Deployment

Watch the build logs:

1. Go to **"Deployments"** tab
2. Click on the active deployment
3. Watch for these success messages:

```
✓ Installing dependencies...
✓ cd backend && npm install
✓ added XXX packages
✓ Starting server...
✓ Server running at http://localhost:5000
✓ Database connected
```

---

## Alternative: Use Railway CLI

If you have Railway CLI installed:

```bash
# Login
railway login

# Link to your project
railway link

# Set build command
railway variables set BUILD_COMMAND="cd backend && npm install"

# Set start command  
railway variables set START_COMMAND="cd backend && npm start"

# Redeploy
railway up
```

---

## What Changed?

### Updated Files:

1. **nixpacks.toml** - Fixed install phase to only install backend deps
2. **Procfile** - Added npm install before start
3. **railway.toml** - New file with proper build configuration

### Why This Fixes It:

The error happened because Railway was trying to run the app without installing the backend dependencies first. Now:

1. Railway installs dependencies in the `backend` folder
2. Then starts the server from the `backend` folder
3. All modules (dotenv, express, etc.) are available

---

## Quick Test

After redeployment, test these URLs:

```
Health Check: https://your-app.railway.app/api/health/check
```

You should see:
```json
{
  "success": true,
  "status": "ok",
  "message": "API server is running"
}
```

---

## Still Having Issues?

### Check Build Logs

1. Railway Dashboard → Deployments → Click deployment
2. Look for errors in the build phase
3. Common issues:

**"npm ERR! code ENOENT"**
→ Build command path is wrong
→ Fix: Ensure build command is `cd backend && npm install`

**"Cannot find module 'express'"**
→ Dependencies not installed
→ Fix: Check build logs, ensure npm install completed

**"Port already in use"**
→ Multiple instances running
→ Fix: Restart the service

---

## Environment Variables Check

Make sure these are set in Railway:

```
MONGODB_URI = <from MongoDB service>
PORT = 5000
NODE_ENV = production
JWT_SECRET = <your secret>
JWT_EXPIRE = 30d
```

---

## Need More Help?

1. Check Railway logs: Dashboard → Logs tab
2. Check build logs: Dashboard → Deployments → Click deployment
3. Railway Discord: https://discord.gg/railway
4. Railway Docs: https://docs.railway.app

---

## Summary

✅ Configuration files updated
✅ Push changes to GitHub
✅ Configure build/start commands in Railway
✅ Redeploy
✅ Test the deployment

Your app should now deploy successfully! 🚀
