# 🚀 Backend-Only Deployment for X-Host

This package contains **ONLY the backend API** for deployment to X-Host server (port 25539).

**Frontend:** Deploy separately to Netlify (see Netlify deployment instructions below)

---

## 📦 Contents (Backend Only)

- `index.js` - Compiled backend API server
- `package.json` - Node.js dependencies
- `package-lock.json` - Locked dependency versions
- `attached_assets/` - Images and static assets (served via `/assets/*` API)
- `.env.example` - Environment variables template
- `start-server.sh` - Quick start script

**Note:** No frontend files (`dist/public`) - frontend is deployed separately to Netlify

---

## 🚀 X-Host Deployment Steps

### 1. Upload Files to X-Host

Upload this entire folder to your X-Host server using FTP, SFTP, or file manager.

**Server ID:** `09a29a8d-4109-4a55-8e57-5786ab91aa92`

### 2. SSH Into X-Host

```bash
ssh your-username@your-x-host-server.com
cd /path/to/katabump-deploy
```

### 3. Configure Environment Variables

Create `.env` file with your credentials:

```bash
cp .env.example .env
nano .env
```

**Required Environment Variables:**

```bash
# MongoDB Connection (Your actual MongoDB Atlas URI)
MONGODB_URI=mongodb+srv://ahmed12ahmed12222_db_user:XQrHohCTcVjBgEbT@cluster0.oq5zwzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# X-Host Fixed Port (CANNOT BE CHANGED)
PORT=25539

# Environment
NODE_ENV=production

# Auto-seed on first run
AUTO_SEED=true

# Admin Password (CHANGE THIS!)
ADMIN_PASSWORD=your-secure-password-here

# JWT Secret (Generate with: openssl rand -hex 32)
JWT_SECRET=your-generated-secret-key-here
```

**🔐 Important:**
- Port `25539` is **fixed by X-Host** and cannot be changed
- Change `ADMIN_PASSWORD` to something secure
- Generate a new `JWT_SECRET` using: `openssl rand -hex 32`

### 4. Install Dependencies

```bash
npm install --production
```

This will install all required packages (~425MB).

### 5. Start the Backend

#### Option A: Direct Start
```bash
node index.js
```

#### Option B: Quick Start Script
```bash
chmod +x start-server.sh
./start-server.sh
```

#### Option C: PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start index.js --name bimora-backend

# Save configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### 6. Verify Backend is Running

Test your backend API:

```bash
# Test locally on X-Host server
curl http://localhost:25539/api/news

# Test externally (replace with your X-Host domain)
curl http://your-x-host-domain:25539/api/news
```

You should see a JSON array of news items.

---

## 🌐 Frontend Deployment (Netlify)

Your frontend is deployed separately to Netlify. Here's how to connect it to this X-Host backend:

### 1. Update Netlify Configuration

In your `netlify.toml` file (in your main project), update the API redirect:

```toml
[[redirects]]
  from = "/api/*"
  to = "http://your-x-host-domain:25539/api/:splat"
  status = 200
  force = true
```

**Replace** `your-x-host-domain` with your actual X-Host domain.

### 2. Deploy Frontend to Netlify

```bash
# Build frontend
npm run build

# Deploy to Netlify (or push to Git if using auto-deploy)
```

### 3. Architecture Overview

```
┌─────────────────┐
│  Netlify        │
│  (Frontend)     │
│  Port: 443      │
└────────┬────────┘
         │
         │ API Calls via /api/*
         │
         ▼
┌─────────────────┐
│  X-Host         │
│  (Backend API)  │
│  Port: 25539    │
└─────────────────┘
```

**How it works:**
1. User visits your Netlify site (e.g., `https://yourapp.netlify.app`)
2. Frontend makes API calls to `/api/*`
3. Netlify redirects those calls to `http://your-x-host:25539/api/*`
4. X-Host backend processes the request and returns data
5. Frontend displays the data

---

## 📡 API Endpoints

Once deployed, your backend provides these endpoints:

**News & Articles:**
- `GET /api/news` - List all news
- `GET /api/news/:id` - Get specific news item
- `POST /api/news` - Create news (admin only)
- `PATCH /api/news/:id` - Update news (admin only)
- `DELETE /api/news/:id` - Delete news (admin only)

**Events:**
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get specific event

**Comments:**
- `GET /api/comments/:postId` - Get comments
- `POST /api/comments` - Create comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

**Support Tickets:**
- `POST /api/tickets` - Submit support ticket
- `GET /api/tickets` - Get all tickets (admin only)

**Admin:**
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check` - Check admin status

**Static Assets:**
- `GET /assets/*` - Serve images from `attached_assets/`

---

## 🔧 Common PM2 Commands

```bash
pm2 status                  # Check status
pm2 logs bimora-backend     # View logs
pm2 restart bimora-backend  # Restart
pm2 stop bimora-backend     # Stop
pm2 delete bimora-backend   # Remove
pm2 monit                   # Monitor resources
```

---

## 🆘 Troubleshooting

### Backend won't start

**Check MongoDB Connection:**
```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message))"
```

**Check Environment Variables:**
```bash
cat .env
```

**View Logs:**
```bash
pm2 logs bimora-backend
```

### Can't connect to backend from Netlify

1. **Verify backend is running:**
   ```bash
   curl http://localhost:25539/api/news
   ```

2. **Check X-Host firewall:**
   - Port 25539 must be open
   - Allow external connections

3. **Update Netlify redirects:**
   - Make sure `netlify.toml` points to correct X-Host URL

4. **Test external access:**
   ```bash
   curl http://your-x-host-domain:25539/api/news
   ```

### MongoDB Connection Issues

**Add X-Host IP to MongoDB Atlas Whitelist:**

1. Get your X-Host server IP:
   ```bash
   curl ifconfig.me
   ```

2. Add this IP to MongoDB Atlas:
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Enter your X-Host server IP
   - Or use `0.0.0.0/0` for testing (not recommended for production)

### Port Issues

**X-Host uses a fixed port (25539)** that cannot be changed. If you get port errors:

1. Verify `PORT=25539` in your `.env` file
2. Make sure no other service is using port 25539
3. Contact X-Host support if port is unavailable

---

## 📊 Resource Usage

**After Installation:**
- **Disk Space:** ~450 MB (with node_modules)
- **Memory (Idle):** ~80 MB
- **Memory (Active):** ~150-250 MB
- **CPU (Idle):** <1%
- **CPU (Active):** 5-15%

---

## 🔐 Security Checklist

Before going live:

- [ ] Changed `ADMIN_PASSWORD` from default
- [ ] Generated unique `JWT_SECRET`
- [ ] MongoDB IP whitelist configured
- [ ] `.env` file is not publicly accessible
- [ ] Tested all API endpoints
- [ ] SSL/HTTPS enabled on Netlify frontend
- [ ] CORS configured correctly

---

## 📈 Monitoring

### Setup Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Monitor Performance
```bash
pm2 monit
```

---

## 🔄 Updates

To update your backend:

1. **Backup current version**
2. **Upload new `index.js`** to X-Host
3. **Restart:** `pm2 restart bimora-backend`

---

## ✅ Deployment Summary

**Backend (X-Host):**
- Server ID: `09a29a8d-4109-4a55-8e57-5786ab91aa92`
- Port: `25539` (fixed, non-changeable)
- URL: `http://your-x-host-domain:25539/api/*`

**Frontend (Netlify):**
- Deployed separately
- Connects to X-Host backend via API redirects
- URL: `https://yourapp.netlify.app`

**Database (MongoDB Atlas):**
- Cloud-hosted
- Accessible from X-Host server IP

---

**Need help?** Check PM2 logs: `pm2 logs bimora-backend`

**Good luck with your deployment! 🚀**
