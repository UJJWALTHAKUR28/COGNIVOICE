# 🚀 Cognivoice - Deployment Ready

This project is configured for deployment on:
- **Backend**: Railway (with MongoDB Atlas)
- **Frontend**: Vercel
- **Cost**: 100% FREE

---

## 📦 What's Included

### Backend Configuration
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process configuration
- ✅ `nixpacks.toml` - Build configuration with FFmpeg
- ✅ `runtime.txt` - Python version
- ✅ `.railwayignore` - Exclude unnecessary files
- ✅ Updated `requirements.txt` - All dependencies
- ✅ Updated `app.py` - Dynamic CORS and FFmpeg paths

### Frontend Configuration
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Exclude unnecessary files
- ✅ Updated `.env.example` - Railway backend URL template

### Documentation
- ✅ `DEPLOYMENT.md` - Complete step-by-step guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Quick checklist
- ✅ Updated `.gitignore` - Proper exclusions

---

## 🎯 Quick Start

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cognivoice.git
git push -u origin main
```

### 2. Follow Deployment Guide
Open `DEPLOYMENT.md` and follow the step-by-step instructions.

**Or use the quick checklist:**
Open `DEPLOYMENT_CHECKLIST.md` for a quick reference.

---

## 📋 Required Accounts

1. **MongoDB Atlas** (Database) - https://www.mongodb.com/cloud/atlas
2. **Railway** (Backend) - https://railway.app
3. **Vercel** (Frontend) - https://vercel.com

All have generous free tiers!

---

## ⚡ Deployment Time

- MongoDB Atlas: ~5 minutes
- Railway Backend: ~10 minutes
- Vercel Frontend: ~5 minutes
- **Total: ~20 minutes**

---

## 🔧 Environment Variables Needed

### Backend (Railway)
```env
MONGO_URL=mongodb+srv://...
SECRET_KEY=your-secret-key
API_HOST=0.0.0.0
API_ENV=production
FRONTEND_URL=https://your-app.vercel.app
MAX_UPLOAD_SIZE=50
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_ENV=production
```

---

## 🎉 After Deployment

Your app will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`

Both will auto-deploy on every `git push`!

---

## 📚 Documentation

- **Full Guide**: See `DEPLOYMENT.md`
- **Quick Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Project Info**: See `README.md`

---

## 🆘 Need Help?

1. Check `DEPLOYMENT.md` troubleshooting section
2. Review deployment logs on Railway/Vercel
3. Verify environment variables are set correctly

---

**Ready to deploy? Open `DEPLOYMENT.md` and let's go! 🚀**
