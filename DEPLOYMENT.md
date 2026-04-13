# Docker & Deployment Quick Reference

## Local Testing

```bash
# Validate Docker configuration
./validate-docker.sh

# Test Docker locally (starts container and runs tests)
./test-docker-local.sh
```

## Production Deployment

### One-Command Cloud Deploy

Deploy to **Vultr**, **DigitalOcean**, **Linode**, **AWS**, or any Linux VM:

```bash
./deploy-cloud.sh <server_ip> <ssh_key_path> [optional_domain]
```

**Examples:**

```bash
# Vultr
./deploy-cloud.sh 45.76.120.50 ~/.ssh/vultr_key

# DigitalOcean
./deploy-cloud.sh 167.99.100.50 ~/.ssh/digitalocean_key

# With custom domain
./deploy-cloud.sh 45.76.120.50 ~/.ssh/key example.com

# AWS EC2
./deploy-cloud.sh 54.123.45.67 ~/Downloads/my-key.pem
```

### What Gets Deployed

- ✅ Full application (frontend + backend)
- ✅ Docker container running on single port 3000
- ✅ Persistent SQLite database
- ✅ Nginx reverse proxy
- ✅ Health monitoring
- ✅ Firewall configuration

### After Deployment

Access the app at:

- **URL**: `http://<server_ip>:3000/app`
- **API**: `http://<server_ip>:3000/api`

## Container Commands

### Docker Compose (Local)

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Full rebuild
docker-compose up -d --build
```

### Docker (Manual)

```bash
# Build image
docker build -t kids-task-tracker:latest .

# Run container
docker run -d \
  --name kids-task-tracker \
  -p 3000:3000 \
  -e DATABASE_URL=/home/app/data/tasks.db \
  -v /path/to/data:/home/app/data \
  kids-task-tracker:latest

# View logs
docker logs -f kids-task-tracker

# Stop
docker stop kids-task-tracker

# Restart
docker restart kids-task-tracker
```

## Server Management (Cloud)

After deployment, manage the remote application:

```bash
# SSH into server
ssh -i <key> root@<ip>

# View logs (realtime)
docker logs -f kids-task-tracker

# Stop application
docker stop kids-task-tracker

# Start application
docker start kids-task-tracker

# Restart application
docker restart kids-task-tracker

# View container status
docker ps -a | grep kids-task-tracker

# Database operations
sqlite3 /opt/kids-task-tracker/data/tasks.db "SELECT COUNT(*) FROM children;"
```

## Backup & Restore

### Backup Database

```bash
# From local machine
scp -i <key> root@<ip>:/opt/kids-task-tracker/data/tasks.db ./backup.db

# Or from server
ssh -i <key> root@<ip> 'cp /opt/kids-task-tracker/data/tasks.db /opt/kids-task-tracker/data/tasks-backup.db'
```

### Restore Database

```bash
# Copy backup back to server
scp -i <key> ./backup.db root@<ip>:/opt/kids-task-tracker/data/tasks.db

# Restart to reload
ssh -i <key> root@<ip> docker restart kids-task-tracker
```

## Monitoring

### Health Check

```bash
# From local machine
curl http://<ip>:3000/health

# Should return:
# {"status":"ok"}
```

### View Stats

```bash
# Quick stats
./bin/stats.sh

# Detailed stats
./bin/detailed-stats.sh

# Export data
./bin/export-data.sh
```

## Configuration

### Environment Variables

```bash
# Frontend (optional - auto-detected)
VITE_API_URL=http://localhost:3000

# Backend/Docker (optional)
NODE_ENV=production
DATABASE_URL=/home/app/data/tasks.db
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs kids-task-tracker

# Check port usage
sudo netstat -tulpn | grep 3000

# Try rebuilding
docker-compose down && docker-compose up -d --build
```

### Connection refused

```bash
# Verify container is running
docker ps | grep kids-task-tracker

# Wait for startup (first boot takes 2-5 minutes)
sleep 60
curl http://localhost:3000/health

# Check firewall
sudo ufw status
```

### Database issues

```bash
# Check database file exists
ls -la /home/app/data/tasks.db

# Verify permissions
stat /home/app/data/

# Backup and restart
docker cp kids-task-tracker:/home/app/data/tasks.db backup.db
docker restart kids-task-tracker
```

## Performance Tips

- **First Boot**: Docker build takes 2-5 minutes (only once)
- **Restarts**: ~10-30 seconds
- **No Build**: Just use pre-built image (update deployment)

## Security Checklist

- ✅ SSH key stored securely (not in repo)
- ✅ Firewall configured (only needed ports open)
- ✅ Database backed up regularly
- ✅ No secrets in environment variables
- ✅ HTTPS recommended for production (use reverse proxy)

## Update Application

To deploy a new version:

```bash
./deploy-cloud.sh <ip> <key> [domain]
```

This will:

1. Stop old container
2. Pull latest code
3. Rebuild Docker image
4. Start new container (with existing database)

## Getting Help

1. **Validation**: Run `./validate-docker.sh`
2. **Docker Logs**: `docker logs -f kids-task-tracker`
3. **Container Status**: `docker ps -a`
4. **Documentation**: See [DOCKER.md](./DOCKER.md)
