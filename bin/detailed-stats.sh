#!/bin/bash

# Kids Task Tracker - Detailed Backend Statistics
# Shows comprehensive information about all children, tasks, activities, and occurrences

API_URL="${API_URL:-http://localhost:3000}"
BOLD='\033[1m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}=== Kids Task Tracker - Detailed Backend Report ===${NC}\n"

# Check backend
echo "🔍 Checking backend..."
if ! curl -s "${API_URL}/api/health" > /dev/null; then
    echo -e "${RED}❌ Backend not running on ${API_URL}${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend OK${NC}\n"

# Fetch all data
CHILDREN=$(curl -s "${API_URL}/api/children")
TEMPLATES=$(curl -s "${API_URL}/api/templates")

echo -e "${BOLD}${BLUE}=== CHILDREN ===${NC}"
echo "$CHILDREN" | jq -r '.[] |
    "ID: \(.id)\n" +
    "Name: \(.name)\n" +
    "Age: \(.age)\n" +
    "PIN: \(if .pin then "🔒 Protected" else "❌ No PIN" end)\n" +
    "Manual Adjustment: \(.manualAdjustment)\n" +
    "---"' 2>/dev/null

CHILD_COUNT=$(echo "$CHILDREN" | jq 'length' 2>/dev/null || echo "0")
echo -e "${BOLD}Total Children: $CHILD_COUNT${NC}\n"

echo -e "${BOLD}${BLUE}=== TASKS (Earning) ===${NC}"
echo "$TEMPLATES" | jq -r '.[] | select(.type == "earning") |
    "Title: \(.title)\n" +
    "ID: \(.id)\n" +
    "Amount: \(.amount) points\n" +
    "Order: \(.order)\n" +
    "Icon: \(.icon // "None")\n" +
    "---"' 2>/dev/null

TASK_COUNT=$(echo "$TEMPLATES" | jq '[.[] | select(.type == "earning")] | length' 2>/dev/null || echo "0")
echo -e "${BOLD}Total Tasks: $TASK_COUNT${NC}\n"

echo -e "${BOLD}${BLUE}=== ACTIVITIES (Spending) ===${NC}"
echo "$TEMPLATES" | jq -r '.[] | select(.type == "spending") |
    "Title: \(.title)\n" +
    "ID: \(.id)\n" +
    "Amount: \(.amount) points\n" +
    "Order: \(.order)\n" +
    "Icon: \(.icon // "None")\n" +
    "---"' 2>/dev/null

ACTIVITY_COUNT=$(echo "$TEMPLATES" | jq '[.[] | select(.type == "spending")] | length' 2>/dev/null || echo "0")
echo -e "${BOLD}Total Activities: $ACTIVITY_COUNT${NC}\n"

echo -e "${BOLD}${BLUE}=== SUMMARY ===${NC}"
echo -e "  ${GREEN}Children${NC}:      ${BOLD}$CHILD_COUNT${NC}"
echo -e "  ${GREEN}Tasks${NC}:         ${BOLD}$TASK_COUNT${NC}"
echo -e "  ${GREEN}Activities${NC}:    ${BOLD}$ACTIVITY_COUNT${NC}"
echo -e "  ${GREEN}Total${NC}:         ${BOLD}$((TASK_COUNT + ACTIVITY_COUNT))${NC} templates"
