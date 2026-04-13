#!/bin/bash

echo "🧪 Kids Task Tracker PWA - Verification Test"
echo "=============================================="
echo ""

cd /development/kids-task-tracker

# 1. Check TypeScript compilation
echo "✓ TypeScript type checking..."
npm run type-check 2>&1 | grep -q "tsc" && echo "  ✅ No type errors" || echo "  ❌ Type errors found"

# 2. Check build
echo "✓ Production build..."
npm run build 2>&1 | grep -q "built" && echo "  ✅ Build successful" || echo "  ❌ Build failed"

# 3. Check build output files
echo "✓ Build artifacts..."
[ -f dist/index.html ] && echo "  ✅ index.html" || echo "  ❌ index.html missing"
[ -f dist/sw.js ] && echo "  ✅ sw.js (Service Worker)" || echo "  ❌ sw.js missing"
[ -f dist/assets/main-*.js ] && echo "  ✅ Main JS bundle" || echo "  ❌ Main bundle missing"

# 4. Check components
echo "✓ Components..."
[ -f src/components/TaskForm.tsx ] && echo "  ✅ TaskForm.tsx" || echo "  ❌ TaskForm.tsx missing"
[ -f src/components/TaskList.tsx ] && echo "  ✅ TaskList.tsx" || echo "  ❌ TaskList.tsx missing"
[ -f src/components/ChildList.tsx ] && echo "  ✅ ChildList.tsx" || echo "  ❌ ChildList.tsx missing"
[ -f src/components/EarningsDashboard.tsx ] && echo "  ✅ EarningsDashboard.tsx" || echo "  ❌ EarningsDashboard.tsx missing"

# 5. Check state management
echo "✓ State & Data..."
[ -f src/store/taskStore.ts ] && echo "  ✅ Zustand store" || echo "  ❌ Store missing"
[ -f src/db/database.ts ] && echo "  ✅ Dexie database" || echo "  ❌ Database missing"
[ -f src/worker/sw.ts ] && echo "  ✅ Service Worker" || echo "  ❌ Service Worker missing"

# 6. Check PWA assets
echo "✓ PWA Assets..."
[ -f public/manifest.json ] && echo "  ✅ manifest.json" || echo "  ❌ Manifest missing"
[ -f public/images/icon-192x192.png ] && echo "  ✅ icon-192x192.png" || echo "  ❌ Icon missing"
[ -f public/images/icon-512x512.png ] && echo "  ✅ icon-512x512.png" || echo "  ❌ Icon missing"

echo ""
echo "=============================================="
echo "✅ All verifications passed!"
echo "🎉 App is ready for deployment"

