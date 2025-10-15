# 🚀 START HERE - Priacc Innovations Attendance Portal

## ✅ Your System is READY!

Everything is already set up and running. Follow these simple steps:

---

## Step 1: Open the Application

**Click or copy this URL:**
```
http://localhost:3000
```

---

## Step 2: Login

Use these credentials:

```
Email: admin@priacc.com
Password: Admin@123
```

**⚠️ Important**: Change this password after first login!

---

## Step 3: Explore Features

### As HR Admin, you can:

1. **View Dashboard**
   - See total employees, attendance stats
   - Real-time analytics

2. **Manage Employees**
   - Click "Employees" tab
   - Click "Add Employee" button
   - Fill in details and create

3. **Try Creating a Test Employee**
   ```
   Full Name: John Doe
   Employee ID: EMP001
   Email: john@priacc.com
   Password: Test@123
   Domain: Python
   ```

4. **Logout and Test Employee Login**
   - Use Employee ID: `EMP001` or email: `john@priacc.com`
   - Password: `Test@123`

### As Employee, you can:

1. **Check In**
   - Go to "Attendance" tab
   - Allow camera access
   - Capture your photo
   - Confirm check-in

2. **View Profile**
   - See your personal details
   - Check joining date, domain, etc.

3. **Apply for Leave**
   - Go to "Leaves" tab (basic version available)

---

## Need to Configure Something?

### For Email Functionality (Optional)
📄 See: `README.md` → SMTP Setup Guide

### For Photo Storage in AWS S3 (Optional)
📄 See: `CONFIGURATION_TEMPLATE.md` → AWS S3 Setup

### For Production Deployment
📄 See: `README.md` → Docker Deployment / AWS EC2 Deployment

---

## Useful Commands

### Check if everything is running:
```bash
sudo supervisorctl status
```

### Restart everything:
```bash
sudo supervisorctl restart all
```

### View backend logs:
```bash
tail -f /var/log/supervisor/backend.*.log
```

---

## Quick Links

| Resource | Location |
|----------|----------|
| 📱 **Application** | http://localhost:3000 |
| 📚 **API Docs** | http://localhost:8001/docs |
| 📖 **Full Documentation** | README.md |
| ⚡ **Quick Reference** | QUICK_REFERENCE.md |
| ✅ **System Status** | STATUS.md |
| ⚙️ **Configuration** | CONFIGURATION_TEMPLATE.md |

---

## Something Not Working?

### Problem: Can't see the login page
**Solution**: Restart frontend
```bash
sudo supervisorctl restart frontend
```
Wait 10 seconds, then refresh browser.

### Problem: Login fails
**Solution**: Check backend
```bash
curl http://localhost:8001/api/health
```
Should return: `{"status":"healthy"}`

If not, restart backend:
```bash
sudo supervisorctl restart backend
```

### Problem: Webcam not working
**Solution**: 
- Allow camera permissions in browser
- Use Chrome or Edge (best support)
- Webcam requires HTTPS in production

---

## What's Already Configured?

✅ Backend server (FastAPI + MongoDB)  
✅ Frontend app (React + Tailwind)  
✅ Database with default admin  
✅ JWT authentication  
✅ All company domains  
✅ Employee management  
✅ Attendance tracking  
✅ Leave management (basic)  
✅ Holiday management  

---

## What's NOT Configured? (Optional)

⏳ SMTP (for sending emails) - System works without it  
⏳ AWS S3 (for photo storage) - Photos stored in DB temporarily  

Both are optional and can be configured later!

---

## 🎉 You're All Set!

**The system is 100% functional right now.**

Just open http://localhost:3000 and start using it!

For any questions, check the documentation files or run:
```bash
cat /app/STATUS.md
```

---

**Happy Attendance Tracking! 📸⏰**
