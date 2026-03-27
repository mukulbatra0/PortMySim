# Railway Deployment Helper Script for Windows
# This script helps you deploy PortMySim to Railway

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║        🚂 Railway Deployment Helper for PortMySim           ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to generate JWT secret
function Generate-JWTSecret {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    $secret = -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $secret
}

# Check if git is initialized
Write-Host "📋 Step 1: Checking Git status..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "   ⚠️  Git not initialized. Initializing..." -ForegroundColor Red
    git init
    Write-Host "   ✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "   ✅ Git already initialized" -ForegroundColor Green
}

Write-Host ""

# Check for uncommitted changes
Write-Host "📋 Step 2: Checking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "   ⚠️  You have uncommitted changes" -ForegroundColor Red
    Write-Host ""
    $commit = Read-Host "   Would you like to commit all changes? (y/n)"
    if ($commit -eq "y") {
        git add .
        $message = Read-Host "   Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($message)) {
            $message = "Ready for Railway deployment"
        }
        git commit -m $message
        Write-Host "   ✅ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ No uncommitted changes" -ForegroundColor Green
}

Write-Host ""

# Check for GitHub remote
Write-Host "📋 Step 3: Checking GitHub remote..." -ForegroundColor Yellow
$remote = git remote -v
if (-not $remote) {
    Write-Host "   ⚠️  No GitHub remote found" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please follow these steps:" -ForegroundColor Cyan
    Write-Host "   1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "   2. Create a new repository (e.g., 'portmysim')" -ForegroundColor White
    Write-Host "   3. Don't initialize with README" -ForegroundColor White
    Write-Host ""
    $repoUrl = Read-Host "   Enter your GitHub repository URL (e.g., https://github.com/username/portmysim.git)"
    if ($repoUrl) {
        git remote add origin $repoUrl
        git branch -M main
        Write-Host "   ✅ Remote added" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ GitHub remote configured" -ForegroundColor Green
}

Write-Host ""

# Push to GitHub
Write-Host "📋 Step 4: Pushing to GitHub..." -ForegroundColor Yellow
$push = Read-Host "   Push to GitHub now? (y/n)"
if ($push -eq "y") {
    try {
        git push -u origin main
        Write-Host "   ✅ Pushed to GitHub successfully" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Push failed. You may need to authenticate or check your remote URL" -ForegroundColor Red
    }
}

Write-Host ""

# Generate JWT Secret
Write-Host "📋 Step 5: Generating JWT Secret..." -ForegroundColor Yellow
$jwtSecret = Generate-JWTSecret
Write-Host "   ✅ JWT Secret generated" -ForegroundColor Green
Write-Host ""
Write-Host "   Your JWT_SECRET: " -NoNewline -ForegroundColor Cyan
Write-Host $jwtSecret -ForegroundColor White
Write-Host "   (Copy this for Railway environment variables)" -ForegroundColor Gray
Write-Host ""

# Railway CLI check
Write-Host "📋 Step 6: Checking Railway CLI..." -ForegroundColor Yellow
$railwayCli = Get-Command railway -ErrorAction SilentlyContinue
if ($railwayCli) {
    Write-Host "   ✅ Railway CLI installed" -ForegroundColor Green
    Write-Host ""
    $loginRailway = Read-Host "   Login to Railway now? (y/n)"
    if ($loginRailway -eq "y") {
        railway login
    }
} else {
    Write-Host "   ⚠️  Railway CLI not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "   To install Railway CLI, run:" -ForegroundColor Cyan
    Write-Host "   npm install -g @railway/cli" -ForegroundColor White
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║                    ✅ PREPARATION COMPLETE!                  ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to https://railway.app" -ForegroundColor White
Write-Host "2. Click 'Start a New Project'" -ForegroundColor White
Write-Host "3. Select 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "4. Choose your portmysim repository" -ForegroundColor White
Write-Host "5. Add MongoDB database (New → Database → MongoDB)" -ForegroundColor White
Write-Host "6. Add environment variables:" -ForegroundColor White
Write-Host ""
Write-Host "   Required Variables:" -ForegroundColor Yellow
Write-Host "   MONGODB_URI = <copy from MongoDB service>" -ForegroundColor Gray
Write-Host "   PORT = 5000" -ForegroundColor Gray
Write-Host "   NODE_ENV = production" -ForegroundColor Gray
Write-Host "   JWT_SECRET = $jwtSecret" -ForegroundColor Gray
Write-Host "   JWT_EXPIRE = 30d" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Generate domain (Settings → Domains → Generate Domain)" -ForegroundColor White
Write-Host "8. Seed database: railway run npm run seed --prefix backend" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - QUICK_START.md (10-minute guide)" -ForegroundColor White
Write-Host "   - RAILWAY_DEPLOYMENT_GUIDE.md (complete guide)" -ForegroundColor White
Write-Host "   - DEPLOYMENT_CHECKLIST.md (verification checklist)" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Good luck with your deployment! 🚀" -ForegroundColor Green
Write-Host ""

# Save JWT secret to a file for reference
$jwtSecret | Out-File -FilePath "jwt-secret.txt" -Encoding UTF8
Write-Host "💾 JWT Secret saved to jwt-secret.txt (don't commit this file!)" -ForegroundColor Yellow
Write-Host ""

# Pause to let user read
Read-Host "Press Enter to exit"
