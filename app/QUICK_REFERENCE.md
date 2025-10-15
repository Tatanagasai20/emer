# Priacc Attendance Portal - Quick Reference Card

## 🚀 Quick Access

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ Running |
| **Backend API** | http://localhost:8001 | ✅ Running |
| **API Docs** | http://localhost:8001/docs | ✅ Available |
| **MongoDB** | mongodb://localhost:27017 | ✅ Running |

## 🔐 Default Credentials

```
HR Admin:
  Email: admin@priacc.com
  Password: Admin@123
```

## 📋 Quick Commands

### Service Management
```bash
# Check all services
sudo supervisorctl status

# Restart all
sudo supervisorctl restart all

# Restart specific service
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### View Logs
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs  
tail -f /var/log/supervisor/frontend.*.log

# All errors
tail -f /var/log/supervisor/*.err.log
```

### Test APIs
```bash
# Health check
curl http://localhost:8001/api/health

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@priacc.com&password=Admin@123"
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `/app/backend/.env` | Backend configuration (SMTP, S3, MongoDB) |
| `/app/frontend/.env` | Frontend configuration (Backend URL) |
| `/app/README.md` | Complete documentation |
| `/app/SETUP_GUIDE.md` | Quick setup instructions |
| `/app/CONFIGURATION_TEMPLATE.md` | Configuration examples |

## ⚙️ Configuration Quick Fix

### SMTP Not Working?
Edit `/app/backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```
Then: `sudo supervisorctl restart backend`

### S3 Not Working?
Edit `/app/backend/.env`:
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=priacc-attendance-photos
AWS_REGION=us-east-1
```
Then: `sudo supervisorctl restart backend`

## 🏢 Company Domains

- SAP
- DevOps  
- Java
- Python
- Data Science
- Testing
- PowerBI

## 📊 Common Tasks

### Create Employee (HR)
1. Login as admin
2. Go to "Employees" tab
3. Click "Add Employee"
4. Fill details and submit

### Employee Check-In
1. Login as employee
2. Go to "Attendance" tab
3. Click "Check In"
4. Capture photo
5. Confirm

### Generate Reports (HR)
1. Login as admin
2. Go to "Attendance" tab
3. Select date range
4. Choose domain (optional)
5. Click "Generate Report"
6. Export to CSV

### Approve Leave (HR)
1. Login as admin
2. Go to "Leaves" tab
3. Filter "Pending"
4. Click ✓ to approve or ✗ to reject

## 🐛 Troubleshooting Quick Fixes

### Backend Won't Start
```bash
sudo supervisorctl restart mongodb
sleep 3
sudo supervisorctl restart backend
```

### Frontend Won't Load
```bash
cd /app/frontend
rm -rf node_modules/.cache
sudo supervisorctl restart frontend
```

### Port Already in Use
```bash
# Kill process on port 8001
sudo fkill :8001

# Kill process on port 3000
sudo fkill :3000

# Then restart services
sudo supervisorctl restart all
```

### MongoDB Connection Error
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# Restart MongoDB
sudo supervisorctl restart mongodb

# Check connection
mongo --eval "db.adminCommand('ping')"
```

## 📊 API Endpoints Cheat Sheet

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/reset-password` - Reset with OTP

### Employees (HR)
- `POST /api/employees` - Create employee
- `GET /api/employees` - List all
- `GET /api/employees/{id}` - Get one
- `PUT /api/employees/{id}` - Update
- `DELETE /api/employees/{id}` - Delete

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/my-history` - My history
- `GET /api/attendance/today` - Today's status
- `GET /api/attendance/reports` - Reports (HR)

### Leaves
- `POST /api/leaves/apply` - Apply leave
- `GET /api/leaves/my-leaves` - My leaves
- `GET /api/leaves/all` - All leaves (HR)
- `PUT /api/leaves/{id}/status` - Approve/Reject (HR)

### Holidays
- `POST /api/holidays` - Create (HR)
- `GET /api/holidays` - List all
- `DELETE /api/holidays/{id}` - Delete (HR)

### Dashboard
- `GET /api/dashboard/stats` - Statistics (HR)

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Updated JWT_SECRET_KEY
- [ ] Configured SMTP
- [ ] Configured AWS S3
- [ ] Using HTTPS in production
- [ ] MongoDB access restricted
- [ ] Regular database backups

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Full Documentation | `/app/README.md` |
| Setup Guide | `/app/SETUP_GUIDE.md` |
| Configuration Examples | `/app/CONFIGURATION_TEMPLATE.md` |
| API Documentation | http://localhost:8001/docs |
| Backend Logs | `/var/log/supervisor/backend.*.log` |
| Frontend Logs | `/var/log/supervisor/frontend.*.log` |

## 🎯 Features at a Glance

### Employee
✅ Login with Email/ID  
✅ Photo Check-in/out  
✅ Attendance History  
✅ Leave Application  
✅ Holiday Calendar  
✅ Profile Management  
✅ Password Change/Reset  

### HR Admin
✅ Employee Management  
✅ Dashboard Analytics  
✅ Attendance Reports  
✅ Leave Approval  
✅ Holiday Management  
✅ Domain-wise Reports  
✅ CSV Export  

## 💡 Pro Tips

1. **Webcam requires HTTPS** - Use ngrok for testing
2. **Photos stored in MongoDB** until S3 configured
3. **OTP visible in logs** when SMTP not configured
4. **Use Chrome/Edge** for best webcam support
5. **CSV export** works without any configuration
6. **Filter by domain** for department-wise reports
7. **Leave balance** tracking coming in next update

## 📈 System Requirements

- **RAM**: 2GB minimum
- **CPU**: 2 cores minimum
- **Storage**: 10GB minimum
- **MongoDB**: 4GB+ database size for 1000 employees
- **Bandwidth**: 1 Mbps minimum (photo uploads)

## 🚀 Performance Tips

1. Configure S3 to reduce MongoDB size
2. Setup indexes (already done automatically)
3. Regular database cleanup of old photos
4. Use CDN for frontend in production
5. Enable MongoDB compression
6. Use connection pooling

---

**Built for Priacc Innovations** 🏢  
**1000+ Employees** 👥  
**Enterprise-Grade Attendance Management** ⏱️

**Quick Help**: See README.md for detailed documentation
