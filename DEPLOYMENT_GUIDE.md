# 🚀 FREE DEPLOYMENT GUIDE - Recipe Sharing App

**Date:** April 16, 2026  
**Status:** Ready for Deployment ✅

---

## 🎯 DEPLOYMENT OVERVIEW

Your Recipe Sharing App will be deployed using:
- **Backend:** Render.com (Free tier)
- **Frontend:** Vercel (Free tier)
- **Database:** MongoDB Atlas (Free tier)

**Total Cost:** $0/month  
**Time Required:** ~45 minutes

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ What You Need
- [x] GitHub repository: https://github.com/MUHEEZ12/Berry-s-Recipe-Platform
- [ ] MongoDB Atlas account (free)
- [ ] Render.com account (free)
- [ ] Vercel account (free)

### ✅ Environment Variables Ready
- [x] Backend: MONGO_URI, JWT_SECRET, PORT
- [x] Frontend: VITE_API_URL

---

## 1️⃣ SETUP MONGODB ATLAS (Database)

### Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **Try Free**
3. Sign up with email
4. Verify email

### Step 2: Create Cluster
1. Choose **FREE** tier (M0 Sandbox)
2. Select **AWS** + **N. Virginia** region
3. Cluster name: `berryrecipes`
4. Click **Create Cluster** (takes 5-10 minutes)

### Step 3: Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Username: `berryuser`
3. Password: `berrypass123` (or your choice)
4. Built-in Role: **Read and write to any database**
5. Click **Add User**

### Step 4: Get Connection String
1. Go to **Clusters** → **Connect**
2. Choose **Connect your application**
3. Driver: **Node.js**
4. Version: **3.6 or later**
5. Copy the connection string:
   ```
   mongodb+srv://berryuser:berrypass123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

**Save this URL!** You'll need it for deployment.

---

## 2️⃣ DEPLOY BACKEND TO RENDER.COM

### Step 1: Create Render Account
1. Go to: https://render.com
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2: Create New Web Service
1. Click **New** → **Web Service**
2. Connect your GitHub repo: `MUHEEZ12/Berry-s-Recipe-Platform`
3. **Root Directory:** `Backend/server`
4. **Environment:** `Node`
5. **Build Command:** `npm install`
6. **Start Command:** `npm start`

### Step 3: Add Environment Variables
In Render dashboard, go to your service → **Environment**:

```
MONGO_URI=mongodb+srv://berryuser:berrypass123@cluster0.xxxxx.mongodb.net/berryrecipes?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
PORT=10000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 4: Deploy
1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. Get your backend URL: `https://your-app-name.onrender.com`

**Save this URL!** You'll need it for frontend.

---

## 3️⃣ DEPLOY FRONTEND TO VERCEL

### Step 1: Create Vercel Account
1. Go to: https://vercel.com
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2: Import Project
1. Click **New Project**
2. Import from GitHub: `MUHEEZ12/Berry-s-Recipe-Platform`
3. **Root Directory:** `./` (leave empty)
4. **Framework Preset:** `Vite`
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`

### Step 3: Add Environment Variable
In Vercel dashboard, go to your project → **Settings** → **Environment Variables**:

```
VITE_API_URL=https://your-render-backend.onrender.com/api
```

### Step 4: Deploy
1. Click **Deploy**
2. Wait 2-3 minutes
3. Get your frontend URL: `https://your-app-name.vercel.app`

---

## 4️⃣ UPDATE BACKEND WITH FRONTEND URL

### In Render Dashboard:
1. Go to your backend service
2. **Environment** → Update:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
3. Click **Save** and redeploy

---

## 5️⃣ TEST YOUR LIVE APP

### URLs You'll Have:
- **Frontend:** `https://your-app-name.vercel.app`
- **Backend:** `https://your-app-name.onrender.com`
- **Database:** MongoDB Atlas (cloud)

### Test Checklist:
- [ ] Frontend loads: https://your-app-name.vercel.app
- [ ] Can register new user
- [ ] Can login
- [ ] Can create recipe
- [ ] Can like/save recipes
- [ ] Mobile responsive
- [ ] Dark mode works

---

## 🎯 TROUBLESHOOTING

### Backend Issues:
- **"Cannot connect to MongoDB"**: Check MONGO_URI format
- **"Port already in use"**: Render assigns ports automatically
- **CORS errors**: Check FRONTEND_URL is correct

### Frontend Issues:
- **"Failed to fetch"**: Check VITE_API_URL points to Render backend
- **Blank page**: Check build succeeded in Vercel
- **Images not loading**: Check image URLs are absolute

### Common Fixes:
- **Redeploy**: Click "Manual Deploy" in Render/Vercel
- **Check logs**: View deployment logs for errors
- **Environment vars**: Make sure they're set correctly (no spaces)

---

## 💰 COST BREAKDOWN

| Service | Cost | Limits |
|---------|------|--------|
| **MongoDB Atlas** | FREE | 512MB storage |
| **Render** | FREE | 750 hours/month, sleeps after 15min |
| **Vercel** | FREE | Unlimited bandwidth |
| **TOTAL** | **$0/month** | Perfect for learning |

---

## 📞 SUPPORT

If something doesn't work:
1. Check deployment logs in Render/Vercel
2. Verify environment variables
3. Test locally first: `npm run dev`
4. Ask for help with specific error messages

---

## ✅ FINAL RESULT

After deployment, you'll have:
- 🌐 **Live website:** Anyone can visit and use
- 📱 **Mobile friendly:** Works on all devices
- 🔐 **Secure:** HTTPS enabled automatically
- 🚀 **Fast:** Global CDN for quick loading
- 💾 **Persistent data:** MongoDB Atlas stores everything

---

**Ready to start? Begin with MongoDB Atlas setup!** 🚀

Need help with any step? Just tell me what you're stuck on! 🎯