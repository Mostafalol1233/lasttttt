# 🚀 X-Host Backend-Only Deployment Package

**Package Type:** Backend API Only (No Frontend)  
**Target Server:** X-Host  
**Server ID:** `09a29a8d-4109-4a55-8e57-5786ab91aa92`  
**Fixed Port:** `25539` (non-changeable)  
**Status:** ✅ READY FOR DEPLOYMENT

---

## 📦 Package Contents (Backend Only)

| File/Folder | Size | Description |
|-------------|------|-------------|
| `index.js` | 49 KB | Compiled backend API server |
| `package.json` | 4 KB | Node.js dependencies |
| `package-lock.json` | 328 KB | Locked versions |
| `attached_assets/` | ~11 MB | Images served via `/assets/*` |
| `.env.example` | 2 KB | Environment configuration template |
| `start-server.sh` | 1 KB | Quick start script |
| `README.md` | 8 KB | Complete deployment guide |
| `DEPLOYMENT-CHECKLIST.md` | 8 KB | Step-by-step checklist |

**Total Size:** ~12 MB

**Note:** ❌ No frontend files - frontend is deployed separately to Netlify

---

## 🏗️ Architecture Overview

```
                  Internet Users
                        │
                        ▼
            ┌───────────────────────┐
            │      NETLIFY          │
            │   (Frontend Only)     │
            │   yourapp.netlify.app │
            │   Port: 443 (HTTPS)   │
            └──────────┬────────────┘
                       │
                       │ API Calls: /api/*
                       │ Redirected to X-Host
                       │
                       ▼
            ┌───────────────────────┐
            │      X-HOST           │
            │   (Backend API Only)  │
            │   Port: 25539 (Fixed) │
            │   Server ID: 09a29... │
            └──────────┬────────────┘
                       │
                       │ Database Queries
                       │
                       ▼
            ┌───────────────────────┐
            │   MongoDB Atlas       │
            │   (Cloud Database)    │
            └───────────────────────┘
```

---

## ⚙️ Configuration Required

### X-Host Environment Variables (Port 25539)

Create `.env` file on X-Host with:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://ahmed12ahmed12222_db_user:XQrHohCTcVjBgEbT@cluster0.oq5zwzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# X-Host Fixed Port (CANNOT BE CHANGED)
PORT=25539

# Environment
NODE_ENV=production

# Auto-seed database on first run
AUTO_SEED=true

# Admin Password (CHANGE THIS!)
ADMIN_PASSWORD=your-secure-password-here

# JWT Secret (generate new one)
JWT_SECRET=your-generated-secret-key-here
```

**🔐 Security:**
- Generate JWT_SECRET: `openssl rand -hex 32`
- Change ADMIN_PASSWORD to something secure
- Port 25539 is fixed by X-Host and cannot be changed

### Netlify Configuration (Frontend)

Update `netlify.toml` to redirect API calls to X-Host:

```toml
[build]
  publish = "dist/public"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "http://your-x-host-domain:25539/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/assets/*"
  to = "http://your-x-host-domain:25539/assets/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Replace** `your-x-host-domain` with your actual X-Host domain.

---

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend to X-Host

```bash
# 1. Upload katabump-deploy folder to X-Host
# 2. SSH into X-Host
ssh your-username@x-host-server

# 3. Navigate to deployment folder
cd /path/to/katabump-deploy

# 4. Create .env file
cp .env.example .env
nano .env  # Update with your actual values

# 5. Install dependencies
npm install --production

# 6. Start with PM2 (recommended)
npm install -g pm2
pm2 start index.js --name bimora-backend
pm2 save
pm2 startup

# 7. Verify backend is running
curl http://localhost:25539/api/news
```

### Step 2: Deploy Frontend to Netlify

```bash
# From your main project directory (not katabump-deploy)

# 1. Update netlify.toml with X-Host backend URL
# 2. Build frontend
npm run build

# 3. Deploy to Netlify
# (Either push to Git if auto-deploy is enabled, or use Netlify CLI)
netlify deploy --prod
```

### Step 3: Verify Connection

```bash
# Test backend directly
curl http://your-x-host-domain:25539/api/news

# Test frontend → backend connection
# Visit https://yourapp.netlify.app
# Check browser console - API calls should work
```

---

## 🌐 API Endpoints (Port 25539)

All endpoints are accessible at: `http://your-x-host-domain:25539/api/*`

**News:**
- `GET /api/news` - List all news
- `GET /api/news/:id` - Get specific news
- `POST /api/news` - Create (admin)
- `PATCH /api/news/:id` - Update (admin)
- `DELETE /api/news/:id` - Delete (admin)

**Events:**
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get specific event

**Comments:**
- `GET /api/comments/:postId` - Get comments
- `POST /api/comments` - Create comment

**Support:**
- `POST /api/tickets` - Submit ticket

**Admin:**
- `POST /api/admin/login` - Login
- `POST /api/admin/logout` - Logout

**Assets:**
- `GET /assets/*` - Images from attached_assets

---

## ✅ Pre-Deployment Checklist

### X-Host Server
- [ ] Node.js 18+ installed
- [ ] Port 25539 is available (fixed by X-Host)
- [ ] SSH access confirmed
- [ ] Firewall allows traffic on port 25539

### MongoDB Atlas
- [ ] Cluster created
- [ ] Database user created
- [ ] X-Host server IP whitelisted (or 0.0.0.0/0 for testing)
- [ ] Connection string tested

### Environment Variables
- [ ] `.env` file created on X-Host
- [ ] MongoDB URI configured
- [ ] Port set to 25539
- [ ] JWT_SECRET generated (32+ chars)
- [ ] ADMIN_PASSWORD changed from default

### Netlify Frontend
- [ ] `netlify.toml` updated with X-Host backend URL
- [ ] API redirects configured
- [ ] Frontend built and deployed

---

## 🔍 Testing After Deployment

### Test Backend (X-Host)

```bash
# From X-Host server
curl http://localhost:25539/api/news

# From external
curl http://your-x-host-domain:25539/api/news
```

**Expected:** JSON array of news items

### Test Frontend → Backend Connection

1. Visit your Netlify site: `https://yourapp.netlify.app`
2. Open browser Developer Tools → Network tab
3. Navigate through the site
4. Check API calls are going to X-Host backend
5. Verify data loads correctly

---

## 🆘 Troubleshooting

### Backend Won't Start

**Check MongoDB Connection:**
```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e))"
```

**Check Logs:**
```bash
pm2 logs bimora-backend
```

### Netlify Can't Connect to Backend

**Verify backend is accessible:**
```bash
curl http://your-x-host-domain:25539/api/news
```

**Check netlify.toml redirects:**
- Make sure URL matches your X-Host domain
- Port must be 25539
- Protocol should match (http/https)

**Common Issues:**
- X-Host firewall blocking port 25539
- Wrong domain in netlify.toml
- Backend not running

### MongoDB Connection Issues

**Whitelist X-Host IP:**

```bash
# Get X-Host server IP
curl ifconfig.me

# Add to MongoDB Atlas:
# Network Access → Add IP Address → Enter IP
```

### Port 25539 Issues

**Remember:**
- Port 25539 is **fixed by X-Host**
- Cannot be changed
- Must be specified in `.env` as `PORT=25539`

---

## 📊 Expected Performance

**Backend (X-Host):**
- Response time: <500ms
- Memory usage: 80-250 MB
- CPU usage: <15%

**Frontend (Netlify):**
- Load time: <2s
- Global CDN delivery
- Automatic HTTPS

---

## 🔐 Security Best Practices

- ✅ Never commit `.env` file
- ✅ Use strong ADMIN_PASSWORD
- ✅ Generate unique JWT_SECRET
- ✅ Whitelist specific IPs in MongoDB (not 0.0.0.0/0)
- ✅ Enable HTTPS on frontend (Netlify does this automatically)
- ✅ Keep dependencies updated

---

## 📞 Support

**X-Host Issues:**
- Check server logs
- Contact X-Host support
- Verify server ID: `09a29a8d-4109-4a55-8e57-5786ab91aa92`

**Deployment Help:**
- See `README.md` for detailed guide
- See `DEPLOYMENT-CHECKLIST.md` for step-by-step

---

## ✨ Deployment Summary

**This package contains:**
- ✅ Backend API server (compiled)
- ✅ Image assets (served via /assets/*)
- ✅ Environment configuration
- ✅ Complete documentation

**This package does NOT contain:**
- ❌ Frontend files (deploy those to Netlify separately)

**How it works:**
1. Upload this package to X-Host server
2. Configure environment (port 25539)
3. Install dependencies and start backend
4. Deploy frontend to Netlify separately
5. Netlify redirects /api/* calls to X-Host backend

**Ready to deploy! 🚀**
