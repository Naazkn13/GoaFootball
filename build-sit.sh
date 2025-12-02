#!/bin/bash

echo "========================================="
echo "Building for SIT Environment"
echo "========================================="

# Set NODE_ENV to production for build
export NODE_ENV=production

# Load SIT environment variables (except NODE_ENV)
if [ -f .env.sit ]; then
  export $(cat .env.sit | grep -v '^#' | grep -v '^NODE_ENV' | xargs)
  echo "✓ SIT environment variables loaded"
else
  echo "⚠ .env.sit file not found, using .env.local"
  export $(cat .env.local | grep -v '^#' | grep -v '^NODE_ENV' | xargs)
fi

# Clean build directory
rm -rf .next
rm -rf build
echo "✓ Build directories cleaned"

# Build Next.js application
echo "Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✓ Build completed successfully"
  
  # Create build directory
  mkdir -p build/football_auth_app
  
  # Copy build files
  cp -r .next build/football_auth_app/
  cp -r public build/football_auth_app/
  cp -r pages build/football_auth_app/
  cp -r components build/football_auth_app/
  cp -r services build/football_auth_app/
  cp -r styles build/football_auth_app/
  cp -r store build/football_auth_app/
  cp -r node_modules build/football_auth_app/
  cp package.json build/football_auth_app/
  cp next.config.js build/football_auth_app/
  cp jsconfig.json build/football_auth_app/
  cp server-simple.js build/football_auth_app/
  cp .env.sit build/football_auth_app/.env.production
  
  echo "✓ Files copied to build directory"
  echo "========================================="
  echo "SIT Build Completed Successfully!"
  echo "Build location: ./build/football_auth_app"
  echo "========================================="
else
  echo "✗ Build failed"
  exit 1
fi
