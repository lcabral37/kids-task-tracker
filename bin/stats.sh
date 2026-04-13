#!/bin/bash

# Kids Task Tracker - Backend Statistics Script
# Displays summary of registered children, tasks, and activities

API_URL="${API_URL:-http://localhost:3000}"
BOLD='\033[1m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}=== Kids Task Tracker Backend Statistics ===${NC}\n"

# Check if backend is running
echo "🔍 Checking backend connection..."
if ! curl -s "${API_URL}/api/health" > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend is not running on ${API_URL}${NC}"
    echo "Start it with: cd /development/kids-task-tracker/server && npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}\n"

# Get children
echo "📊 Fetching data..."
CHILDREN=$(curl -s "${API_URL}/api/children")
TEMPLATES=$(curl -s "${API_URL}/api/templates")

# Count children
CHILD_COUNT=$(echo "$CHILDREN" | jq 'length' 2>/dev/null || echo "0")

# Count tasks (earning type)
TASK_COUNT=$(echo "$TEMPLATES" | jq '[.[] | select(.type == "earning")] | length' 2>/dev/null || echo "0")

# Count activities (spending type)
ACTIVITY_COUNT=$(echo "$TEMPLATES" | jq '[.[] | select(.type == "spending")] | length' 2>/dev/null || echo "0")

# Total templates
TOTAL_TEMPLATES=$(echo "$TEMPLATES" | jq 'length' 2>/dev/null || echo "0")

echo -e "${BOLD}Summary:${NC}"
echo -e "  ${GREEN}👨‍👧‍👦 Children${NC}:     ${BOLD}$CHILD_COUNT${NC}"
echo -e "  ${GREEN}✅ Tasks${NC}:        ${BOLD}$TASK_COUNT${NC} (earning)"
echo -e "  ${GREEN}🎮 Activities${NC}:   ${BOLD}$ACTIVITY_COUNT${NC} (spending)"
echo -e "  ${GREEN}📋 Total Templates${NC}: ${BOLD}$TOTAL_TEMPLATES${NC}"

# Show children details if available
if [ "$CHILD_COUNT" -gt 0 ]; then
    echo -e "\n${BOLD}Children Details:${NC}"
    echo "$CHILDREN" | jq -r '.[] | "  • \(.name) (age \(.age), PIN: \(if .pin then "🔒 Protected" else "Unprotected" end))"' 2>/dev/null
fi

# Show tasks details if available
if [ "$TASK_COUNT" -gt 0 ]; then
    echo -e "\n${BOLD}Tasks:${NC}"
    echo "$TEMPLATES" | jq -r '.[] | select(.type == "earning") | "  • \(.title) (\(.amount) points)"' 2>/dev/null
fi

# Show activities details if available
if [ "$ACTIVITY_COUNT" -gt 0 ]; then
    echo -e "\n${BOLD}Activities:${NC}"
    echo "$TEMPLATES" | jq -r '.[] | select(.type == "spending") | "  • \(.title) (\(.amount) points)"' 2>/dev/null
fi

echo ""
