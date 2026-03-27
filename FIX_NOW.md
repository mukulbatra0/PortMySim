# ⚡ QUICK FIX - Module Not Found Error

## The Problem
Railway can't find `dotenv` and other modules because dependencies aren't installed.

## The Solution (3 Steps)

---

### Step 1: Push Updated Config Files (30 seconds)

I've already updated the config files. Just commit and push:

```bash
git add .
git commit -m "Fix Railway build configuration"
git push
```

---

### Step 2: Configure Railway Settings (1 minute)

**This is the most important step!**

1. Go to your Railway dashboard
2. Click on your **main service** (the one with your code, NOT MongoDB)
3. Click **"Settings"** tab
4. Scroll down to find **"Build"** or **"Deploy"** section
5. Set these values:

   **Build Command:**
   ```
   cd backend && npm install
   ```

   **Start Command:**
   ```
   cd backend && npm start
   ```

6. The settings save automatically

---

### Step 3: Redeploy (2 minutes)

Railway will automatically redeploy after you push, OR:

1. Go to **"Deployments"** tab
2. Click the **three dots** (⋮) on the latest deployment
3. Click **"Redeploy"**

---

## Watch the Logs

1. Go to **"Deployments"** tab
2. Click on the active deployment
3. You should see:

```
✓ cd backend && npm install
✓ added 150+ packages
✓ Server running at http://localhost:5000
✓ Database connected
```

---

## Test Your App

Visit: `https://your-app-name.up.railway.app/api/health/check`

You should see:
```json
{
  "success": true,
  "status": "ok",
  "message": "API server is running"
}
```

---

## Still Not Working?

### Check These:

1. **Build Command is set correctly**
   - Go to Settings → Build Command
   - Should be: `cd backend && npm install`

2. **Start Command is set correctly**
   - Go to Settings → Start Command
   - Should be: `cd backend && npm start`

3. **Environment Variables are set**
   - Go to Variables tab
   - Check MONGODB_URI, PORT, NODE_ENV, JWT_SECRET are all there

4. **MongoDB is running**
   - Check MongoDB service has green status
   - Copy MONGO_URL and verify it's in MONGODB_URI variable

---

## Alternative: Use Railway CLI

If you prefer command line:

```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Redeploy
railway up
```

---

## What We Fixed

✅ Updated `nixpacks.toml` - Proper dependency installation
✅ Updated `Procfile` - Install deps before starting
✅ Created `railway.toml` - Railway-specific config

Now Railway knows to:
1. Install backend dependencies first
2. Then start the server
3. All modules will be available

---

## Success! 🎉

Once you see "Server running" in the logs, your app is live!

Test it at: `https://your-app-name.up.railway.app`

---

**Need more help?** Check `RAILWAY_FIX.md` for detailed troubleshooting.
