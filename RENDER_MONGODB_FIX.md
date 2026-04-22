# 🔧 Render MongoDB Connection Fix

## Your Connection Details:
- **Cluster:** `cluster0.vljmkqv.mongodb.net`
- **Username:** `berryrecipes`
- **Database:** `berryrecipes`

## ❌ Problem:
Render is still using local MongoDB (`127.0.0.1:27017`) instead of MongoDB Atlas

## ✅ Solution - Follow These Exact Steps:

### Step 1: Get Your Password
Go to MongoDB Atlas → Database Access → Your `berryrecipes` user
- If you don't remember the password, you can reset it

### Step 2: Complete Connection String Format
Your full connection string should be:
```
mongodb+srv://berryrecipes:PASSWORD_HERE@cluster0.vljmkqv.mongodb.net/berryrecipes?retryWrites=true&w=majority&appName=Cluster0
```

Replace `PASSWORD_HERE` with your actual password

### Step 3: Update Render Environment Variables
1. Go to: https://render.com
2. Find your Recipe App backend service
3. Click **Environment** (in left menu)
4. Find the `MONGODB_URI` variable
5. **Replace ENTIRE value** with your complete connection string
6. **Save changes**

### Step 4: Manual Deploy
1. Click **Manual Deploy** button
2. Wait 2-3 minutes
3. Check logs - should show: `✅ Connected to MongoDB`

### Step 5: Test
Visit your Render backend URL and go to: `/health/db`
Should show: `"connected": true`

## 🆘 Still Not Working?

Check in MongoDB Atlas:
1. **Network Access** → Your Render IP should be whitelisted
2. Click **Add IP Address** → Choose **Allow Access From Anywhere** (0.0.0.0/0)
3. Try again

## Important Notes:
- Make sure password has NO special characters that need URL encoding
- If it does, URL-encode them (e.g., @ becomes %40, # becomes %23)
- Test your connection string locally first if possible