# 🚀 Quick Start - Deploy to Railway in 10 Minutes

Follow these steps to get your PortMySim app live on Railway quickly!

## ✅ Pre-Deployment Checklist

- [ ] Code is working locally
- [ ] GitHub account created
- [ ] Railway account created (free)
- [ ] All sensitive data removed from code

---

## Step 1: Push to GitHub (2 minutes)

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/portmysim.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy on Railway (3 minutes)

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **portmysim** repository
5. Railway starts building automatically ✨

---

## Step 3: Add MongoDB (1 minute)

1. In your project, click **"New"** → **"Database"** → **"Add MongoDB"**
2. MongoDB is provisioned automatically
3. Click on MongoDB service
4. Copy the **MONGO_URL** (looks like: `mongodb://mongo:...`)

---

## Step 4: Configure Environment Variables (2 minutes)

1. Click on your **main service** (not MongoDB)
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add these:

### Minimum Required Variables:

```
MONGODB_URI = <paste MONGO_URL from step 3>
PORT = 5000
   NODE_ENV = production
   JWT_SECRET = <generate random string - see below>
   JWT_EXPIRE = 30d
```

### Generate JWT_SECRET:
**Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Or use this online:** https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

4. Click **"Add"** for each variable

---

## Step 5: Get Your Live URL (1 minute)

1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy your URL: `https://your-app-name.up.railway.app`

🎉 **Your app is now LIVE!**

---

## Step 6: Seed Database (1 minute)

### Option A: Using Railway Dashboard
1. Click on your service
2. Go to **"Shell"** tab (terminal icon)
3. Run:
```bash
cd backend
npm run seed
```

### Option B: Using Railway CLI
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Seed database
railway run npm run seed --prefix backend
```

---

## 🧪 Test Your Deployment

Visit these URLs (replace with your Railway URL):

1. **Homepage**: `https://your-app.railway.app/`
2. **Health Check**: `https://your-app.railway.app/api/health/check`
3. **Plans API**: `https://your-app.railway.app/api/plans`

---

## 🎯 What's Next?

### Optional but Recommended:

1. **Add Email Service** (for notifications):
   ```
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_USER = your_email@gmail.com
   EMAIL_PASSWORD = your_app_password
   EMAIL_FROM = support@portmysim.com
   ```

2. **Custom Domain** (if you have one):
   - Settings → Domains → Custom Domain
   - Add CNAME record in your DNS

3. **Monitor Your App**:
   - Check "Logs" tab for any errors
   - Monitor "Metrics" for performance

---

## 🐛 Common Issues & Fixes

### "Application Error" or 500 Error
- Check **Logs** tab for error details
- Verify all environment variables are set
- Ensure MongoDB is running

### "Cannot connect to database"
- Verify `MONGODB_URI` is correct
- Check MongoDB service is active
- Try restarting both services

### Frontend shows but API doesn't work
- Check if backend deployed successfully
- Verify domain is generated
- Test health endpoint: `/api/health/check`

### Build Failed
- Check **Deployments** tab for build logs
- Verify `package.json` is correct
- Ensure all dependencies are listed

---

## 📊 Railway Free Tier Limits

- ✅ $5 credit per month
- ✅ 500 execution hours
- ✅ 512MB RAM
- ✅ 1GB disk space
- ✅ Unlimited projects

**This is enough for development and small production apps!**

---

## 🆘 Need Help?

1. **Check Full Guide**: See `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed instructions
2. **Railway Docs**: https://docs.railway.app
3. **Railway Discord**: https://discord.gg/railway
4. **Check Logs**: Always check the Logs tab first

---

## 🎉 Success Checklist

- [ ] App deployed on Railway
- [ ] MongoDB connected
- [ ] Environment variables set
- [ ] Database seeded
- [ ] Domain generated
- [ ] Homepage loads
- [ ] API health check works
- [ ] Can view plans
- [ ] Can register/login

---

## 📝 Important Commands

```bash
# View logs
railway logs

# Run commands in Railway environment
railway run <command>

# Restart service
railway restart

# Open in browser
railway open
```

---

## 🔐 Security Reminders

- ✅ Never commit `.env` files
- ✅ Use strong JWT_SECRET
- ✅ Keep dependencies updated
- ✅ Use environment variables for all secrets
- ✅ Enable 2FA on Railway account

---

**Congratulations! Your PortMySim app is now live! 🚀**

Share your Railway URL and start helping users port their numbers!

---

**Deployment Time**: ~10 minutes  
**Cost**: FREE (Railway free tier)  
**Difficulty**: Easy ⭐⭐☆☆☆
