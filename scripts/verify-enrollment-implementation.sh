#!/bin/bash

# Script to verify the enrollment system improvement implementation

echo "Verifying enrollment system improvement implementation..."

# Check if required directories exist
echo "Checking directories..."
if [ ! -d "lib/types/enrollments" ]; then
  echo "❌ lib/types/enrollments directory not found"
  exit 1
else
  echo "✅ lib/types/enrollments directory exists"
fi

if [ ! -d "lib/utils/enrollments" ]; then
  echo "❌ lib/utils/enrollments directory not found"
  exit 1
else
  echo "✅ lib/utils/enrollments directory exists"
fi

# Check if required files exist
echo "Checking files..."

# Type definitions
if [ ! -f "lib/types/enrollments/index.ts" ]; then
  echo "❌ lib/types/enrollments/index.ts not found"
  exit 1
else
  echo "✅ lib/types/enrollments/index.ts exists"
fi

# Utility files
required_files=(
  "lib/utils/enrollments/validation.ts"
  "lib/utils/enrollments/notifications.ts"
  "lib/utils/enrollments/capacity.ts"
  "lib/utils/enrollments/query-patterns.ts"
  "lib/utils/enrollments/query-utils.ts"
  "lib/utils/enrollments/error-handler.ts"
  "lib/utils/enrollments/validation-schema.ts"
  "lib/utils/enrollments/index.ts"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ $file not found"
    exit 1
  else
    echo "✅ $file exists"
  fi
done

# Server action files
required_server_files=(
  "lib/server-actions/admin/enrollments-optimized.ts"
  "lib/server-actions/admin/enrollments-compat.ts"
  "lib/server-actions/admin/enrollments/index.ts"
)

for file in "${required_server_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ $file not found"
    exit 1
  else
    echo "✅ $file exists"
  fi
done

# Hook files
if [ ! -f "hooks/admin/enrollments.ts" ]; then
  echo "❌ hooks/admin/enrollments.ts not found"
  exit 1
else
  echo "✅ hooks/admin/enrollments.ts exists"
fi

# Documentation files
required_docs=(
  "docs/enrollment-migration-guide.md"
  "docs/enrollment-hooks.md"
  "docs/enrollment-system-improvement-summary.md"
  "docs/final-enrollment-system-improvement-summary.md"
  "docs/enrollment-system-implementation-summary.md"
)

for file in "${required_docs[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ $file not found"
    exit 1
  else
    echo "✅ $file exists"
  fi
done

echo "✅ All required files and directories are present!"
echo "🎉 Enrollment system improvement implementation verification complete!"