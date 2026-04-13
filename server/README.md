# Kids Task Tracker Backend Server

Express.js + SQLite backend for the Kids Task Tracker PWA.

## Features

- RESTful API for child data management
- Task template and occurrence sync
- PIN-based child authentication
- Local SQLite database persistence
- CORS support for frontend communication
- Health check endpoint

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Production Build

```bash
npm run build
```

## API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Children Management

- `GET /api/children` - List all children
- `POST /api/children` - Create a new child
- `GET /api/children/:id` - Get specific child
- `PUT /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

### Task Templates

- `GET /api/templates` - List all task templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Task Occurrences

- `POST /api/occurrences` - Record task occurrence
- `PUT /api/occurrences/:id` - Update occurrence
- `DELETE /api/occurrences/:id` - Delete occurrence

### Sync Endpoint

- `POST /api/sync/:childId` - Push local data to server
- `GET /api/sync/:childId` - Pull data from server

### PIN Verification

- `POST /api/children/:id/verify-pin` - Verify child PIN

## Database Schema

The SQLite database includes the following tables:

- **children** - Child profiles with PIN protection
- **taskTemplates** - Reusable task definitions
- **taskOccurrences** - Per-child per-day task completions
- **syncLog** - Sync history and timestamps

## Environment Variables

Currently no environment variables required. Future enhancements:

- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origins
- `DB_PATH` - SQLite database file path

## Notes

- PIN verification is done locally for security
- Data sync uses bulk upsert to avoid conflicts
- Each occurrence is unique per (templateId, childId, date)
- No authentication required; implement as needed

## Future Enhancements

- [ ] Authentication system
- [ ] Conflict resolution for concurrent syncs
- [ ] Data export/import
- [ ] Multi-device sync with user accounts
- [ ] Cloud backup integration
