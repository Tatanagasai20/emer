#!/bin/bash

# HR Management System - Backend Deployment Script
# Instance 2: FastAPI Backend Setup

set -e

echo "🔧 Deploying FastAPI Backend Instance..."

# Configuration - MODIFY THESE VALUES
DATABASE_IP="YOUR_DATABASE_SERVER_IP"
MONGO_PASSWORD="priacc-secure-password"
JWT_SECRET=$(openssl rand -base64 32)
APP_DIR="/opt/hr-backend"

# Validate configuration
if [ "$DATABASE_IP" = "YOUR_DATABASE_SERVER_IP" ]; then
    echo "❌ Please update DATABASE_IP in the script with your actual database server IP"
    exit 1
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
# Database Configuration
MONGO_URL=mongodb://priacc_user:$MONGO_PASSWORD@$DATABASE_IP:27017/priacc_attendance

# JWT Configuration
JWT_SECRET_KEY=$JWT_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# SMTP Configuration (Optional - configure if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@priacc.com

# AWS S3 Configuration (Optional - configure if needed)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=priacc-attendance-photos
AWS_REGION=us-east-1
EOF

# Secure environment file
chmod 600 .env

# Copy application files (assuming they're in the parent directory)
echo "📋 Copying application files..."
if [ -f "../app/backend/server.py" ]; then
    cp -r ../app/backend/* .
else
    echo "⚠️  Application files not found. Please ensure backend code is available."
    echo "   Required files: server.py, requirements.txt, Dockerfile"
fi

# Stop existing container if running
echo "🛑 Stopping existing backend container..."
docker stop hr-backend 2>/dev/null || true
docker rm hr-backend 2>/dev/null || true

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t hr-backend .

# Create logs directory
sudo mkdir -p $APP_DIR/logs
sudo chown -R 1000:1000 $APP_DIR/logs

# Run backend container
echo "🚀 Starting backend container..."
docker run -d \
  --name hr-backend \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file .env \
  -v $APP_DIR/logs:/app/logs \
  hr-backend

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Test database connection
echo "🔗 Testing database connection..."
for i in {1..30}; do
    if curl -s http://localhost:8001/api/health > /dev/null; then
        echo "✅ Backend is responding"
        break
    fi
    echo "   Attempt $i/30: Waiting for backend..."
    sleep 2
done

# Configure firewall
echo "🔥 Configuring firewall..."
echo "⚠️  Please run the following commands with your frontend server IP:"
echo "   sudo ufw allow from FRONTEND_SERVER_IP to any port 8001"
echo "   sudo ufw enable"

# Verify deployment
echo "✅ Verifying backend deployment..."
if docker ps | grep -q hr-backend; then
    echo "✅ Backend container is running"
    
    # Test API endpoints
    if curl -s http://localhost:8001/api/health | grep -q "healthy"; then
        echo "✅ Backend API is responding"
    else
        echo "⚠️  Backend API health check failed"
    fi
else
    echo "❌ Backend deployment failed"
    docker logs hr-backend
    exit 1
fi

echo "🎉 Backend deployment completed successfully!"
echo ""
echo "📝 Backend Details:"
echo "   URL: http://$(hostname -I | awk '{print $1}'):8001"
echo "   Health Check: http://$(hostname -I | awk '{print $1}'):8001/api/health"
echo "   API Docs: http://$(hostname -I | awk '{print $1}'):8001/docs"
echo ""
echo "🔒 Security Notes:"
echo "   - Configure firewall to allow only frontend server"
echo "   - Update SMTP settings for email notifications"
echo "   - Configure AWS S3 for file uploads (optional)"
echo ""
echo "📊 Monitoring:"
echo "   docker logs hr-backend        # View logs"
echo "   docker stats hr-backend       # View resource usage"