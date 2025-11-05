# 🚀 X-Host Deployment Checklist

Use this checklist to ensure your Bimora backend is ready for deployment to x-host server.

## ✅ Pre-Deployment Checklist

### 📦 Files & Structure

- [x] `index.js` - Compiled backend server (49KB)
- [x] `dist/public/` - Built frontend files
  - [x] `index.html`
  - [x] `favicon.png`
  - [x] `assets/` folder with JS/CSS files
- [x] `package.json` - Dependencies list
- [x] `package-lock.json` - Locked versions
- [x] `attached_assets/` - Images and static files
- [x] `start-server.sh` - Quick start script
- [x] `.env.example` - Environment template
- [x] `README.md` - Deployment guide

### 🔐 Security Requirements

- [ ] MongoDB credentials are NOT hardcoded in files
- [ ] `.env.example` contains only placeholder values
- [ ] Strong JWT_SECRET generated (32+ characters)
- [ ] MongoDB IP whitelist configured for x-host server
- [ ] Admin passwords are secure and documented separately

### 🗄️ Database Preparation

- [ ] MongoDB Atlas cluster is created
- [ ] Database user credentials are ready
- [ ] IP whitelist includes x-host server IP (or 0.0.0.0/0 for testing)
- [ ] Database has been seeded with initial data (optional)
- [ ] Connection string tested and verified

### 🌐 Server Requirements

- [ ] Node.js 18+ is available on x-host
- [ ] npm is available on x-host
- [ ] Port 5000 (or assigned port) is available
- [ ] SSH access to x-host server confirmed
- [ ] Firewall allows traffic on chosen port
- [ ] Sufficient disk space (minimum 1GB recommended)
- [ ] PM2 can be installed globally (optional but recommended)

## 📋 Deployment Steps

### Step 1: Upload Files ⬆️

- [ ] All files from `katabump-deploy/` folder uploaded to x-host
- [ ] File permissions are correct (755 for .sh files)
- [ ] Path is noted for SSH access

**Upload Location:** `____________________________________`

### Step 2: Configure Environment 🔧

- [ ] SSH into x-host server
- [ ] Navigate to deployment folder
- [ ] Copy `.env.example` to `.env`
- [ ] Update `MONGODB_URI` with actual credentials
- [ ] Generate and set secure `JWT_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Set correct `PORT` value
- [ ] Save and verify `.env` file

**Environment Variables Set:**
```bash
✅ MONGODB_URI
✅ NODE_ENV
✅ PORT
✅ JWT_SECRET
```

### Step 3: Install Dependencies 📥

- [ ] Run `npm install --production`
- [ ] Wait for installation to complete (~425MB)
- [ ] Verify no errors in installation
- [ ] Check node_modules folder exists

**Installation Command:**
```bash
cd /path/to/your/app
npm install --production
```

### Step 4: Test MongoDB Connection 🗄️

- [ ] Test connection with node script
- [ ] Verify database is accessible
- [ ] Check MongoDB Atlas shows active connection
- [ ] Resolve any connection issues

**Test Command:**
```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB Connected!')).catch(e => console.error('❌ Error:', e.message))"
```

### Step 5: Start the Server 🚀

Choose one method:

#### Method A: Direct Start
- [ ] Run `node index.js`
- [ ] Server starts without errors
- [ ] Process stays running

#### Method B: Start Script
- [ ] Make script executable: `chmod +x start-server.sh`
- [ ] Run `./start-server.sh`
- [ ] Server starts successfully

#### Method C: PM2 (Recommended)
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start app: `pm2 start index.js --name bimora-backend`
- [ ] Save config: `pm2 save`
- [ ] Setup startup: `pm2 startup`
- [ ] Run the generated startup command
- [ ] Verify: `pm2 status`

**Selected Method:** `____________________________________`

### Step 6: Verify Deployment ✔️

- [ ] Backend is running and responding
- [ ] Test API endpoint: `curl http://localhost:5000/api/news`
- [ ] Test from external IP: `curl http://YOUR_DOMAIN:5000/api/news`
- [ ] Check PM2 status (if using PM2): `pm2 status`
- [ ] Review logs for errors: `pm2 logs bimora-backend`
- [ ] Frontend loads correctly (if serving frontend)

**Verification URLs:**
- Local: `http://localhost:5000/api/news`
- Public: `http://____________________:5000/api/news`

### Step 7: Configure Domain (Optional) 🌍

- [ ] Domain DNS configured to point to x-host server
- [ ] SSL certificate installed (recommended)
- [ ] Reverse proxy configured (if applicable)
- [ ] Test HTTPS connection (if SSL enabled)

**Domain:** `____________________________________`

## 🔍 Post-Deployment Checks

### Functionality Tests

- [ ] API endpoints respond correctly
- [ ] News articles load
- [ ] Events display properly
- [ ] Image assets load from `/assets/` path
- [ ] Admin login works (if applicable)
- [ ] Database queries execute successfully

### Performance Tests

- [ ] Response times are acceptable (<2 seconds)
- [ ] Server memory usage is normal
- [ ] CPU usage is reasonable
- [ ] No memory leaks detected

**Monitor with:** `pm2 monit`

### Security Checks

- [ ] `.env` file is NOT publicly accessible
- [ ] Database credentials are secure
- [ ] JWT tokens are being generated properly
- [ ] CORS is configured correctly
- [ ] Rate limiting is active (if implemented)

### Monitoring Setup

- [ ] PM2 logs are accessible
- [ ] Log rotation configured (optional)
- [ ] Error monitoring in place
- [ ] Uptime monitoring configured (optional)

**Log Rotation Setup:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 📊 Production Information

Fill in after successful deployment:

**Server Details:**
- Server IP: `____________________________________`
- Server Location: `____________________________________`
- Hosting Provider: `x-host`

**Application Details:**
- Backend URL: `____________________________________`
- Frontend URL: `____________________________________`
- API Port: `____________________________________`

**Database Details:**
- MongoDB Cluster: `____________________________________`
- Database Name: `____________________________________`
- Connection Status: `____________________________________`

**Process Management:**
- Process Manager: `____________________________________`
- Process Name: `____________________________________`
- Auto-restart: `____________________________________`

## 🆘 Troubleshooting

### If deployment fails:

1. **Check Logs:**
   ```bash
   pm2 logs bimora-backend
   # or
   tail -f /path/to/logs/error.log
   ```

2. **Verify Environment:**
   ```bash
   cat .env
   printenv | grep MONGODB
   ```

3. **Test Port:**
   ```bash
   netstat -tuln | grep 5000
   lsof -i :5000
   ```

4. **Check MongoDB:**
   - Verify IP whitelist in Atlas
   - Test connection string
   - Check database user permissions

5. **Review README.md:**
   - Full troubleshooting section available
   - Common error solutions documented

## ✅ Deployment Complete!

Once all items are checked:

- [ ] All checklist items completed
- [ ] Application is running stably
- [ ] Monitoring is active
- [ ] Backup plan is in place
- [ ] Documentation is updated
- [ ] Team notified of deployment

**Deployment Date:** `____________________________________`  
**Deployed By:** `____________________________________`  
**Status:** `____________________________________`

---

## 🔄 Regular Maintenance

### Weekly:
- [ ] Check PM2 status
- [ ] Review error logs
- [ ] Monitor memory usage
- [ ] Check disk space

### Monthly:
- [ ] Review security updates
- [ ] Update dependencies if needed
- [ ] Backup database
- [ ] Review performance metrics

---

**Need Help?** Refer to README.md for detailed troubleshooting steps.
