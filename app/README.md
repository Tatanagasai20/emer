# Priacc Innovations - Attendance Portal

A comprehensive employee attendance management system with photo verification, leave management, and detailed reporting capabilities.

## 🚀 Features

### For Employees:
- ✅ Login with Email or Employee ID
- 📸 Check-in/Check-out with photo capture (webcam)
- 📊 View attendance history
- 🏖️ Apply for leaves (Casual, Sick, Earned)
- 📅 View company holidays
- 👤 View personal profile (DOB, Joining Date, Address, Hierarchy, Manager)
- 🔐 Change password
- 🔑 Forgot password with OTP-based reset

### For HR Admin:
- 👥 Create, Edit, and Delete employees
- 📊 Dashboard with real-time statistics
- 📈 Domain-wise employee distribution charts
- 🕒 Day-wise and month-wise attendance reports
- 📥 Export attendance reports to CSV
- 🌴 Manage company holidays
- ✅ Approve/Reject leave applications
- 📋 Filter reports by domain and employee

## 📋 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Recharts, React Webcam, React Router
- **Backend**: FastAPI (Python), PyMongo
- **Database**: MongoDB
- **Authentication**: JWT with OAuth2
- **Storage**: AWS S3 (for attendance photos)
- **Email**: SMTP (for OTP and notifications)

## 🏢 Company Domains

- SAP
- DevOps
- Java
- Python
- Data Science
- Testing
- PowerBI

## 📦 Installation

### Prerequisites

- Python 3.9+
- Node.js 16+
- MongoDB (local or cloud)
- Yarn package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd /app
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables (see Configuration section below)
nano .env
```

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
yarn install

# The backend URL is already configured in .env
```

## ⚙️ Configuration

### Backend Environment Variables (`/app/backend/.env`)

```env
# Database
MONGO_URL=mongodb://localhost:27017/

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# SMTP Configuration (For sending OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM_EMAIL=noreply@priacc.com

# AWS S3 Configuration (For storing attendance photos)
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_S3_BUCKET_NAME=priacc-attendance-photos
AWS_REGION=us-east-1
```

### Frontend Environment Variables (`/app/frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

⚠️ **Note**: The backend URL should point to where your FastAPI server is running.

## 🔐 Default Admin Credentials

```
Email: admin@priacc.com
Password: Admin@123
```

⚠️ **Important**: Change the default admin password after first login!

## 🚀 Running the Application

### Using Supervisor (Recommended for Production)

The application uses Supervisor to manage both frontend and backend services:

```bash
# Start all services
sudo supervisorctl start all

# Check status
sudo supervisorctl status

# Restart services
sudo supervisorctl restart all

# Stop services
sudo supervisorctl stop all

# View logs
tail -f /var/log/supervisor/backend.*.log
tail -f /var/log/supervisor/frontend.*.log
```

### Manual Development Mode

#### Backend:
```bash
cd backend
python server.py
# Server runs on http://0.0.0.0:8001
```

#### Frontend:
```bash
cd frontend
yarn start
# App runs on http://localhost:3000
```

## 📧 SMTP Setup Guide

### Option 1: Gmail SMTP

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
4. Update `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASSWORD=your-16-digit-app-password
   ```

### Option 2: SendGrid SMTP

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Update `.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   ```

### Option 3: AWS SES

1. Set up AWS SES in your AWS account
2. Verify your domain/email
3. Update `.env`:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-ses-smtp-username
   SMTP_PASSWORD=your-ses-smtp-password
   ```

### Option 4: Other SMTP Providers

Works with any SMTP provider (Mailgun, Postmark, etc.). Just update the credentials.

## ☁️ AWS S3 Setup Guide

### 1. Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://priacc-attendance-photos --region us-east-1

# Or create via AWS Console:
# Go to S3 → Create bucket → Name: priacc-attendance-photos
```

### 2. Set Bucket Policy (Optional - for public read access)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::priacc-attendance-photos/*"
        }
    ]
}
```

### 3. Create IAM User with S3 Access

1. Go to IAM → Users → Create User
2. Attach policy: `AmazonS3FullAccess` (or create custom policy)
3. Create Access Key
4. Update `.env` with:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### 4. Enable CORS (Optional)

If accessing images from frontend:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### Fallback Mode

⚠️ If S3 is not configured, the system will:
- Store attendance photos as base64 in MongoDB (for testing)
- This is NOT recommended for production due to database size concerns

## 🗄️ Database Schema

### Collections:

1. **users**: Employee and HR admin data
2. **attendance**: Check-in/check-out records with photos
3. **leaves**: Leave applications
4. **holidays**: Company holidays
5. **otp_tokens**: Temporary OTP tokens for password reset

### Indexes:

- `users.email` (unique)
- `users.employee_id` (unique)
- `attendance.employee_id + attendance.date`
- `leaves.employee_id`
- `holidays.date`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Employees (HR Admin only)
- `POST /api/employees` - Create employee
- `GET /api/employees` - Get all employees
- `GET /api/employees/{id}` - Get employee by ID
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/domains` - Get domain list

### Attendance
- `POST /api/attendance/check-in` - Check in with photo
- `POST /api/attendance/check-out` - Check out with photo
- `GET /api/attendance/my-history` - Get my attendance history
- `GET /api/attendance/today` - Get today's status
- `GET /api/attendance/reports` - Get reports (HR only)

### Leaves
- `POST /api/leaves/apply` - Apply for leave
- `GET /api/leaves/my-leaves` - Get my leaves
- `GET /api/leaves/all` - Get all leaves (HR only)
- `PUT /api/leaves/{id}/status` - Approve/Reject leave (HR only)

### Holidays
- `POST /api/holidays` - Create holiday (HR only)
- `GET /api/holidays` - Get holidays
- `DELETE /api/holidays/{id}` - Delete holiday (HR only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (HR only)

## 🧪 Testing

### Test Default Admin Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@priacc.com&password=Admin@123"
```

### Test Create Employee
```bash
curl -X POST http://localhost:8001/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@priacc.com",
    "employee_id": "EMP001",
    "full_name": "John Doe",
    "password": "Test@123",
    "domain": "Python",
    "joining_date": "2024-01-01"
  }'
```

## 🐳 Docker Deployment (Production)

### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### AWS EC2 Deployment Steps

#### 1. Launch EC2 Instances

- **Backend Server**: t2.medium (Ubuntu 22.04)
- **Frontend Server**: t2.small (Ubuntu 22.04)
- **Database Server**: t2.medium (Ubuntu 22.04) - Bare metal MongoDB

#### 2. Setup Database Server

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Configure for remote access
sudo nano /etc/mongod.conf
# Change bindIp to 0.0.0.0

sudo systemctl restart mongod
```

#### 3. Setup Backend Server

```bash
# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Build and run
cd /path/to/backend
sudo docker build -t priacc-backend .
sudo docker run -d -p 8001:8001 \
  -e MONGO_URL="mongodb://DATABASE_SERVER_IP:27017/" \
  -e AWS_ACCESS_KEY_ID="your-key" \
  -e AWS_SECRET_ACCESS_KEY="your-secret" \
  -e SMTP_USER="your-email" \
  -e SMTP_PASSWORD="your-password" \
  --name priacc-backend \
  priacc-backend
```

#### 4. Setup Frontend Server

```bash
# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Build and run
cd /path/to/frontend
sudo docker build -t priacc-frontend .
sudo docker run -d -p 80:80 \
  --name priacc-frontend \
  priacc-frontend
```

#### 5. Security Groups

**Database Server**:
- Inbound: Port 27017 from Backend Server IP only

**Backend Server**:
- Inbound: Port 8001 from Frontend Server IP only

**Frontend Server**:
- Inbound: Port 80 from 0.0.0.0/0 (public)
- Inbound: Port 443 from 0.0.0.0/0 (if using HTTPS)

#### 6. Domain & SSL (Optional)

```bash
# Install Certbot on Frontend Server
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## 🔧 Troubleshooting

### Issue: SMTP emails not sending
**Solution**: Check SMTP credentials, ensure less secure apps are enabled (Gmail), or use app passwords.

### Issue: S3 upload fails
**Solution**: Verify AWS credentials, check bucket permissions, ensure IAM user has S3 access.

### Issue: MongoDB connection error
**Solution**: Check MONGO_URL in .env, ensure MongoDB is running, verify network connectivity.

### Issue: Frontend can't reach backend
**Solution**: Verify REACT_APP_BACKEND_URL in frontend/.env matches backend server address.

### Issue: Webcam not working
**Solution**: Ensure HTTPS is enabled (webcam requires secure context), check browser permissions.

## 📊 Monitoring

### Check Backend Logs
```bash
tail -f /var/log/supervisor/backend.*.log
```

### Check Frontend Logs
```bash
tail -f /var/log/supervisor/frontend.*.log
```

### Check Database Status
```bash
sudo systemctl status mongod
```

### Check Services Status
```bash
sudo supervisorctl status
```

## 🔒 Security Best Practices

1. **Change default admin password immediately**
2. **Use strong JWT_SECRET_KEY** (generate random 32+ character string)
3. **Enable HTTPS** in production
4. **Restrict MongoDB access** to backend server IP only
5. **Use environment-specific .env files**
6. **Regularly update dependencies**
7. **Implement rate limiting** on login endpoints
8. **Backup database regularly**
9. **Use IAM roles** instead of access keys when possible
10. **Enable CloudWatch** for monitoring (AWS)

## 📄 License

Proprietary - Priacc Innovations © 2024

## 👥 Support

For technical support or queries, contact:
- Email: support@priacc.com
- Internal IT Team

## 🎉 Credits

Developed for Priacc Innovations
- 1000+ Employees
- Multi-domain organization
- Enterprise-grade attendance management

---

**Note**: This system is designed for internal use at Priacc Innovations. Ensure all credentials are kept secure and never committed to version control.
