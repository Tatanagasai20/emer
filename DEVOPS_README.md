# HR Management System - DevOps Deployment Guide

This guide provides step-by-step instructions for deploying the HR Management System on bare metal servers using Docker containers across three separate instances.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Instance 1    │    │   Instance 2    │    │   Instance 3    │
│   Frontend      │────│   Backend       │────│   Database      │
│   (React + Nginx)│    │   (FastAPI)     │    │   (MongoDB)     │
│   Port: 3000    │    │   Port: 8001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### All Instances
- Ubuntu 20.04+ or CentOS 7+
- Docker 20.10+
- Docker Compose (optional, for easier management)
- Minimum 2GB RAM per instance
- Network connectivity between instances

### Instance Requirements
- **Instance 1 (Frontend)**: 1 CPU, 2GB RAM, 10GB Storage
- **Instance 2 (Backend)**: 2 CPU, 4GB RAM, 20GB Storage  
- **Instance 3 (Database)**: 2 CPU, 4GB RAM, 50GB Storage

## 🚀 Deployment Instructions

### Instance 3: Database Setup (MongoDB)

#### Step 1: Install Docker
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

#### Step 2: Create MongoDB Data Directory
```bash
# Create data directory
sudo mkdir -p /opt/mongodb/data
sudo mkdir -p /opt/mongodb/logs
sudo chown -R 1000:1000 /opt/mongodb
```

#### Step 3: Run MongoDB Container
```bash
# Create MongoDB container
docker run -d \
  --name mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -v /opt/mongodb/data:/data/db \
  -v /opt/mongodb/logs:/var/log/mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your-secure-password \
  mongo:6.0

# Verify MongoDB is running
docker ps
docker logs mongodb
```

#### Step 4: Configure MongoDB (Optional)
```bash
# Connect to MongoDB shell
docker exec -it mongodb mongosh -u admin -p your-secure-password

# Create application database and user
use priacc_attendance
db.createUser({
  user: "priacc_user",
  pwd: "priacc-secure-password",
  roles: [
    { role: "readWrite", db: "priacc_attendance" }
  ]
})

exit
```

#### Step 5: Configure Firewall
```bash
# Allow MongoDB port (only from backend server)
sudo ufw allow from BACKEND_SERVER_IP to any port 27017
sudo ufw enable
```

---

### Instance 2: Backend Setup (FastAPI)

#### Step 1: Install Docker
```bash
# Follow same Docker installation steps as Instance 3
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

#### Step 2: Prepare Application Files
```bash
# Create application directory
sudo mkdir -p /opt/hr-backend
cd /opt/hr-backend

# Clone or copy your backend code here
# Ensure you have: server.py, requirements.txt, Dockerfile
```

#### Step 3: Create Environment Configuration
```bash
# Create .env file
cat > .env << EOF
# Database Configuration
MONGO_URL=mongodb://priacc_user:priacc-secure-password@DATABASE_SERVER_IP:27017/priacc_attendance

# JWT Configuration
JWT_SECRET_KEY=$(openssl rand -base64 32)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# SMTP Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@priacc.com

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=priacc-attendance-photos
AWS_REGION=us-east-1
EOF

# Secure the environment file
chmod 600 .env
```

#### Step 4: Build and Run Backend Container
```bash
# Build the Docker image
docker build -t hr-backend .

# Run the container
docker run -d \
  --name hr-backend \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file .env \
  -v /opt/hr-backend/logs:/app/logs \
  hr-backend

# Verify backend is running
docker ps
docker logs hr-backend

# Test API health
curl http://localhost:8001/api/health
```

#### Step 5: Configure Firewall
```bash
# Allow backend port (from frontend server and for testing)
sudo ufw allow from FRONTEND_SERVER_IP to any port 8001
sudo ufw allow 8001  # Remove this after testing
sudo ufw enable
```

---

### Instance 1: Frontend Setup (React + Nginx)

#### Step 1: Install Docker
```bash
# Follow same Docker installation steps
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

#### Step 2: Prepare Application Files
```bash
# Create application directory
sudo mkdir -p /opt/hr-frontend
cd /opt/hr-frontend

# Clone or copy your frontend code here
# Ensure you have: src/, public/, package.json, Dockerfile, nginx.conf
```

#### Step 3: Create Environment Configuration
```bash
# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://BACKEND_SERVER_IP:8001
REACT_APP_ENVIRONMENT=production
EOF
```

#### Step 4: Build and Run Frontend Container
```bash
# Build the Docker image
docker build -t hr-frontend .

# Run the container
docker run -d \
  --name hr-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -p 80:3000 \
  --env-file .env \
  hr-frontend

# Verify frontend is running
docker ps
docker logs hr-frontend

# Test frontend
curl http://localhost:3000/health
```

#### Step 5: Configure Firewall
```bash
# Allow HTTP traffic
sudo ufw allow 80
sudo ufw allow 3000
sudo ufw enable
```

## 🔧 Configuration Details

### Network Configuration
Replace the following placeholders with actual IP addresses:

- `DATABASE_SERVER_IP`: IP address of Instance 3 (MongoDB)
- `BACKEND_SERVER_IP`: IP address of Instance 2 (FastAPI)
- `FRONTEND_SERVER_IP`: IP address of Instance 1 (React)

### Environment Variables

#### Backend (.env)
```bash
# Required
MONGO_URL=mongodb://priacc_user:password@DATABASE_IP:27017/priacc_attendance
JWT_SECRET_KEY=your-secret-key

# Optional (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend (.env)
```bash
# Required
REACT_APP_BACKEND_URL=http://BACKEND_IP:8001
```

## 🔍 Health Checks & Monitoring

### Check Service Status
```bash
# On each instance
docker ps
docker logs <container-name>

# Check service health
curl http://FRONTEND_IP:3000/health      # Frontend
curl http://BACKEND_IP:8001/api/health   # Backend
docker exec mongodb mongosh --eval "db.adminCommand('ping')"  # Database
```

### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# Check logs
docker logs -f <container-name>

# System resources
htop
df -h
```

## 🔒 Security Considerations

### Firewall Rules
```bash
# Instance 1 (Frontend)
sudo ufw allow 80
sudo ufw allow 443  # If using HTTPS
sudo ufw deny 22    # Disable SSH from public (use VPN/bastion)

# Instance 2 (Backend)  
sudo ufw allow from FRONTEND_IP to any port 8001
sudo ufw deny 8001  # Block public access

# Instance 3 (Database)
sudo ufw allow from BACKEND_IP to any port 27017
sudo ufw deny 27017  # Block public access
```

### SSL/TLS Setup (Recommended)
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx configuration to use SSL
# Add SSL configuration to nginx.conf
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Can't Connect to Database
```bash
# Check network connectivity
docker exec hr-backend ping DATABASE_IP

# Check MongoDB logs
docker logs mongodb

# Verify MongoDB is accepting connections
docker exec mongodb mongosh --eval "db.adminCommand('ping')"
```

#### Frontend Can't Connect to Backend
```bash
# Check backend health
curl http://BACKEND_IP:8001/api/health

# Check CORS settings in backend
docker logs hr-backend | grep CORS

# Verify environment variables
docker exec hr-frontend env | grep REACT_APP
```

#### Container Won't Start
```bash
# Check Docker logs
docker logs <container-name>

# Check resource usage
df -h
free -m

# Restart container
docker restart <container-name>
```

## 📊 Backup & Recovery

### Database Backup
```bash
# Create backup script
cat > /opt/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker exec mongodb mongodump \
  --uri="mongodb://priacc_user:password@localhost:27017/priacc_attendance" \
  --out=/tmp/backup_$DATE

docker cp mongodb:/tmp/backup_$DATE $BACKUP_DIR/
docker exec mongodb rm -rf /tmp/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /opt/backup-mongodb.sh

# Add to crontab for daily backup
echo "0 2 * * * /opt/backup-mongodb.sh" | crontab -
```

### Application Backup
```bash
# Backup application code and configs
tar -czf hr-app-backup-$(date +%Y%m%d).tar.gz \
  /opt/hr-frontend \
  /opt/hr-backend \
  /opt/mongodb
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull new code
cd /opt/hr-backend  # or hr-frontend

# Rebuild image
docker build -t hr-backend:new .

# Stop old container
docker stop hr-backend

# Start new container
docker run -d \
  --name hr-backend-new \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file .env \
  hr-backend:new

# Remove old container after verification
docker rm hr-backend
docker rename hr-backend-new hr-backend
```

### System Maintenance
```bash
# Clean up Docker
docker system prune -a

# Update system packages
sudo apt update && sudo apt upgrade -y

# Monitor disk space
df -h
```

## 📞 Support & Contacts

- **Application Issues**: Check application logs
- **Infrastructure Issues**: Check system resources and Docker status
- **Database Issues**: Check MongoDB logs and connectivity

## 🎯 Default Credentials

After deployment, access the application at `http://FRONTEND_IP` with:
- **Username**: admin@priacc.com
- **Password**: Admin@123

**⚠️ Important**: Change the default admin password immediately after first login!

---

This deployment guide provides a complete setup for running the HR Management System across three separate instances. Follow the steps in order and ensure network connectivity between instances for proper operation.