# 🚀 Quick Setup Guide - HR Management System

## 📋 Prerequisites
- 3 Ubuntu/CentOS servers with Docker installed
- Network connectivity between servers
- Minimum 2GB RAM per server

## 🏗️ Deployment Order

### 1️⃣ Instance 3: Database (MongoDB)
```bash
# Copy and run the database deployment script
wget https://your-repo/deploy-scripts/deploy-database.sh
chmod +x deploy-database.sh
sudo ./deploy-database.sh
```

### 2️⃣ Instance 2: Backend (FastAPI)
```bash
# Update the script with your database IP
wget https://your-repo/deploy-scripts/deploy-backend.sh
nano deploy-backend.sh  # Update DATABASE_IP
chmod +x deploy-backend.sh
sudo ./deploy-backend.sh
```

### 3️⃣ Instance 1: Frontend (React)
```bash
# Update the script with your backend IP
wget https://your-repo/deploy-scripts/deploy-frontend.sh
nano deploy-frontend.sh  # Update BACKEND_IP
chmod +x deploy-frontend.sh
sudo ./deploy-frontend.sh
```

## 🔧 Manual Setup (Alternative)

### Instance 3: Database
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# Create directories
sudo mkdir -p /opt/mongodb/{data,logs}
sudo chown -R 1000:1000 /opt/mongodb

# Run MongoDB
docker run -d --name mongodb --restart unless-stopped \
  -p 27017:27017 \
  -v /opt/mongodb/data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secure-password \
  mongo:6.0
```

### Instance 2: Backend
```bash
# Create app directory and environment
mkdir -p /opt/hr-backend && cd /opt/hr-backend

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://priacc_user:password@DATABASE_IP:27017/priacc_attendance
JWT_SECRET_KEY=$(openssl rand -base64 32)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
EOF

# Copy backend files and build
docker build -t hr-backend .
docker run -d --name hr-backend --restart unless-stopped \
  -p 8001:8001 --env-file .env hr-backend
```

### Instance 1: Frontend
```bash
# Create app directory and environment
mkdir -p /opt/hr-frontend && cd /opt/hr-frontend

# Create .env file
echo "REACT_APP_BACKEND_URL=http://BACKEND_IP:8001" > .env

# Copy frontend files and build
docker build -t hr-frontend .
docker run -d --name hr-frontend --restart unless-stopped \
  -p 80:3000 --env-file .env hr-frontend
```

## 🔍 Verification Commands

```bash
# Check containers
docker ps

# Check logs
docker logs mongodb
docker logs hr-backend
docker logs hr-frontend

# Test connectivity
curl http://DATABASE_IP:27017     # Should timeout (good - means it's running)
curl http://BACKEND_IP:8001/api/health
curl http://FRONTEND_IP/health
```

## 🎯 Access Application

1. Open browser: `http://FRONTEND_IP`
2. Login with:
   - Username: `admin@priacc.com`
   - Password: `Admin@123`
3. Change password immediately!

## 🔒 Security Checklist

- [ ] Change default MongoDB passwords
- [ ] Configure firewall rules between instances
- [ ] Update default admin password
- [ ] Configure SSL/TLS for production
- [ ] Set up backup procedures

## 📞 Troubleshooting

### Backend can't connect to database
```bash
# Test network connectivity
docker exec hr-backend ping DATABASE_IP
# Check MongoDB logs
docker logs mongodb
```

### Frontend can't connect to backend
```bash
# Check backend health
curl http://BACKEND_IP:8001/api/health
# Check environment variables
docker exec hr-frontend env | grep REACT_APP
```

### Container won't start
```bash
# Check logs for errors
docker logs CONTAINER_NAME
# Check system resources
df -h && free -m
```

## 📊 Monitoring

```bash
# Resource usage
docker stats

# Application logs
docker logs -f CONTAINER_NAME

# System monitoring
htop
```

---

For detailed instructions, see [DEVOPS_README.md](DEVOPS_README.md)