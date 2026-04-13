#!/bin/bash

# Kids Task Tracker - Cloud Deployment Script
# Supports: Vultr, Linode, DigitalOcean, AWS EC2, and other Linux VMs
# Usage: ./deploy-cloud.sh <server_ip> <ssh_key_path> [optional: domain_name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="${1:-}"
SSH_KEY="${2:-}"
DOMAIN="${3:-}"
APP_NAME="kids-task-tracker"
APP_PORT=3000
APP_DIR="/opt/kids-task-tracker"

# Validate inputs
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}Error: Server IP is required${NC}"
    echo "Usage: $0 <server_ip> <ssh_key_path> [domain_name]"
    exit 1
fi

if [ -z "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key path is required${NC}"
    echo "Usage: $0 <server_ip> <ssh_key_path> [domain_name]"
    exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found: $SSH_KEY${NC}"
    exit 1
fi

# SSH configuration
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10"
SSH_CMD="ssh $SSH_OPTS -i $SSH_KEY root@$SERVER_IP"
SCP_CMD="scp $SSH_OPTS -i $SSH_KEY"

echo -e "${BLUE}🚀 Kids Task Tracker - Cloud Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Server IP: ${GREEN}$SERVER_IP${NC}"
echo -e "SSH Key: ${GREEN}$SSH_KEY${NC}"
[ -n "$DOMAIN" ] && echo -e "Domain: ${GREEN}$DOMAIN${NC}"
echo ""

# Step 1: Test SSH connection
echo -e "${YELLOW}📡 Testing SSH connection...${NC}"
if ! $SSH_CMD "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}✗ Failed to connect to server${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection successful${NC}"

# Step 2: Update system and install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
$SSH_CMD bash -s << 'SCRIPT'
    set -e
    echo "Updating system packages..."
    apt-get update -qq
    apt-get upgrade -y -qq

    echo "Installing Docker..."
    if ! command -v docker &> /dev/null; then
        apt-get install -y -qq docker.io docker-compose-plugin
        systemctl start docker
        systemctl enable docker
    fi

    echo "Installing curl and wget..."
    apt-get install -y -qq curl wget

    echo "Dependencies installed successfully"
SCRIPT
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Create app directory and copy files
echo -e "${YELLOW}🗂️  Setting up application directory...${NC}"
$SSH_CMD mkdir -p "$APP_DIR"

# Create a temporary tar archive of the current directory
echo "Creating deployment archive..."
TAR_FILE="/tmp/${APP_NAME}-$(date +%s).tar.gz"
tar --exclude='.git' \
    --exclude='node_modules' \
    --exclude='server/node_modules' \
    --exclude='dist' \
    --exclude='server/dist' \
    --exclude='.vscode' \
    --exclude='.idea' \
    --exclude='*.log' \
    -czf "$TAR_FILE" -C "$(dirname "$0")" "$(basename "$0")"

# Copy to server
echo "Uploading application files..."
$SCP_CMD "$TAR_FILE" "root@$SERVER_IP:/tmp/"
$SSH_CMD tar -xzf "/tmp/$(basename $TAR_FILE)" -C "$APP_DIR" --strip-components=1
$SSH_CMD rm "/tmp/$(basename $TAR_FILE)"
rm "$TAR_FILE"
echo -e "${GREEN}✓ Application files uploaded${NC}"

# Step 4: Build and start Docker container
echo -e "${YELLOW}🐳 Building Docker image...${NC}"
$SSH_CMD bash -s << SCRIPT
    cd $APP_DIR
    echo "Building Docker image..."
    docker build -t $APP_NAME:latest .
    echo "Build completed"
SCRIPT
echo -e "${GREEN}✓ Docker image built${NC}"

# Step 5: Create data directory and start container
echo -e "${YELLOW}🚀 Starting application...${NC}"
$SSH_CMD bash -s << SCRIPT
    set -e
    cd $APP_DIR

    # Create data volume directory
    mkdir -p $APP_DIR/data

    # Stop and remove existing container if it exists
    if docker ps -a --format '{{.Names}}' | grep -q ^${APP_NAME}\$; then
        echo "Stopping existing container..."
        docker stop $APP_NAME || true
        docker rm $APP_NAME || true
    fi

    # Start new container
    echo "Starting container..."
    docker run -d \
        --name $APP_NAME \
        --restart unless-stopped \
        -p ${APP_PORT}:3000 \
        -e NODE_ENV=production \
        -e DATABASE_URL=$APP_DIR/data/tasks.db \
        -v $APP_DIR/data:$APP_DIR/data \
        $APP_NAME:latest

    echo "Container started, waiting for health check..."
    sleep 5

    # Health check
    for i in {1..30}; do
        if curl -s http://localhost:${APP_PORT}/health > /dev/null 2>&1; then
            echo "Application is healthy"
            break
        fi
        if [ \$i -eq 30 ]; then
            echo "Health check failed"
            docker logs $APP_NAME
            exit 1
        fi
        sleep 1
    done
SCRIPT
echo -e "${GREEN}✓ Application started successfully${NC}"

# Step 6: Configure firewall (if ufw is available)
echo -e "${YELLOW}🔒 Configuring firewall...${NC}"
$SSH_CMD bash -s << SCRIPT
    if command -v ufw &> /dev/null; then
        # Enable SSH
        ufw allow 22/tcp || true
        # Enable app port
        ufw allow ${APP_PORT}/tcp || true
        # Enable HTTP and HTTPS if domain is set
        ufw allow 80/tcp || true
        ufw allow 443/tcp || true
        echo "Firewall configured"
    fi
SCRIPT
echo -e "${GREEN}✓ Firewall configured${NC}"

# Step 7: Display deployment summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Application Details:${NC}"
echo -e "  URL: ${GREEN}http://$SERVER_IP:$APP_PORT/app${NC}"
echo -e "  API: ${GREEN}http://$SERVER_IP:$APP_PORT/api${NC}"
echo -e "  Health: ${GREEN}http://$SERVER_IP:$APP_PORT/health${NC}"
echo ""

if [ -n "$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️  Domain Support:${NC}"
    echo "  To use your domain, configure DNS to point to $SERVER_IP"
    echo "  Then access: http://$DOMAIN:$APP_PORT/app"
    echo ""
fi

echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:      ssh -i $SSH_KEY root@$SERVER_IP docker logs -f $APP_NAME"
echo "  Stop app:       ssh -i $SSH_KEY root@$SERVER_IP docker stop $APP_NAME"
echo "  Start app:      ssh -i $SSH_KEY root@$SERVER_IP docker start $APP_NAME"
echo "  Restart app:    ssh -i $SSH_KEY root@$SERVER_IP docker restart $APP_NAME"
echo "  View DB:        ssh -i $SSH_KEY root@$SERVER_IP sqlite3 $APP_DIR/data/tasks.db"
echo ""
echo -e "${BLUE}Backup Database:${NC}"
echo "  scp -i $SSH_KEY root@$SERVER_IP:$APP_DIR/data/tasks.db ./tasks-backup-\$(date +%Y%m%d).db"
echo ""
echo -e "${BLUE}Update Application:${NC}"
echo "  ./deploy-cloud.sh $SERVER_IP $SSH_KEY $DOMAIN"
echo ""
