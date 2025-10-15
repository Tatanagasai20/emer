#!/bin/bash

# HR Management System - Database Deployment Script
# Instance 3: MongoDB Setup

set -e

echo "🗄️  Deploying MongoDB Database Instance..."

# Configuration
MONGO_ROOT_PASSWORD="your-secure-root-password"
MONGO_APP_PASSWORD="priacc-secure-password"
DATA_DIR="/opt/mongodb/data"
LOGS_DIR="/opt/mongodb/logs"

# Create directories
echo "📁 Creating MongoDB directories..."
sudo mkdir -p $DATA_DIR $LOGS_DIR
sudo chown -R 1000:1000 /opt/mongodb

# Stop existing container if running
echo "🛑 Stopping existing MongoDB container..."
docker stop mongodb 2>/dev/null || true
docker rm mongodb 2>/dev/null || true

# Run MongoDB container
echo "🚀 Starting MongoDB container..."
docker run -d \
  --name mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -v $DATA_DIR:/data/db \
  -v $LOGS_DIR:/var/log/mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_ROOT_PASSWORD \
  mongo:6.0

# Wait for MongoDB to start
echo "⏳ Waiting for MongoDB to start..."
sleep 10

# Create application user
echo "👤 Creating application user..."
docker exec mongodb mongosh -u admin -p $MONGO_ROOT_PASSWORD --eval "
use priacc_attendance;
db.createUser({
  user: 'priacc_user',
  pwd: '$MONGO_APP_PASSWORD',
  roles: [
    { role: 'readWrite', db: 'priacc_attendance' }
  ]
});
"

# Configure firewall (you'll need to replace with actual backend IP)
echo "🔥 Configuring firewall..."
echo "⚠️  Please run: sudo ufw allow from BACKEND_SERVER_IP to any port 27017"
echo "⚠️  Please run: sudo ufw enable"

# Verify deployment
echo "✅ Verifying MongoDB deployment..."
if docker ps | grep -q mongodb; then
    echo "✅ MongoDB container is running"
    docker exec mongodb mongosh -u admin -p $MONGO_ROOT_PASSWORD --eval "db.adminCommand('ping')"
    echo "✅ MongoDB is responding to ping"
else
    echo "❌ MongoDB deployment failed"
    exit 1
fi

echo "🎉 MongoDB deployment completed successfully!"
echo ""
echo "📝 Connection Details:"
echo "   Host: $(hostname -I | awk '{print $1}')"
echo "   Port: 27017"
echo "   Database: priacc_attendance"
echo "   Username: priacc_user"
echo "   Password: $MONGO_APP_PASSWORD"
echo ""
echo "🔒 Security Notes:"
echo "   - Configure firewall to allow only backend server"
echo "   - Change default passwords in production"
echo "   - Enable MongoDB authentication"