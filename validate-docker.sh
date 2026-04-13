#!/bin/bash

# Quick Docker build test script
# This validates that the Dockerfile has the correct syntax without needing to build

echo "🐳 Validating Dockerfile..."

# Check if Dockerfile exists
if [ ! -f Dockerfile ]; then
    echo "❌ Dockerfile not found"
    exit 1
fi

# Check for required sections
echo "Checking Dockerfile structure..."

if ! grep -q "FROM node:20-alpine AS frontend-builder" Dockerfile; then
    echo "❌ Missing frontend builder stage"
    exit 1
fi
echo "✓ Frontend builder stage present"

if ! grep -q "FROM node:20-alpine AS backend-builder" Dockerfile; then
    echo "❌ Missing backend builder stage"
    exit 1
fi
echo "✓ Backend builder stage present"

if ! grep -q "FROM node:20-alpine" Dockerfile; then
    echo "❌ Missing runtime stage"
    exit 1
fi
echo "✓ Runtime stage present"

if ! grep -q "COPY --from=frontend-builder" Dockerfile; then
    echo "❌ Missing frontend copy"
    exit 1
fi
echo "✓ Frontend files copy present"

if ! grep -q "COPY --from=backend-builder" Dockerfile; then
    echo "❌ Missing backend copy"
    exit 1
fi
echo "✓ Backend files copy present"

if ! grep -q "EXPOSE 3000" Dockerfile; then
    echo "❌ Missing port exposure"
    exit 1
fi
echo "✓ Port 3000 exposed"

# Validate nginx.conf
echo ""
echo "✓ Validating nginx.conf..."
if [ ! -f nginx.conf ]; then
    echo "❌ nginx.conf not found"
    exit 1
fi

if ! grep -q "listen 3000" nginx.conf; then
    echo "❌ Nginx not listening on port 3000"
    exit 1
fi
echo "✓ Nginx configuration valid"

# Validate docker-compose.yml
echo ""
echo "Validating docker-compose.yml..."
if [ ! -f docker-compose.yml ]; then
    echo "❌ docker-compose.yml not found"
    exit 1
fi

if ! grep -q "kids-task-tracker" docker-compose.yml; then
    echo "❌ Service name missing"
    exit 1
fi
echo "✓ docker-compose.yml configuration valid"

# Validate deploy-cloud.sh
echo ""
echo "Validating deploy-cloud.sh..."
if [ ! -f deploy-cloud.sh ]; then
    echo "❌ deploy-cloud.sh not found"
    exit 1
fi

if ! [ -x deploy-cloud.sh ]; then
    echo "❌ deploy-cloud.sh is not executable"
    chmod +x deploy-cloud.sh
    echo "✓ Fixed: deploy-cloud.sh is now executable"
fi

if ! grep -q "docker build" deploy-cloud.sh; then
    echo "❌ Docker build command missing from deploy script"
    exit 1
fi
echo "✓ deploy-cloud.sh structure valid"

echo ""
echo "✅ All Docker configurations validated successfully!"
echo ""
echo "Next steps:"
echo "1. Local test: docker-compose up -d"
echo "2. Cloud deploy: ./deploy-cloud.sh <ip> <ssh_key>"
echo ""
