# Configuration Templates for Priacc Attendance Portal

## 📧 SMTP Configuration Options

### Option 1: Gmail SMTP

```env
# /app/backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-digit-app-password
SMTP_FROM_EMAIL=noreply@priacc.com
```

**How to get App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Select "Mail" and generate password
5. Copy the 16-digit password (spaces don't matter)

### Option 2: SendGrid SMTP

```env
# /app/backend/.env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key-here
SMTP_FROM_EMAIL=noreply@priacc.com
```

**Setup Steps:**
1. Sign up at [SendGrid](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create API Key with "Mail Send" permission
4. Use "apikey" as SMTP_USER (literal string)
5. Use your API key as SMTP_PASSWORD

### Option 3: AWS SES

```env
# /app/backend/.env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM_EMAIL=verified@yourdomain.com
```

**Setup Steps:**
1. Go to AWS SES Console
2. Verify your domain or email
3. Create SMTP credentials
4. Use the provided SMTP credentials

### Option 4: Microsoft 365 / Outlook

```env
# /app/backend/.env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=your-email@yourdomain.com
```

### Option 5: Mailgun

```env
# /app/backend/.env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-mailgun-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

---

## ☁️ AWS S3 Configuration

### Complete AWS S3 Setup

```env
# /app/backend/.env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=priacc-attendance-photos
AWS_REGION=us-east-1
```

### Step-by-Step AWS Configuration:

#### 1. Create S3 Bucket (AWS Console)

```bash
# Or using AWS CLI
aws s3 mb s3://priacc-attendance-photos --region us-east-1
```

**Console Steps:**
1. Go to AWS S3 Console
2. Click "Create bucket"
3. Bucket name: `priacc-attendance-photos`
4. Region: `us-east-1` (or your preferred region)
5. Leave other settings as default
6. Click "Create bucket"

#### 2. Set Bucket Policy (Optional - For public read)

Go to Bucket → Permissions → Bucket Policy:

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

#### 3. Enable CORS (Optional)

Go to Bucket → Permissions → CORS:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

#### 4. Create IAM User

**Console Steps:**
1. Go to IAM Console → Users → Create user
2. User name: `priacc-attendance-s3`
3. Access type: Programmatic access
4. Attach policies: `AmazonS3FullAccess` (or custom policy below)
5. Create user and download credentials

**Custom Policy (More Secure):**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::priacc-attendance-photos",
                "arn:aws:s3:::priacc-attendance-photos/*"
            ]
        }
    ]
}
```

#### 5. Create Access Key

1. Go to IAM → Users → Select user → Security credentials
2. Create access key
3. Choose "Application running on AWS compute service"
4. Download or copy:
   - Access Key ID: `AWS_ACCESS_KEY_ID`
   - Secret Access Key: `AWS_SECRET_ACCESS_KEY`

---

## 🗄️ MongoDB Configuration Options

### Option 1: Local MongoDB (Default)

```env
# /app/backend/.env
MONGO_URL=mongodb://localhost:27017/
```

Already configured and running!

### Option 2: MongoDB Atlas (Cloud)

```env
# /app/backend/.env
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/priacc_attendance?retryWrites=true&w=majority
```

**Setup Steps:**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP address (or use 0.0.0.0/0 for testing)
5. Get connection string
6. Replace `<username>` and `<password>`

### Option 3: MongoDB on Separate Server

```env
# /app/backend/.env
MONGO_URL=mongodb://username:password@192.168.1.100:27017/priacc_attendance
```

For remote MongoDB with authentication.

---

## 🔒 Security Configuration

### JWT Configuration

```env
# /app/backend/.env
JWT_SECRET_KEY=generate-a-strong-random-32-character-string-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Generate Strong Secret:**

```bash
# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -base64 32

# Example output:
# JWT_SECRET_KEY=Xk8mP2vN9qL5rT7wY3bF6gH1jK4nM8pQ0sR2tU5vX7zA
```

---

## 🌐 Frontend Configuration

### Development

```env
# /app/frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Production (Same Server)

```env
# /app/frontend/.env
REACT_APP_BACKEND_URL=http://your-domain.com/api
```

### Production (Separate Servers)

```env
# /app/frontend/.env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

---

## 🚀 Deployment Configurations

### Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=priacc_attendance

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017/
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001

volumes:
  mongodb_data:
```

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: priacc-config
data:
  MONGO_URL: "mongodb://mongodb-service:27017/"
  JWT_ALGORITHM: "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES: "1440"
  SMTP_HOST: "smtp.gmail.com"
  SMTP_PORT: "587"
  AWS_REGION: "us-east-1"
  AWS_S3_BUCKET_NAME: "priacc-attendance-photos"
```

### Nginx Configuration (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/priacc-attendance

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📝 Configuration Checklist

### Before Going to Production:

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET_KEY
- [ ] Configure SMTP with valid credentials
- [ ] Setup AWS S3 with proper IAM user
- [ ] Configure MongoDB (Atlas or secure local)
- [ ] Setup HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Setup database backups
- [ ] Configure monitoring/logging
- [ ] Test all integrations
- [ ] Update REACT_APP_BACKEND_URL to production URL

---

## 🧪 Testing Configurations

### Test SMTP

```python
# test_smtp.py
import smtplib
from email.mime.text import MIMEText

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "your-email@gmail.com"
SMTP_PASSWORD = "your-app-password"

try:
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASSWORD)
    
    msg = MIMEText("Test email from Priacc Attendance Portal")
    msg['Subject'] = "Test Email"
    msg['From'] = SMTP_USER
    msg['To'] = "recipient@example.com"
    
    server.send_message(msg)
    server.quit()
    print("✅ SMTP configuration is working!")
except Exception as e:
    print(f"❌ SMTP Error: {e}")
```

### Test AWS S3

```python
# test_s3.py
import boto3

AWS_ACCESS_KEY_ID = "your-access-key"
AWS_SECRET_ACCESS_KEY = "your-secret-key"
AWS_REGION = "us-east-1"
AWS_S3_BUCKET_NAME = "priacc-attendance-photos"

try:
    s3 = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    
    # Test upload
    s3.put_object(
        Bucket=AWS_S3_BUCKET_NAME,
        Key='test.txt',
        Body=b'Test file'
    )
    
    print("✅ S3 configuration is working!")
except Exception as e:
    print(f"❌ S3 Error: {e}")
```

### Test MongoDB

```python
# test_mongo.py
from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017/"

try:
    client = MongoClient(MONGO_URL)
    client.admin.command('ping')
    print("✅ MongoDB connection is working!")
except Exception as e:
    print(f"❌ MongoDB Error: {e}")
```

---

## 🔧 Environment-Specific Configurations

### Development (.env.development)

```env
MONGO_URL=mongodb://localhost:27017/
JWT_SECRET_KEY=dev-secret-key-not-for-production
REACT_APP_BACKEND_URL=http://localhost:8001
SMTP_USER=
SMTP_PASSWORD=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### Staging (.env.staging)

```env
MONGO_URL=mongodb+srv://user:pass@staging-cluster.mongodb.net/
JWT_SECRET_KEY=staging-secret-key-change-me
REACT_APP_BACKEND_URL=https://staging-api.priacc.com
SMTP_USER=staging@priacc.com
SMTP_PASSWORD=staging-smtp-password
AWS_S3_BUCKET_NAME=priacc-attendance-staging
```

### Production (.env.production)

```env
MONGO_URL=mongodb+srv://user:pass@prod-cluster.mongodb.net/
JWT_SECRET_KEY=prod-strong-secret-key-32-chars-min
REACT_APP_BACKEND_URL=https://api.priacc.com
SMTP_USER=noreply@priacc.com
SMTP_PASSWORD=prod-smtp-password
AWS_S3_BUCKET_NAME=priacc-attendance-production
AWS_REGION=us-east-1
```

---

**Need Help?** Refer to README.md for detailed documentation or contact IT support.
