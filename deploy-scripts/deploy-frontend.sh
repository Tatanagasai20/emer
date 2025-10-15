#!/bin/bash

# HR Management System - Frontend Deployment Script
# Instance 1: React Frontend Setup

set -e

echo "🎨 Deploying React Frontend Instance..."

# Configuration - MODIFY THESE VALUES
BACKEND_IP="YOUR_BACKEND_SERVER_IP"
APP_DIR="/opt/hr-frontend"

# Validate configuration
if [ "$BACKEND_IP" = "YOUR_BACKEND_SERVER_IP" ]; then
    echo "❌ Please update BACKEND_IP in the script with your actual backend server IP"
    exit 1
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
REACT_APP_BACKEND_URL=http://$BACKEND_IP:8001
REACT_APP_ENVIRONMENT=production
EOF

# Copy application files (assuming they're in the parent directory)
echo "📋 Copying application files..."
if [ -f "../app/frontend/package.json" ]; then
    cp -r ../app/frontend/* .
else
    echo "⚠️  Application files not found. Please ensure frontend code is available."
    echo "   Required files: src/, public/, package.json, Dockerfile, nginx.conf"
fi

# Stop existing container if running
echo "🛑 Stopping existing frontend container..."
docker stop hr-frontend 2>/dev/null || true
docker rm hr-frontend 2>/dev/null || true

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t hr-frontend .

# Run frontend container
echo "🚀 Starting frontend container..."
docker run -d \
  --name hr-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -p 80:3000 \
  --env-file .env \
  hr-frontend

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 80 2>/dev/null || echo "Port 80 already allowed or ufw not available"
sudo ufw allow 3000 2>/dev/null || echo "Port 3000 already allowed or ufw not available"

# Verify deployment
echo "✅ Verifying frontend deployment..."
if docker ps | grep -q hr-frontend; then
    echo "✅ Frontend container is running"
    
    # Test frontend health
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null; then
            echo "✅ Frontend is responding"
            break
        fi
        echo "   Attempt $i/30: Waiting for frontend..."
        sleep 2
    done
    
    # Test main page
    if curl -s http://localhost:3000 | grep -q "HR Management" 2>/dev/null; then
        echo "✅ Frontend application is loaded"
    else
        echo "⚠️  Frontend application may not be fully loaded"
    fi
else
    echo "❌ Frontend deployment failed"
    docker logs hr-frontend
    exit 1
fi

echo "🎉 Frontend deployment completed successfully!"
echo ""
echo "📝 Frontend Details:"
echo "   URL: http://$(hostname -I | awk '{print $1}')"
echo "   Alternative: http://$(hostname -I | awk '{print $1}'):3000"
echo "   Health Check: http://$(hostname -I | awk '{print $1}'):3000/health"
echo ""
echo "👤 Default Login Credentials:"
echo "   Username: admin@priacc.com"
echo "   Password: Admin@123"
echo "   ⚠️  Change password immediately after first login!"
echo ""
echo "🔒 Security Notes:"
echo "   - Configure SSL/TLS for production use"
echo "   - Set up proper domain name"
echo "   - Configure firewall rules"
echo ""
echo "📊 Monitoring:"
echo "   docker logs hr-frontend       # View logs"
echo "   docker stats hr-frontend      # View resource usage"