# Backend Statistics Scripts

Quick scripts to query the backend API and display information about registered children, tasks, and activities.

## Prerequisites

- Backend must be running: `cd server && npm run dev`
- `curl` installed
- `jq` installed (for JSON parsing)
- Bash 4+

## Scripts

### 1. `stats.sh` - Quick Summary

Shows a quick overview of all data in the backend.

```bash
./bin/stats.sh
```

**Output:**

- Total number of children
- Total number of tasks (earning)
- Total number of activities (spending)
- List of all children with names and ages
- List of all tasks and activities with point values

**Example:**

```
🔍 Checking backend connection...
✅ Backend is running

📊 Fetching data...

Summary:
  👨‍👧‍👦 Children:     2
  ✅ Tasks:        5
  🎮 Activities:   3
  📋 Total Templates: 8

Children Details:
  • Alice (age 10, PIN: 🔒 Protected)
  • Bob (age 8, PIN: Unprotected)

Tasks:
  • Homework (50 points)
  • Clean Room (30 points)

Activities:
  • Ice Cream (20 points)
  • Movie (15 points)
```

### 2. `detailed-stats.sh` - Full Report

Shows complete information about all children, tasks, and activities with IDs and metadata.

```bash
./bin/detailed-stats.sh
```

**Output:**

- Detailed child information (ID, age, PIN status)
- All tasks with descriptions and order
- All activities with descriptions and order
- Summary totals

### 3. `export-data.sh` - JSON Export

Exports all backend data as a single JSON file.

```bash
./bin/export-data.sh > backup.json
./bin/export-data.sh | tee data-$(date +%s).json
```

**Output:**

- Timestamp
- All children data
- All templates data
- Properly formatted JSON

## Configuration

Set custom backend URL:

```bash
API_URL="http://192.168.1.100:3000" ./bin/stats.sh
API_URL="http://backend.example.com" ./bin/detailed-stats.sh
```

Default: `http://localhost:3000`

## Installation

Scripts are already in `/development/kids-task-tracker/bin/`

Make them executable if needed:

```bash
chmod +x bin/*.sh
```

## Examples

### Quick count of everything

```bash
./bin/stats.sh
```

### Export all data for backup

```bash
./bin/export-data.sh > backups/backup-$(date +%Y-%m-%d).json
```

### Check specific children

```bash
./bin/detailed-stats.sh | grep -A 5 "Name: Alice"
```

### Monitor changes (requires `watch`)

```bash
watch -n 5 ./bin/stats.sh
```

### Get just the numbers

```bash
curl -s http://localhost:3000/api/children | jq 'length'
curl -s http://localhost:3000/api/templates | jq '[.[] | select(.type=="earning")] | length'
curl -s http://localhost:3000/api/templates | jq '[.[] | select(.type=="spending")] | length'
```

## Troubleshooting

**"Backend not running"**

```bash
cd /development/kids-task-tracker/server
npm run dev
```

**"command not found: jq"**

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Manual JSON parsing (slower, no jq needed)
./bin/export-data.sh
```

**"Permission denied"**

```bash
chmod +x bin/stats.sh bin/detailed-stats.sh bin/export-data.sh
```

## API Endpoints Used

- `GET /api/health` - Health check
- `GET /api/children` - List all children
- `GET /api/templates` - List all task templates

## Notes

- Scripts assume JSON output from backend API
- All scripts are read-only (no data modification)
- Results are current snapshot at time of execution
- For real-time monitoring, use `watch` command
