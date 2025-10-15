# Priacc Innovations Attendance Portal - Quick Setup Guide

## ✅ System Status

**Backend**: Running on `http://localhost:8001`  
**Frontend**: Running on `http://localhost:3000`  
**Database**: MongoDB on `mongodb://localhost:27017/`

## 🔐 Default Login Credentials

```
Email: admin@priacc.com
Password: Admin@123
```

⚠️ **IMPORTANT**: Change this password immediately after first login!

## 🚀 Quick Start (System is Ready!)

### 1. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

### 2. Login as HR Admin

Use the default credentials above to login as HR Administrator.

### 3. Create Your First Employee

1. Navigate to "Employees" tab
2. Click "Add Employee"
3. Fill in the details:
   - Full Name: John Doe
   - Employee ID: EMP001
   - Email: john@priacc.com
   - Password: Test@123
   - Domain: Python
   - Joining Date: 2024-01-01
4. Click "Create Employee"

### 4. Test Employee Login

1. Logout from HR admin
2. Login with: `EMP001` or `john@priacc.com` and password `Test@123`
3. Test check-in/check-out functionality

## 🔧 Configuration Required (For Production)

### SMTP Setup (For Email Functionality)

Edit `/app/backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@priacc.com
```

**How to get Gmail App Password:**
1. Enable 2-Factor Authentication in Google Account
2. Go to: Google Account → Security → 2-Step Verification → App passwords
3. Generate password for "Mail"
4. Use the 16-digit password in SMTP_PASSWORD

### AWS S3 Setup (For Photo Storage)

Edit `/app/backend/.env`:

```env
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=priacc-attendance-photos
AWS_REGION=us-east-1
```

**How to setup AWS S3:**
1. Login to AWS Console
2. Go to S3 → Create bucket
3. Bucket name: `priacc-attendance-photos`
4. Region: `us-east-1` (or your preferred region)
5. Go to IAM → Create User → Attach `AmazonS3FullAccess` policy
6. Create Access Key → Copy credentials to .env

⚠️ **Note**: Until S3 is configured, photos are stored as base64 in MongoDB (for testing only).

## 📊 Services Management

### Check Services Status
```bash
sudo supervisorctl status
```

### Restart All Services
```bash
sudo supervisorctl restart all
```

### Restart Individual Services
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### View Logs
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs
tail -f /var/log/supervisor/frontend.*.log
```

## 🧪 Testing the APIs

### Test Health Check
```bash
curl http://localhost:8001/api/health
```

### Test Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@priacc.com&password=Admin@123"
```

### Test Create Employee (Replace TOKEN)
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:8001/api/employees \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@priacc.com",
    "employee_id": "EMP999",
    "full_name": "Test User",
    "password": "Test@123",
    "domain": "Python",
    "joining_date": "2024-01-01"
  }'
```

### Test Get Domains
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/domains
```

## 🎯 Features Overview

### Employee Features:
- ✅ Login with Email/Employee ID
- ✅ Check-in with photo capture
- ✅ Check-out with photo capture
- ✅ View attendance history
- ✅ Apply for leaves
- ✅ View company holidays
- ✅ View personal profile
- ✅ Change password
- ✅ Forgot password (OTP-based)

### HR Admin Features:
- ✅ Dashboard with statistics
- ✅ Create/Edit/Delete employees
- ✅ View all employees
- ✅ Filter employees by domain
- ✅ Generate attendance reports (day-wise/month-wise)
- ✅ Export reports to CSV
- ✅ Manage company holidays
- ✅ Approve/Reject leave requests
- ✅ Domain-wise analytics

## 📱 Application URLs

### Frontend (User Interface)
```
http://localhost:3000
```

### Backend API (Documentation)
```
http://localhost:8001/docs
```

### API Base URL
```
http://localhost:8001/api
```

## 🏢 Company Domains Available

- SAP
- DevOps
- Java
- Python
- Data Science
- Testing
- PowerBI

## 🔐 Security Notes

1. **Change Default Password**: Immediately change admin@priacc.com password
2. **JWT Secret**: Update JWT_SECRET_KEY in .env with a strong random string
3. **HTTPS**: Use HTTPS in production (not HTTP)
4. **Firewall**: Restrict MongoDB access to backend server only
5. **Backups**: Regularly backup MongoDB database

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check logs
tail -f /var/log/supervisor/backend.err.log

# Common fix: Restart MongoDB
sudo supervisorctl restart mongodb
sudo supervisorctl restart backend
```

### Frontend not loading?
```bash
# Check logs
tail -f /var/log/supervisor/frontend.err.log

# Common fix: Clear cache and restart
cd /app/frontend
rm -rf node_modules/.cache
sudo supervisorctl restart frontend
```

### Cannot connect to MongoDB?
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"
```

### Webcam not working?
- Browser needs HTTPS for webcam (use ngrok or similar for testing)
- Check browser permissions for camera access

### SMTP not sending emails?
- Verify SMTP credentials in .env
- For Gmail: Enable "Less secure app access" or use App Password
- Check spam folder

## 📈 Next Steps

1. **Configure SMTP** for email functionality
2. **Setup AWS S3** for photo storage
3. **Change default passwords**
4. **Create employee accounts**
5. **Setup company holidays**
6. **Test all features**
7. **Deploy to production** (see README.md for AWS deployment guide)

## 📞 Support

For issues or questions:
- Check logs: `/var/log/supervisor/`
- Review README.md for detailed documentation
- Contact: IT Support Team

---

**Built for Priacc Innovations** 🚀  
Enterprise Attendance Management System
