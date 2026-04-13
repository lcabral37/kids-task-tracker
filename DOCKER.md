# Docker & Cloud Deployment Guide

This guide explains how to deploy Kids Task Tracker using Docker and to cloud providers.

## Local Docker Deployment

### Prerequisites

- Docker and Docker Compose installed
- Unix-like system (Linux, macOS, WSL on Windows)

### Quick Start

```bash
# Build and run locally
docker-compose up -d

# Access the app
# Frontend: http://localhost:3000/app
# API: http://localhost:3000/api
# Health: http://localhost:3000/health
```

### Docker Commands

```bash
# View logs
docker logs -f kids-task-tracker

# Stop the container
docker-compose down

# Stop and remove data volume
docker-compose down -v

# Rebuild the image
docker-compose up -d --build

# Check container status
docker ps | grep kids-task-tracker
```

### Using a Specific Database

```bash
# Mount a custom database location
docker run -d \
  --name kids-task-tracker \
  -p 3000:3000 \
  -e DATABASE_URL=/custom/path/tasks.db \
  -v /path/to/database:/custom/path \
  kids-task-tracker:latest
```

### Backup & Restore Database

```bash
# Backup
docker cp kids-task-tracker:/home/app/data/tasks.db ./tasks-backup.db

# Restore
docker cp ./tasks-backup.db kids-task-tracker:/home/app/data/tasks.db
docker restart kids-task-tracker
```

## Cloud Deployment (Vultr, DigitalOcean, Linode, AWS EC2, etc.)

### Prerequisites

- Linux VM (Ubuntu 20.04+ recommended) with root SSH access
- SSH key for authentication
- Public IP address assigned to the VM

### One-Command Deployment

```bash
# Deploy to Vultr, DigitalOcean, Linode, or any cloud provider with SSH access
./deploy-cloud.sh <server_ip> <ssh_key_path> [domain_name]

# Examples:
./deploy-cloud.sh 192.168.1.100 ~/.ssh/id_rsa
./deploy-cloud.sh 45.76.120.50 ~/.ssh/vultr_key
./deploy-cloud.sh 45.76.120.50 ~/.ssh/vultr_key example.com
```

### What the Deployment Script Does

1. **Tests SSH connection** - Validates access to the remote server
2. **Installs dependencies** - Installs Docker, Docker Compose, curl, wget
3. **Uploads application** - Copies app files to `/opt/kids-task-tracker`
4. **Builds Docker image** - Compiles frontend and backend
5. **Starts container** - Launches the application with proper volume mounts
6. **Configures firewall** - Opens necessary ports (3000, 80, 443)
7. **Displays summary** - Shows access URLs and useful commands

### After Deployment

The application will be accessible at:

- **App URL**: `http://<server_ip>:3000/app`
- **API URL**: `http://<server_ip>:3000/api`
- **Health**: `http://<server_ip>:3000/health`

### Server Access Examples

```bash
# View real-time logs
ssh -i ~/.ssh/id_rsa root@<server_ip> docker logs -f kids-task-tracker

# Stop the application
ssh -i ~/.ssh/id_rsa root@<server_ip> docker stop kids-task-tracker

# Restart the application
ssh -i ~/.ssh/id_rsa root@<server_ip> docker restart kids-task-tracker

# Query the database
ssh -i ~/.ssh/id_rsa root@<server_ip> \
  sqlite3 /opt/kids-task-tracker/data/tasks.db "SELECT COUNT(*) FROM children;"

# Backup database
scp -i ~/.ssh/id_rsa \
  root@<server_ip>:/opt/kids-task-tracker/data/tasks.db \
  ./tasks-backup-$(date +%Y%m%d).db
```

## Docker Image Details

### Image Layers

- **Stage 1**: Frontend builder - Builds React/Vite application
- **Stage 2**: Backend builder - Builds Node.js API server
- **Stage 3**: Runtime - Minimal Alpine Linux with Node.js, Nginx

### Port Configuration

- **3000**: Combined port for both frontend and API via Nginx reverse proxy
  - `/app` → Static frontend files
  - `/api` → Backend API proxy
  - `/health` → Health check endpoint

### Environment Variables

```bash
# Set custom database location
DATABASE_URL=/path/to/database.db

# Set environment
NODE_ENV=production  # default
```

### Volume Mounts

```bash
# Persistent database storage (recommended)
-v /opt/kids-task-tracker/data:/home/app/data
```

## Nginx Configuration

The Dockerfile includes Nginx as a reverse proxy:

- Serves static frontend at `/app`
- Proxies API requests from `/api` to backend (port 3001)
- Provides health check endpoint at `/health`
- Redirects root `/` to `/app`

## Cloud Provider Specific Notes

### Vultr

1. Create a new compute instance (Ubuntu 20.04+)
2. Note the IP address
3. Download the SSH key
4. Run: `./deploy-cloud.sh <ip> <ssh_key> [domain]`

### DigitalOcean

1. Create a new Droplet (Ubuntu 20.04+)
2. Use SSH key authentication during creation
3. Note the Droplet IP
4. Run: `./deploy-cloud.sh <ip> <ssh_key> [domain]`

### Linode

1. Create a new Linode (Ubuntu 20.04+)
2. Add your SSH key in the settings
3. Note the IP address
4. Run: `./deploy-cloud.sh <ip> <ssh_key> [domain]`

### AWS EC2

1. Create an EC2 instance (Ubuntu 20.04+ AMI)
2. Create/use existing key pair
3. Configure security group to allow port 3000
4. Note the public IP
5. Run: `./deploy-cloud.sh <public_ip> <key.pem> [domain]`

## Database Persistence

### Local Docker

Data is stored in a Docker volume (`kids-task-tracker-db`) that persists across container restarts.

### Cloud Deployment

Database is stored at `/opt/kids-task-tracker/data/tasks.db` on the server and mounted into the container. The file persists even if the container is stopped or restarted.

### Backup Strategy

```bash
# Daily automated backup (on server)
ssh -i key root@ip << 'EOF'
crontab -e
# Add this line:
0 2 * * * cp /opt/kids-task-tracker/data/tasks.db /opt/kids-task-tracker/backups/tasks-$(date +\%Y\%m\%d).db
EOF
```

## Updating the Application

To update to a new version:

```bash
# For cloud deployment, re-run the deployment script
./deploy-cloud.sh <server_ip> <ssh_key> [domain]

# For local Docker
docker-compose down
docker-compose up -d --build
```

This will:

1. Pull latest code
2. Rebuild the Docker image with new code
3. Stop the old container
4. Start the new container with the existing database

## Troubleshooting

### Connection refused

```bash
# Check if container is running
docker ps | grep kids-task-tracker

# Check logs
docker logs kids-task-tracker

# Verify port 3000 is open
netstat -tulpn | grep 3000
```

### Database not persisting

```bash
# Verify volume mount
docker inspect kids-task-tracker | grep -A 5 "Mounts"

# For cloud: check if /opt/kids-task-tracker/data exists
ssh -i key root@ip ls -la /opt/kids-task-tracker/data/
```

### Slow startup

- First startup builds the Docker image - this can take 2-5 minutes
- Subsequent restarts are much faster (~10-30 seconds)
- Monitor progress: `docker logs -f kids-task-tracker`

## Performance & Scaling

### Recommended Settings

- **Minimum**: 1 vCPU, 512MB RAM
- **Comfortable**: 2 vCPU, 1GB RAM
- **Production**: 4+ vCPU, 2GB+ RAM

### For Multiple Users

- Current SQLite setup works well for up to 50-100 concurrent users
- For larger deployments, consider migrating to PostgreSQL

## Security Considerations

1. **SSH Key**: Protect your SSH key with appropriate permissions
2. **Firewall**: Only open necessary ports (3000, 80, 443)
3. **HTTPS**: Use a reverse proxy (nginx, Caddy) or cloud provider's SSL
4. **Database**: Regularly backup and secure your database file
5. **Updates**: Keep Docker and system packages updated

## Support & Monitoring

### Health Monitoring

```bash
# Check health endpoint
curl http://<server_ip>:3000/health
# Should return: {"status":"ok"}

# Monitor container status
watch docker stats kids-task-tracker
```

### Container Status

```bash
# Full container info
docker inspect kids-task-tracker

# Resource usage
docker stats kids-task-tracker

# Recent logs (last 100 lines)
docker logs --tail 100 kids-task-tracker
```
