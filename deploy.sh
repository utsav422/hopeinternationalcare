#!/bin/bash

# Deploy script for Hope International Care application

echo "Starting deployment process..."

# Pull latest changes from repository
echo "Pulling latest changes from repository..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "Error: Git pull failed!"
    exit 1
fi

echo "Git pull completed successfully."

# Install/update dependencies
echo "Installing/updating dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: npm install failed!"
    exit 1
fi

echo "Dependencies installed successfully."

# Build the application
echo "Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Error: Build failed!"
    exit 1
fi

echo "Build completed successfully."

# Restart PM2 process with updated environment variables
echo "Restarting PM2 process with updated environment..."
pm2 restart hopeinternationalcare --update-env

if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
    echo "PM2 process 'hopeinternationalcare' restarted with updated environment."
else
    echo "Error: Failed to restart PM2 process!"
    exit 1
fi

# Optional: Show PM2 status
echo "Current PM2 status:"
pm2 status