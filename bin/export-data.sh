#!/bin/bash

# Kids Task Tracker - Quick JSON Export
# Exports all backend data as formatted JSON

API_URL="${API_URL:-http://localhost:3000}"

echo "Fetching backend data..."

# Check backend
if ! curl -s "${API_URL}/api/health" > /dev/null; then
    echo "Backend not running on ${API_URL}"
    exit 1
fi

# Fetch data
CHILDREN=$(curl -s "${API_URL}/api/children")
TEMPLATES=$(curl -s "${API_URL}/api/templates" 2>/dev/null)

# If templates endpoint doesn't exist, use empty array
if echo "$TEMPLATES" | grep -q "<!DOCTYPE"; then
    TEMPLATES="[]"
fi

# Simple JSON construction and pretty-print
echo "{
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"children\": $CHILDREN,
  \"templates\": $TEMPLATES
}" | jq . 2>/dev/null || echo "Error formatting JSON. Raw data:"

echo ""
echo "Data exported successfully"
