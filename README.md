# Kids Task Tracker 🎯

A Progressive Web App (PWA) for tracking kids' tasks, activities, and earnings with offline support, backend sync, and PIN protection.

## Features

✅ **Offline First** - Works completely offline with local database
✅ **Progressive Web App** - Installable on any device
✅ **Task Management** - Create earning and spending activities
✅ **Budget Tracking** - Track daily/weekly earnings and balances
✅ **PIN Protection** - Each child has a unique 4-6 digit PIN
✅ **QR Code Sharing** - Share child profiles via QR codes
✅ **Backend Sync** - Optional backend for data persistence
✅ **Docker Deployment** - Single-port Docker container
✅ **Cloud Ready** - One-command deployment to Vultr, DigitalOcean, Linode, AWS, etc.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start backend (port 3000)
npm --prefix server run dev

# Start frontend (port 3001)
npm run dev

# App will be at http://localhost:3001
```

### Docker (Recommended for Production)

```bash
# Build and run locally
docker-compose up -d

# Access at http://localhost:3000/app
```

### Cloud Deployment (Vultr, DigitalOcean, Linode, AWS)

```bash
# One-command deployment to any Linux VM with SSH
./deploy-cloud.sh <server_ip> <ssh_key_path> [domain_name]

# Example:
./deploy-cloud.sh 192.168.1.100 ~/.ssh/id_rsa
```

## Architecture

### Frontend

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Storage**: IndexedDB (with SQLite sync)

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite
- **API**: RESTful with full sync support

### Deployment

- **Docker**: Multi-stage build with Nginx reverse proxy
- **Ports**: Single port (3000) for both frontend and API
  - `/app` → Frontend
  - `/api` → Backend API
  - `/health` → Health check

## Project Structure

```
kids-task-tracker/
├── src/                    # Frontend React components
│   ├── components/        # UI components
│   ├── store/            # Zustand state management
│   ├── services/         # API services
│   └── types/            # TypeScript interfaces
├── server/               # Backend Node.js/Express
│   ├── src/
│   │   ├── server.ts    # Express server
│   │   ├── service.ts   # Business logic
│   │   ├── database.ts  # SQLite database
│   │   └── types.ts     # API types
│   └── package.json
├── Dockerfile            # Multi-stage production image
├── docker-compose.yml    # Local Docker setup
├── nginx.conf           # Reverse proxy config
├── deploy-cloud.sh      # Cloud deployment script
└── DOCKER.md            # Docker documentation
```

## Configuration

### Environment Variables

**Frontend (.env.local)**

```
VITE_API_URL=http://localhost:3000  # Optional, auto-detected
```

**Backend (server/.env or NODE_ENV)**

```
NODE_ENV=production
PORT=3001
DATABASE_URL=/path/to/database.db   # Optional, defaults to server/data/tasks.db
```

**Docker (environment)**

```
NODE_ENV=production
DATABASE_URL=/home/app/data/tasks.db
```

## Development

### Building

```bash
# Build frontend (produces dist/)
npm run build

# Build backend (server/dist/)
npm --prefix server run build

# Full Docker build
docker build -t kids-task-tracker:latest .
```

### Testing

```bash
# Run frontend build (validates TypeScript)
npm run build

# Run backend build
npm --prefix server run build
```

### Code Structure

- **Components** are in `src/components/` - Each major feature has its own view
- **State** is managed in `src/store/taskStore.ts` - Single Zustand store
- **API** calls are in `src/services/backend.ts` - Type-safe wrappers
- **Backend routes** are in `server/src/server.ts` - Express handlers
- **Database** is in `server/src/database.ts` - SQLite schema and queries

## Deployment

### Local Docker

```bash
docker-compose up -d

# Access: http://localhost:3000/app
# Logs: docker logs -f kids-task-tracker
# Stop: docker-compose down
```

### Cloud (Vultr/DigitalOcean/Linode/AWS)

```bash
# Prerequisites: Linux VM, SSH access, SSH key

./deploy-cloud.sh 192.168.1.100 ~/.ssh/id_rsa optional-domain.com

# Automatically:
# 1. Installs Docker
# 2. Uploads application code
# 3. Builds Docker image
# 4. Starts container with persistent database
# 5. Configures firewall
```

**After deployment:**

- App: `http://<server_ip>:3000/app`
- API: `http://<server_ip>:3000/api`
- Health: `http://<server_ip>:3000/health`

See [DOCKER.md](./DOCKER.md) for detailed deployment documentation.

## Features in Detail

### Task Management

- **Earning Tasks**: Activities that increase balance
- **Spending Activities**: Activities that decrease balance
- **Daily Reset**: Tasks can be toggled daily
- **Order Control**: Drag to reorder tasks
- **PIN Protection**: Each child needs PIN to make changes

### Data Sync

- **Offline First**: All changes stored locally
- **Optional Backend**: Sync to server when available
- **Smart Sync**: Only changed data is synced
- **Conflict Resolution**: Server is source of truth

### Backend Features

- **Child Management**: Create multiple child profiles
- **Task Templates**: Reusable task definitions
- **Daily Occurrences**: Track which tasks completed each day
- **Balance History**: Full audit trail of earnings/spending
- **QR Code Sharing**: Export child via QR for mobile access

### Security

- **PIN Protection**: 4-6 digit PIN per child
- **PIN Caching**: PIN stored locally in encrypted Zustand store
- **No Backend Auth**: PIN + child ID = access control
- **SQLite Database**: Local data stays local unless synced

## Scripts

### Statistics & Monitoring

```bash
# Quick stats about registered children and tasks
./bin/stats.sh

# Detailed database dump with colors
./bin/detailed-stats.sh

# Export all data as JSON with timestamp
./bin/export-data.sh

# Custom API URL
API_URL=http://192.168.1.100:3000 ./bin/stats.sh
```

### Validation

```bash
# Validate Docker configuration
./validate-docker.sh
```

## Troubleshooting

### Frontend not connecting to backend

The app automatically detects the backend URL based on your access method:

- Local access: `localhost:3000`
- External IP access: `<your_ip>:3000`

Check Settings → Server URLs to verify correct URLs.

### Database not persisting

Docker: Ensure volume is mounted (`docker-compose.yml` does this)

```bash
docker inspect kids-task-tracker | grep -A 5 "Mounts"
```

### Container won't start

```bash
# Check logs
docker logs kids-task-tracker

# Ensure port 3000 is available
sudo netstat -tulpn | grep 3000

# Rebuild
docker-compose down && docker-compose up -d --build
```

## Performance

- **Frontend**: ~631 KB gzipped (React + UI + service worker)
- **Build Time**: ~10 seconds (development), ~30 seconds (Docker)
- **Container Size**: ~400 MB (includes Node.js, Nginx, dependencies)
- **Database**: Scales to 1000s of daily records per child

## API Endpoints

All endpoints require `child_id` and `pin` for authentication (except health).

### Available Endpoints

- `POST /sync` - Sync data from client
- `GET /health` - Health check
- `POST /child` - Create child
- `GET /child/:id` - Get child data

Full documentation in [DOCKER.md](./DOCKER.md)

## Browser Support

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Contributing

This is a personal project. Feel free to fork and modify for your needs.

## License

Private project for family use.

## Support

For deployment issues:

1. Check [DOCKER.md](./DOCKER.md) for detailed deployment guide
2. Run `./validate-docker.sh` to validate configuration
3. Check logs: `docker logs -f kids-task-tracker`
4. Verify network: `curl http://<ip>:3000/health`

## Roadmap

- [ ] PostgreSQL support for larger deployments
- [ ] Multi-user backend authentication
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Parent portal for monitoring
