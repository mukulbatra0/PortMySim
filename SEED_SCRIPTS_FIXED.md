# ✅ Seed Scripts Fixed!

All seed scripts have been converted from CommonJS to ES modules.

## What Was Fixed

All seed scripts were using `require()` syntax, but your project is configured as ES modules (`"type": "module"` in package.json).

### Files Updated:

1. ✅ `backend/scripts/seedDatabase.js` - Main seed orchestrator
2. ✅ `backend/scripts/seedPlans.js` - Seeds mobile plans
3. ✅ `backend/scripts/seedFAQs.js` - Seeds FAQ data
4. ✅ `backend/scripts/seedTelecomCircles.js` - Seeds telecom circles
5. ✅ `backend/scripts/seedNetworkCoverage.js` - Seeds network coverage
6. ✅ `backend/scripts/seedPortingRules.js` - Seeds porting rules
7. ✅ `backend/scripts/seedPortingCenters.js` - Seeds porting centers

## Changes Made

### Before (CommonJS):
```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const Model = require('../models/Model');
```

### After (ES Modules):
```javascript
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Model from '../models/Model.js';

dotenv.config();
```

## How to Use

### Commit and Push Changes:

```bash
git add .
git commit -m "Fix seed scripts for ES modules"
git push
```

### Seed Database Locally:

```bash
cd backend
npm run seed
```

### Seed Database on Railway:

**Option 1: Railway Dashboard**
1. Go to your main service
2. Click "Shell" tab
3. Run:
```bash
cd backend
npm run seed
```

**Option 2: Railway CLI**
```bash
railway run npm run seed --prefix backend
```

## Individual Seed Commands

You can also seed specific data:

```bash
# Seed all data
npm run seed

# Or seed individually:
npm run seed:plans
npm run seed:faqs
npm run seed:circles
npm run seed:coverage
npm run seed:porting-rules
npm run seed:porting-centers
```

## Expected Output

When seeding successfully, you should see:

```
Running seedPlans.js...
✅ Existing plans deleted
✅ 50 plans seeded successfully
✅ Seed operation completed

Running seedFAQs.js...
✅ Existing FAQs deleted
✅ 20 FAQs seeded successfully
✅ FAQ seed operation completed

Running seedTelecomCircles.js...
✅ Existing telecom circles deleted
✅ 22 telecom circles seeded successfully
✅ Telecom circles seed operation completed

✅ All data seeded successfully!
```

## Troubleshooting

### "Cannot find module"
- Make sure you're in the `backend` directory
- Run `npm install` first
- Check that all `.js` extensions are included in imports

### "Database connection failed"
- Check `MONGODB_URI` environment variable is set
- Verify MongoDB is running
- On Railway: Make sure MongoDB service is active

### "Module not found: dotenv"
- Run `npm install` in the backend directory
- Check `package.json` has dotenv in dependencies

## Next Steps

1. ✅ Commit and push changes
2. ✅ Railway will auto-deploy
3. ✅ Seed the database using Railway Shell or CLI
4. ✅ Test your app!

---

**All seed scripts are now compatible with ES modules! 🎉**
