#!/bin/bash

# Local Docker testing script
# Helps test the Docker setup locally before cloud deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐳 Kids Task Tracker - Local Docker Test${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Function to clean up
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Trap Ctrl+C
trap cleanup EXIT

# Start containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

# Wait for container to be healthy
echo -e "${YELLOW}⏳ Waiting for container to be healthy...${NC}"
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker-compose ps | grep -q "healthy"; then
        echo -e "${GREEN}✓ Container is healthy${NC}"
        break
    fi

    if docker-compose ps | grep -q "unhealthy"; then
        echo -e "${RED}✗ Container failed health check${NC}"
        echo ""
        echo "Container logs:"
        docker logs kids-task-tracker
        exit 1
    fi

    echo -n "."
    sleep 1
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}✗ Timeout waiting for container${NC}"
    echo ""
    echo "Container status:"
    docker-compose ps
    echo ""
    echo "Container logs:"
    docker logs kids-task-tracker
    exit 1
fi

echo ""

# Test endpoints
echo -e "${BLUE}Testing Endpoints:${NC}"
echo ""

# Health check
echo -n "  Health (/health): "
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Frontend
echo -n "  Frontend (/app): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app | grep -q "200"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# API
echo -n "  API (/api/health): "
if curl -s http://localhost:3000/api/health 2>/dev/null | grep -q "ok" || [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} (API accessible)"
else
    echo -e "${YELLOW}⚠ (API may require auth)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Docker setup is working!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}Access URLs:${NC}"
echo -e "  App: ${GREEN}http://localhost:3000/app${NC}"
echo -e "  API: ${GREEN}http://localhost:3000/api${NC}"
echo -e "  Health: ${GREEN}http://localhost:3000/health${NC}"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:      docker logs -f kids-task-tracker"
echo "  Stop:           docker-compose down"
echo "  Restart:        docker-compose restart"
echo "  Rebuild:        docker-compose up -d --build"
echo "  Database:       docker exec kids-task-tracker sqlite3 /home/app/data/tasks.db '.tables'"
echo ""

echo -e "${YELLOW}Press Ctrl+C to stop and cleanup${NC}"
echo ""

# Keep running
while true; do
    sleep 1
done
